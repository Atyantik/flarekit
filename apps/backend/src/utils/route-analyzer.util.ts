// utils/route-analyzer.util.ts
export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'options'
  | 'head'
  | 'trace';

export interface RouteAnalysis {
  isListRoute: boolean;
  isGetByIdRoute: boolean;
  isCreateRoute: boolean;
  isUpdateRoute: boolean;
  isDeleteRoute: boolean;
  pathVariables: string[];
  hasPathVariables: boolean;
}

export const analyzeRoute = (
  method: HttpMethod,
  path: string,
): RouteAnalysis => {
  const pathVariables = path.match(/\{\w+\}/g) || [];
  const hasPathVariables = pathVariables.length > 0;

  return {
    isListRoute: method === 'get' && !hasPathVariables,
    isGetByIdRoute: method === 'get' && hasPathVariables,
    isCreateRoute: method === 'post' && !hasPathVariables,
    isUpdateRoute: (method === 'put' || method === 'patch') && hasPathVariables,
    isDeleteRoute: method === 'delete' && hasPathVariables,
    pathVariables,
    hasPathVariables,
  };
};
