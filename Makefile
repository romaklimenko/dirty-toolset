# run only integration tests
integration:
	deno test --allow-net --allow-read --allow-env test/integration

# run only unit tests
unit:
	deno test --allow-net --allow-read --allow-env test/unit

# run all tests
test:
	deno test --allow-net --allow-read --allow-env