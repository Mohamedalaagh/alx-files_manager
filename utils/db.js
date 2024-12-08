import { MongoClient } from 'mongodb';

// MongoDB configuration variables.
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

// MongoDB connection URL.
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Class for performing operations with MongoDB service.
 * Provides methods for checking the connection status and retrieving
 * basic statistics about the `users` and `files` collections.
 */
class DBClient {
  constructor() {
    // Establish a connection to the MongoDB server.
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        /**
         * MongoDB database instance.
         * @type {object}
         */
        this.db = client.db(DB_DATABASE);

        /**
         * Reference to the `users` collection.
         * @type {object}
         */
        this.usersCollection = this.db.collection('users');

        /**
         * Reference to the `files` collection.
         * @type {object}
         */
        this.filesCollection = this.db.collection('files');

        // Uncomment to log successful connection.
        // console.log('Connected successfully to server');
      } else {
        console.log(`MongoDB connection error: ${err.message}`);

        /**
         * Indicates whether the database connection is active.
         * @type {boolean}
         */
        this.db = false;
      }
    });
  }

  /**
   * Checks if the connection to the MongoDB server is active.
   * @return {boolean} `true` if the connection is alive, `false` otherwise.
   */
  isAlive() {
    return Boolean(this.db);
  }

  /**
   * Retrieves the total number of documents in the `users` collection.
   * @return {Promise<number>} A promise that resolves to the number of users.
   */
  async nbUsers() {
    const numberOfUsers = await this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  /**
   * Retrieves the total number of documents in the `files` collection.
   * @return {Promise<number>} A promise that resolves to the number of files.
   */
  async nbFiles() {
    const numberOfFiles = await this.filesCollection.countDocuments();
    return numberOfFiles;
  }
}

// Singleton instance of the DBClient class for use throughout the application.
const dbClient = new DBClient();

export default dbClient;

