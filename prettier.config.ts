import { type Config } from "prettier"

/**
 * @see https://prettier.io/docs
 * */
const config: Config = {
  printWidth: 120, // 一行最大长度
  tabWidth: 2, // 缩进 2 空格
  useTabs: false, // 使用空格缩进
  semi: false, // 行尾不分号
  singleQuote: false, // 使用双引号
  quoteProps: "as-needed", // 对象属性按需加引号
  trailingComma: "all", // 多行末尾加逗号
  bracketSpacing: true, // 对象大括号内加空格
  arrowParens: "always", // 箭头函数参数总是加括号
  endOfLine: "lf", // 统一换行符
  vueIndentScriptAndStyle: true, // Vue SFC <script> 和 <style> 缩进
}

export default config
