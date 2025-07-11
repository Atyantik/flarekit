import { storageCreateEndpoint } from './storageCreate.route';
import { storageListEndpoint } from './storageList.route';
import { storageGetOneEndpoint } from './storageGetOne.route';
import { storageUpdateEndpoint } from './storageUpdate.route';

export default [
  storageCreateEndpoint,
  storageListEndpoint,
  storageGetOneEndpoint,
  storageUpdateEndpoint,
];
