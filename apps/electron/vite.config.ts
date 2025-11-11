import { rmSync } from "node:fs"
import { defineConfig } from "vite"
import electron from "vite-plugin-electron/simple"
import renderer from "vite-plugin-electron-renderer"
import pkg from "./package.json"

export default defineConfig(({ command, mode }) => {
  rmSync("dist", { recursive: true, force: true })

  const isServe = command === "serve"
  const isBuild = command === "build"
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  console.log(`current env ${mode}.`)
  return {
    plugins: [
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: "./src/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */ "[startup] Electron App")
            } else {
              args.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist",
              rollupOptions: {
                external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "./src/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined, // #332
              minify: isBuild,
              outDir: "dist/preload",
              rollupOptions: {
                external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        renderer: {},
      }),
      renderer(),
    ],
  }
})
