/**
 * Training Program Builder - Renderer Process
 * Handles all UI interactions and communicates with main process
 */

class TrainingProgramRenderer {
    constructor() {
        this.currentView = 'dashboard';
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
        document.getElementById('new-program-btn').addEventListener('click', () => {
            this.showNewProgramModal();
        });

        // New program form
        document.getElementById('new-program-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateProgram();
        });

        // Modal close handlers
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideNewProgramModal();
        });

        // Close modal when clicking outside
        document.getElementById('new-program-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideNewProgramModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNewProgramModal();
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

        const activeNavItem = document.querySelector(`[href="#${viewId}"]`).parentElement;
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        this.currentView = viewId;

        // Load view-specific data
        if (viewId === 'programs') {
            this.renderProgramsList();
        }
    }

    showNewProgramModal() {
        const modal = document.getElementById('new-program-modal');
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('program-name').focus();
        }, 100);
    }

    hideNewProgramModal() {
        const modal = document.getElementById('new-program-modal');
        modal.classList.remove('active');
        
        // Reset form
        document.getElementById('new-program-form').reset();
    }

    async handleCreateProgram() {
        const formData = new FormData(document.getElementById('new-program-form'));
        const programData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim()
        };

        // Basic validation
        if (!programData.name) {
            alert('Please enter a program name');
            return;
        }

        try {
            this.showLoading();
            
            const result = await window.electronAPI.createTrainingProgram(programData);
            
            if (result.success) {
                // Add to local array
                this.trainingPrograms.unshift(result.data);
                
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
                        <span>0 modules</span>
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
                        <span>0 modules • 0 employees</span>
                    </div>
                    <div class="program-actions mt-10">
                        <button class="btn btn-primary" onclick="trainingApp.editProgram(${program.id})">
                            Edit Program
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    editProgram(programId) {
        // TODO: Implement program editing
        console.log('Edit program:', programId);
        this.showNotification('Program editing coming soon!', 'info');
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
});

// Expose trainingApp globally for onclick handlers
window.trainingApp = trainingApp;