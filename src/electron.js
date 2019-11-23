const { app, BrowserWindow, Menu } = require('electron');
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create simple menu for easy devtools access, and for demo
const menuTemplateDev = [
	{
	  label: 'Options',
	  submenu: [
		{
		  label: 'Open Dev Tools',
		  click() {
			mainWindow.openDevTools();
		  },
		},
	  ],
	},
  ];

function createWindow() {
	const mode = process.env.NODE_ENV;

    mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js'
		},
		titleBarStyle: 'hidden',
        height: 920,
    	width: 1600,
	});

	if (process.env.NODE_ENV === 'development') {
		// Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
		//Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
		// If we are developers we might as well open the devtools by default.
		mainWindow.webContents.openDevTools();
	}

	let watcher;

    if (process.env.NODE_ENV === 'development') {
        watcher = require('chokidar').watch(path.join(__dirname, '../public/bundle.js'), { ignoreInitial: true });
        watcher.on('change', () => {
            mainWindow.reload();
        });
    }

	mainWindow.loadURL(`file://${path.join(__dirname, '../public/index.html')}`);

	mainWindow.on('close', function(e){
		if(mainWindow.isDocumentEdited()){
			var choice = require('electron').dialog.showMessageBoxSync(this, {
				type: 'question',
				buttons: ['Yes', 'No'],
				title: 'Confirm',
				message: 'Are you sure you want to quit?'
			});

			if(choice == 1) e.preventDefault();
		}
	});

	mainWindow.on('closed', () => {
        if (watcher) {
            watcher.close();
        }
        mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
