// utils/api-docs.util.ts
import { HttpMethod, analyzeRoute } from './route-analyzer.util';

export const generateApiSummary = (
  method: HttpMethod,
  resourceName: string,
  path: string,
): string => {
  const analysis = analyzeRoute(method, path);

  const actionMap: { [key in HttpMethod]: string } = {
    get: 'Retrieve',
    post: 'Create',
    put: 'Update',
    patch: 'Update',
    delete: 'Delete',
    options: 'Options',
    head: 'Head',
    trace: 'Trace',
  };

  const action = actionMap[method] || 'Process';
  const resourceText = analysis.isListRoute
    ? `${resourceName} Records`
    : `${resourceName} Record`;

  return `${action} ${resourceText}`;
};

export const generateApiDescription = (
  method: HttpMethod,
  resourceName: string,
  path: string,
): string => {
  const analysis = analyzeRoute(method, path);
  const lowercaseResource = resourceName.toLowerCase();

  if (analysis.isListRoute) {
    return `Retrieve a paginated list of ${lowercaseResource} records.`;
  }

  if (analysis.isGetByIdRoute) {
    return `Retrieve a specific ${lowercaseResource} record by its unique identifier.`;
  }

  if (analysis.isCreateRoute) {
    return `Create a new ${lowercaseResource} record.`;
  }

  if (analysis.isUpdateRoute) {
    return `Update an existing ${lowercaseResource} record.`;
  }

  if (analysis.isDeleteRoute) {
    return `Delete a specific ${lowercaseResource} record.`;
  }

  return `${generateApiSummary(method, resourceName, path)} operation.`;
};

export const generateResourceTags = (resourceName: string): string[] => {
  return [
    resourceName
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  ];
};
