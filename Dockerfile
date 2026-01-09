FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3000

# Environment variables (to be provided at runtime)
ENV NODE_ENV=production
ENV PORT=3000
# Database connection (external MySQL)
ENV DB_HOST=
ENV DB_PORT=3306
ENV DB_USER=
ENV DB_PASSWORD=
ENV DB_NAME=

# Start the application
CMD ["node", "index.js"]