# Use official Node.js image as base
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Environment variables (you can also pass these at runtime)
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]