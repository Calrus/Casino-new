# Makefile to start both backend and frontend

start: start-backend start-frontend

start-backend:
	@cd casino-app-backend && npm install && node server.js &

start-frontend:
	@cd casino-app && npm install && npm start
