/**
 * Training Program Builder - Renderer Process
 * Handles all UI interactions and communicates with main process
 */

class TrainingProgramRenderer {
    constructor() {
        this.currentView = 'dashboard';
        this.currentProgramId = null;
        this.currentEmployeeId = null;
        this.currentModules = [];
        this.currentAssignments = [];
        this.trainingPrograms = [];
        this.employees = [];
        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        this.setupMenuHandlers();
        await this.loadTrainingPrograms();
        await this.loadEmployees();
        this.updateDashboard();
        console.log('Training Program Builder initialized');
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

        // New program button
        const newProgramBtn = document.getElementById('new-program-btn');
        if (newProgramBtn) {
            newProgramBtn.addEventListener('click', () => {
                this.showNewProgramModal();
            });
        }

        // New program form
        const newProgramForm = document.getElementById('new-program-form');
        if (newProgramForm) {
            newProgramForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateProgram();
            });
        }

        // New module button
        const addModuleBtn = document.getElementById('add-module-btn');
        if (addModuleBtn) {
            addModuleBtn.addEventListener('click', () => {
                this.showNewModuleModal();
            });
        }

        // New module form
        const newModuleForm = document.getElementById('new-module-form');
        if (newModuleForm) {
            newModuleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateModule();
            });
        }

        // Edit module form
        const editModuleForm = document.getElementById('edit-module-form');
        if (editModuleForm) {
            editModuleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateModule();
            });
        }

        // Add employee button
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => {
                this.showAddEmployeeModal();
            });
        }

        // Add employee form
        const addEmployeeForm = document.getElementById('add-employee-form');
        if (addEmployeeForm) {
            addEmployeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateEmployee();
            });
        }

        // Edit employee button
        const editEmployeeBtn = document.getElementById('edit-employee-btn');
        if (editEmployeeBtn) {
            editEmployeeBtn.addEventListener('click', () => {
                this.showEditEmployeeModal();
            });
        }

        // Edit employee form
        const editEmployeeForm = document.getElementById('edit-employee-form');
        if (editEmployeeForm) {
            editEmployeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateEmployee();
            });
        }

        // Assign training button
        const assignTrainingBtn = document.getElementById('assign-training-btn');
        if (assignTrainingBtn) {
            assignTrainingBtn.addEventListener('click', () => {
                this.showAssignTrainingModal();
            });
        }

        // Assign training form
        const assignTrainingForm = document.getElementById('assign-training-form');
        if (assignTrainingForm) {
            assignTrainingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAssignTraining();
            });
        }

        // Modal close handlers
        const newProgramModalClose = document.querySelector('#new-program-modal .modal-close');
        if (newProgramModalClose) {
            newProgramModalClose.addEventListener('click', () => {
                this.hideNewProgramModal();
            });
        }

        const newModuleModalClose = document.querySelector('#new-module-modal .modal-close');
        if (newModuleModalClose) {
            newModuleModalClose.addEventListener('click', () => {
                this.hideNewModuleModal();
            });
        }

        const editModuleModalClose = document.querySelector('#edit-module-modal .modal-close');
        if (editModuleModalClose) {
            editModuleModalClose.addEventListener('click', () => {
                this.hideEditModuleModal();
            });
        }

        const addEmployeeModalClose = document.querySelector('#add-employee-modal .modal-close');
        if (addEmployeeModalClose) {
            addEmployeeModalClose.addEventListener('click', () => {
                this.hideAddEmployeeModal();
            });
        }

        const editEmployeeModalClose = document.querySelector('#edit-employee-modal .modal-close');
        if (editEmployeeModalClose) {
            editEmployeeModalClose.addEventListener('click', () => {
                this.hideEditEmployeeModal();
            });
        }

        const assignTrainingModalClose = document.querySelector('#assign-training-modal .modal-close');
        if (assignTrainingModalClose) {
            assignTrainingModalClose.addEventListener('click', () => {
                this.hideAssignTrainingModal();
            });
        }

        // Close modal when clicking outside
        const newProgramModal = document.getElementById('new-program-modal');
        if (newProgramModal) {
            newProgramModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideNewProgramModal();
                }
            });
        }

        const newModuleModal = document.getElementById('new-module-modal');
        if (newModuleModal) {
            newModuleModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideNewModuleModal();
                }
            });
        }

        const editModuleModal = document.getElementById('edit-module-modal');
        if (editModuleModal) {
            editModuleModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideEditModuleModal();
                }
            });
        }

        const addEmployeeModal = document.getElementById('add-employee-modal');
        if (addEmployeeModal) {
            addEmployeeModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideAddEmployeeModal();
                }
            });
        }

        const editEmployeeModal = document.getElementById('edit-employee-modal');
        if (editEmployeeModal) {
            editEmployeeModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideEditEmployeeModal();
                }
            });
        }

        const assignTrainingModal = document.getElementById('assign-training-modal');
        if (assignTrainingModal) {
            assignTrainingModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.hideAssignTrainingModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNewProgramModal();
                this.hideNewModuleModal();
                this.hideEditModuleModal();
                this.hideAddEmployeeModal();
                this.hideEditEmployeeModal();
                this.hideAssignTrainingModal();
            }
        });
    }

    setupMenuHandlers() {
        // Listen for menu events from main process
        window.electronAPI.onMenuNewProgram(() => {
            this.showNewProgramModal();
        });
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

        // Load view-specific data
        if (viewId === 'programs') {
            this.renderProgramsList();
        } else if (viewId === 'program-detail') {
            this.loadProgramModules();
        } else if (viewId === 'employees') {
            this.renderEmployeesList();
        } else if (viewId === 'employee-detail') {
            this.loadEmployeeAssignments();
        }
    }

    showNewProgramModal() {
        console.log('showNewProgramModal called');
        const modal = document.getElementById('new-program-modal');
        if (!modal) {
            console.error('new-program-modal not found');
            return;
        }
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const nameInput = document.getElementById('program-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
    }

    hideNewProgramModal() {
        const modal = document.getElementById('new-program-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('new-program-form').reset();
    }

    showNewModuleModal() {
        const modal = document.getElementById('new-module-modal');
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const nameInput = document.getElementById('module-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
    }

    hideNewModuleModal() {
        const modal = document.getElementById('new-module-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('new-module-form').reset();
    }

    showEditModuleModal(module) {
        const modal = document.getElementById('edit-module-modal');
        
        // Populate form with module data
        document.getElementById('edit-module-id').value = module.id;
        document.getElementById('edit-module-name').value = module.name;
        document.getElementById('edit-module-description').value = module.description || '';
        document.getElementById('edit-module-content').value = module.content || '';
        document.getElementById('edit-module-duration').value = module.duration_minutes || '';
        document.getElementById('edit-module-required').checked = module.is_required;
        
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('edit-module-name').focus();
        }, 100);
    }

    hideEditModuleModal() {
        const modal = document.getElementById('edit-module-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('edit-module-form').reset();
    }

    showAddEmployeeModal() {
        const modal = document.getElementById('add-employee-modal');
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const firstNameInput = document.getElementById('employee-first-name');
            if (firstNameInput) {
                firstNameInput.focus();
            }
        }, 100);
    }

    hideAddEmployeeModal() {
        const modal = document.getElementById('add-employee-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('add-employee-form').reset();
    }

    showEditEmployeeModal() {
        if (!this.currentEmployeeId) return;
        
        const employee = this.employees.find(e => e.id === this.currentEmployeeId);
        if (!employee) return;
        
        const modal = document.getElementById('edit-employee-modal');
        
        // Populate form with employee data
        document.getElementById('edit-employee-id').value = employee.id;
        document.getElementById('edit-employee-first-name').value = employee.first_name;
        document.getElementById('edit-employee-last-name').value = employee.last_name;
        document.getElementById('edit-employee-email').value = employee.email || '';
        document.getElementById('edit-employee-position').value = employee.position || '';
        document.getElementById('edit-employee-department').value = employee.department || '';
        document.getElementById('edit-employee-hire-date').value = employee.hire_date || '';
        
        modal.classList.add('active');
    }

    hideEditEmployeeModal() {
        const modal = document.getElementById('edit-employee-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('edit-employee-form').reset();
    }

    showAssignTrainingModal() {
        if (!this.currentEmployeeId) return;
        
        const modal = document.getElementById('assign-training-modal');
        
        // Set employee ID
        document.getElementById('assign-employee-id').value = this.currentEmployeeId;
        
        // Populate programs dropdown
        const select = document.getElementById('assign-program-select');
        select.innerHTML = '<option value="">Choose a training program...</option>';
        
        this.trainingPrograms.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            option.dataset.description = program.description || '';
            option.dataset.modules = program.module_count || 0;
            select.appendChild(option);
        });
        
        // Add change listener for program preview
        select.addEventListener('change', () => {
            const selectedOption = select.options[select.selectedIndex];
            const preview = document.getElementById('program-preview');
            
            if (selectedOption.value) {
                document.getElementById('program-preview-description').textContent = 
                    selectedOption.dataset.description || 'No description available';
                document.getElementById('program-preview-modules').textContent = 
                    `${selectedOption.dataset.modules} modules`;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });
        
        modal.classList.add('active');
    }

    hideAssignTrainingModal() {
        const modal = document.getElementById('assign-training-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('assign-training-form').reset();
        document.getElementById('program-preview').style.display = 'none';
    }

    async handleCreateProgram() {
        console.log('handleCreateProgram called');
        const form = document.getElementById('new-program-form');
        if (!form) {
            console.error('new-program-form not found');
            return;
        }
        
        const formData = new FormData(form);
        const programData = {
            name: formData.get('name')?.trim() || '',
            description: formData.get('description')?.trim() || ''
        };

        console.log('Program data:', programData);

        // Basic validation
        if (!programData.name) {
            alert('Please enter a program name');
            return;
        }

        try {
            this.showLoading();
            
            console.log('Calling electronAPI.createTrainingProgram...');
            const result = await window.electronAPI.createTrainingProgram(programData);
            console.log('Result:', result);
            
            if (result.success) {
                // Add to local array
                this.trainingPrograms.unshift({...result.data, module_count: 0});
                
                // Update UI
                this.updateDashboard();
                this.renderProgramsList();
                
                // Close modal
                this.hideNewProgramModal();
                
                // Show success message
                this.showNotification('Training program created successfully!', 'success');
                
                // Switch to programs view if not already there
                if (this.currentView !== 'programs') {
                    this.switchView('programs');
                }
            } else {
                this.showNotification('Error creating program: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error creating training program:', error);
            this.showNotification('Failed to create training program', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleCreateModule() {
        const formData = new FormData(document.getElementById('new-module-form'));
        const moduleData = {
            program_id: this.currentProgramId,
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            content: formData.get('content').trim(),
            duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
            is_required: formData.get('is_required') === 'on',
            order_index: this.currentModules.length
        };

        // Basic validation
        if (!moduleData.name) {
            alert('Please enter a module name');
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.createTrainingModule(moduleData);
            
            if (result.success) {
                // Add to local array
                this.currentModules.push(result.data);
                
                // Update module count in programs list
                const programIndex = this.trainingPrograms.findIndex(p => p.id === this.currentProgramId);
                if (programIndex !== -1) {
                    this.trainingPrograms[programIndex].module_count = (this.trainingPrograms[programIndex].module_count || 0) + 1;
                }
                
                // Update UI
                this.renderModulesList();
                this.updateDashboard();
                
                // Close modal
                this.hideNewModuleModal();
                
                // Show success message
                this.showNotification('Training module created successfully!', 'success');
            } else {
                this.showNotification('Error creating module: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error creating training module:', error);
            this.showNotification('Failed to create training module', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleUpdateModule() {
        const formData = new FormData(document.getElementById('edit-module-form'));
        const moduleId = parseInt(formData.get('module_id'));
        const moduleData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            content: formData.get('content').trim(),
            duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
            is_required: formData.get('is_required') === 'on'
        };

        try {
            this.showLoading();
            
            const result = await window.electronAPI.updateTrainingModule(moduleId, moduleData);
            
            if (result.success) {
                // Update local array
                const index = this.currentModules.findIndex(m => m.id === moduleId);
                if (index !== -1) {
                    this.currentModules[index] = { ...this.currentModules[index], ...moduleData };
                }
                
                // Update UI
                this.renderModulesList();
                
                // Close modal
                this.hideEditModuleModal();
                
                // Show success message
                this.showNotification('Module updated successfully!', 'success');
            } else {
                this.showNotification('Error updating module: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error updating training module:', error);
            this.showNotification('Failed to update training module', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleDeleteModule() {
        const moduleId = parseInt(document.getElementById('edit-module-id').value);
        
        if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.deleteTrainingModule(moduleId);
            
            if (result.success) {
                // Remove from local array
                this.currentModules = this.currentModules.filter(m => m.id !== moduleId);
                
                // Update module count in programs list
                const programIndex = this.trainingPrograms.findIndex(p => p.id === this.currentProgramId);
                if (programIndex !== -1) {
                    this.trainingPrograms[programIndex].module_count = Math.max(0, (this.trainingPrograms[programIndex].module_count || 0) - 1);
                }
                
                // Update UI
                this.renderModulesList();
                this.updateDashboard();
                
                // Close modal
                this.hideEditModuleModal();
                
                // Show success message
                this.showNotification('Module deleted successfully!', 'success');
            } else {
                this.showNotification('Error deleting module: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting training module:', error);
            this.showNotification('Failed to delete training module', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleCreateEmployee() {
        const formData = new FormData(document.getElementById('add-employee-form'));
        const employeeData = {
            first_name: formData.get('first_name').trim(),
            last_name: formData.get('last_name').trim(),
            email: formData.get('email')?.trim() || null,
            position: formData.get('position')?.trim() || null,
            department: formData.get('department')?.trim() || null,
            hire_date: formData.get('hire_date') || null
        };

        // Basic validation
        if (!employeeData.first_name || !employeeData.last_name) {
            alert('Please enter both first and last name');
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.createEmployee(employeeData);
            
            if (result.success) {
                // Add to local array with default progress values
                this.employees.unshift({
                    ...result.data,
                    assigned_programs: 0,
                    completed_programs: 0,
                    total_modules: 0,
                    completed_modules: 0
                });
                
                // Update UI
                this.updateDashboard();
                this.renderEmployeesList();
                
                // Close modal
                this.hideAddEmployeeModal();
                
                // Show success message
                this.showNotification('Employee added successfully!', 'success');
                
                // Switch to employees view if not already there
                if (this.currentView !== 'employees') {
                    this.switchView('employees');
                }
            } else {
                this.showNotification('Error creating employee: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error creating employee:', error);
            this.showNotification('Failed to create employee', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleUpdateEmployee() {
        const formData = new FormData(document.getElementById('edit-employee-form'));
        const employeeId = parseInt(formData.get('employee_id'));
        const employeeData = {
            first_name: formData.get('first_name').trim(),
            last_name: formData.get('last_name').trim(),
            email: formData.get('email')?.trim() || null,
            position: formData.get('position')?.trim() || null,
            department: formData.get('department')?.trim() || null,
            hire_date: formData.get('hire_date') || null
        };

        try {
            this.showLoading();
            
            const result = await window.electronAPI.updateEmployee(employeeId, employeeData);
            
            if (result.success) {
                // Update local array
                const index = this.employees.findIndex(e => e.id === employeeId);
                if (index !== -1) {
                    this.employees[index] = { ...this.employees[index], ...employeeData };
                }
                
                // Update UI
                this.renderEmployeesList();
                this.updateEmployeeDetailView();
                
                // Close modal
                this.hideEditEmployeeModal();
                
                // Show success message
                this.showNotification('Employee updated successfully!', 'success');
            } else {
                this.showNotification('Error updating employee: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            this.showNotification('Failed to update employee', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleDeleteEmployee() {
        const employeeId = parseInt(document.getElementById('edit-employee-id').value);
        
        if (!confirm('Are you sure you want to delete this employee? This will also remove all their training progress.')) {
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.deleteEmployee(employeeId);
            
            if (result.success) {
                // Remove from local array
                this.employees = this.employees.filter(e => e.id !== employeeId);
                
                // Update UI
                this.updateDashboard();
                this.renderEmployeesList();
                
                // Close modal and switch to employees view
                this.hideEditEmployeeModal();
                this.switchView('employees');
                
                // Show success message
                this.showNotification('Employee deleted successfully!', 'success');
            } else {
                this.showNotification('Error deleting employee: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            this.showNotification('Failed to delete employee', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleAssignTraining() {
        const formData = new FormData(document.getElementById('assign-training-form'));
        const employeeId = parseInt(formData.get('employee_id'));
        const programId = parseInt(formData.get('program_id'));

        if (!programId) {
            alert('Please select a training program');
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.assignTrainingToEmployee(employeeId, programId);
            
            if (result.success) {
                // Reload employee assignments
                await this.loadEmployeeAssignments();
                
                // Update employee progress counts
                const employeeIndex = this.employees.findIndex(e => e.id === employeeId);
                if (employeeIndex !== -1) {
                    this.employees[employeeIndex].assigned_programs += 1;
                }
                
                // Update UI
                this.updateDashboard();
                this.updateEmployeeDetailView();
                
                // Close modal
                this.hideAssignTrainingModal();
                
                // Show success message
                this.showNotification('Training assigned successfully!', 'success');
            } else {
                this.showNotification('Error assigning training: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error assigning training:', error);
            this.showNotification('Failed to assign training', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadTrainingPrograms() {
        try {
            this.showLoading();
            
            const result = await window.electronAPI.getTrainingPrograms();
            
            if (result.success) {
                this.trainingPrograms = result.data || [];
            } else {
                console.error('Error loading programs:', result.error);
                this.showNotification('Failed to load training programs', 'error');
            }
        } catch (error) {
            console.error('Error loading training programs:', error);
            this.showNotification('Failed to load training programs', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadEmployees() {
        try {
            this.showLoading();
            
            const result = await window.electronAPI.getEmployees();
            
            if (result.success) {
                this.employees = result.data || [];
            } else {
                console.error('Error loading employees:', result.error);
                this.showNotification('Failed to load employees', 'error');
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            this.showNotification('Failed to load employees', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadProgramModules() {
        if (!this.currentProgramId) return;

        try {
            this.showLoading();
            
            const result = await window.electronAPI.getModulesByProgram(this.currentProgramId);
            
            if (result.success) {
                this.currentModules = result.data || [];
                this.renderModulesList();
            } else {
                console.error('Error loading modules:', result.error);
                this.showNotification('Failed to load modules', 'error');
            }
        } catch (error) {
            console.error('Error loading modules:', error);
            this.showNotification('Failed to load modules', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadEmployeeAssignments() {
        if (!this.currentEmployeeId) return;

        try {
            this.showLoading();
            
            const result = await window.electronAPI.getEmployeeTrainingAssignments(this.currentEmployeeId);
            
            if (result.success) {
                this.currentAssignments = result.data || [];
                this.renderAssignmentsList();
            } else {
                console.error('Error loading assignments:', result.error);
                this.showNotification('Failed to load assignments', 'error');
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showNotification('Failed to load assignments', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateDashboard() {
        // Update total programs count
        document.getElementById('total-programs').textContent = this.trainingPrograms.length;
        
        // Update total employees count
        document.getElementById('total-employees').textContent = this.employees.length;
        
        // Update recent programs list
        const recentProgramsContainer = document.getElementById('recent-programs');
        
        if (this.trainingPrograms.length === 0) {
            recentProgramsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <h4>No training programs yet</h4>
                    <p>Create your first training program to get started</p>
                    <button class="btn btn-primary" onclick="window.trainingApp?.showNewProgramModal()">
                        Create Program
                    </button>
                </div>
            `;
        } else {
            const recentPrograms = this.trainingPrograms.slice(0, 3);
            recentProgramsContainer.innerHTML = recentPrograms.map(program => `
                <div class="program-card">
                    <h4>${this.escapeHtml(program.name)}</h4>
                    <p>${this.escapeHtml(program.description || 'No description')}</p>
                    <div class="program-meta">
                        <span>Created: ${this.formatDate(program.created_date)}</span>
                        <span class="module-count">${program.module_count || 0} modules</span>
                    </div>
                </div>
            `).join('');
        }
    }

    renderModulesList() {
        const modulesContainer = document.getElementById('modules-list');
        
        if (this.currentModules.length === 0) {
            modulesContainer.innerHTML = `
                <div class="modules-empty">
                    <span class="modules-empty-icon">📝</span>
                    <h4>No modules yet</h4>
                    <p>Add your first training module to get started</p>
                    <button class="btn btn-primary" onclick="trainingApp.showNewModuleModal()">
                        Add Module
                    </button>
                </div>
            `;
        } else {
            modulesContainer.innerHTML = this.currentModules.map((module, index) => `
                <div class="module-item" data-module-id="${module.id}">
                    <span class="module-drag-handle">⋮⋮</span>
                    <div class="module-info">
                        <div class="module-title">${this.escapeHtml(module.name)}</div>
                        <div class="module-meta">
                            <span>${module.duration_minutes || 0} minutes</span>
                            <span class="module-badge ${module.is_required ? 'required' : 'optional'}">
                                ${module.is_required ? 'Required' : 'Optional'}
                            </span>
                            ${module.description ? `<span>${this.escapeHtml(module.description)}</span>` : ''}
                        </div>
                    </div>
                    <div class="module-actions">
                        <button class="module-action-btn" onclick="trainingApp.editModule(${module.id})" title="Edit Module">
                            ✏️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    renderProgramsList() {
        const programsContainer = document.getElementById('programs-list');
        
        if (this.trainingPrograms.length === 0) {
            programsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <h4>No training programs yet</h4>
                    <p>Create your first training program to get started</p>
                    <button class="btn btn-primary" onclick="trainingApp.showNewProgramModal()">
                        Create Program
                    </button>
                </div>
            `;
        } else {
            programsContainer.innerHTML = this.trainingPrograms.map(program => `
                <div class="program-card">
                    <h4>${this.escapeHtml(program.name)}</h4>
                    <p>${this.escapeHtml(program.description || 'No description')}</p>
                    <div class="program-meta">
                        <span>Created: ${this.formatDate(program.created_date)}</span>
                        <span class="module-count">${program.module_count || 0} modules • 0 employees</span>
                    </div>
                    <div class="program-actions mt-10">
                        <button class="btn btn-primary" onclick="trainingApp.viewProgram(${program.id})">
                            Manage Program
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    renderEmployeesList() {
        const employeesContainer = document.getElementById('employees-list');
        
        if (this.employees.length === 0) {
            employeesContainer.innerHTML = `
                <div class="employees-empty">
                    <span class="employees-empty-icon">👥</span>
                    <h4>No employees yet</h4>
                    <p>Add your first employee to get started</p>
                    <button class="btn btn-primary" onclick="trainingApp.showAddEmployeeModal()">
                        Add Employee
                    </button>
                </div>
            `;
        } else {
            employeesContainer.innerHTML = this.employees.map(employee => {
                const initials = (employee.first_name.charAt(0) + employee.last_name.charAt(0)).toUpperCase();
                const completionRate = employee.total_modules > 0 ? 
                    Math.round((employee.completed_modules / employee.total_modules) * 100) : 0;
                
                return `
                    <div class="employee-card" onclick="trainingApp.viewEmployee(${employee.id})">
                        <div class="employee-card-header">
                            <div class="employee-avatar">${initials}</div>
                            <div class="employee-card-info">
                                <h4>${this.escapeHtml(employee.first_name)} ${this.escapeHtml(employee.last_name)}</h4>
                                <div class="employee-card-meta">
                                    ${employee.position ? this.escapeHtml(employee.position) : 'No position'} • 
                                    ${employee.department ? this.escapeHtml(employee.department) : 'No department'}
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
        const assignmentsContainer = document.getElementById('training-assignments-list');
        
        if (this.currentAssignments.length === 0) {
            assignmentsContainer.innerHTML = `
                <div class="assignments-empty">
                    <span class="assignments-empty-icon">📚</span>
                    <h4>No training assignments yet</h4>
                    <p>Assign training programs to this employee to track their progress</p>
                    <button class="btn btn-primary" onclick="trainingApp.showAssignTrainingModal()">
                        Assign Training
                    </button>
                </div>
            `;
        } else {
            assignmentsContainer.innerHTML = this.currentAssignments.map(assignment => {
                const progressPercent = assignment.total_modules > 0 ? 
                    Math.round((assignment.completed_modules / assignment.total_modules) * 100) : 0;
                
                return `
                    <div class="assignment-item">
                        <div class="assignment-info">
                            <div class="assignment-title">${this.escapeHtml(assignment.program_name)}</div>
                            <div class="assignment-meta">
                                <span>Assigned: ${this.formatDate(assignment.assignment_date)}</span>
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

    async viewProgram(programId) {
        const program = this.trainingPrograms.find(p => p.id === programId);
        if (!program) {
            this.showNotification('Program not found', 'error');
            return;
        }

        // Set current program
        this.currentProgramId = programId;
        
        // Update program detail view
        document.getElementById('program-detail-name').textContent = program.name;
        document.getElementById('program-detail-title').textContent = program.name;
        document.getElementById('program-detail-description').textContent = program.description || 'No description';
        
        // Switch to program detail view
        this.switchView('program-detail');
        
        // Load modules
        await this.loadProgramModules();
    }

    async viewEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            this.showNotification('Employee not found', 'error');
            return;
        }

        // Set current employee
        this.currentEmployeeId = employeeId;
        
        // Update employee detail view
        this.updateEmployeeDetailView();
        
        // Switch to employee detail view
        this.switchView('employee-detail');
        
        // Load assignments
        await this.loadEmployeeAssignments();
    }

    updateEmployeeDetailView() {
        const employee = this.employees.find(e => e.id === this.currentEmployeeId);
        if (!employee) return;
        
        document.getElementById('employee-detail-name').textContent = 
            `${employee.first_name} ${employee.last_name}`;
        document.getElementById('employee-detail-title').textContent = 
            `${employee.first_name} ${employee.last_name}`;
        
        const positionDept = [employee.position, employee.department].filter(Boolean).join(' • ');
        document.getElementById('employee-detail-position').textContent = 
            positionDept || 'No position or department specified';
        
        // Update stats
        document.getElementById('employee-assigned-programs').textContent = employee.assigned_programs || 0;
        document.getElementById('employee-completed-programs').textContent = employee.completed_programs || 0;
        
        const completionRate = employee.total_modules > 0 ? 
            Math.round((employee.completed_modules / employee.total_modules) * 100) : 0;
        document.getElementById('employee-completion-rate').textContent = `${completionRate}%`;
    }

    editModule(moduleId) {
        const module = this.currentModules.find(m => m.id === moduleId);
        if (!module) {
            this.showNotification('Module not found', 'error');
            return;
        }
        
        this.showEditModuleModal(module);
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Simple notification for now - could be enhanced with a proper notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // For now, use browser alert for important messages
        if (type === 'error') {
            alert('Error: ' + message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the application when DOM is loaded
let trainingApp;

document.addEventListener('DOMContentLoaded', () => {
    trainingApp = new TrainingProgramRenderer();
    // Make sure it's available globally
    window.trainingApp = trainingApp;
});

// Global functions for onclick handlers
function showNewProgramModal() {
    if (window.trainingApp) window.trainingApp.showNewProgramModal();
}

function hideNewProgramModal() {
    if (window.trainingApp) window.trainingApp.hideNewProgramModal();
}

function hideNewModuleModal() {
    if (window.trainingApp) window.trainingApp.hideNewModuleModal();
}

function hideEditModuleModal() {
    if (window.trainingApp) window.trainingApp.hideEditModuleModal();
}

function hideAddEmployeeModal() {
    if (window.trainingApp) window.trainingApp.hideAddEmployeeModal();
}

function hideEditEmployeeModal() {
    if (window.trainingApp) window.trainingApp.hideEditEmployeeModal();
}

function hideAssignTrainingModal() {
    if (window.trainingApp) window.trainingApp.hideAssignTrainingModal();
}

function handleDeleteModule() {
    if (window.trainingApp) window.trainingApp.handleDeleteModule();
}

function handleDeleteEmployee() {
    if (window.trainingApp) window.trainingApp.handleDeleteEmployee();
}