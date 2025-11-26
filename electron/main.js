import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        transparent: true,
        backgroundColor: '#00000000', // Ensure true transparency
        frame: false,
        alwaysOnTop: true,
        hasShadow: false,
        resizable: true,
        minWidth: 600,
        minHeight: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
        },
    });
    // Keep overlay on top even in fullscreen games
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Re‑show window on focus/blur to prevent it disappearing after map change
    win.on('focus', () => {
        win.show();
    });
    win.on('blur', () => {
        win.show();
    });
    // Re‑apply always‑on‑top and visibility when display metrics change (e.g., map switch)
    screen.on('display-metrics-changed', () => {
        win.setAlwaysOnTop(true, 'screen-saver');
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    });

    // Force minimum size constraints manually as well
    win.on('will-resize', (event, { width, height }) => {
        // Electron's will-resize event provides bounds, but we need to check them
        // Note: newBounds might be passed as the second argument
    });

    // Correct implementation for will-resize in Electron
    win.on('will-resize', (event, newBounds) => {
        if (newBounds.width < 600) {
            event.preventDefault();
        }
        if (newBounds.height < 200) {
            event.preventDefault();
        }
    });

    // In development, load the Vite dev server
    const devUrl = 'http://localhost:5173';

    win.loadURL(devUrl).catch(() => {
        console.log('Waiting for Vite server...');
        setTimeout(() => win.loadURL(devUrl), 3000);
    });
}

app.whenReady().then(() => {
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
