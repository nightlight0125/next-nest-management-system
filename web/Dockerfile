# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set npm registry to a mirror.
RUN npm config set registry https://registry.npm.taobao.org

# Install dependencies first for better caching
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Copy configuration files
COPY next.config.ts tsconfig.json ./
COPY .eslintrc.json postcss.config.mjs ./

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "run", "start"]