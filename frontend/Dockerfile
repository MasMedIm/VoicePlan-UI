# Simple serving stage - build should be done locally
FROM node:20-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy pre-built dist folder
COPY dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
