import os
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "https://sgp.cloud.appwrite.io/v1")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID", "6a786172001351dc68bf")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY", "") # Need an API key for backend ops
APPWRITE_STORAGE_BUCKET_ID = os.getenv("APPWRITE_STORAGE_BUCKET_ID", "6a8f4c4f0482bf2aa92d")

client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
if APPWRITE_API_KEY:
    client.set_key(APPWRITE_API_KEY)

storage = Storage(client)

def download_file(file_id: str, output_path: str):
    """Download a file from Appwrite Storage"""
    result = storage.get_file_download(APPWRITE_STORAGE_BUCKET_ID, file_id)
    with open(output_path, "wb") as f:
        f.write(result)
    return output_path

def upload_file(file_path: str) -> str:
    """Upload a file to Appwrite Storage and return the new fileId"""
    result = storage.create_file(
        bucket_id=APPWRITE_STORAGE_BUCKET_ID,
        file_id="unique()",
        file=InputFile.from_path(file_path)
    )
    return result["$id"]
