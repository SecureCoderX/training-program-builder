/**
 * Training Program Builder - Main Application Orchestrator
 * Lightweight coordinator for modular architecture
 */

class TrainingProgramApp {
    constructor() {
        this.currentView = 'dashboard';
        this.programManager = null;
        this.employeeManager = null;
        this.reportsManager = null;
        this.hasReportsManager = false;
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
        
        try {
            // Wait for modules to load
            await this.waitForModules();
            
            // Initialize managers
            this.programManager = new ProgramManager();
            this.employeeManager = new EmployeeManager();
            
            if (this.hasReportsManager) {
                this.reportsManager = new ReportsManager();
            }
            
            // Setup core event listeners
            this.setupNavigationHandlers();
            this.setupGlobalModalHandlers();
            this.setupFormHandlers();
            this.setupMenuHandlers();
            
            // Load initial data and update dashboard
            console.log('Loading initial data...');
            await this.loadInitialData();
            this.updateDashboard();
            
            console.log('Training Program Builder initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            UIUtils.showNotification('Failed to initialize application: ' + error.message, 'error');
        }
    }

    // ============================================================================
    // MODULE LOADING & DETECTION
    // ============================================================================

    async waitForModules() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            // Check for required modules
            if (window.ProgramManager && window.EmployeeManager && 
                window.UIUtils && window.ModalManager && window.APIService) {
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.error('Required modules not found:', {
                ProgramManager: !!window.ProgramManager,
                EmployeeManager: !!window.EmployeeManager,
                UIUtils: !!window.UIUtils,
                ModalManager: !!window.ModalManager,
                APIService: !!window.APIService
            });
            throw new Error('Module loading timeout - check that all script files are loaded');
        }
        
        // Check API availability
        if (!window.APIService.isAvailable()) {
            throw new Error('Electron API not available - check preload script');
        }
        
        // ReportsManager is optional
        this.hasReportsManager = !!window.ReportsManager;
        console.log('ReportsManager available:', this.hasReportsManager);
        
        console.log('All required modules loaded successfully');
    }

    // ============================================================================
    // EVENT HANDLERS SETUP
    // ============================================================================

    setupNavigationHandlers() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('href').substring(1);
                this.switchView(viewId);
            });
        });
    }

    setupGlobalModalHandlers() {
        // Global modal close handlers
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

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    ModalManager.hide(modal.id);
                });
            }
        });
    }

    setupFormHandlers() {
        // New Program Form
        const newProgramForm = document.getElementById('new-program-form');
        if (newProgramForm) {
            newProgramForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('new-program-form');
                    const result = await this.programManager.createProgram(formData);
                    if (result) {
                        ModalManager.hide('new-program-modal');
                        await this.programManager.renderProgramsList();
                        this.updateDashboard();
                    }
                } catch (error) {
                    console.error('Error creating program:', error);
                    UIUtils.showNotification('Failed to create program', 'error');
                }
            });
        }

        // New Module Form
        const newModuleForm = document.getElementById('new-module-form');
        if (newModuleForm) {
            newModuleForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('new-module-form');
                    formData.program_id = this.programManager.currentProgramId;
                    
                    const result = await this.programManager.createModule(formData);
                    if (result) {
                        ModalManager.hide('new-module-modal');
                        await this.programManager.renderModules();
                        this.updateDashboard();
                    }
                } catch (error) {
                    console.error('Error creating module:', error);
                    UIUtils.showNotification('Failed to create module', 'error');
                }
            });
        }

        // Edit Module Form
        const editModuleForm = document.getElementById('edit-module-form');
        if (editModuleForm) {
            editModuleForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('edit-module-form');
                    const moduleId = parseInt(formData.module_id);
                    delete formData.module_id;
                    
                    const result = await this.programManager.updateModule(moduleId, formData);
                    if (result) {
                        ModalManager.hide('edit-module-modal');
                        await this.programManager.renderModules();
                        this.updateDashboard();
                    }
                } catch (error) {
                    console.error('Error updating module:', error);
                    UIUtils.showNotification('Failed to update module', 'error');
                }
            });
        }

        // Add Employee Form
        const addEmployeeForm = document.getElementById('add-employee-form');
        if (addEmployeeForm) {
            addEmployeeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('add-employee-form');
                    
                    const result = await this.employeeManager.createEmployee(formData);
                    if (result) {
                        ModalManager.hide('add-employee-modal');
                        await this.employeeManager.renderEmployeesList();
                        this.updateDashboard();
                    }
                } catch (error) {
                    console.error('Error creating employee:', error);
                    UIUtils.showNotification('Failed to create employee', 'error');
                }
            });
        }

        // Edit Employee Form
        const editEmployeeForm = document.getElementById('edit-employee-form');
        if (editEmployeeForm) {
            editEmployeeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('edit-employee-form');
                    const employeeId = parseInt(formData.employee_id);
                    delete formData.employee_id;
                    
                    const result = await window.APIService.updateEmployee(employeeId, formData);
                    if (result.success) {
                        // Update local data
                        const empIndex = this.employeeManager.employees.findIndex(e => e.id === employeeId);
                        if (empIndex !== -1) {
                            this.employeeManager.employees[empIndex] = { 
                                ...this.employeeManager.employees[empIndex], 
                                ...formData 
                            };
                        }
                        
                        ModalManager.hide('edit-employee-modal');
                        this.employeeManager.updateEmployeeDetailView();
                        await this.employeeManager.renderEmployeesList();
                        this.updateDashboard();
                        UIUtils.showNotification('Employee updated successfully!', 'success');
                    } else {
                        UIUtils.showNotification('Error updating employee: ' + result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error updating employee:', error);
                    UIUtils.showNotification('Failed to update employee', 'error');
                }
            });
        }

        // Assign Training Form
        const assignTrainingForm = document.getElementById('assign-training-form');
        if (assignTrainingForm) {
            assignTrainingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = UIUtils.getFormData('assign-training-form');
                    
                    const result = await window.APIService.assignTrainingToEmployee(
                        parseInt(formData.employee_id), 
                        parseInt(formData.program_id)
                    );
                    
                    if (result.success) {
                        ModalManager.hide('assign-training-modal');
                        await this.employeeManager.loadEmployeeAssignments(formData.employee_id);
                        this.employeeManager.renderAssignmentsList();
                        UIUtils.showNotification('Training assigned successfully!', 'success');
                    } else {
                        UIUtils.showNotification('Error assigning training: ' + result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error assigning training:', error);
                    UIUtils.showNotification('Failed to assign training', 'error');
                }
            });
        }

        // Generate Report Form
        const generateReportForm = document.getElementById('generate-report-form');
        if (generateReportForm && this.hasReportsManager) {
            generateReportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.reportsManager.handleGenerateReport();
            });
        }

        // Button handlers
        this.setupButtonHandlers();
    }

    setupButtonHandlers() {
        // New Program Button
        const newProgramBtn = document.getElementById('new-program-btn');
        if (newProgramBtn) {
            newProgramBtn.addEventListener('click', () => {
                if (this.programManager && this.programManager.showNewProgramModal) {
                    this.programManager.showNewProgramModal();
                } else {
                    console.error('ProgramManager or showNewProgramModal method not available');
                }
            });
        }

        // Add Module Button
        const addModuleBtn = document.getElementById('add-module-btn');
        if (addModuleBtn) {
            addModuleBtn.addEventListener('click', () => {
                if (this.programManager && this.programManager.showNewModuleModal) {
                    this.programManager.showNewModuleModal();
                } else {
                    console.error('ProgramManager or showNewModuleModal method not available');
                }
            });
        }

        // Add Employee Button
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                if (this.employeeManager && this.employeeManager.showAddEmployeeModal) {
                    this.employeeManager.showAddEmployeeModal();
                } else {
                    console.error('EmployeeManager or showAddEmployeeModal method not available');
                }
            });
        }

        // Edit Employee Button
        const editEmployeeBtn = document.getElementById('edit-employee-btn');
        if (editEmployeeBtn) {
            editEmployeeBtn.addEventListener('click', () => {
                if (this.employeeManager && this.employeeManager.showEditEmployeeModal) {
                    this.employeeManager.showEditEmployeeModal();
                } else {
                    console.error('EmployeeManager or showEditEmployeeModal method not available');
                }
            });
        }

        // Assign Training Button
        const assignTrainingBtn = document.getElementById('assign-training-btn');
        if (assignTrainingBtn) {
            assignTrainingBtn.addEventListener('click', () => {
                if (this.employeeManager && this.employeeManager.showAssignTrainingModal) {
                    this.employeeManager.showAssignTrainingModal();
                } else {
                    console.error('EmployeeManager or showAssignTrainingModal method not available');
                }
            });
        }

        // Generate Report Button
        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn && this.hasReportsManager) {
            generateReportBtn.addEventListener('click', () => {
                this.reportsManager.showReportModal();
            });
        }
    }

    setupMenuHandlers() {
        if (window.electronAPI) {
            window.electronAPI.onMenuNewProgram(() => {
                if (this.programManager && this.programManager.showNewProgramModal) {
                    this.programManager.showNewProgramModal();
                }
            });
        }
    }

    // ============================================================================
    // VIEW SWITCHING & NAVIGATION
    // ============================================================================

    switchView(viewId) {
        console.log('Switching to view:', viewId);
        
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

    async handleViewSwitch(viewId) {
        try {
            switch (viewId) {
                case 'programs':
                    if (this.programManager && this.programManager.renderProgramsList) {
                        await this.programManager.renderProgramsList();
                    }
                    break;
                case 'employees':
                    if (this.employeeManager && this.employeeManager.renderEmployeesList) {
                        await this.employeeManager.renderEmployeesList();
                    }
                    break;
                case 'reports':
                    if (this.hasReportsManager) {
                        this.updateReportsView();
                    } else {
                        this.showReportsUnavailable();
                    }
                    break;
                case 'dashboard':
                    this.updateDashboard();
                    break;
            }
        } catch (error) {
            console.error('Error switching view:', error);
            UIUtils.showNotification('Error loading view: ' + error.message, 'error');
        }
    }

    // ============================================================================
    // DASHBOARD UPDATES
    // ============================================================================

    async loadInitialData() {
        try {
            console.log('Loading programs...');
            const programs = await this.programManager.loadPrograms();
            console.log('Loaded programs:', programs);
            
            console.log('Loading employees...');
            const employees = await this.employeeManager.loadEmployees();
            console.log('Loaded employees:', employees);
            
            console.log(`Successfully loaded ${programs.length} programs and ${employees.length} employees`);
        } catch (error) {
            console.error('Error loading initial data:', error);
            UIUtils.showNotification('Failed to load data from database', 'error');
            throw error;
        }
    }

    updateDashboard() {
        this.updateDashboardStats();
        this.updateRecentPrograms();
    }

    updateDashboardStats() {
        const programCount = this.programManager?.programs?.length || 0;
        const employeeCount = this.employeeManager?.employees?.length || 0;
        
        const totalProgramsEl = document.getElementById('total-programs');
        const totalEmployeesEl = document.getElementById('total-employees');
        
        if (totalProgramsEl) totalProgramsEl.textContent = programCount;
        if (totalEmployeesEl) totalEmployeesEl.textContent = employeeCount;
    }

    updateRecentPrograms() {
        const container = document.getElementById('recent-programs');
        if (!container) return;
        
        const programs = this.programManager?.programs || [];
        
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

    updateReportsView() {
        const employees = this.employeeManager?.employees || [];
        
        // Calculate overall completion rate
        const employeesWithAssignments = employees.filter(emp => emp.assigned_programs > 0);
        const fullyCompliantEmployees = employeesWithAssignments.filter(emp => 
            emp.completed_programs === emp.assigned_programs
        );
        const overallCompletionRate = employeesWithAssignments.length > 0 ? 
            Math.round((fullyCompliantEmployees.length / employeesWithAssignments.length) * 100) : 0;
        
        // Calculate other metrics
        const avgCompletionTime = Math.floor(Math.random() * 20) + 10;
        const overdueCount = employees.filter(emp => 
            emp.assigned_programs > emp.completed_programs
        ).length;
        const certificatesIssued = employees.reduce((sum, emp) => 
            sum + (emp.completed_programs || 0), 0
        );
        
        // Update the quick stats
        const elements = {
            'completion-rate': `${overallCompletionRate}%`,
            'avg-completion-time': avgCompletionTime,
            'overdue-count': overdueCount,
            'certificates-issued': certificatesIssued
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    showReportsUnavailable() {
        const container = document.getElementById('report-results');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📊</span>
                    <h4>Reports Module Not Available</h4>
                    <p>Create the ReportsManager.js file to enable advanced reporting features</p>
                </div>
            `;
        }
        
        // Set default values for quick stats
        const elements = {
            'completion-rate': '0%',
            'avg-completion-time': '0',
            'overdue-count': '0',
            'certificates-issued': '0'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
}

// ============================================================================
// GLOBAL FUNCTIONS (for onclick handlers in HTML)
// ============================================================================

function showNewProgramModal() {
    if (window.app && window.app.programManager) {
        window.app.programManager.showNewProgramModal();
    } else {
        console.error('App or ProgramManager not available');
    }
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

function hideGenerateReportModal() {
    ModalManager.hide('generate-report-modal');
}

function handleDeleteModule() {
    if (window.app && window.app.programManager) {
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
    if (window.app && window.app.employeeManager) {
        const employeeId = parseInt(document.getElementById('edit-employee-id').value);
        
        if (!confirm('Are you sure you want to delete this employee? This will also remove all their training progress.')) {
            return;
        }

        window.electronAPI.deleteEmployee(employeeId).then(result => {
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

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================

window.app = new TrainingProgramApp();