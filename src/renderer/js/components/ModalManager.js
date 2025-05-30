/**
 * ModalManager - Centralized modal management
 */
class ModalManager {
    static show(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (data) {
            ModalManager.populateModal(modalId, data);
        }

        modal.classList.add('active');
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    static hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            const form = modal.querySelector('form');
            if (form) form.reset();
            
            const preview = modal.querySelector('.program-preview');
            if (preview) preview.style.display = 'none';
        }
    }

    static populateModal(modalId, data) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        switch (modalId) {
            case 'edit-module-modal':
                ModalManager.populateEditModule(modal, data);
                break;
            case 'edit-employee-modal':
                ModalManager.populateEditEmployee(modal, data);
                break;
            case 'assign-training-modal':
                ModalManager.populateAssignTraining(modal, data);
                break;
        }
    }

    static populateEditModule(modal, module) {
        const fields = {
            'edit-module-id': module.id,
            'edit-module-name': module.name,
            'edit-module-description': module.description || '',
            'edit-module-content': module.content || '',
            'edit-module-duration': module.duration_minutes || '',
            'edit-module-required': module.is_required
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = modal.querySelector(`#${id}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    static populateEditEmployee(modal, employee) {
        const fields = {
            'edit-employee-id': employee.id,
            'edit-employee-first-name': employee.first_name,
            'edit-employee-last-name': employee.last_name,
            'edit-employee-email': employee.email || '',
            'edit-employee-position': employee.position || '',
            'edit-employee-department': employee.department || '',
            'edit-employee-hire-date': employee.hire_date || ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = modal.querySelector(`#${id}`);
            if (element) element.value = value;
        });
    }

    static populateAssignTraining(modal, data) {
        const { employeeId, programs } = data;
        
        const employeeIdField = modal.querySelector('#assign-employee-id');
        if (employeeIdField) employeeIdField.value = employeeId;

        const select = modal.querySelector('#assign-program-select');
        if (select && programs) {
            select.innerHTML = '<option value="">Choose a training program...</option>';
            
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program.id;
                option.textContent = program.name;
                option.dataset.description = program.description || '';
                option.dataset.modules = program.module_count || 0;
                select.appendChild(option);
            });

            select.addEventListener('change', () => {
                ModalManager.updateProgramPreview(modal, select);
            });
        }
    }

    static updateProgramPreview(modal, select) {
        const selectedOption = select.options[select.selectedIndex];
        const preview = modal.querySelector('#program-preview');
        
        if (selectedOption.value && preview) {
            const description = modal.querySelector('#program-preview-description');
            const modules = modal.querySelector('#program-preview-modules');
            
            if (description) {
                description.textContent = selectedOption.dataset.description || 'No description available';
            }
            if (modules) {
                modules.textContent = `${selectedOption.dataset.modules} modules`;
            }
            
            preview.style.display = 'block';
        } else if (preview) {
            preview.style.display = 'none';
        }
    }
}

// Make available globally
window.ModalManager = ModalManager;