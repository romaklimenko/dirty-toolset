import os
from google.cloud import storage
import hashlib
from pymongo import MongoClient
import time

if 'GOOGLE_APPLICATION_CREDENTIALS' not in os.environ and os.path.exists('account-key.json'):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(
        'account-key.json')

db = MongoClient(os.environ['MONGO'])['dirty']
hashes_collection = db['hashes']

cache_dir = 'cache'

client = storage.Client()
bucket = client.get_bucket('dirty-karma-cache')

file_names = sorted(os.listdir(cache_dir))
file_names_count = len(file_names)

count = 1
uploaded_count = 0

for file_name in file_names:
    count += 1

    if file_name == '.DS_Store':
        continue
    file_path = os.path.abspath(os.path.join(cache_dir, file_name))

    hash = hashlib.sha256(open(file_path, 'rb').read()).hexdigest()

    if (hashes_collection.count_documents({'_id': hash})) > 0:
        continue

    if bucket.get_blob(file_name) != None:
        bucket.delete_blob(file_name)
        print(f'❌ {file_name} is deleted. (processed: {count}, uploaded: {uploaded_count}, total {file_names_count})')

    blob = storage.Blob(file_name, bucket)
    with open(file_path, 'rb') as my_file:
        blob.upload_from_file(my_file, content_type='application/json')
    os.remove(file_path)

    uploaded_count += 1

    print(f'✅ {file_name} is uploaded. (processed: {count}, uploaded: {uploaded_count}, total {file_names_count})')

    hashes_collection.insert_one({'_id': hash, 'time': time.time()})
