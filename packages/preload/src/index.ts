import {sha256sum} from './nodeCrypto.js';
import {versions} from './versions.js';
import {ipcRenderer} from 'electron';

function send(channel: string, message: string) {
  return ipcRenderer.invoke(channel, message);
}

function openNewWindow(url: string) {
  return ipcRenderer.invoke('open-new-window', url);
}

export {sha256sum, versions, send, openNewWindow};
