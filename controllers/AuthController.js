import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

/**
 * Controller class for managing user authentication operations.
 * Handles user sign-in (generating tokens) and sign-out (revoking tokens).
 */
class AuthController {
  /**
   * Signs in a user by generating an authentication token.
   * 
   * **Workflow**:
   * - Extracts and decodes Basic Auth credentials from the `Authorization` header.
   * - Validates the provided email and password by checking against stored credentials (SHA1 hashed password).
   * - If the user exists:
   *   - Generates a unique token using `uuidv4`.
   *   - Creates a key in Redis (`auth_<token>`) storing the user's ID with a 24-hour expiration.
   *   - Returns the token with a `200 OK` status.
   * - If validation fails, returns `401 Unauthorized`.
   * 
   * **Validation Errors**:
   * - Returns `401 Unauthorized` if the `Authorization` header is missing or invalid.
   * - Returns `401 Unauthorized` if no user matches the provided credentials.
   * 
   * **Success Response**:
   * - Status: `200 OK`
   * - Body: `{ "token": "<UUID Token>" }`
   * 
   * @async
   * @param {object} request - The HTTP request object containing the `Authorization` header.
   * @param {object} response - The HTTP response object.
   */
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization') || '';

    const credentials = Authorization.split(' ')[1];

    if (!credentials) return response.status(401).send({ error: 'Unauthorized' });

    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) return response.status(401).send({ error: 'Unauthorized' });

    const sha1Password = sha1(password);

    const user = await userUtils.getUser({ email, password: sha1Password });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 24;

    await redisClient.set(key, user._id.toString(), hoursForExpiration * 3600);

    return response.status(200).send({ token });
  }

  /**
   * Signs out a user by invalidating the authentication token.
   * 
   * **Workflow**:
   * - Retrieves the user's ID and token from the request using `userUtils`.
   * - If no valid user/token is found, returns `401 Unauthorized`.
   * - Deletes the token from Redis (`auth_<token>`).
   * - Returns a `204 No Content` status upon successful sign-out.
   * 
   * **Validation Errors**:
   * - Returns `401 Unauthorized` if the token is invalid or the user is not found.
   * 
   * **Success Response**:
   * - Status: `204 No Content`
   * - No response body.
   * 
   * @async
   * @param {object} request - The HTTP request object containing the user's token.
   * @param {object} response - The HTTP response object.
   */
  static async getDisconnect(request, response) {
    const { userId, key } = await userUtils.getUserIdAndKey(request);

    if (!userId) return response.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(key);

    return response.status(204).send();
  }
}

export default AuthController;

