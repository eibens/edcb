import { join, normalize, resolve } from "../../deps/path.ts";

export type Bundler = {
  markDirty: (path: string) => void;
  updateBundle: (url: string) => Promise<void>;
};

export type BundleOptions = {
  source: string;
  target: string;
  noCheck?: boolean;
  config?: string;
  importMap?: string;
};

export type BundlerOptions = {
  webRoot: string;
  bundle: BundleAction;
  bundles: BundleOptions[];
  noCheck: boolean;
  config?: string;
  importMap?: string;
};

export type BundleAction = (options: BundleOptions) => Promise<void>;

export function createBundler(options: BundlerOptions): Bundler {
  const bundles = new Map<string, {
    dirty: boolean;
    source: string;
    target: string;
    noCheck: boolean;
    config?: string;
    importMap?: string;
  }>();

  // Map absolute bundle path to a dirty flag.
  options.bundles.forEach((bundle) => {
    bundles.set(keyFromTarget(bundle.target), {
      dirty: true,
      source: bundle.source,
      config: bundle.config || options.config,
      noCheck: bundle.noCheck == null ? options.noCheck : bundle.noCheck,
      importMap: bundle.importMap || options.importMap,
      target: normalize(join(options.webRoot, bundle.target)),
    });
  });

  function normalizePath(path: string) {
    return normalize(resolve(path));
  }

  function keyFromTarget(path: string) {
    return normalizePath(join(options.webRoot, path));
  }

  function keyFromUrl(url: string) {
    const { pathname } = new URL(url);
    return keyFromTarget(pathname.substr(1)); // remove leading slash
  }

  return {
    markDirty: (path: string) => {
      // NOTE: Ignore changes on bundled files.
      // Otherwise, bundled files would be marked dirty immediately.
      if (bundles.has(normalizePath(path))) return;
      bundles.forEach((bundle) => {
        bundle.dirty = true;
      });
    },
    updateBundle: async (url: string) => {
      // Find bundle that matches the URL.
      const bundle = bundles.get(keyFromUrl(url));
      if (!bundle) return;

      // Ignore bundles that are already up-to-date.
      if (!bundle.dirty) return;
      bundle.dirty = false;

      // Bundle the file.
      try {
        await options.bundle(bundle);
      } catch (_) {
        // NOTE: An invalid bundle should not shut down the server.
      }
    },
  };
}
