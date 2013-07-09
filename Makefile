REPORTER = spec

test: test-integration

test-clean:
	@NODE_ENV=test jake db:drop
	@NODE_ENV=test jake db:create
	@NODE_ENV=test jake db:migrate

test-integration: test-clean
	@NODE_ENV=test mocha test/integration --reporter $(REPORTER)

.PHONY: test
