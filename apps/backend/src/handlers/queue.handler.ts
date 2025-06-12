/**
 * Handles incoming messages from the queue.
 *
 * This function is designed to be used as the queue handler for the application.
 * It receives a batch of messages, logs them, and acknowledges all messages in the batch.
 */

import { logInfo } from '@utils/logger.util';

export const queueHandler: ExportedHandlerQueueHandler<Env> = async (batch) => {
  const messages = JSON.stringify(batch.messages);
  logInfo(`Consumed from our queue: ${messages}`);
  batch.ackAll();
};
