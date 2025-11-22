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

# Create a startup script with proper health check
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
RETRY_COUNT=0\n\
MAX_RETRIES=30\n\
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do\n\
  echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."\n\
  if node -e "const sql = require(\"mssql\"); const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST, database: \"master\", options: { encrypt: true, trustServerCertificate: true } }; sql.connect(config).then(() => { console.log(\"Connected!\"); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null; then\n\
    echo "✅ Database is ready!"\n\
    break\n\
  fi\n\
  RETRY_COUNT=$((RETRY_COUNT + 1))\n\
  sleep 2\n\
done\n\
\n\
if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then\n\
  echo "⚠️ Warning: Could not verify database connection, but starting anyway..."\n\
fi\n\
\n\
echo "📦 Initializing database..."\n\
node init-db.js || echo "⚠️ Database initialization failed or already initialized"\n\
\n\
echo "🚀 Starting server..."\n\
node server.js' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]