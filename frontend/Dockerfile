# Use official Node.js image as the base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy everything to the working directory
COPY . /app

# Install dependencies
RUN npm install

# Install Prisma globally
RUN npm install -g prisma
# Install typescript
RUN npm install -g typescript

# Generate Prisma client
RUN npx prisma generate

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]