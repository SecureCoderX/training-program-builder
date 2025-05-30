/**
 * APIService - Centralized API communication layer
 */
class APIService {
    constructor() {
        this.api = window.electronAPI;
    }

    // Training Program Operations
    async createTrainingProgram(programData) {
        return await this.api.createTrainingProgram(programData);
    }

    async getTrainingPrograms() {
        return await this.api.getTrainingPrograms();
    }

    // Module Operations
    async createTrainingModule(moduleData) {
        return await this.api.createTrainingModule(moduleData);
    }

    async getModulesByProgram(programId) {
        return await this.api.getModulesByProgram(programId);
    }

    async updateTrainingModule(moduleId, moduleData) {
        return await this.api.updateTrainingModule(moduleId, moduleData);
    }

    async deleteTrainingModule(moduleId) {
        return await this.api.deleteTrainingModule(moduleId);
    }

    async updateModuleOrder(moduleId, newOrder) {
        return await this.api.updateModuleOrder(moduleId, newOrder);
    }

    // Employee Operations
    async createEmployee(employeeData) {
        return await this.api.createEmployee(employeeData);
    }

    async getEmployees() {
        return await this.api.getEmployees();
    }

    async getEmployeeById(employeeId) {
        return await this.api.getEmployeeById(employeeId);
    }

    async updateEmployee(employeeId, employeeData) {
        return await this.api.updateEmployee(employeeId, employeeData);
    }

    async deleteEmployee(employeeId) {
        return await this.api.deleteEmployee(employeeId);
    }

    // Training Assignment Operations
    async assignTrainingToEmployee(employeeId, programId) {
        return await this.api.assignTrainingToEmployee(employeeId, programId);
    }

    async getEmployeeTrainingAssignments(employeeId) {
        return await this.api.getEmployeeTrainingAssignments(employeeId);
    }

    async updateTrainingProgress(employeeId, moduleId, status, score) {
        return await this.api.updateTrainingProgress(employeeId, moduleId, status, score);
    }

    // Menu Events
    onMenuNewProgram(callback) {
        return this.api.onMenuNewProgram(callback);
    }

    // Utility Methods
    isAvailable() {
        return !!this.api;
    }

    getPlatform() {
        return this.api.platform;
    }

    getVersions() {
        return this.api.versions;
    }
}

// Export singleton instance
window.APIService = new APIService();