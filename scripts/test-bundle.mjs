import { build } from "esbuild";
import { transformAsync } from "@babel/core";
import istanbul from "babel-plugin-istanbul";
import { readFile, mkdir } from "node:fs/promises";
await mkdir(".test-build", { recursive: true });
await build({
  entryPoints: ["tests/suite.jsx"],
  bundle: true,
  outfile: ".test-build/suite.js",
  sourcemap: "inline",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"test"', "import.meta.env": '{}' },
  plugins: [
    {
      name: "coverage",
      setup(b) {
        b.onLoad({ filter: /src[\\/].*\.(js|jsx)$/ }, async (args) => {
          const result = await transformAsync(
            await readFile(args.path, "utf8"),
            {
              filename: args.path,
              plugins: [
                [
                  istanbul,
                  {
                    include: ["src/**/*"],
                    exclude: ["src/main.jsx", "src/seed.js"],
                  },
                ],
              ],
              parserOpts: { plugins: ["jsx"] },
              sourceMaps: true,
            },
          );
          return { contents: result.code, loader: "jsx" };
        });
      },
    },
  ],
});
