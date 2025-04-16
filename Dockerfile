# syntax=docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=23.7.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Set the working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install Yarn
ARG YARN_VERSION=1.22.22
RUN npm install -g yarn@$YARN_VERSION --force

# --- Pass in your Supabase public vars as build args ---
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG RESEND_API_KEY

ENV RESEND_API_KEY=${RESEND_API_KEY}
# Set them as environment variables so Next.js can access them at build time
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}

# --- Build Stage ---
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules (all dependencies)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy the rest of the application code
COPY . .

# Build the application (this step will inline your NEXT_PUBLIC_ vars)
RUN yarn run build

# Remove development dependencies
RUN yarn install --production=true

# --- Final Stage ---
FROM base

# Copy built application from the build stage
COPY --from=build /app /app

# Expose the port your Next.js app listens on
EXPOSE 3000

# Start the server
CMD [ "yarn", "run", "start" ]
