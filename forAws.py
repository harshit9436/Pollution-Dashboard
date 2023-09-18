from fastapi import FastAPI, Request
import boto3
from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
import Utils.Utils as Utils
import Utils.athena as athena
import json
import Utils.Auth as Auth
from typing import Annotated
import Utils.MongoDb as mongo

app = FastAPI()

# Initialize the session as a global variable
session = None
params = {
        'region': 'us-east-1',
        'database': 'api_kolkata_glue_db',
        'bucket': 'sachin-query-bucket',
        'path': 'python',
        'query': 'SELECT * Fdb_ROM api_kolkata_glue_db.aqikolkata ORDER BY ts DESC LIMIT 5 ;'
    }

def get_session():
    global session
    with open("Utils/configForAws.json", "r") as config_file:
        config = json.load(config_file)
    session = boto3.Session(aws_access_key_id=config["aws_access_key_id"], aws_secret_access_key=config["aws_secret_access_key"])

# Use a decorator to ensure that get_session is called at startup
@app.on_event("startup")
async def startup_event():
    get_session()

@app.get("/")
async def root( current_user: Auth.User = Depends(Auth.get_current_user) ):
    return {"Message" : "hello"}


@app.post("/token", response_model=Auth.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = Auth.authenticate_user( form_data.username, form_data.password)
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
async def get_sensor_data(current_user: Annotated[Auth.User, Depends(Auth.get_current_user)], mac_id: str, offset: str = "7"):
    global session

    # Calculate timestamps
    ts_curr = Utils.currentUnixTS()
    ts_old = Utils.offsetUnixTS(offset=int(offset))
    # print(ts_old)

    # Build the SQL query
    query = f"""
        SELECT * FROM api_kolkata_glue_db.aqikolkata
        WHERE macid = '{mac_id}' AND ts >= {ts_old} AND ts <= {ts_curr}
        ORDER BY ts DESC LIMIT 5;
    """

    if session is None:
        return {"message": "Session is not initialized"}

    params["query"] = query

    location, data = athena.query_results(session, params)
    # print("Location:", location)
    # print(type(data))
    return data

@app.post("/sensors/")
async def get_sensor_data_from_body(  request: Request,
    current_user: Auth.User = Depends(Auth.get_current_user) 
):
    global session

    # Parse the JSON request body
    sensor_data_request = await request.json()
    mac_ids = sensor_data_request.get("mac_id", [])
    offset = sensor_data_request.get("offset", 7)

    # Calculate timestamps
    ts_curr = Utils.currentUnixTS()
    ts_old = Utils.offsetUnixTS(offset=offset)

    # Build the SQL query
    mac_id_filter = "', '".join(mac_ids)
    query = f"""
        SELECT * FROM api_kolkata_glue_db.aqikolkata
        WHERE macid IN ('{mac_id_filter}') AND ts >= {ts_old} AND ts <= {ts_curr}
        ORDER BY ts DESC LIMIT 5;
    """

    if session is None:
        return {"message": "Session is not initialized"}

    params["query"] = query

    location, data = athena.query_results(session, params)
    # print("Location:", location)
    # print(type(data))
    return data



# @app.get("/users/me/", response_model=Auth.User)
# async def read_users_me(
#     current_user: Annotated[Auth.User, Depends(Auth.get_current_active_user)]
# ):
#     return current_user


# @app.get("/users/me/items/")
# async def read_own_items(
#     current_user: Annotated[Auth.User, Security(Auth.get_current_active_user, scopes=["items"])]
# ):
#     return [{"item_id": "Foo", "owner": current_user.username}]


# @app.get("/status/")
# async def read_system_status(current_user: Annotated[Auth.User, Depends(Auth.get_current_user)]):
#     return {"status": "ok"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
