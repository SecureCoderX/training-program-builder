/**
 * Training Program Builder - Main Application
 * Clean orchestrator that coordinates all modules
 */

class TrainingProgramApp {
    constructor() {
        this.currentView = 'dashboard';
        this.initialize();
    }

    async initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            await this.init();
        }
    }

    async init() {
        console.log('Training Program Builder initializing...');
        
        // Wait for modules to load
        await this.waitForModules();
        
        // Initialize managers
        this.programManager = new ProgramManager();
        this.employeeManager = new EmployeeManager();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupMenuHandlers();
        this.setupModalEventListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        // Update dashboard
        this.updateDashboard();
        
        console.log('Training Program Builder initialized');
    }

    async waitForModules() {
        let attempts = 0;
        while ((!window.APIService || !window.UIUtils || !window.ModalManager || 
                !window.ProgramManager || !window.EmployeeManager) && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        if (attempts >= 100) {
            console.error('Failed to load required modules');
            throw new Error('Module loading timeout');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('href').substring(1);
                this.switchView(viewId);
            });
        });

        // Program management
        this.setupFormHandler('new-program-btn', 'click', () => this.programManager.showNewProgramModal());
        this.setupFormHandler('new-program-form', 'submit', (e) => this.handleCreateProgram(e));
        this.setupFormHandler('add-module-btn', 'click', () => this.programManager.showNewModuleModal());
        this.setupFormHandler('new-module-form', 'submit', (e) => this.handleCreateModule(e));
        this.setupFormHandler('edit-module-form', 'submit', (e) => this.handleUpdateModule(e));

        // Employee management
        this.setupFormHandler('add-employee-btn', 'click', () => this.employeeManager.showAddEmployeeModal());
        this.setupFormHandler('add-employee-form', 'submit', (e) => this.handleCreateEmployee(e));
        this.setupFormHandler('edit-employee-btn', 'click', () => this.employeeManager.showEditEmployeeModal());
        this.setupFormHandler('edit-employee-form', 'submit', (e) => this.handleUpdateEmployee(e));
        this.setupFormHandler('assign-training-btn', 'click', () => this.employeeManager.showAssignTrainingModal());
        this.setupFormHandler('assign-training-form', 'submit', (e) => this.handleAssignTraining(e));
    }

    setupFormHandler(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    setupModalEventListeners() {
        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) ModalManager.hide(modal.id);
            });
        });

        // Click outside to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    ModalManager.hide(modal.id);
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    ModalManager.hide(modal.id);
                });
            }
        });
    }

    setupMenuHandlers() {
        if (window.electronAPI) {
            window.electronAPI.onMenuNewProgram(() => {
                this.programManager.showNewProgramModal();
            });
        }
    }

    async loadInitialData() {
        try {
            const [programs, employees] = await Promise.all([
                this.programManager.loadPrograms(),
                this.employeeManager.loadEmployees()
            ]);
            
            console.log(`Loaded ${programs.length} programs and ${employees.length} employees`);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    switchView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[href="#${viewId}"]`)?.parentElement;
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        this.currentView = viewId;
        this.handleViewSwitch(viewId);
    }

    handleViewSwitch(viewId) {
        switch (viewId) {
            case 'programs':
                this.programManager.renderProgramsList();
                break;
            case 'employees':
                this.employeeManager.renderEmployeesList();
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
        }
    }

    updateDashboard() {
        const programCount = this.programManager.programs.length;
        const employeeCount = this.employeeManager.employees.length;
        
        document.getElementById('total-programs').textContent = programCount;
        document.getElementById('total-employees').textContent = employeeCount;
        
        this.updateRecentPrograms();
    }

    updateRecentPrograms() {
        const container = document.getElementById('recent-programs');
        if (!container) return;
        
        const programs = this.programManager.programs;
        
        if (programs.length === 0) {
            container.innerHTML = UIUtils.createEmptyState(
                '📚',
                'No training programs yet',
                'Create your first training program to get started',
                'Create Program',
                'window.app.programManager.showNewProgramModal()'
            );
        } else {
            const recentPrograms = programs.slice(0, 3);
            container.innerHTML = recentPrograms.map(program => `
                <div class="program-card">
                    <h4>${UIUtils.escapeHtml(program.name)}</h4>
                    <p>${UIUtils.escapeHtml(program.description || 'No description')}</p>
                    <div class="program-meta">
                        <span>Created: ${UIUtils.formatDate(program.created_date)}</span>
                        <span class="module-count">${program.module_count || 0} modules</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Event Handlers
    async handleCreateProgram(e) {
        e.preventDefault();
        const programData = UIUtils.getFormData('new-program-form');
        
        if (!programData.name) {
            alert('Please enter a program name');
            return;
        }

        const result = await this.programManager.createProgram(programData);
        if (result) {
            ModalManager.hide('new-program-modal');
            this.programManager.renderProgramsList();
            this.updateDashboard();
            
            if (this.currentView !== 'programs') {
                this.switchView('programs');
            }
        }
    }

    async handleCreateModule(e) {
        e.preventDefault();
        const moduleData = UIUtils.getFormData('new-module-form');
        
        if (!moduleData.name) {
            alert('Please enter a module name');
            return;
        }

        moduleData.program_id = this.programManager.currentProgramId;
        moduleData.is_required = moduleData.is_required === 'on';
        moduleData.duration_minutes = parseInt(moduleData.duration_minutes) || 0;
        moduleData.order_index = this.programManager.currentModules.length;

        const result = await this.programManager.createModule(moduleData);
        if (result) {
            ModalManager.hide('new-module-modal');
            this.programManager.renderModulesList();
            this.updateDashboard();
        }
    }

    async handleUpdateModule(e) {
        e.preventDefault();
        const moduleData = UIUtils.getFormData('edit-module-form');
        const moduleId = parseInt(moduleData.module_id);
        
        delete moduleData.module_id;
        moduleData.is_required = moduleData.is_required === 'on';
        moduleData.duration_minutes = parseInt(moduleData.duration_minutes) || 0;

        const result = await this.programManager.updateModule(moduleId, moduleData);
        if (result) {
            ModalManager.hide('edit-module-modal');
            this.programManager.renderModulesList();
        }
    }

    async handleCreateEmployee(e) {
        e.preventDefault();
        const employeeData = UIUtils.getFormData('add-employee-form');
        
        if (!employeeData.first_name || !employeeData.last_name) {
            alert('Please enter both first and last name');
            return;
        }

        const result = await this.employeeManager.createEmployee(employeeData);
        if (result) {
            ModalManager.hide('add-employee-modal');
            this.employeeManager.renderEmployeesList();
            this.updateDashboard();
            
            if (this.currentView !== 'employees') {
                this.switchView('employees');
            }
        }
    }

    async handleUpdateEmployee(e) {
        e.preventDefault();
        const employeeData = UIUtils.getFormData('edit-employee-form');
        const employeeId = parseInt(employeeData.employee_id);
        
        delete employeeData.employee_id;

        const result = await window.APIService.updateEmployee(employeeId, employeeData);
        if (result.success) {
            const index = this.employeeManager.employees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
                this.employeeManager.employees[index] = { ...this.employeeManager.employees[index], ...employeeData };
            }
            
            ModalManager.hide('edit-employee-modal');
            this.employeeManager.renderEmployeesList();
            this.employeeManager.updateEmployeeDetailView();
            UIUtils.showNotification('Employee updated successfully!', 'success');
        } else {
            UIUtils.showNotification('Error updating employee: ' + result.error, 'error');
        }
    }

    async handleAssignTraining(e) {
        e.preventDefault();
        const formData = UIUtils.getFormData('assign-training-form');
        const employeeId = parseInt(formData.employee_id);
        const programId = parseInt(formData.program_id);

        if (!programId) {
            alert('Please select a training program');
            return;
        }

        try {
            UIUtils.showLoading();
            const result = await window.APIService.assignTrainingToEmployee(employeeId, programId);
            
            if (result.success) {
                const employeeIndex = this.employeeManager.employees.findIndex(e => e.id === employeeId);
                if (employeeIndex !== -1) {
                    this.employeeManager.employees[employeeIndex].assigned_programs += 1;
                }
                
                ModalManager.hide('assign-training-modal');
                await this.employeeManager.loadEmployeeAssignments(employeeId);
                this.employeeManager.renderAssignmentsList();
                this.employeeManager.updateEmployeeDetailView();
                this.updateDashboard();
                
                UIUtils.showNotification('Training assigned successfully!', 'success');
            } else {
                UIUtils.showNotification('Error assigning training: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error assigning training:', error);
            UIUtils.showNotification('Failed to assign training', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }
}

// Global functions for onclick handlers (backward compatibility)
function showNewProgramModal() {
    if (window.app) window.app.programManager.showNewProgramModal();
}

function hideNewProgramModal() {
    ModalManager.hide('new-program-modal');
}

function hideNewModuleModal() {
    ModalManager.hide('new-module-modal');
}

function hideEditModuleModal() {
    ModalManager.hide('edit-module-modal');
}

function hideAddEmployeeModal() {
    ModalManager.hide('add-employee-modal');
}

function hideEditEmployeeModal() {
    ModalManager.hide('edit-employee-modal');
}

function hideAssignTrainingModal() {
    ModalManager.hide('assign-training-modal');
}

function handleDeleteModule() {
    if (window.app) {
        const moduleId = parseInt(document.getElementById('edit-module-id').value);
        window.app.programManager.deleteModule(moduleId).then(result => {
            if (result) {
                ModalManager.hide('edit-module-modal');
                window.app.programManager.renderModulesList();
                window.app.updateDashboard();
            }
        });
    }
}

function handleDeleteEmployee() {
    if (window.app) {
        const employeeId = parseInt(document.getElementById('edit-employee-id').value);
        
        if (!confirm('Are you sure you want to delete this employee? This will also remove all their training progress.')) {
            return;
        }

        window.APIService.deleteEmployee(employeeId).then(result => {
            if (result.success) {
                window.app.employeeManager.employees = window.app.employeeManager.employees.filter(e => e.id !== employeeId);
                
                ModalManager.hide('edit-employee-modal');
                window.app.switchView('employees');
                window.app.employeeManager.renderEmployeesList();
                window.app.updateDashboard();
                
                UIUtils.showNotification('Employee deleted successfully!', 'success');
            } else {
                UIUtils.showNotification('Error deleting employee: ' + result.error, 'error');
            }
        });
    }
}

// Initialize the application
window.app = new TrainingProgramApp();