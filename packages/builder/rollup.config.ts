import path from "path"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"
import typescript from "rollup-plugin-typescript2"
import postcss from "rollup-plugin-postcss"
import fs from "node:fs"
import vue from "@vitejs/plugin-vue"
import type { RollupOptions, OutputOptions, Plugin } from "rollup"

interface CustomRollupOptions extends RollupOptions {
  output: OutputOptions[]
}

interface CreateRollupConfigOptions {
  input?: string
}

interface BuildOptions {
  name?: string
  formats?: Array<"cjs" | "esm" | "iife" | "umd">
  type?: "ts" | "vue"
}

interface PackageJson {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  buildOptions?: BuildOptions
}

/**
 * 读取 package.json
 */
async function packageJson(root: string): Promise<PackageJson> {
  const jsonPath = path.resolve(root, "package.json")
  const content = await fs.promises.readFile(jsonPath, "utf-8")
  return JSON.parse(content) as PackageJson
}

/**
 * 生成 external，根据 dependencies / peerDependencies 自动处理
 */
function getExternal(pkgJson: PackageJson): string[] {
  const deps = Object.keys(pkgJson.dependencies || {})
  const peerDeps = Object.keys(pkgJson.peerDependencies || {})
  return [...deps, ...peerDeps]
}

/**
 * 获取插件列表
 */
function getPlugins(root: string, type: "ts" | "vue" = "ts"): Plugin[] {
  const tsconfig = path.resolve(root, "tsconfig.json")
  const plugins: Plugin[] = [
    nodeResolve(),
    commonjs(),
    terser({ format: { comments: false } }),
    typescript({ tsconfig }),
    postcss(),
  ]

  if (type === "vue") {
    plugins.push(vue())
  }

  return plugins
}

/**
 * 清空 dist
 */
export function clearDist(): void {
  const dist = path.resolve(process.cwd(), "dist")
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true })
  }
}

/**
 * 创建 Rollup 配置
 */
export async function createRollupConfig({
  input = "src/index.ts",
}: CreateRollupConfigOptions): Promise<CustomRollupOptions> {
  const root = process.cwd()
  const dist = path.resolve(root, "dist")
  const pkgJson = await packageJson(root)
  const { name, formats = ["cjs", "esm"], type = "ts" } = pkgJson.buildOptions || {}
  const output: OutputOptions[] = []

  console.log(type, "this is types")

  for (const format of formats) {
    const outputItem: OutputOptions = {
      format,
      file: path.resolve(dist, `index.${format}.js`),
      sourcemap: true,
      globals: {},
    }

    if ((format === "iife" || format === "umd") && name) {
      outputItem.name = name
      if (pkgJson.peerDependencies) {
        outputItem.globals = Object.fromEntries(Object.keys(pkgJson.peerDependencies).map((key) => [key, key]))
      }
    }

    output.push(outputItem)
  }

  return {
    input,
    output,
    plugins: getPlugins(root, type),
    external: getExternal(pkgJson),
    watch: {
      include: path.resolve(root, "src/**"),
      exclude: path.resolve(root, "node_modules/**"),
      clearScreen: false,
    },
  }
}
