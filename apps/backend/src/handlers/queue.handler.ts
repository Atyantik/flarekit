/**
 * Handles incoming messages from the queue.
 *
 * This function is designed to be used as the queue handler for the application.
 * It receives a batch of messages, logs them, and acknowledges all messages in the batch.
 *
 * @param {MessageBatch} batch - The batch of messages received from the queue.
 * @returns {Promise<void>} Resolves when all messages have been acknowledged.
 */

export const queueHandler: ExportedHandlerQueueHandler<Env> = async (batch) => {
  let messages = JSON.stringify(batch.messages);
  console.log(`Consumed from our queue: ${messages}`);
  batch.ackAll();
};
