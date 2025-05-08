import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  EQUIPMENT: z.string(),
  SECTOR: z.string(),
  UNITS: z.string(),
  XLSX: z.string(),
  LOGERROR: z.string(),
  LOGEQUIPMENT: z.string(),
  LOGSECTOR: z.string(),
  LOGUNITS: z.string(),
  LOGIN: z.string(),
  GLPIINITIAL: z.string(),
  JWTSECRET: z.string()
})

export const env = envSchema.parse(process.env)