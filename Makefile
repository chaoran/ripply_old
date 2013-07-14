REPORTER = spec

test: test-integration

test-clean:
	@NODE_ENV=test jake mailbox:clear
	@NODE_ENV=test jake redis:flush
	@NODE_ENV=test jake db:drop
	@NODE_ENV=test jake db:create
	@NODE_ENV=test jake db:migrate

test-oauth:
	@NODE_ENV=test mocha test/integration/oauth --reporter $(REPORTER)

test-users:
	@NODE_ENV=test mocha test/integration/users --reporter $(REPORTER)

test-messages:
	@NODE_ENV=test mocha test/integration/messages --reporter $(REPORTER)

test-integration: test-clean test-oauth test-users test-messages 

.PHONY: test
