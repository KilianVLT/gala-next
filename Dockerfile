# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

# Set the working directory inside the container
# Créer un dossier dans le docker
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install --production=false

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js app and prune devDependencies after build
# prune pour enlever ce qui sert à rien
RUN npm run build && npm prune --production

# Stage 2: Production image
FROM node:slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the port the app runs on
# Port dans Docker
EXPOSE 3000

# Command to run the Next.js app
CMD ["npm", "run", "start"]