/**
 * ProgramManager - Handles all training program and module operations
 */
class ProgramManager {
    constructor() {
        this.programs = [];
        this.currentProgramId = null;
        this.currentModules = [];
    }

    async loadPrograms() {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.getTrainingPrograms();
            
            if (result.success) {
                this.programs = result.data || [];
                return this.programs;
            } else {
                console.error('Error loading programs:', result.error);
                UIUtils.showNotification('Failed to load training programs', 'error');
                return [];
            }
        } catch (error) {
            console.error('Error loading training programs:', error);
            UIUtils.showNotification('Failed to load training programs', 'error');
            return [];
        } finally {
            UIUtils.hideLoading();
        }
    }

    async createProgram(programData) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.createTrainingProgram(programData);
            
            if (result.success) {
                this.programs.unshift({...result.data, module_count: 0});
                UIUtils.showNotification('Training program created successfully!', 'success');
                return result.data;
            } else {
                UIUtils.showNotification('Error creating program: ' + result.error, 'error');
                return null;
            }
        } catch (error) {
            console.error('Error creating training program:', error);
            UIUtils.showNotification('Failed to create training program', 'error');
            return null;
        } finally {
            UIUtils.hideLoading();
        }
    }

    async loadModulesByProgram(programId) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.getModulesByProgram(programId);
            
            if (result.success) {
                this.currentModules = result.data || [];
                return this.currentModules;
            } else {
                console.error('Error loading modules:', result.error);
                UIUtils.showNotification('Failed to load modules', 'error');
                return [];
            }
        } catch (error) {
            console.error('Error loading modules:', error);
            UIUtils.showNotification('Failed to load modules', 'error');
            return [];
        } finally {
            UIUtils.hideLoading();
        }
    }

    async createModule(moduleData) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.createTrainingModule(moduleData);
            
            if (result.success) {
                this.currentModules.push(result.data);
                
                const programIndex = this.programs.findIndex(p => p.id === this.currentProgramId);
                if (programIndex !== -1) {
                    this.programs[programIndex].module_count = (this.programs[programIndex].module_count || 0) + 1;
                }
                
                UIUtils.showNotification('Training module created successfully!', 'success');
                return result.data;
            } else {
                UIUtils.showNotification('Error creating module: ' + result.error, 'error');
                return null;
            }
        } catch (error) {
            console.error('Error creating training module:', error);
            UIUtils.showNotification('Failed to create training module', 'error');
            return null;
        } finally {
            UIUtils.hideLoading();
        }
    }

    async updateModule(moduleId, moduleData) {
        try {
            UIUtils.showLoading();
            const result = await window.APIService.updateTrainingModule(moduleId, moduleData);
            
            if (result.success) {
                const index = this.currentModules.findIndex(m => m.id === moduleId);
                if (index !== -1) {
                    this.currentModules[index] = { ...this.currentModules[index], ...moduleData };
                }
                
                UIUtils.showNotification('Module updated successfully!', 'success');
                return result.data;
            } else {
                UIUtils.showNotification('Error updating module: ' + result.error, 'error');
                return null;
            }
        } catch (error) {
            console.error('Error updating training module:', error);
            UIUtils.showNotification('Failed to update training module', 'error');
            return null;
        } finally {
            UIUtils.hideLoading();
        }
    }

    async deleteModule(moduleId) {
        if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return false;
        }

        try {
            UIUtils.showLoading();
            const result = await window.APIService.deleteTrainingModule(moduleId);
            
            if (result.success) {
                this.currentModules = this.currentModules.filter(m => m.id !== moduleId);
                
                const programIndex = this.programs.findIndex(p => p.id === this.currentProgramId);
                if (programIndex !== -1) {
                    this.programs[programIndex].module_count = Math.max(0, (this.programs[programIndex].module_count || 0) - 1);
                }
                
                UIUtils.showNotification('Module deleted successfully!', 'success');
                return true;
            } else {
                UIUtils.showNotification('Error deleting module: ' + result.error, 'error');
                return false;
            }
        } catch (error) {
            console.error('Error deleting training module:', error);
            UIUtils.showNotification('Failed to delete training module', 'error');
            return false;
        } finally {
            UIUtils.hideLoading();
        }
    }

    renderProgramsList() {
        const container = document.getElementById('programs-list');
        if (!container) return;
        
        if (this.programs.length === 0) {
            container.innerHTML = UIUtils.createEmptyState(
                '📚', 
                'No training programs yet', 
                'Create your first training program to get started',
                'Create Program',
                'window.app.programManager.showNewProgramModal()'
            );
        } else {
            container.innerHTML = this.programs.map(program => `
                <div class="program-card">
                    <h4>${UIUtils.escapeHtml(program.name)}</h4>
                    <p>${UIUtils.escapeHtml(program.description || 'No description')}</p>
                    <div class="program-meta">
                        <span>Created: ${UIUtils.formatDate(program.created_date)}</span>
                        <span class="module-count">${program.module_count || 0} modules</span>
                    </div>
                    <div class="program-actions mt-10">
                        <button class="btn btn-primary" onclick="window.app.programManager.viewProgram(${program.id})">
                            Manage Program
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    renderModulesList() {
        const container = document.getElementById('modules-list');
        if (!container) return;
        
        if (this.currentModules.length === 0) {
            container.innerHTML = UIUtils.createEmptyState(
                '📝',
                'No modules yet',
                'Add your first training module to get started',
                'Add Module',
                'window.app.programManager.showNewModuleModal()'
            );
        } else {
            container.innerHTML = this.currentModules.map(module => `
                <div class="module-item" data-module-id="${module.id}">
                    <span class="module-drag-handle">⋮⋮</span>
                    <div class="module-info">
                        <div class="module-title">${UIUtils.escapeHtml(module.name)}</div>
                        <div class="module-meta">
                            <span>${module.duration_minutes || 0} minutes</span>
                            <span class="module-badge ${module.is_required ? 'required' : 'optional'}">
                                ${module.is_required ? 'Required' : 'Optional'}
                            </span>
                            ${module.description ? `<span>${UIUtils.escapeHtml(module.description)}</span>` : ''}
                        </div>
                    </div>
                    <div class="module-actions">
                        <button class="module-action-btn" onclick="window.app.programManager.editModule(${module.id})" title="Edit Module">
                            ✏️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    showNewProgramModal() {
        ModalManager.show('new-program-modal');
    }

    showNewModuleModal() {
        ModalManager.show('new-module-modal');
    }

    async viewProgram(programId) {
        const program = this.programs.find(p => p.id === programId);
        if (!program) {
            UIUtils.showNotification('Program not found', 'error');
            return;
        }

        this.currentProgramId = programId;
        
        document.getElementById('program-detail-name').textContent = program.name;
        document.getElementById('program-detail-title').textContent = program.name;
        document.getElementById('program-detail-description').textContent = program.description || 'No description';
        
        window.app.switchView('program-detail');
        
        await this.loadModulesByProgram(programId);
        this.renderModulesList();
    }

    editModule(moduleId) {
        const module = this.currentModules.find(m => m.id === moduleId);
        if (!module) {
            UIUtils.showNotification('Module not found', 'error');
            return;
        }
        
        ModalManager.show('edit-module-modal', module);
    }
}

// Make available globally
window.ProgramManager = ProgramManager;