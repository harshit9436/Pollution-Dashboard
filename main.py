import psycopg2.pool
from fastapi import Depends, FastAPI, HTTPException, Security, status, Request
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
from fastapi.middleware.cors import CORSMiddleware

import json
from pydantic import BaseModel
from datetime import timedelta,datetime

import Utils.Utils as Utils
from datetime import timedelta
import Utils.Auth as Auth
from typing import Annotated, List, Dict
import Utils.MongoDb as mongo
import asyncio

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        WHERE macid = '{mac_id}' --AND ts >= {ts_old} AND ts <= {ts_curr}
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



@app.get("/dashboard/")
async def get_dashboard():
    # Calculate timestamps
    # ts_curr = Utils.currentUnixTS()
    

    # Build the SQL query with the table name included
    
    global pg_pool
    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        ts_curr = cursor.fetchone()[0]
        ts_old = ts_curr - 24*60*60*7

        # query = f"""
        # SELECT pm2_5, pm4_0, ts FROM alldata
        # WHERE macid = '{mac_id}'  AND ts >= {ts_old} AND ts <= {ts_curr}
        # ORDER BY ts;
        #     """    

        query = f"""with temp(pm2_5,pm_10,ts) as
                (select pm2_5,pm10_0, TO_CHAR(TO_TIMESTAMP(ts), 'DD/MM/YYYY')
                from alldata
                where ts>{ts_old}
                )
            select ts,Round(avg(pm2_5),2) as pm2_5, Round(avg(pm_10),2) as pm10_0
            from temp
            group by ts
            order by ts asc;
        """
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
            print(row_dict)
            # convert row_dict.ts to unix timestamp
            # row_dict['unix_timestamp']=int(datetime(row_dict['ts'], f'%d/%m/%Y'))

            # date_string = '22/03/2023'
# Assuming the date format is DD/MM/YYYY
            date_format = '%d/%m/%Y'

            # Parse the date string into a datetime object
            date_object = datetime.strptime(row_dict["ts"], date_format)

            # Convert the datetime object to a Unix timestamp
            row_dict["ts"] = date_object.timestamp()
            print(row_dict)
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

@app.get("/list/sensors_nonstatic/")
async def get_all_mac_ids():

    global pg_pool
    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        latest_timestamp = cursor.fetchone()[0]
        latest_timestamp = float(latest_timestamp)
        twenty_four_hours = latest_timestamp - timedelta(hours=24).total_seconds()

        cursor.execute(f"""
            With temp(mc_id, avg2_5, avg10_0) as(
                SELECT macid, AVG(pm2_5), AVG(pm10_0)
                FROM alldata
                WHERE tz>0 and ts >= {twenty_four_hours} AND ts <= {latest_timestamp}
                group by macid
                ),
                temp2(macid, lat, long, ts) as (
                SELECT DISTINCT ON (macid) macid, lat, long, ts
                FROM alldata
                where tz>0
                ORDER BY macid, ts DESC
                )
            SELECT DISTINCT t2.macid, t2.lat, t2.long, t2.ts, t1.avg2_5, t1.avg10_0
            FROM temp2 t2
            LEFT JOIN temp t1 ON t2.macid = t1.mc_id;
        """)

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Create a list of dictionaries with MAC ID, latitude, and longitude
        data = []

        max_ts =-1
        for row in rows:
            max_ts = max(max_ts, int(row[3]))

        for row in rows:
            mac_id, lat, long, ts, avg2_5, avg10_0 = row
            # mac_id, lat, long, ts = row
            ts_old = max_ts - 24 * 60 * 60 # hueristic for active sensors
            is_active = (ts>=ts_old and ts<=max_ts)
            if(lat==0 or long==0):
                is_active = False
            # data.append({"macid": str(mac_id), "lat": float(lat), "long": float(long), "is_active" : is_active, "avg2_5" : float(avg2_5), "avg10_0" : float(avg10_0) })
            # data.append({"macid": str(mac_id), "lat": float(lat), "long": float(long), "is_active" : is_active })
            data.append({
                "macid": str(mac_id),
                "lat": float(lat),
                "long": float(long),
                "is_active": is_active,
                "avg2_5": float(avg2_5) if avg2_5 is not None else 0.0,
                "avg10_0": float(avg10_0) if avg10_0 is not None else 0.0,
                "is_static": False
            })
        
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

@app.get("/list/sensors_static/")
async def get_all_static_mac_ids():

    global pg_pool
    try:
        # Get a connection from the pool
        conn = pg_pool.getconn()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        latest_timestamp = cursor.fetchone()[0]
        latest_timestamp = float(latest_timestamp)
        twenty_four_hours = latest_timestamp - timedelta(hours=24).total_seconds()

        cursor.execute(f"""
            With temp(mc_id, avg2_5, avg10_0) as(
                SELECT macid, AVG(pm2_5), AVG(pm10_0)
                FROM alldata
                WHERE tz=0 and ts >= {twenty_four_hours} AND ts <= {latest_timestamp}
                group by macid
                ),
                temp2(macid, lat, long, ts) as (
                SELECT DISTINCT ON (macid) macid, lat, long, ts
                FROM alldata
                where tz=0
                ORDER BY macid, ts DESC
                )
            SELECT DISTINCT t2.macid, t2.lat, t2.long, t2.ts, t1.avg2_5, t1.avg10_0
            FROM temp2 t2
            LEFT JOIN temp t1 ON t2.macid = t1.mc_id;
        """)

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Create a list of dictionaries with MAC ID, latitude, and longitude
        data = []

        max_ts =-1
        for row in rows:
            max_ts = max(max_ts, int(row[3]))

        for row in rows:
            mac_id, lat, long, ts, avg2_5, avg10_0 = row
            # mac_id, lat, long, ts = row
            ts_old = max_ts - 24 * 60 * 60 # hueristic for active sensors
            is_active = (ts>=ts_old and ts<=max_ts)
            if(lat==0 or long==0):
                is_active = False
            # data.append({"macid": str(mac_id), "lat": float(lat), "long": float(long), "is_active" : is_active, "avg2_5" : float(avg2_5), "avg10_0" : float(avg10_0) })
            # data.append({"macid": str(mac_id), "lat": float(lat), "long": float(long), "is_active" : is_active })
            data.append({
                "macid": str(mac_id),
                "lat": float(lat),
                "long": float(long),
                "is_active": is_active,
                "avg2_5": float(avg2_5) if avg2_5 is not None else 0.0,
                "avg10_0": float(avg10_0) if avg10_0 is not None else 0.0,
                "is_static": True
            })
        # print(len(data))
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
def fetch_sensor_data_from_database(active_sensors):
    connection = None
    sensor_data = []

    try:
        # Get a connection from the pool
        connection = pg_pool.getconn()

        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        cursor.execute("SELECT MAX(ts) FROM alldata;")
        end_timestamp = cursor.fetchone()[0]
        start_timestamp = end_timestamp - 3600

        # Define the SQL query to retrieve sensor data for active sensors and the specified time range
        query = """
            SELECT macid, AVG(long) as long, AVG(lat) as lat, MAX(ts) as ts, AVG(pm2_5) as avg
            FROM alldata
            WHERE ts >= %s AND ts <= %s AND macid = ANY(%s)
            GROUP BY macid;
        """

        # Execute the SQL query with parameters
        cursor.execute(query, (start_timestamp, end_timestamp, active_sensors))

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Create a list of dictionaries containing sensor data
        for row in rows:
            macid, long, lat, ts, avg = row
            sensor_data.append({"macid": macid, "long": long, "lat": lat, "ts": ts, "avg": float(avg)})

        # Commit the transaction
        connection.commit()

    except psycopg2.Error as e:
        # Handle database errors
        raise HTTPException(status_code=500, detail="Database Error")

    finally:
        # Return the connection to the pool (do not close it)
        if cursor:
            cursor.close()
        if connection:
            pg_pool.putconn(connection)

    return sensor_data

@app.get("/average_pm25_last_hour/")
async def get_average_pm25_last_hour(request: Request):
    # Get the list of active sensors from the request body

    body = await request.json()
    active_sensors: List[str] =body.get("mac_id",[])
    # Calculate timestamps for the last hour
    # end_timestamp = int(datetime.timestamp(datetime.now()))
    # cursor.execute("SELECT MAX(ts) FROM alldata;")
    # latest_timestamp = cursor.fetchone()[0]
    print(active_sensors)


    # start_timestamp = end_timestamp - 3600  # 3600 seconds = 1 hour

    # Fetch sensor data from the database for active sensors and the last hour
    sensor_data = fetch_sensor_data_from_database(active_sensors)

    return sensor_data

@app.post("/test/", response_model=dict)
async def authenticate(login_request: dict):
    # Define the LoginRequest model within the function
    print("we were here 1")
    class LoginRequest(BaseModel):
        email: str
        password: str

    # A dictionary to store the valid email and password
    valid_credentials = {"riju@example.com": "riju"}

    # Deserialize the request body using the LoginRequest model
    login_data = LoginRequest(**login_request)

    email = login_data.email
    password = login_data.password

    if email in valid_credentials and valid_credentials[email] == password:
        print("we were here 2")
        # Successful authentication
        return {"token": "ccdshbh", "message": "Successful authentication"}
    else:
        # Authentication failed
        raise HTTPException(status_code=401, detail="Login failed", headers={"WWW-Authenticate": "Bearer"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
