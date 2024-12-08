import Queue from 'bull';
import { ObjectId } from 'mongodb';
import { promises as fsPromises } from 'fs';
import fileUtils from './utils/file';
import userUtils from './utils/user';
import basicUtils from './utils/basic';

const imageThumbnail = require('image-thumbnail');

// Create two queues for processing jobs related to files and users.
const fileQueue = new Queue('fileQueue'); // Queue for processing file-related tasks
const userQueue = new Queue('userQueue'); // Queue for processing user-related tasks

/**
 * Process jobs in the fileQueue.
 * This queue handles file-related tasks such as generating image thumbnails.
 */
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data; // Extract fileId and userId from the job data

  // **Redis Cleanup Command (optional)**:
  //   Use the following Redis CLI command to delete Bull's keys:
  //   redis-cli keys "bull*" | xargs redis-cli del

  // Validate that userId and fileId are present
  if (!userId) {
    console.log('Missing userId');
    throw new Error('Missing userId');
  }

  if (!fileId) {
    console.log('Missing fileId');
    throw new Error('Missing fileId');
  }

  // Validate the format of the userId and fileId (ensure they are valid MongoDB ObjectIds)
  if (!basicUtils.isValidId(fileId) || !basicUtils.isValidId(userId)) throw new Error('File not found');

  // Fetch the file details from the database using fileId and userId
  const file = await fileUtils.getFile({
    _id: ObjectId(fileId), // Convert fileId to ObjectId
    userId: ObjectId(userId), // Convert userId to ObjectId
  });

  // If the file is not found, throw an error
  if (!file) throw new Error('File not found');

  const { localPath } = file; // Extract the local path of the file for thumbnail generation
  const options = {}; // Options object for thumbnail generation
  const widths = [500, 250, 100]; // Define the widths for the thumbnails

  // Generate thumbnails for each specified width
  widths.forEach(async (width) => {
    options.width = width; // Set the width for the current thumbnail
    try {
      const thumbnail = await imageThumbnail(localPath, options); // Generate the thumbnail
      await fsPromises.writeFile(`${localPath}_${width}`, thumbnail); // Save the thumbnail to the file system
    } catch (err) {
      // Log any errors that occur during thumbnail generation
      console.error(err.message);
    }
  });
});

/**
 * Process jobs in the userQueue.
 * This queue handles user-related tasks such as welcoming a new user.
 */
userQueue.process(async (job) => {
  const { userId } = job.data; // Extract userId from the job data

  // **Redis Cleanup Command (optional)**:
  //   Use the following Redis CLI command to delete Bull's keys:
  //   redis-cli keys "bull*" | xargs redis-cli del

  // Validate that userId is present
  if (!userId) {
    console.log('Missing userId');
    throw new Error('Missing userId');
  }

  // Validate the format of the userId (ensure it is a valid MongoDB ObjectId)
  if (!basicUtils.isValidId(userId)) throw new Error('User not found');

  // Fetch the user details from the database using userId
  const user = await userUtils.getUser({
    _id: ObjectId(userId), // Convert userId to ObjectId
  });

  // If the user is not found, throw an error
  if (!user) throw new Error('User not found');

  // Log a welcome message with the user's email
  console.log(`Welcome ${user.email}!`);
});

