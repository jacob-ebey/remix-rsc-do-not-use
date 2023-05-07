import { importById } from "remix/ssr-runtime";

const cachedImports = new Map<string, Promise<any>>();
const cachedMods = new Map<string, any>();

export function __webpack_chunk_load__(id: string) {
  if (id.startsWith("/") || id.startsWith("http")) {
    return Promise.resolve({});
  }
  const cached = cachedImports.get(id);
  if (cached) return cached;

  const importPromise = importById(id).then(
    (mod) => {
      cachedMods.set(id, mod);
      return mod;
    },
    () => {
      cachedImports.delete(id);
      throw new Error(`Failed to load chunk ${id}`);
    }
  );

  cachedImports.set(id, importPromise);
  return importPromise;
}

export function __webpack_require__(id: string) {
  return cachedMods.get(id);
}
