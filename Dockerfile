# Stage 1: Build the Nuxt.js application using Node.js
FROM node:20-bullseye-slim as build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --no-cache

# Copy the rest of the application code
COPY . .

# Build the Nuxt.js application
RUN npm run build

# Stage 2: Set up Python environment for production and install Node.js with NVM
FROM python:3.10-slim as production-stage

# Set working directory
WORKDIR /app

# Install necessary system dependencies, including Git LFS and curl for NVM
RUN apt-get update && apt-get install -y --no-install-recommends \
    git git-lfs curl libgl1 libglib2.0-0 && \
    git lfs install && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install NVM (Node Version Manager) and Node.js 20.x
ENV NVM_DIR=/root/.nvm \
    NODE_VERSION=20.17.0 \
    PATH=/root/.nvm/versions/node/v20.17.0/bin:$PATH

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm use $NODE_VERSION && \
    npm install -g npm && npm cache clean --force

# Verify Node.js and npm versions
RUN node -v && npm -v

# Copy the Python requirements file
COPY ./server/requirements.txt .

# Copy Python scripts and other necessary files
COPY ./server/python/* ./server/python/

# Create tmp directory
RUN mkdir -p /app/tmp

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.cache/pip

# Copy the built Nuxt.js application from the build stage
COPY --from=build-stage /app/.output ./.output
COPY --from=build-stage /app/package*.json ./

# Install only production Node.js dependencies (if required by Nuxt)
RUN npm install --production --no-cache && npm cache clean --force

# Expose port 3000
EXPOSE 3000

# Command to run the Nuxt.js application
CMD ["node", ".output/server/index.mjs"]
