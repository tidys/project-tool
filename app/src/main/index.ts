import { BrowserWindow, app } from "electron";
import * as Path from "path";
import * as Fs from 'fs';

app.on("ready", () => {
    const win = new BrowserWindow({
        resizable: true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true, // 允许在渲染进程使用node特性
        },
        backgroundColor: "#ffffff",
    });
    const html = Path.join(__dirname, "index.html");
    if (Fs.existsSync(html)) {
        console.log('load file success: ', html);
        win.webContents.openDevTools();
        win.loadFile(html);
    }
});
app.on("window-all-closed", () => {
    app.quit();
});
