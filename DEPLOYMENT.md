# Extempore AI Coach Deployment Guide

This guide provides instructions for deploying the Extempore AI Coach Next.js application.

## Prerequisites

- Node.js (version specified in `package.json` `engines` field, e.g., >=18.0.0)
- npm or yarn
- A Firebase project with Authentication, Firestore, and Cloud Storage enabled.
- Git repository for your project (e.g., on GitHub, GitLab, Bitbucket).

## Environment Variables

Your Next.js application requires Firebase configuration. These should be stored in `.env.local` at the project root for local development and set as environment variables in your deployment platform.

**Required Firebase Variables:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id # Optional
```

**NextAuth.js Variables (if applicable):**
```env
NEXTAUTH_URL=your_production_url # e.g., https://your-app.vercel.app
NEXTAUTH_SECRET=a_very_secure_random_string # Generate a strong secret for production
# Add other NextAuth.js provider credentials (Google, etc.) as needed
```

---

## Option 1: Deploying to Vercel (Recommended for Next.js)

Vercel is a platform from the creators of Next.js, optimized for Next.js applications.

### Steps:

1.  **Push your code to a Git repository** (e.g., GitHub).

2.  **Sign up or log in to Vercel** using your Git provider account.

3.  **Import your project:**
    - Click on "Add New..." -> "Project".
    - Select your Git repository.
    - Vercel will automatically detect that it's a Next.js project.

4.  **Configure Project Settings:**
    - **Root Directory:** Should be left as the default (repository root), as your Next.js application is now at the root.
    - **Build & Output Settings:** Vercel usually auto-detects these correctly for Next.js.
        - Build Command: `npm run build` or `yarn build`.
        - Output Directory: `.next` (default for Next.js).
        - Install Command: `npm install` or `yarn install`.
    - **Environment Variables:** Add all the Firebase and NextAuth.js environment variables listed above through the Vercel project dashboard (Settings -> Environment Variables).

5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application.

6.  **Custom Domain (Optional):** Once deployed, you can assign a custom domain through the Vercel dashboard.

---

## Option 2: Deploying to Google Cloud Run

Google Cloud Run allows you to run containerized applications in a serverless environment.

### Prerequisites:

- Google Cloud Platform (GCP) account with billing enabled.
- `gcloud` CLI installed and authenticated (`gcloud auth login`, `gcloud config set project YOUR_PROJECT_ID`).
- Docker installed locally.
- Google Artifact Registry or Container Registry enabled in your GCP project.

### Steps:

1.  **Create a `Dockerfile` at the project root:**

    ```dockerfile
    # Dockerfile (at project root)

    # Install dependencies only when needed
    FROM node:18-alpine AS deps
    # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
    RUN apk add --no-cache libc6-compat
    WORKDIR /app

    # Install dependencies based on the preferred package manager
    COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
    RUN \
      if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
      elif [ -f package-lock.json ]; then npm ci; \
      elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
      else echo "Lockfile not found." && exit 1; \
      fi


    # Rebuild the source code only when needed
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .

    # Next.js collects completely anonymous telemetry data about general usage.
    # Learn more here: https://nextjs.org/telemetry
    # Uncomment the following line in case you want to disable telemetry during build.
    ENV NEXT_TELEMETRY_DISABLED 1

    RUN npm run build

    # Production image, copy all the files and run next
    FROM node:18-alpine AS runner
    WORKDIR /app

    ENV NODE_ENV production
    # Uncomment the following line in case you want to disable telemetry during runtime.
    ENV NEXT_TELEMETRY_DISABLED 1

    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 nextjs

    COPY --from=builder /app/public ./public

    # Set the correct permission for prerender cache
    RUN mkdir .next
    RUN chown nextjs:nodejs .next

    # Automatically leverage output traces to reduce image size
    # https://nextjs.org/docs/advanced-features/output-file-tracing
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

    USER nextjs

    EXPOSE 3000

    ENV PORT 3000

    CMD ["node", "server.js"]
    ```
    *(Note: This is a standard Next.js standalone Dockerfile. Ensure `output: 'standalone'` is in your `next.config.js` if not already present for optimal image size).*

2.  **(Optional but Recommended) Configure `next.config.js` (at project root) for standalone output:**
    ```javascript
    // next.config.js
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      // ... other configurations
      output: 'standalone',
    };

    module.exports = nextConfig;
    ```

3.  **Build and Push the Docker Image:**
    Navigate to your project root directory in the terminal.
    ```bash
    # Replace YOUR_GCP_PROJECT_ID and YOUR_IMAGE_NAME accordingly
    export GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID"
    export IMAGE_NAME="extempore-app" # Changed from extempore-client
    export IMAGE_TAG="gcr.io/${GCP_PROJECT_ID}/${IMAGE_NAME}:latest" # For Container Registry
    # Or for Artifact Registry (recommended):
    # export REGION="your-gcp-region" # e.g., us-central1
    # export ARTIFACT_REPO_NAME="your-artifact-repo-name"
    # export IMAGE_TAG="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REPO_NAME}/${IMAGE_NAME}:latest"

    # Build the image (ensure Docker daemon is running)
    docker build -t ${IMAGE_TAG} .

    # Authenticate Docker with GCP (if using Artifact Registry, first time setup might be needed)
    gcloud auth configure-docker ${REGION}-docker.pkg.dev # For Artifact Registry (replace ${REGION})
    # Or for Container Registry (gcr.io)
    # gcloud auth configure-docker

    # Push the image
    docker push ${IMAGE_TAG}
    ```

4.  **Deploy to Cloud Run:**
    ```bash
    gcloud run deploy ${IMAGE_NAME} \
      --image ${IMAGE_TAG} \
      --platform managed \
      --region YOUR_GCP_REGION  # e.g., us-central1, us-east1
      --allow-unauthenticated # To make it publicly accessible, or configure IAM for access control
      --port 3000 # The port your app listens on inside the container
      # Set environment variables (repeat --set-env-vars for each)
      --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key" \
      --set-env-vars="NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain" \
      # ... add all other Firebase and NextAuth.js variables
      --set-env-vars="NEXTAUTH_URL=YOUR_CLOUD_RUN_SERVICE_URL" # This will be provided after first deploy or set manually
      --set-env-vars="NEXTAUTH_SECRET=your_production_secret"
    ```
    - After deployment, Cloud Run will provide a URL for your service. You might need to update `NEXTAUTH_URL` with this service URL and redeploy if it's dynamically generated and required at build/runtime by NextAuth.

## Firebase Setup for Deployed App

- **Authentication:** Ensure your production URL (from Vercel or Cloud Run) is added to the authorized domains in Firebase Authentication settings.
- **Firestore/Storage Security Rules:** Review and ensure your security rules are appropriate for a production environment, allowing access only to authenticated users as needed.

## Troubleshooting

- **Vercel:** Check the build logs in the Vercel dashboard for any errors. Ensure environment variables are correctly set.
- **Cloud Run:** Use Google Cloud Logging to check for container logs. Ensure the Docker image builds successfully and environment variables are correctly passed to the Cloud Run service. 