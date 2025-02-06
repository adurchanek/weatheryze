# Use Node.js LTS as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the service's port
EXPOSE 5004

# Start the service
CMD ["npm", "run", "start"]