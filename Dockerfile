# Use the official Node.js image as a base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port that the NestJS application listens on
EXPOSE 3000

# Command to run the NestJS application
CMD ["npm", "run", "build && npm start"]

