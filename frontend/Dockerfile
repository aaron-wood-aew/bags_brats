FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the app
RUN npm run build

# Install serve globally for static file hosting
RUN npm install -g serve

EXPOSE 5173

# Serve the built static files
CMD ["serve", "-s", "dist", "-l", "5173"]
