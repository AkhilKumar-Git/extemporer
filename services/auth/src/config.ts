import { z } from 'zod'

const configSchema = z.object({
  port: z.string().default('3004'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string().optional(),
  databaseUrl: z.string().optional(),
})

const envConfig = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
}

export const config = configSchema.parse(envConfig) 