import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

/**
 * Configures the application routes by mapping endpoints to corresponding controller methods.
 * @param {object} app - The Express application instance.
 */
function controllerRouting(app) {
  // Create a new Express router.
  const router = express.Router();

  // Attach the router to the root path of the application.
  app.use('/', router);

  // **App Controller Routes**

  /**
   * GET /status
   * Checks the health of the system by verifying if Redis and the database are alive.
   * @route {GET} /status
   */
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  /**
   * GET /stats
   * Retrieves statistics such as the number of users and files in the database.
   * @route {GET} /stats
   */
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  // **User Controller Routes**

  /**
   * POST /users
   * Creates a new user in the database.
   * @route {POST} /users
   */
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  /**
   * GET /users/me
   * Retrieves the authenticated user's details based on the provided token.
   * @route {GET} /users/me
   */
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  // **Auth Controller Routes**

  /**
   * GET /connect
   * Signs in the user by generating a new authentication token.
   * @route {GET} /connect
   */
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  /**
   * GET /disconnect
   * Signs out the user by invalidating the provided authentication token.
   * @route {GET} /disconnect
   */
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });

  // **Files Controller Routes**

  /**
   * POST /files
   * Creates a new file in the database and stores it on disk.
   * @route {POST} /files
   */
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  /**
   * GET /files/:id
   * Retrieves a file document from the database based on its ID.
   * @route {GET} /files/:id
   */
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  /**
   * GET /files
   * Retrieves all file documents for a specific parent ID with pagination.
   * @route {GET} /files
   */
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  /**
   * PUT /files/:id/publish
   * Marks a file as public by setting `isPublic` to `true` based on its ID.
   * @route {PUT} /files/:id/publish
   */
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  /**
   * PUT /files/:id/unpublish
   * Marks a file as private by setting `isPublic` to `false` based on its ID.
   * @route {PUT} /files/:id/unpublish
   */
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  /**
   * GET /files/:id/data
   * Retrieves the content of a file based on its ID.
   * @route {GET} /files/:id/data
   */
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });
}

export default controllerRouting;

