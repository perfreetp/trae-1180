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
    icon: path.join(__dirname, 'public', 'favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = 'http://localhost:5173/stalls';
  win.loadURL(startUrl);

  win.on('closed', () => {
    win = null;
  });
}

function startVite() {
  return new Promise((resolve) => {
    const isDev = !app.isPackaged;
    if (isDev) {
      viteProcess = spawn(process.platform === 'win32' ? 'npx' : 'npx', ['vite', '--port', '5173'], {
        cwd: path.join(__dirname),
        shell: true,
        stdio: 'pipe',
      });

      let resolved = false;
      viteProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (!resolved && output.includes('ready')) {
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
      }, 5000);
    } else {
      resolve();
    }
  });
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
  if (viteProcess) {
    viteProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (viteProcess) {
    viteProcess.kill();
  }
});
