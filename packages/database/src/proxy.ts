import type { Ctx } from './types';

/**
 * OmitCtxParam:
 * Given a function type that has the signature (...args, Ctx) => ReturnType,
 * produce a new function type that omits the final Ctx param.
 */
type OmitCtxParam<T> = T extends (...args: [...infer Rest, Ctx]) => infer R
  ? (...args: Rest) => R
  : T;

/**
 * TransformNamespace:
 * Given an object { fnA, fnB, ... },
 * convert each function to the version that omits the final Ctx param.
 */
type TransformNamespace<TNamespace> = {
  [K in keyof TNamespace]: OmitCtxParam<TNamespace[K]>;
};

/**
 * FlarekitServices:
 * For each namespace in `TServices` (e.g. `user`, `posts`, etc.),
 * transform all functions within that namespace.
 */
type FlarekitServices<TServices> = {
  [N in keyof TServices]: TransformNamespace<TServices[N]>;
};

export function createFlarekitServices<TServices extends object>(
  ctx: Ctx,
  services: TServices,
): FlarekitServices<TServices> {
  // 1. Create an empty object to hold the “wrapped” namespaces
  const result = {} as FlarekitServices<TServices>;

  // 2. Iterate over each namespace in `services`
  for (const [namespaceKey, namespaceObj] of Object.entries(services)) {
    // Assume each "namespace" is an object of functions + possibly other stuff
    const transformedNamespace = {} as Record<string, unknown>;

    // 3. Shallow-clone / wrap each property
    for (const [fnKey, fnVal] of Object.entries(namespaceObj)) {
      if (typeof fnVal === 'function') {
        // Return a function that calls the original with the appended `ctx`
        transformedNamespace[fnKey] = (...args: unknown[]) =>
          (fnVal as Function)(...args, ctx);
      } else {
        // If it’s not a function, just copy it as-is
        transformedNamespace[fnKey] = fnVal;
      }
    }

    // 4. Insert the transformed namespace into the result
    (result as any)[namespaceKey] = transformedNamespace;
  }

  return result;
}
