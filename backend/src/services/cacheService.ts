import Redis from 'ioredis';

export class CacheService {
  private static instance: Redis | null = null;
  private static isConnected = false;
  private static initAttempted = false;

  public static initialize(): void {
    if (this.initAttempted) return;
    this.initAttempted = true;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('ℹ️ REDIS_URL not set. Running in memory / non-cached mode.');
      return;
    }

    try {
      this.instance = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true
      });

      this.instance.connect()
        .then(() => {
          this.isConnected = true;
          console.log('⚡ Redis connected successfully for campaign list caching');
        })
        .catch((err) => {
          this.isConnected = false;
          console.warn('⚠️ Redis connection failed. Caching disabled, falling back to direct DB queries.', err.message);
        });

      this.instance.on('error', (err) => {
        this.isConnected = false;
      });

      this.instance.on('connect', () => {
        this.isConnected = true;
      });
    } catch (error: any) {
      this.isConnected = false;
      console.warn('⚠️ Could not initialize Redis client:', error?.message);
    }
  }

  public static async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.instance) return null;
    try {
      const data = await this.instance.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      return null;
    }
  }

  public static async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    if (!this.isConnected || !this.instance) return;
    try {
      await this.instance.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      // Non-blocking cache failure
    }
  }

  public static async del(keyOrPattern: string): Promise<void> {
    if (!this.isConnected || !this.instance) return;
    try {
      if (keyOrPattern.includes('*')) {
        const keys = await this.instance.keys(keyOrPattern);
        if (keys.length > 0) {
          await this.instance.del(...keys);
        }
      } else {
        await this.instance.del(keyOrPattern);
      }
    } catch (err) {
      // Non-blocking cache failure
    }
  }

  public static async invalidateCampaignCache(): Promise<void> {
    await this.del('campaigns:*');
    await this.del('campaign_list');
  }
}
