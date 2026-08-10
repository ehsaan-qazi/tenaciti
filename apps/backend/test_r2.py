import boto3
import os
from botocore.config import Config
from dotenv import load_dotenv

# Disable the checksum explicitly to make this script test just the credentials and addressing
os.environ["AWS_REQUEST_CHECKSUM_CALCULATION"] = "when_required"
os.environ["AWS_RESPONSE_CHECKSUM_VALIDATION"] = "when_required"

# Load from .env just like the backend does
load_dotenv()

def clean_env(v):
    return v.strip().strip('"').strip("'") if v else ''

account_id = clean_env(os.environ.get('R2_ACCOUNT_ID', ''))
access_key = clean_env(os.environ.get('R2_ACCESS_KEY_ID', ''))
secret_key = clean_env(os.environ.get('R2_SECRET_ACCESS_KEY', ''))
bucket_name = clean_env(os.environ.get('R2_BUCKET_NAME', ''))

print("Attempting to initialize R2 client and put object...")
print(f"Bucket: {bucket_name}, Account ID length: {len(account_id)}")

try:
    client = boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='auto',
        config=Config(signature_version='s3v4', s3={'addressing_style': 'path'})
    )
    
    resp = client.put_object(Bucket=bucket_name, Key='test-upload.txt', Body=b'hello world')
    print('SUCCESS:', resp)
except Exception as e:
    print('FAILED:', str(e))
