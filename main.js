const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Hayan School System",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'hss_real.ico') // Updated to the correct icon
    });

    // DEVELOPMENT MODE:
    // Load the Vite Dev Server URL so changes are reflected instantly (Sync with Browser)
    const devUrl = 'http://localhost:5173';

    // PRODUCTION/FALLBACK MODE:
    const prodFile = path.join(__dirname, 'frontend', 'dist', 'index.html');

    const loadApp = async () => {
        let retries = 10;
        while (retries > 0) {
            try {
                await mainWindow.loadURL(devUrl);
                console.log("Connected to Dev Server");
                return;
            } catch (err) {
                console.log(`Dev server not ready, retrying... (${retries} attempts left)`);
                retries--;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            }
        }

        console.log("Dev server failed, falling back to build file...");
        mainWindow.loadFile(prodFile).catch(e => {
            console.error("Failed to load build file either.", e);
        });
    };

    loadApp();

    // Make links open in external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackend() {
    console.log("Starting Backend...");

    const backendPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app', 'backend', 'server.js')
        : path.join(__dirname, 'backend', 'server.js');

    const backendCwd = app.isPackaged
        ? path.join(process.resourcesPath, 'app', 'backend')
        : path.join(__dirname, 'backend');

    // Spawn node process
    backendProcess = fork(backendPath, [], {
        cwd: backendCwd,
        env: { ...process.env, PORT: 5002 },
        stdio: 'pipe'
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        // If we see EADDRINUSE, it means backend is already running (e.g. from start_hayan_system.bat)
        // We can ignore it, as we want to connect to the existing one.
        if (data.toString().includes('EADDRINUSE')) {
            console.log("Backend port 5002 is already in use. Assuming external backend is running.");
        } else {
            console.error(`Backend Error: ${data}`);
        }
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
