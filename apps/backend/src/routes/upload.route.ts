import { uploadFiles } from '@utils/upload.util';
import { Context, Handler } from 'hono';

const sendNoImagesError = (c: Context) => {
  return c.json(
    {
      success: false,
      message: 'No images[] found',
    },
    400,
  );
};

const sendExecutionError = (c: Context, error: unknown) => {
  let message = 'An Error Occurred';
  if (error instanceof Error) {
    message = error.message;
  }
  return c.json(
    {
      success: false,
      message,
    },
    400,
  );
};

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2 MB
export const uploadHandler: Handler = async (c) => {
  const body = await c.req.parseBody();
  let images = body?.['images[]'];
  if (!body?.['images[]']) {
    return sendNoImagesError(c);
  }
  /**
   * If the images is a single file, we convert it to an array
   * and make sure that they are instance of file
   */
  let allUploadedImages = [] as File[];
  if (
    !Array.isArray(images) &&
    images instanceof File &&
    images.type.startsWith('image/') &&
    images.size <= MAX_FILE_SIZE
  ) {
    allUploadedImages = [images];
  }
  if (Array.isArray(images)) {
    for (const image of images) {
      if (
        image instanceof File &&
        image.type.startsWith('image/') &&
        image.size <= MAX_FILE_SIZE
      ) {
        allUploadedImages.push(image);
      }
    }
  }
  if (!allUploadedImages.length) {
    return sendNoImagesError(c);
  }
  try {
    const uploadData = await uploadFiles(allUploadedImages, c.env);
    return c.json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadData,
    });
  } catch (ex) {
    return sendExecutionError(c, ex);
  }
};
