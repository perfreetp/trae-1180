const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win = null;
let viteProcess = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: '集市管理系统',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173/stalls');

  win.on('closed', () => {
    win = null;
  });
}

function startVite() {
  return new Promise((resolve) => {
    const isDev = !app.isPackaged;
    if (isDev) {
      viteProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--port', '5173'], {
        cwd: __dirname,
        shell: true,
        stdio: 'pipe',
      });

      let resolved = false;
      viteProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (!resolved && (output.includes('ready') || output.includes('Local:'))) {
          resolved = true;
          resolve();
        }
      });

      viteProcess.stderr.on('data', () => {});

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 8000);
    } else {
      resolve();
    }
  });
}

function cleanup() {
  if (viteProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/PID', String(viteProcess.pid), '/T', '/F'], { shell: true });
      } else {
        viteProcess.kill('SIGTERM');
      }
    } catch (e) {
      // ignore
    }
    viteProcess = null;
  }
}

app.whenReady().then(async () => {
  await startVite();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanup();
});
