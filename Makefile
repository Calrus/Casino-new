# Makefile

.PHONY: start-frontend start-backend

start-frontend:
	cd casino-app && npm start

start-backend:
	cd casino-app-backend && npm start

start:
	concurrently "make start-frontend" "make start-backend"
