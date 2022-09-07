import { BrowserWindow, app, ipcMain } from "electron";
import * as Path from "path";
import * as Fs from 'fs';
import * as remoteMain from '@electron/remote/main'
import { dialog } from '../core/dialog';

app.on("ready", () => {
    remoteMain.initialize();
    dialog.init();
    const win = new BrowserWindow({
        resizable: true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true, // 允许在渲染进程使用node特性
            nodeIntegrationInWorker: true,
            nodeIntegrationInSubFrames: true,
            contextIsolation: false,
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
