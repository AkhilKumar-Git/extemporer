import { z } from 'zod'

const configSchema = z.object({
  port: z.string().default('3001'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string(),
  databaseUrl: z.string(),
})

const envConfig = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
}

export const config = configSchema.parse(envConfig) 