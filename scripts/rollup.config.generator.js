import path from "node:path"
import URL from "node:url"
import fs from "node:fs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "rollup-plugin-typescript2"
import vue from "@vitejs/plugin-vue"
import postcss from "rollup-plugin-postcss"

const __filename = URL.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 要打包的 packages
const packages = ["utils", "axios"]

// 获取包根路径
function getPackageRoots() {
  return packages.map((pkg) => path.resolve(__dirname, "../packages", pkg))
}

// 读取 package.json
async function packageJson(root) {
  const jsonPath = path.resolve(root, "package.json")
  const content = await fs.promises.readFile(jsonPath, "utf-8")
  return JSON.parse(content)
}

// 根据包类型生成插件列表
function getPlugins(root, type) {
  const tsconfig = path.resolve(root, "tsconfig.json")
  const plugins = [nodeResolve(), commonjs(), typescript({ tsconfig }), postcss()]

  if (type === "vue") {
    plugins.push(
      vue({
        template: {
          compilerOptions: {
            nodeTransforms: [
              (node) => {
                if (node.type === 1) {
                  node.props = node.props.filter((prop) => prop.type !== 6 || prop.name !== "data-testid")
                }
              },
            ],
          },
        },
      }),
    )
  }

  return plugins
}

// 生成 external，根据 dependencies / peerDependencies 自动处理
function getExternal(pkgJson) {
  const deps = Object.keys(pkgJson.dependencies || {})
  const peerDeps = Object.keys(pkgJson.peerDependencies || {})
  return [...deps, ...peerDeps]
}

// 生成单个包的 Rollup 配置
async function getRollupConfig(root) {
  const pkgJson = await packageJson(root)
  const { name, formats, type = "ts" } = pkgJson.buildOptions || {}
  const entry = path.resolve(root, "src/index.ts")
  const dist = path.resolve(root, "dist")

  const rollupOptions = {
    input: entry,
    plugins: getPlugins(root, type),
    external: getExternal(pkgJson),
    output: [],
    watch: {
      include: path.resolve(root, "src/**"),
      exclude: path.resolve(root, "node_modules/**"),
      clearScreen: false,
    },
  }

  for (const format of formats) {
    const outputItem = {
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
    rollupOptions.output.push(outputItem)
  }

  return rollupOptions
}

// 批量生成配置
export async function getRollupConfigs() {
  const roots = getPackageRoots()
  const configs = await Promise.all(roots.map(getRollupConfig))
  const result = {}
  for (let i = 0; i < packages.length; i++) {
    result[packages[i]] = configs[i]
  }
  return result
}

// 清空 dist
export function clearDist(name) {
  const dist = path.resolve(__dirname, "../packages", name, "dist")
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true })
  }
}
