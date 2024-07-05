import fs from "fs";
import path from "path";

const CACHE_FILE_PATH = path.join(__dirname, "cache.json");

interface CacheData {
  timestamp: number;
  data: any;
}

const readCache = (): CacheData | null => {
  if (!fs.existsSync(CACHE_FILE_PATH)) {
    return null;
  }
  const rawData = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
  return JSON.parse(rawData);
};

const writeCache = (data: any): void => {
  const cacheData: CacheData = {
    timestamp: Date.now(),
    data,
  };
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData), "utf-8");
};

const isCacheValid = (cacheData: CacheData, cacheDuration: number): boolean => {
  return Date.now() - cacheData.timestamp < cacheDuration;
};

export { readCache, writeCache, isCacheValid };
