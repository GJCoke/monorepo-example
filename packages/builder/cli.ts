// @ts-expect-error: TS5097
import { createRollupConfig } from "./rollup.config.ts"
import { rollup, watch } from "rollup"

// 获取命令行参数
const args = process.argv.slice(2)
const isDev: boolean = args.includes("--dev")

async function main() {
  const config = await createRollupConfig({
    input: process.env.INPUT,
  })

  if (isDev) {
    // dev modal
    const watcher = watch(config)

    watcher.on("event", (event) => {
      switch (event.code) {
        case "START":
          console.log("Rollup started build...")
          break
        case "BUNDLE_START":
          console.log(`Started build: ${event.input}`)
          break
        case "BUNDLE_END":
          console.log(`Downed build: ${event.output?.join(", ")} (${event.duration}ms)`)
          break
        case "END":
          console.log("Rollup build done.")
          break
        case "ERROR":
          console.error("Rollup build error:", event.error)
          break
        default:
          break
      }
    })
  } else {
    // Build modal
    const bundle = await rollup(config)
    const outputs = config.output ?? []

    for (const out of outputs) {
      await bundle.write(out)
    }

    console.log("Rollup build done.")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
