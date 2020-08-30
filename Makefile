# run only integration tests
integration:
	deno test --allow-net --allow-read --allow-env test/integration

# run only unit tests
unit:
	deno test --allow-net --allow-read --allow-env --allow-plugin --unstable test/unit

# get all user's votes and save to JSON
votes:
	deno run --allow-net --allow-read --allow-write --allow-env --allow-plugin --unstable tools/votes.ts $(username)

# get all users and their karma and save to mongo
users:
	deno run --allow-env --allow-net --allow-write --allow-read --allow-plugin --unstable maintenance/users.ts $(from) $(to)

# save users and their outgoing karma votes to JSON files
users_to_json:
	deno run --allow-env --allow-net --allow-write --allow-read --allow-plugin --unstable maintenance/cache.ts

# upload JSON-files to Google Cloud Storage
upload_cache:
	python3 maintenance/cache.py