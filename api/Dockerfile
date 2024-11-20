# Build stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set npm registry to a mirror.
RUN npm config set registry https://registry.npm.taobao.org

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate the Prisma client.
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose API port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start:prod"]