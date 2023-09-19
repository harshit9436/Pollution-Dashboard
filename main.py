import psycopg2.pool
from fastapi import Depends, FastAPI, HTTPException, Security, status, Request
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
import json
from pydantic import BaseModel
from datetime import timedelta,datetime

import Utils.Utils as Utils
from datetime import timedelta
import Utils.Auth as Auth
from typing import Annotated
import Utils.MongoDb as mongo
import asyncio

app = FastAPI()

# Define a global variable for the PostgreSQL connection pool
pg_pool = None

# Initialize the connection pool as a startup event
@app.on_event("startup")
async def startup_event():
    global pg_pool
    with open("Utils/config.json", "r") as config_file:
        config = json.load(config_file)

    # Connect to the PostgreSQL database
    try:
        pg_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            user=config["db_user"],
            password=config["db_password"],
            database=config["db_name"],
            host=config["db_host"],
        )
    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str

@app.get("/")
async def root():
    return {"message" : "working"}

@app.post("/token", response_model=Auth.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = Auth.authenticate_user( form_data.username, form_data.password)
    print(form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=Auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = Auth.create_access_token(
        data={"sub": user.uuid},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/sign_up/")
async def create_user(user_data: mongo.CreateUserRequest):
    # Check if the username or email already exists
    existing_user = mongo.UserManager.find_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = mongo.UserManager.find_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create a User object
    new_user = mongo.User(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    
    # Insert the user into the database
    mongo.UserManager.insert_user(new_user)
    
    return {"message": "User created successfully"}


@app.get("/sensors/{mac_id}/")
async def get_sensor_data(mac_id: str, 
                    # current_user: Auth.User = Depends(Auth.get_current_user), 
                offset: str = "7"):
    # Calculate timestamps
    ts_curr = Utils.currentUnixTS()
    ts_old = Utils.offsetUnixTS(offset=int(offset))

    # Build the SQL query with the table name included
    query = f"""
        SELECT * FROM alldata
        WHERE macid = '{mac_id}' -- AND ts >= {ts_old} AND ts <= {ts_curr}
        ORDER BY ts limit 50;
    """
    global pg_pool
    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()

        # Execute the query
        cursor.execute(query)

        # Get the column names from the cursor description
        column_names = [desc[0] for desc in cursor.description]

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Create a list of dictionaries with string values
        data = []
        for row in rows:
            row_dict = {column_names[i]: str(row[i]) for i in range(len(column_names))}
            data.append(row_dict)

        return data

    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

    finally:
        # Close the cursor and return the connection to the pool
        if cursor:
            cursor.close()
        if conn:
            pg_pool.putconn(conn)


@app.get("/sensors/")
async def get_sensor_data_from_body(
    request: Request,
    # current_user: Auth.User = Depends(Auth.get_current_user),
):
    # Parse the JSON request body
    sensor_data_request = await request.json()
    mac_id_filter = sensor_data_request.get("mac_id", [])
    offset = sensor_data_request.get("offset","7")
    # Calculate timestamps

    ts_curr = Utils.currentUnixTS()
    ts_old = Utils.offsetUnixTS(offset=offset)
    global pg_pool
    # Build the SQL query with the table name included
    result_data = []

    try:
        for mac_id in mac_id_filter:
            # Get a connection from the pool
            conn = pg_pool.getconn()

            # Create a cursor object
            cursor = conn.cursor()

            # Build the SQL query with the table name included
            query = f"""
                SELECT * FROM alldata
                WHERE macid = '{mac_id}' 
                ORDER BY ts DESC LIMIT 10;
            """

            # Execute the query
            cursor.execute(query)

            # Get the column names from the cursor description
            column_names = [desc[0] for desc in cursor.description]

            # Fetch all rows of the result set
            rows = cursor.fetchall()

            # Create a list of dictionaries with string values
            current_mac_id_data = []
            for row in rows:
                row_dict = {column_names[i]: str(row[i]) for i in range(len(column_names))}
                current_mac_id_data.append(row_dict)

            # Append the data for the current MAC ID to the result list
            result_data.append(current_mac_id_data)

            # Close the cursor and return the connection to the pool
            cursor.close()
            pg_pool.putconn(conn)

    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)

    finally:
        # Close all connections in the pool
        pg_pool.closeall()

    # print(result_data)
    return result_data

@app.get("/list/sensors")
async def get_all_mac_ids():
    query = """
            SELECT DISTINCT macid FROM alldata;
        """

    global pg_pool
    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()

        # Execute the query
        cursor.execute(query)

        # Get the column names from the cursor description
        column_names = [desc[0] for desc in cursor.description]

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Create a list of dictionaries with string values
        data = []
        for row in rows:
            row_dict = {column_names[i]: str(row[i]) for i in range(len(column_names))}
            print(type(row_dict))
            data.append(row_dict.get("macid"))

        return {"mac_id" : data}

    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

    finally:
        # Close the cursor and return the connection to the pool
        if cursor:
            cursor.close()
        if conn:
            pg_pool.putconn(conn)

    
@app.get("/average_daily/")
async def get_average_pm_values():
    global pg_pool

    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()

        # Find the latest timestamp
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        latest_timestamp = cursor.fetchone()[0]
        latest_timestamp = float(latest_timestamp)
        # latest_timestamp = datetime.datetime.now()

        # Calculate the timestamp of 24 hours before the latest timestamp
        twenty_four_hours_ago = latest_timestamp - timedelta(hours=24).total_seconds()

        # Query to calculate the average of "pm2_5" and "pm10_0" values between the two timestamps
        cursor.execute(f"""
            SELECT AVG(pm2_5), AVG(pm10_0)
            FROM alldata
            WHERE ts >= {twenty_four_hours_ago} AND ts <= {latest_timestamp};
        """)

        # Fetch the result
        average_pm_values = cursor.fetchone()

        if average_pm_values:
            pm2_5_avg, pm10_0_avg = average_pm_values
            return {
                "pm2_5_avg": pm2_5_avg,
                "pm10_0_avg": pm10_0_avg
            }
        else:
            return {
                "pm2_5_avg": None,
                "pm10_0_avg": None
            }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    finally:
        # Return the connection to the pool (do not close it)
        if cursor:
            cursor.close()
        if conn:
            pg_pool.putconn(conn)


@app.get("/average_weekly/")
async def get_average_pm_values():
    global pg_pool

    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()

        # Find the latest timestamp
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        latest_timestamp = cursor.fetchone()[0]
        latest_timestamp = float(latest_timestamp)
        # latest_timestamp = datetime.datetime.now()

        # Calculate the timestamp of 24 hours before the latest timestamp
        twenty_four_hours_ago = latest_timestamp - timedelta(hours=168).total_seconds()

        # Query to calculate the average of "pm2_5" and "pm10_0" values between the two timestamps
        cursor.execute(f"""
            SELECT AVG(pm2_5), AVG(pm10_0)
            FROM alldata
            WHERE ts >= {twenty_four_hours_ago} AND ts <= {latest_timestamp};
        """)

        # Fetch the result
        average_pm_values = cursor.fetchone()

        if average_pm_values:
            pm2_5_avg, pm10_0_avg = average_pm_values
            return {
                "pm2_5_avg": pm2_5_avg,
                "pm10_0_avg": pm10_0_avg
            }
        else:
            return {
                "pm2_5_avg": None,
                "pm10_0_avg": None
            }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

    finally:
        # Return the connection to the pool (do not close it)
        if cursor:
            cursor.close()
        if conn:
            pg_pool.putconn(conn)
# Run the application
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
