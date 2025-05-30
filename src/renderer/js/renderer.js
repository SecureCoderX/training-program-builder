/**
 * Training Program Builder - Renderer Process
 * Handles all UI interactions and communicates with main process
 */

class TrainingProgramRenderer {
    constructor() {
        this.currentView = 'dashboard';
        this.currentProgramId = null;
        this.currentModules = [];
        this.trainingPrograms = [];
        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        this.setupMenuHandlers();
        await this.loadTrainingPrograms();
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

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNewProgramModal();
                this.hideNewModuleModal();
                this.hideEditModuleModal();
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
            document.getElementById('module-name').focus();
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

    updateDashboard() {
        // Update total programs count
        document.getElementById('total-programs').textContent = this.trainingPrograms.length;
        
        // Update recent programs list
        const recentProgramsContainer = document.getElementById('recent-programs');
        
        if (this.trainingPrograms.length === 0) {
            recentProgramsContainer.innerHTML = `
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

function handleDeleteModule() {
    if (window.trainingApp) window.trainingApp.handleDeleteModule();
}