FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run in dev mode for parity with local experience and hot-reloading if volumes are used
CMD ["npm", "run", "dev"]
