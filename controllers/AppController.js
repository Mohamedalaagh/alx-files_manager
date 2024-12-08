import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Controller class for application-level operations.
 * Handles requests to check the status of services and retrieve system statistics.
 */
class AppController {
  /**
   * Handles the `/status` route.
   * Responds with the health status of the Redis and database services.
   * 
   * Example response:
   * ```json
   * {
   *   "redis": true,
   *   "db": true
   * }
   * ```
   * Status code: 200
   * 
   * @param {object} request - The HTTP request object.
   * @param {object} response - The HTTP response object.
   */
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200).send(status);
  }

  /**
   * Handles the `/stats` route.
   * Responds with the total number of users and files in the database.
   * 
   * Example response:
   * ```json
   * {
   *   "users": 12,
   *   "files": 1231
   * }
   * ```
   * Status code: 200
   * 
   * @async
   * @param {object} request - The HTTP request object.
   * @param {object} response - The HTTP response object.
   */
  static async getStats(request, response) {
    const stats = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    response.status(200).send(stats);
  }
}

export default AppController;

