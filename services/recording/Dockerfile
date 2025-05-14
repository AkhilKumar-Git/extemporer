FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies and required system packages
RUN apk add --no-cache python3 make g++ ffmpeg

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove development dependencies
RUN npm prune --production

EXPOSE 3002

CMD ["npm", "start"] 