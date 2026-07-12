const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 750,
    minWidth: 600,
    minHeight: 500,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
    },
    title: 'Quản lý Chi tiêu',
    backgroundColor: '#f5f3f0'
  });

  mainWindow.loadFile('index.html');
  
  // Ẩn menu mặc định
  Menu.setApplicationMenu(null);

  // Mở link trong trình duyệt ngoài
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});