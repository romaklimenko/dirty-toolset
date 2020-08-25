# run only integration tests
integration:
	deno test --allow-net --allow-read --allow-env test/integration

# run only unit tests
unit:
	deno test --allow-net --allow-read --allow-env test/unit

votes:
	deno run --allow-net --allow-read --allow-write --allow-env tools/votes.ts $(username)