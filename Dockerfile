# ---------------------------
# 1️⃣ Base image with Node
# ---------------------------
FROM node:20-alpine AS base
WORKDIR /app

# Copy only dependency files first (for better caching)
COPY package.json yarn.lock ./

# Install dependencies (production + dev)
RUN yarn install --frozen-lockfile

# ---------------------------
# 2️⃣ Build stage
# ---------------------------
FROM base AS build
WORKDIR /app

# Copy the rest of the code
COPY . .

# Build the TypeScript code
RUN yarn build

# ---------------------------
# 3️⃣ Production stage
# ---------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Copy only necessary files from build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy built app and any necessary config
COPY --from=build /app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
