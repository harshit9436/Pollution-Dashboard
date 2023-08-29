from fastapi import FastAPI
import boto3
import athena

app = FastAPI()

# Initialize the session as a global variable
session = None

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
    
    params = {
        'region': 'us-east-1',
        'database': 'api_kolkata_glue_db',
        'bucket': 'sachin-query-bucket',
        'path': 'python',
        'query': 'SELECT * FROM api_kolkata_glue_db.aqikolkata ORDER BY ts DESC LIMIT 5 ;'
    }

    location, data = athena.query_results(session, params)
    print("Location:", location)
    # print("Data:")
    return data
    # return {"message": "Hello"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
