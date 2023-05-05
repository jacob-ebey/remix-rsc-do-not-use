import * as fs from "node:fs";

import arg from "arg";
import { CachedInputFileSystem, ResolverFactory } from "enhanced-resolve";

let {
  "--condition": conditions,
  "--cwd": cwd,
  "--extension": extensions,
  "--extension-alias": extensionAlias,
  "--main-field": mainFields,
} = arg({
  "--condition": [String],
  "--cwd": String,
  "--extension": [String],
  "--extension-alias": [String],
  "--main-field": [String],
});

if (!cwd || !cwd.length) {
  console.error("Missing --cwd");
  process.exit(1);
}

if (!conditions || !conditions.length) {
  console.error("Missing --condition");
  process.exit(1);
}

if (!extensions || !extensions.length) {
  console.error("Missing --extensions");
  process.exit(1);
}

if (!extensionAlias || !extensionAlias.length) {
  extensionAlias = [];
}

if (!mainFields || !mainFields.length) {
  console.error("Missing --main-fields");
  process.exit(1);
}

const resolver = ResolverFactory.createResolver({
  fileSystem: new CachedInputFileSystem(fs, 4000),
  conditionNames: conditions,
  mainFields,
  extensions,
  extensionAlias: extensionAlias.reduce((acc, alias) => {
    const [ext, aliases] = alias.split(":", 2);
    acc[ext] = aliases.split(",");
    return acc;
  }, {}),
  roots: [cwd],
  preferRelative: true,
});

process.on(
  "message",
  (message: { id: string; importPath: string; importerPath: string }) => {
    const { id, importPath, importerPath } = message;

    const ctx = {};
    const resolveContext = {};
    resolver.resolve(
      ctx,
      importerPath,
      importPath,
      resolveContext,
      (error, resolved) => {
        if (error || !resolved) {
          process.send!({
            id,
            error:
              error?.message ||
              `Can't resolve not resolve ${importPath} in ${importerPath}`,
          });
          return;
        }
        process.send!({ id, resolved });
      }
    );
  }
);
