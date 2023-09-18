import pymongo
# import Auth as Auth

# Establish a connection to MongoDB (replace with your MongoDB URI)
client = pymongo.MongoClient("mongodb+srv://harshit:harshit@cluster0.jlhfrqo.mongodb.net/")  # Replace with your MongoDB URI
# Select a database (replace 'mydatabase' with your database name)
db = client["Dashboard"]

# Select a collection (replace 'users' with your collection name)
collection = db["Users"]

import uuid as uid  # Import the uuid library
from passlib.context import CryptContext
from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    uuid :str

class User:
    def __init__(self, username, email, password, uuid=None):  # Provide a default value for uuid
        self.username = username
        self.email = email
        self.password = password
        self.uuid = uuid or str(uid.uuid4())  # Generate a UUID if not provided

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password):
    return pwd_context.hash(password)


class UserManager:
    @staticmethod
    def insert_user(user):
        # Convert the User object to a dictionary
        password= get_password_hash(user.password)
        user_dict = {
            "username": user.username,
            "email": user.email,
            "password": password,
            "uuid": user.uuid  # Include the uuid field
        }
        # Insert the user document into the collection
        collection.insert_one(user_dict)

    
    @staticmethod
    def find_user_by_uuid(uuid):
        # Retrieve a user document by username, excluding the _id field
        user_dict = collection.find_one({"uuid": uuid}, {"_id": 0})
        if user_dict:
            user_dict.pop("_id", None)  # Remove the _id field if it exists
            return User(**user_dict)
        return None

    @staticmethod
    def find_user_by_username(username : str):
        # Retrieve a user document by username, excluding the _id field
        user_dict = collection.find_one({"username": username}, {"_id": 0})
        if user_dict:
            user_dict.pop("_id", None)  # Remove the _id field if it exists
            return User(**user_dict)
        return None


    @staticmethod
    def find_user_by_email(email):
        # Retrieve a user document by email, excluding the _id field
        user_dict = collection.find_one({"email": email}, {"_id": 0})
        if user_dict:
            user_dict.pop("_id", None)  # Remove the _id field if it exists
            return User(**user_dict)
        return None

    @staticmethod
    def verify_user_credentials(username, password):
        # Verify user credentials (username and password)
        user = UserManager.find_user_by_username(username)
        if user and user.password == password:
            return user
        return None

# Create a User object
# new_user = User("ddd", "hdd@gmail.com", "dd")

# Insert the user into the database
# UserManager.insert_user(new_user)

# user_by_username = UserManager.find_user_by_username("harshit")
# print(user_by_username.username, "hardcoded")
# user_by_email = UserManager.find_user_by_email("john@example.com")
