export type RouteRegister = (app: any) => void;

/**
 * Dynamically loads all route modules within this directory.
 * Any exported function from `*.route.ts` files is treated as a route
 * registration function.
 */
export function loadRoutes() {
  const modules = import.meta.glob('./**/*.route.ts', { eager: true });
  const routes: RouteRegister[] = [];
  Object.values(modules).forEach((mod: any) => {
    for (const value of Object.values(mod)) {
      if (typeof value === 'function') {
        routes.push(value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          if (typeof v === 'function') routes.push(v);
        });
      }
    }
  });
  return routes;
}

export default loadRoutes;
