import Electron from 'electron';
import { isRendererProcess } from './utils';

const Methods = {
    Select: 'select',
}

export class Dialog {
    init() {
        if (isRendererProcess()) {

        } else {
            Electron.ipcMain.on(Methods.Select, (event, data) => {
                event.returnValue = this.select(data);
            })
        }
    }

    select(param: any) {
        if (isRendererProcess()) {
            return Electron.ipcRenderer.sendSync(Methods.Select, param)
        } else {
            return Electron.dialog.showOpenDialogSync(param);
        }
    }
}

export const dialog = new Dialog();