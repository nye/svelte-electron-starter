const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const settings = require('electron-settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let windowState = {};

// Create simple menu for easy devtools access, and for demo
const applicationMenu = [
	{
	  label: app.name,
	  submenu: [
		{
			label: 'About ' + app.name,
			role: 'about'
		},
		/*{
			type: 'separator'
		},
		{
			label: 'Open Dev Tools',
			click() {
				mainWindow.openDevTools();
			},
		},*/
		{
			type: 'separator'
		},
		{
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Q',
			click: () => { app.quit(); }
		}
	  ],
	},
	{
		label: 'Edit',
		submenu: [{
		  label: 'Undo',
		  accelerator: 'CmdOrCtrl+Z',
		  selector: 'undo:'
		}, {
		  label: 'Redo',
		  accelerator: 'Shift+CmdOrCtrl+Z',
		  selector: 'redo:'
		}, {
		  type: 'separator'
		}, {
		  label: 'Cut',
		  accelerator: 'CmdOrCtrl+X',
		  selector: 'cut:'
		}, {
		  label: 'Copy',
		  accelerator: 'CmdOrCtrl+C',
		  selector: 'copy:'
		}, {
		  label: 'Paste',
		  accelerator: 'CmdOrCtrl+V',
		  selector: 'paste:'
		}, {
		  label: 'Select All',
		  accelerator: 'CmdOrCtrl+A',
		  selector: 'selectAll:'
		}]
	  }
  ];

function createWindow() {
	const mode = process.env.NODE_ENV;

	windowState = settings.get('windowState', {});

    mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js'
		},
		title: app.name,
  		icon: __dirname + '/img/icon.png',
		titleBarStyle: 'hidden',
        width: windowState.bounds && windowState.bounds.width || 1600,
		height: windowState.bounds && windowState.bounds.height || 920,
		x: windowState.bounds && windowState.bounds.x || undefined,
		y: windowState.bounds && windowState.bounds.y || undefined,
		backgroundColor: '#FFFFFF',
		show: false
	});

	if(settings.get('isMaximized')){
		mainWindow.maximize();
	}

	if (process.platform === 'darwin') {
		Menu.setApplicationMenu(Menu.buildFromTemplate(applicationMenu));
	}

	if (mode === 'development') {
		// Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
		//Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
		// If we are developers we might as well open the devtools by default.
		mainWindow.webContents.openDevTools();
	}

	let watcher;

    if (mode === 'development') {
        watcher = require('chokidar').watch(path.join(__dirname, '../public/bundle.js'), { ignoreInitial: true });
        watcher.on('change', () => {
            mainWindow.reload();
        });
    }

	mainWindow.loadURL(`file://${path.join(__dirname, '../public/index.html')}`);

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	['resize', 'move', 'close'].forEach((e) => {
		mainWindow.on(e, () => {
			windowState.isMaximized = mainWindow.isMaximized();

			if(!windowState.isMaximized){
				windowState.bounds = mainWindow.getBounds();
			}

			settings.set('windowState', windowState);
		});
	});

	mainWindow.on('close', (e) => {
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
        if(watcher){
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
