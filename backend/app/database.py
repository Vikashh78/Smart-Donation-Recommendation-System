from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os
import certifi

# backend folder path
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# load env file
load_dotenv(dotenv_path=ENV_PATH, override=True)

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL:
    raise ValueError("MONGO_URL not found in .env")

if not DB_NAME:
    raise ValueError("DB_NAME not found in .env")

client = MongoClient(
    MONGO_URL,
    tls=True,
    tlsCAFile=certifi.where(),
    retryWrites=True,
    serverSelectionTimeoutMS=8000,
    connectTimeoutMS=8000,
    socketTimeoutMS=10000,
)
database = client[DB_NAME]