import { app, BrowserWindow } from "electron"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class AppMain {
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.registerEvents()
  }

  private registerEvents() {
    app.on("ready", () => this.createWindow())
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit()
      }
    })
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      }
    })
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "./preload/index.mjs"),
      },
    })

    // 加载你的页面（HTML 或者 build 出来的前端）
    this.mainWindow.loadURL("http://localhost:9527")
  }
}
