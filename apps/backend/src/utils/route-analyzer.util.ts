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
  const pathVariables = (path.match(/{[^}]+}/g) || []).map((v) =>
    v.slice(1, -1),
  ) as string[];
  const hasPathVariables = pathVariables.length > 0;
  const hasIdPathVariable = pathVariables.includes('id');

  return {
    isListRoute: method === 'get' && !hasPathVariables,
    isGetByIdRoute: method === 'get' && hasIdPathVariable,
    isCreateRoute: method === 'post' && !hasPathVariables,
    isUpdateRoute: (method === 'put' || method === 'patch') && hasPathVariables,
    isDeleteRoute: method === 'delete' && hasPathVariables,
    pathVariables,
    hasPathVariables,
  };
};
