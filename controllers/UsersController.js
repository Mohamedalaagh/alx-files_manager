import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import userUtils from '../utils/user';

const userQueue = new Queue('userQueue');

/**
 * Controller class for managing user-related operations.
 * Handles user creation and retrieval based on authentication tokens.
 */
class UsersController {
  /**
   * Creates a new user.
   * 
   * **Workflow**:
   * - Validates the presence of `email` and `password` in the request body.
   * - Checks if the `email` already exists in the database.
   * - Hashes the `password` using SHA1 for secure storage.
   * - Saves the user in the database with `email` and hashed `password`.
   * - Adds the user creation event to the `userQueue`.
   * 
   * **Validation Errors**:
   * - Returns `400 Bad Request` if `email` is missing: `{ "error": "Missing email" }`
   * - Returns `400 Bad Request` if `password` is missing: `{ "error": "Missing password" }`
   * - Returns `400 Bad Request` if the `email` already exists: `{ "error": "Already exist" }`
   * 
   * **Success Response**:
   * - Status: `201 Created`
   * - Body: `{ "id": "<MongoDB ObjectId>", "email": "<email>" }`
   * 
   * **Failure**:
   * - Returns `500 Internal Server Error` if there is an issue saving the user.
   * 
   * @async
   * @param {object} request - The HTTP request object containing `email` and `password` in the body.
   * @param {object} response - The HTTP response object.
   */
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) return response.status(400).send({ error: 'Missing email' });

    if (!password) return response.status(400).send({ error: 'Missing password' });

    const emailExists = await dbClient.usersCollection.findOne({ email });

    if (emailExists) return response.status(400).send({ error: 'Already exist' });

    const sha1Password = sha1(password);

    let result;
    try {
      result = await dbClient.usersCollection.insertOne({
        email,
        password: sha1Password,
      });
    } catch (err) {
      await userQueue.add({});
      return response.status(500).send({ error: 'Error creating user.' });
    }

    const user = {
      id: result.insertedId,
      email,
    };

    await userQueue.add({
      userId: result.insertedId.toString(),
    });

    return response.status(201).send(user);
  }

  /**
   * Retrieves the authenticated user based on the token.
   * 
   * **Workflow**:
   * - Extracts the `userId` from the token using `userUtils`.
   * - Fetches the user from the database based on the `userId`.
   * - If the user is not found, returns `401 Unauthorized`: `{ "error": "Unauthorized" }`
   * - If the user is found, returns the user with `email` and `id` only.
   * 
   * **Success Response**:
   * - Status: `200 OK`
   * - Body: `{ "id": "<MongoDB ObjectId>", "email": "<email>" }`
   * 
   * **Failure**:
   * - Returns `401 Unauthorized` if the user is not found or the token is invalid.
   * 
   * @async
   * @param {object} request - The HTTP request object containing the user's token.
   * @param {object} response - The HTTP response object.
   */
  static async getMe(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const processedUser = { id: user._id, ...user };
    delete processedUser._id;
    delete processedUser.password;

    return response.status(200).send(processedUser);
  }
}

export default UsersController;

