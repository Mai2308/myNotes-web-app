# Use the official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose backend port
EXPOSE 5000

# Create a startup script
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
sleep 10\n\
echo "Initializing database..."\n\
node init-db.js || true\n\
echo "Starting server..."\n\
node server.js' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
