from fastapi import FastAPI
import boto3
import Utils.utils as utils
import athena

app = FastAPI()

# Initialize the session as a global variable
session = None
params = {
        'region': 'us-east-1',
        'database': 'api_kolkata_glue_db',
        'bucket': 'sachin-query-bucket',
        'path': 'python',
        'query': 'SELECT * FROM api_kolkata_glue_db.aqikolkata ORDER BY ts DESC LIMIT 5 ;'
    }

def get_session():
    global session
    session = boto3.Session(aws_access_key_id="AKIAY6QBJLXT5A4D636O", aws_secret_access_key="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")

# Use a decorator to ensure that get_session is called at startup
@app.on_event("startup")
async def startup_event():
    get_session()

@app.get("/")
async def root():
    global session
    if session is None:
        return {"message": "Session is not initialized"}
    
    params['query']= 'SELECT * FROM api_kolkata_glue_db.aqikolkata ORDER BY ts DESC LIMIT 5 ; '

    location, data = athena.query_results(session, params)
    print("Location:", location)
    return data

@app.get("/sensors/{mac_id}/")
async def get_sensor_data(mac_id: str, offset: str = "7"):
    global session

    # Calculate timestamps
    ts_curr = utils.currentUnixTS()
    ts_old = utils.offsetUnixTS(offset=int(offset))
    print(ts_old)

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
    print("Location:", location)
    print(type(data))
    return data




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
