import { redis } from "./redis";

const DEFAULT_TTL_SECONDS = 60;

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    console.error(`Error leyendo cache para ${key}:`, err);
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error(`Error escribiendo cache para ${key}:`, err);
  }
}

export async function invalidateCacheByPrefix(prefix: string) {
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`Error invalidando cache con prefijo ${prefix}:`, err);
  }
}