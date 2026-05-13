# Obelisk Q — Monorepo Management

.PHONY: setup install-backend install-contracts dev dev-backend dev-all compile test

setup:
	npm run setup

install-backend:
	npm run install:backend

install-contracts:
	npm run install:contracts

dev-frontend:
	npm run dev

dev-backend:
	npm run dev:backend

dev-all:
	npm run dev:all

compile:
	npm run contracts:compile

test-contracts:
	npm run contracts:test

test-frontend:
	npm run test

clean:
	rm -rf node_modules
	rm -rf contracts/node_modules
	rm -rf backend/__pycache__
	rm -rf contracts/artifacts
	rm -rf contracts/cache
