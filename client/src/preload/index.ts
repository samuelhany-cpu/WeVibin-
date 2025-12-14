import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  onSpotifyCallback: (callback: (url: string) => void) => {
    ipcRenderer.on('spotify-callback', (_, url) => callback(url));
  },
});
