import datetime

def convertTime(timestamp):
    # timestamp = 4294947716
    # Convert the timestamp to a datetime object
    dt = datetime.datetime.utcfromtimestamp(timestamp)

    # You can format the datetime as a string if needed
    formatted_datetime = dt.strftime('%Y-%m-%d %H:%M:%S')

    # print("Unix Timestamp:", timestamp)
    # print("Datetime:", dt)
    return dt

def currentUnixTS():
    current_timestamp = int(datetime.datetime.now().timestamp())
    return current_timestamp

def offsetUnixTS(offset):
    # Get the current date and time
    current_datetime = datetime.datetime.now()

    # Calculate the target date by adding the offset (in days) to the current date
    target_date = current_datetime - datetime.timedelta(days=offset)

    # Convert the target date to a Unix timestamp
    timestamp = int(target_date.timestamp())

    return timestamp

# print(currentUnixTS())