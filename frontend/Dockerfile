# Use Node.js official image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm config set strict-ssl false && npm install

# Copy the rest of your frontend code
COPY . .

# Expose the frontend port (Create React App default is 3000)
EXPOSE 3000

# Set environment variable to make the app accessible from outside the container
ENV HOST=0.0.0.0

# Start the development server
CMD ["npm", "start"]
