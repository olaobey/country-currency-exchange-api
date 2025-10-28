# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all project files
COPY . .

# Build NestJS app
RUN yarn build

# Expose app port
EXPOSE 8080

# Start the app
CMD ["yarn", "start:prod"]
