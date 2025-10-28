# ---------------------------
# 1️⃣ Base build stage
# ---------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install all dependencies (including dev)
RUN yarn install --frozen-lockfile

# Copy rest of the code
COPY . .

# Build the project
RUN yarn build

# ---------------------------
# 2️⃣ Production stage
# ---------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Copy only package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built app
COPY --from=build /app/dist ./dist

# Expose port (Leapcell default is 8080)
EXPOSE 8080

# Start the app
CMD ["node", "dist/main.js"]
