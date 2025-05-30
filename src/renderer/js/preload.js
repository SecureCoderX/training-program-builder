const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Training program operations
  createTrainingProgram: (programData) => ipcRenderer.invoke('create-training-program', programData),
  getTrainingPrograms: () => ipcRenderer.invoke('get-training-programs'),
  
  // Module operations
  createTrainingModule: (moduleData) => ipcRenderer.invoke('create-training-module', moduleData),
  getModulesByProgram: (programId) => ipcRenderer.invoke('get-modules-by-program', programId),
  updateModuleOrder: (moduleId, newOrder) => ipcRenderer.invoke('update-module-order', moduleId, newOrder),
  updateTrainingModule: (moduleId, moduleData) => ipcRenderer.invoke('update-training-module', moduleId, moduleData),
  deleteTrainingModule: (moduleId) => ipcRenderer.invoke('delete-training-module', moduleId),
  
  // Employee operations
  createEmployee: (employeeData) => ipcRenderer.invoke('create-employee', employeeData),
  getEmployees: () => ipcRenderer.invoke('get-employees'),
  getEmployeeById: (employeeId) => ipcRenderer.invoke('get-employee-by-id', employeeId),
  updateEmployee: (employeeId, employeeData) => ipcRenderer.invoke('update-employee', employeeId, employeeData),
  deleteEmployee: (employeeId) => ipcRenderer.invoke('delete-employee', employeeId),
  
  // Training assignment operations
  assignTrainingToEmployee: (employeeId, programId) => ipcRenderer.invoke('assign-training-to-employee', employeeId, programId),
  getEmployeeTrainingAssignments: (employeeId) => ipcRenderer.invoke('get-employee-training-assignments', employeeId),
  updateTrainingProgress: (employeeId, moduleId, status, score) => ipcRenderer.invoke('update-training-progress', employeeId, moduleId, status, score),
  
  // Menu event listener
  onMenuNewProgram: (callback) => ipcRenderer.on('menu-new-program', callback),
  
  // Utility functions
  platform: process.platform,
  versions: process.versions
});

// DOM content loaded event
window.addEventListener('DOMContentLoaded', () => {
  console.log('Training Program Builder - Renderer Process Ready');
});