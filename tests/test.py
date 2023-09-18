import boto3
import Utils.athena as athena

params = {
    'region': 'us-east-1',
    'database': 'api_kolkata_glue_db',
    'bucket': 'sachin-query-bucket',
    'path': 'python',
    'query': 'SELECT * FROM api_kolkata_glue_db.aqikolkata ORDER BY ts DESC LIMIT 5 ;'
}

session = boto3.Session(aws_access_key_id = "AKIAY6QBJLXT5A4D636O",aws_secret_access_key = "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")
# session.set_credentials()

## Function for obtaining query results and location
location, data = athena.query_results(session, params)
print("Location:", location)
print("Data:")

print(data)

# for i, d in enumerate(data):
    # print('{}:'.format(i+1), d)