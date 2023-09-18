import psycopg2
from psycopg2 import pool  # Import the pool module

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

def get_all_mac_ids():
    try:
        # Get a connection from the pool
        conn = conn_pool.getconn()

        # Create a cursor object
        cursor = conn.cursor()

        # Build the SQL query to retrieve all unique macids
        query = """
            SELECT DISTINCT macid FROM alldata;
        """

        # Execute the query
        cursor.execute(query)

        # Fetch all rows of the result set
        rows = cursor.fetchall()

        # Extract macids from the rows
        mac_ids = [row[0] for row in rows]

        return mac_ids

    except psycopg2.Error as e:
        print("Error: Unable to connect to the database.")
        print(e)
        return []

    finally:
        # Close the cursor and return the connection to the pool
        cursor.close()
        conn_pool.putconn(conn)

# Call the function to get all unique macids
# all_mac_ids = get_all_mac_ids()
# print(all_mac_ids)

# import json

# mac_ids = [
#     '84:cc:a8:36:af:7c', '84:cc:a8:36:af:90', '84:cc:a8:36:af:ac', 
#     '84:cc:a8:36:af:b0', '84:cc:a8:36:af:b4', '84:cc:a8:36:af:f8', 
#     '84:cc:a8:36:b0:dc', '84:cc:a8:36:b0:e0', '84:cc:a8:36:b3:88', 
#     '84:cc:a8:36:b3:90', '84:cc:a8:57:c2:60', '8c:4b:14:52:31:3c', 
#     '8c:4b:14:52:33:1c', '9c:9c:1f:ef:b7:10', '9c:9c:1f:ef:b7:20', 
#     '9c:9c:1f:ef:b7:6c', '9c:9c:1f:ef:ba:4c', '9c:9c:1f:ef:ba:5c', 
#     '9c:9c:1f:ef:ba:c8'
# ]

# # Convert the list into a JSON object
# mac_ids_json = {"mac_ids": mac_ids}

# # Serialize the JSON object to a string
# mac_ids_json_str = json.dumps(mac_ids_json, indent=4)

# # Print the JSON string
# print(mac_ids_json_str)