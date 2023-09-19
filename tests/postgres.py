import psycopg2
from psycopg2 import pool
from prettytable import PrettyTable  # Import PrettyTable
from datetime import timedelta
# Database connection parameters
db_params = {
    'database': 'postgres',       # Name of the database
    'user': 'harshit',            # Your PostgreSQL username
    'password': 'harshit',        # Your PostgreSQL password
    'host': 'localhost',          # Hostname or IP address of the PostgreSQL server
    'port': '5432',               # Port used by PostgreSQL (default is 5432)
}

# Create a connection pool
conn_pool = pool.SimpleConnectionPool(1, 5, **db_params)

def print_ts_field():
    try:
        # Get a connection from the pool
        conn = conn_pool.getconn()

        # Create a cursor object
        cursor = conn.cursor()

        # Build the SQL query to retrieve the "ts" field from the table
        cursor.execute("SELECT MAX(ts) FROM alldata;")
        latest_timestamp = cursor.fetchone()[0]
        latest_timestamp = float(latest_timestamp)

        # Calculate the timestamp of 24 hours before the latest timestamp
        twenty_four_hours_ago = latest_timestamp - timedelta(hours=24).total_seconds()

        # Query to calculate the average of "pm2_5" and "pm10_0" values between the two timestamps
        cursor.execute(f"""
            SELECT pm10_0
            FROM alldata
            WHERE ts >= {twenty_four_hours_ago} AND ts <= {latest_timestamp};
        """)

        # Execute the query
        # cursor.execute(query)

        # Fetch all rows of the result set
        rows = cursor.fetchall()
        # sum +=(float(rows[0][0]))

        # Create a PrettyTable object with a single "ts" field
        table = PrettyTable()
        table.field_names = ["ts"]

        # Add "ts" field values to the table
        sum=0.0
        cnt=0
        for row in rows:
            table.add_row([row[0]])
            # print(type(row[0]))
            sum+= float(row[0])
            cnt+=1

        # Print the table
        print(table)
        print(sum,cnt)

    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)

    finally:
        # Close the cursor and return the connection to the pool
        cursor.close()
        conn_pool.putconn(conn)

# Call the function to print only the "ts" field
print_ts_field()
