/**
 * EmployeeManager - Handles all employee and training assignment operations
 */
class EmployeeManager {
    constructor() {
        this.employees = [];
        this.currentEmployeeId = null;
        this.currentAssignments = [];
    }

    async loadEmployees() {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.getEmployees();
            
            if (result.success) {
                this.employees = result.data || [];
                return this.employees;
            } else {
                console.error('Error loading employees:', result.error);
                UIUtils.showNotification('Failed to load employees', 'error');
                return [];
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            UIUtils.showNotification('Failed to load employees', 'error');
            return [];
        } finally {
            UIUtils.hideLoading();
        }
    }

    async createEmployee(employeeData) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.createEmployee(employeeData);
            
            if (result.success) {
                this.employees.unshift({
                    ...result.data,
                    assigned_programs: 0,
                    completed_programs: 0,
                    total_modules: 0,
                    completed_modules: 0
                });
                
                UIUtils.showNotification('Employee added successfully!', 'success');
                return result.data;
            } else {
                UIUtils.showNotification('Error creating employee: ' + result.error, 'error');
                return null;
            }
        } catch (error) {
            console.error('Error creating employee:', error);
            UIUtils.showNotification('Failed to create employee', 'error');
            return null;
        } finally {
            UIUtils.hideLoading();
        }
    }

    async loadEmployeeAssignments(employeeId) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.getEmployeeTrainingAssignments(employeeId);
            
            if (result.success) {
                this.currentAssignments = result.data || [];
                return this.currentAssignments;
            } else {
                console.error('Error loading assignments:', result.error);
                UIUtils.showNotification('Failed to load assignments', 'error');
                return [];
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            UIUtils.showNotification('Failed to load assignments', 'error');
            return [];
        } finally {
            UIUtils.hideLoading();
        }
    }

    renderEmployeesList() {
        const container = document.getElementById('employees-list');
        if (!container) return;
        
        if (this.employees.length === 0) {
            container.innerHTML = UIUtils.createEmptyState(
                '👥',
                'No employees yet',
                'Add your first employee to get started',
                'Add Employee',
                'window.app.employeeManager.showAddEmployeeModal()'
            );
        } else {
            container.innerHTML = this.employees.map(employee => {
                const initials = UIUtils.generateEmployeeInitials(employee.first_name, employee.last_name);
                const completionRate = UIUtils.calculateProgress(employee.completed_modules, employee.total_modules);
                
                return `
                    <div class="employee-card" onclick="window.app.employeeManager.viewEmployee(${employee.id})">
                        <div class="employee-card-header">
                            <div class="employee-avatar">${initials}</div>
                            <div class="employee-card-info">
                                <h4>${UIUtils.escapeHtml(employee.first_name)} ${UIUtils.escapeHtml(employee.last_name)}</h4>
                                <div class="employee-card-meta">
                                    ${employee.position ? UIUtils.escapeHtml(employee.position) : 'No position'} • 
                                    ${employee.department ? UIUtils.escapeHtml(employee.department) : 'No department'}
                                </div>
                            </div>
                        </div>
                        <div class="employee-progress">
                            <div class="employee-progress-item">
                                <span class="progress-label">Assigned Programs</span>
                                <span class="progress-value">${employee.assigned_programs || 0}</span>
                            </div>
                            <div class="employee-progress-item">
                                <span class="progress-label">Completed Programs</span>
                                <span class="progress-value completed">${employee.completed_programs || 0}</span>
                            </div>
                            <div class="employee-progress-item">
                                <span class="progress-label">Completion Rate</span>
                                <span class="progress-value">${completionRate}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    renderAssignmentsList() {
        const container = document.getElementById('training-assignments-list');
        if (!container) return;
        
        if (this.currentAssignments.length === 0) {
            container.innerHTML = UIUtils.createEmptyState(
                '📚',
                'No training assignments yet',
                'Assign training programs to this employee to track their progress',
                'Assign Training',
                'window.app.employeeManager.showAssignTrainingModal()'
            );
        } else {
            container.innerHTML = this.currentAssignments.map(assignment => {
                const progressPercent = UIUtils.calculateProgress(assignment.completed_modules, assignment.total_modules);
                
                return `
                    <div class="assignment-item">
                        <div class="assignment-info">
                            <div class="assignment-title">${UIUtils.escapeHtml(assignment.program_name)}</div>
                            <div class="assignment-meta">
                                <span>Assigned: ${UIUtils.formatDate(assignment.assignment_date)}</span>
                                <span>${assignment.total_modules} modules</span>
                            </div>
                            <div class="assignment-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <span class="progress-text">${assignment.completed_modules}/${assignment.total_modules}</span>
                            </div>
                        </div>
                        <div class="assignment-status">
                            <span class="status-badge ${assignment.overall_status}">
                                ${assignment.overall_status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    showAddEmployeeModal() {
        ModalManager.show('add-employee-modal');
    }

    showEditEmployeeModal() {
        if (!this.currentEmployeeId) return;
        
        const employee = this.employees.find(e => e.id === this.currentEmployeeId);
        if (!employee) return;
        
        ModalManager.show('edit-employee-modal', employee);
    }

    showAssignTrainingModal() {
        if (!this.currentEmployeeId) return;
        
        ModalManager.show('assign-training-modal', {
            employeeId: this.currentEmployeeId,
            programs: window.app.programManager.programs
        });
    }

    async viewEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            UIUtils.showNotification('Employee not found', 'error');
            return;
        }

        this.currentEmployeeId = employeeId;
        
        this.updateEmployeeDetailView();
        window.app.switchView('employee-detail');
        
        await this.loadEmployeeAssignments(employeeId);
        this.renderAssignmentsList();
    }

    updateEmployeeDetailView() {
        const employee = this.employees.find(e => e.id === this.currentEmployeeId);
        if (!employee) return;
        
        document.getElementById('employee-detail-name').textContent = `${employee.first_name} ${employee.last_name}`;
        document.getElementById('employee-detail-title').textContent = `${employee.first_name} ${employee.last_name}`;
        
        document.getElementById('employee-detail-position').textContent = positionDept || 'No position or department specified';
        
        document.getElementById('employee-assigned-programs').textContent = employee.assigned_programs || 0;
        document.getElementById('employee-completed-programs').textContent = employee.completed_programs || 0;
        
        const completionRate = UIUtils.calculateProgress(employee.completed_modules, employee.total_modules);
        document.getElementById('employee-completion-rate').textContent = `${completionRate}%`;
    }
}

// Make available globally
window.EmployeeManager = EmployeeManager;