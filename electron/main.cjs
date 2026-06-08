const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const net = require('net');

const TARGET_URL = 'http://localhost:5173/stalls';
const VITE_PORT = 5173;

let win = null;
let viteProcess = null;

function checkPort(port) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(500);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error', () => resolve(false));
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
    sock.connect(port, '127.0.0.1');
  });
}

async function waitForVite(maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const ready = await checkPort(VITE_PORT);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function startViteServer() {
  return new Promise((resolve) => {
    const cwd = require('path').resolve(__dirname, '..');
    console.log('[集市管理系统] 启动Vite开发服务器...', cwd);

    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    viteProcess = spawn(cmd, ['vite', '--port', String(VITE_PORT)], {
      cwd,
      shell: false,
      stdio: 'pipe',
      env: { ...process.env },
    });

    viteProcess.stdout.on('data', (data) => {
      const text = data.toString();
      console.log('[Vite]', text.trim());
    });

    viteProcess.stderr.on('data', (data) => {
      console.error('[Vite]', data.toString().trim());
    });

    viteProcess.on('error', (err) => {
      console.error('[集市管理系统] 启动Vite失败:', err.message);
    });

    viteProcess.on('exit', (code) => {
      console.log('[Vite] 进程退出, code:', code);
      viteProcess = null;
    });

    resolve(waitForVite());
  });
}

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

  win.loadURL(TARGET_URL);

  win.on('closed', () => {
    win = null;
  });
}

function killVite() {
  if (!viteProcess) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(viteProcess.pid), '/T', '/F'], {
        shell: true,
        stdio: 'ignore',
      });
    } else {
      viteProcess.kill('SIGTERM');
    }
  } catch (e) {
    // ignore
  }
  viteProcess = null;
}

app.whenReady().then(async () => {
  let viteReady = await checkPort(VITE_PORT);

  if (!viteReady) {
    console.log('[集市管理系统] Vite未运行，正在启动...');
    viteReady = await startViteServer();
  }

  if (!viteReady) {
    console.error('[集市管理系统] Vite启动超时，请手动运行 npm run dev 后再试');
    app.quit();
    return;
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  killVite();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  killVite();
});
