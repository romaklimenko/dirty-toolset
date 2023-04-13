import os
from google.cloud import storage

if 'GOOGLE_APPLICATION_CREDENTIALS' not in os.environ and os.path.exists('account-key.json'):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(
        'account-key.json')

cache_dir = 'cache'

client = storage.Client()
bucket = client.get_bucket('dirty-karma-cache')

for file_name in sorted(os.listdir(cache_dir)):
    if file_name == '.DS_Store':
        continue
    file_path = os.path.abspath(os.path.join(cache_dir, file_name))

    if bucket.get_blob(file_name) != None:
        bucket.delete_blob(file_name)
        print(f'{file_name} deleted')

    blob = storage.Blob(file_name, bucket)
    with open(file_path, 'rb') as my_file:
        blob.upload_from_file(my_file, content_type='application/json')
    os.remove(file_path)

    print(f'{file_name} created')
