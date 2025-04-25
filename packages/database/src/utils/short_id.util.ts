import { customAlphabet } from 'nanoid';

export const generateShortId = () => {
  const minLength = 4;
  const maxLength = 8;
  const randomLength =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    randomLength,
  );
  const id = nanoid();
  return id;
};
