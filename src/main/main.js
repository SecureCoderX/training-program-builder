const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { initializeDatabase, createTrainingProgram, getTrainingPrograms, getTrainingProgramsWithModuleCounts, 
        createTrainingModule, getModulesByProgramId, updateModuleOrder, updateTrainingModule, deleteTrainingModule,
        createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee,
        assignTrainingToEmployee, getEmployeeTrainingAssignments, getEmployeesWithTrainingProgress, updateTrainingProgress } = require('./database');

class TrainingProgramApp {
  constructor() {
    this.mainWindow = null;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async initialize() {
    // Initialize database
    await initializeDatabase();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Create application menu
    this.createApplicationMenu();
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../renderer/js/preload.js')
      },
      titleBarStyle: 'default',
      show: false
    });

    // Load the main HTML file
    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      if (this.isDevelopment) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupEventHandlers() {
    // App event handlers
    app.whenReady().then(() => this.createMainWindow());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // IPC handlers for database operations
    ipcMain.handle('create-training-program', async (event, programData) => {
      try {
        const result = await createTrainingProgram(programData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error creating training program:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-training-programs', async () => {
      try {
        const programs = await getTrainingProgramsWithModuleCounts();
        return { success: true, data: programs };
      } catch (error) {
        console.error('Error fetching training programs:', error);
        return { success: false, error: error.message };
      }
    });

    // Module management handlers
    ipcMain.handle('create-training-module', async (event, moduleData) => {
      try {
        const result = await createTrainingModule(moduleData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error creating training module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-modules-by-program', async (event, programId) => {
      try {
        const modules = await getModulesByProgramId(programId);
        return { success: true, data: modules };
      } catch (error) {
        console.error('Error fetching modules:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('update-module-order', async (event, moduleId, newOrder) => {
      try {
        const result = await updateModuleOrder(moduleId, newOrder);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error updating module order:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('update-training-module', async (event, moduleId, moduleData) => {
      try {
        const result = await updateTrainingModule(moduleId, moduleData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error updating training module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('delete-training-module', async (event, moduleId) => {
      try {
        const result = await deleteTrainingModule(moduleId);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error deleting training module:', error);
        return { success: false, error: error.message };
      }
    });

    // Employee management handlers
    ipcMain.handle('create-employee', async (event, employeeData) => {
      try {
        const result = await createEmployee(employeeData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error creating employee:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-employees', async () => {
      try {
        const employees = await getEmployeesWithTrainingProgress();
        return { success: true, data: employees };
      } catch (error) {
        console.error('Error fetching employees:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-employee-by-id', async (event, employeeId) => {
      try {
        const employee = await getEmployeeById(employeeId);
        return { success: true, data: employee };
      } catch (error) {
        console.error('Error fetching employee:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('update-employee', async (event, employeeId, employeeData) => {
      try {
        const result = await updateEmployee(employeeId, employeeData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error updating employee:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('delete-employee', async (event, employeeId) => {
      try {
        const result = await deleteEmployee(employeeId);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error deleting employee:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('assign-training-to-employee', async (event, employeeId, programId) => {
      try {
        const result = await assignTrainingToEmployee(employeeId, programId);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error assigning training:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('get-employee-training-assignments', async (event, employeeId) => {
      try {
        const assignments = await getEmployeeTrainingAssignments(employeeId);
        return { success: true, data: assignments };
      } catch (error) {
        console.error('Error fetching employee assignments:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('update-training-progress', async (event, employeeId, moduleId, status, score) => {
      try {
        const result = await updateTrainingProgress(employeeId, moduleId, status, score);
        return { success: true, data: result };
      } catch (error) {
        console.error('Error updating training progress:', error);
        return { success: false, error: error.message };
      }
    });
  }

  createApplicationMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Program',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu-new-program');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Training Program Builder',
            click: () => {
              // Could open an about dialog
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Initialize and start the application
const trainingApp = new TrainingProgramApp();
trainingApp.initialize();