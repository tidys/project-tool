import { BrowserWindow, app } from "electron";
import * as Path from "path";

app.on("ready", () => {
  const win = new BrowserWindow({
    resizable: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true, // 允许在渲染进程使用node特性
    },
    backgroundColor: "#ffffff",
  });
  const html = Path.join(__dirname, "app.html");
  win.loadFile(html);
});
app.on("window-all-closed", () => {
  app.quit();
});
