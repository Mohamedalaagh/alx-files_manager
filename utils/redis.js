import redis from 'redis';
import { promisify } from 'util';

/**
 * Class for performing operations with Redis service.
 * Provides methods for connecting to a Redis server, checking connection status,
 * and performing basic Redis operations such as setting, retrieving, and deleting keys.
 */
class RedisClient {
  constructor() {
    /**
     * Redis client instance.
     * @type {object}
     */
    this.client = redis.createClient();

    /**
     * Promisified version of the `get` method for asynchronous operations.
     * @type {function}
     */
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Event listener for handling connection errors.
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    // Event listener for successful connection.
    this.client.on('connect', () => {
      // Uncomment the line below to enable connection success logs.
      // console.log('Redis client connected to the server');
    });
  }

  /**
   * Checks if the connection to the Redis server is alive.
   * @return {boolean} `true` if the connection is active, `false` otherwise.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves the value corresponding to a given key from Redis.
   * @param {string} key - The key to search for in Redis.
   * @return {Promise<string|null>} A promise that resolves to the value of the key,
   * or `null` if the key does not exist.
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Stores a key-value pair in Redis with a specified time-to-live (TTL).
   * @param {string} key - The key to be saved in Redis.
   * @param {string} value - The value to assign to the key.
   * @param {number} duration - The TTL (time-to-live) for the key, in seconds.
   * @return {void}
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to be deleted.
   * @return {void}
   */
  async del(key) {
    this.client.del(key);
  }
}

// Singleton instance of the RedisClient class for use throughout the application.
const redisClient = new RedisClient();

export default redisClient;

