import { z } from 'zod'

const configSchema = z.object({
  port: z.string().default('3005'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string().optional(),
  databaseUrl: z.string().optional(),
  // Add Google Cloud specific env vars here if needed by this service, e.g.:
  // googleCloudKeyFile: z.string().optional(),
  // storageBucket: z.string().optional(),
})

const envConfig = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  // googleCloudKeyFile: process.env.GOOGLE_CLOUD_KEY_FILE,
  // storageBucket: process.env.STORAGE_BUCKET,
}

export const config = configSchema.parse(envConfig) 