/**
 * UIUtils - Common UI utility functions and helpers
 */
class UIUtils {
    static showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'flex';
    }

    static hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    static showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error') {
            alert('Error: ' + message);
        }
        // TODO: Implement proper notification system in Phase 4
    }

    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (value && typeof value === 'string') {
                data[key] = value.trim();
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    static generateEmployeeInitials(firstName, lastName) {
        if (!firstName || !lastName) return '??';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    static calculateProgress(completed, total) {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    static createEmptyState(icon, title, description, buttonText = null, onClickHandler = null) {
        let buttonHtml = '';
        if (buttonText && onClickHandler) {
            buttonHtml = `
                <button class="btn btn-primary" onclick="${onClickHandler}">
                    ${buttonText}
                </button>
            `;
        }

        return `
            <div class="empty-state">
                <span class="empty-icon">${icon}</span>
                <h4>${title}</h4>
                <p>${description}</p>
                ${buttonHtml}
            </div>
        `;
    }
}

// Make available globally
window.UIUtils = UIUtils;