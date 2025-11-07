import { defineConfig } from "eslint/config"
import eslint from "@eslint/js"
import tsESLint from "typescript-eslint"
import eslintPluginPrettier from "eslint-plugin-prettier"
import eslintPluginVue from "eslint-plugin-vue"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier/flat"

const ignores = ["**/dist/**", "**node_modules/**", ".*", "scripts/**", "**/*.d.ts", "**/.venv/**", "*.log"]

/**
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * */
export default defineConfig(
  // 通用配置
  {
    ignores, // 忽略目录
    extends: [eslint.configs.recommended, ...tsESLint.configs.recommended, eslintConfigPrettier], // 继承规则
    plugins: {
      prettier: eslintPluginPrettier,
    }, // 插件支持
    languageOptions: {
      ecmaVersion: "latest", // ecma 语法支持版本
      sourceType: "module", // 模块化类型
      parser: tsESLint.parser, // 解析器
    },
    rules: {
      // 自定义规则
      "no-var": "error", // 禁止使用 var
      eqeqeq: "error", // 必须使用 === / !==
      "no-unused-vars": "error", // 禁止未使用变量
      "prefer-const": "error", // 优先使用 const
      "no-duplicate-imports": "error", // 禁止重复导入
    },
  },
  // 前端配置 Vue3
  {
    ignores, // 忽略目录
    files: ["apps/web/**/*.{ts,js,tsx,jsx,vue}", "packages/components/**/*.{ts,js,tsx,jsx,vue}"], // 应用范围
    extends: [...eslintPluginVue.configs["flat/recommended"], eslintConfigPrettier], // 继承规则
    languageOptions: {
      globals: {
        ...globals.browser, // 添加浏览器全局变量
      },
    },
  },
  // 后端配置 electron node
  {
    ignores, // 忽略目录
    files: ["apps/electron/**/*.{ts,js}"], // 应用范围
    languageOptions: {
      globals: {
        ...globals.node, // 添加 node 全局变量
      },
    },
  },
)
