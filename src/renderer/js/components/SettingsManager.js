/**
 * SettingsManager - Comprehensive application settings management
 */
class SettingsManager {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
    }

    getDefaultSettings() {
        return {
            // Appearance Settings
            theme: 'light', // light, dark, auto
            language: 'en',
            fontSize: 'medium', // small, medium, large
            animations: true,
            
            // Notification Settings
            enableNotifications: true,
            notificationSound: true,
            emailNotifications: true,
            reminderFrequency: 'daily', // daily, weekly, monthly
            
            // Training Settings
            defaultTrainingDuration: 30, // minutes
            autoSaveInterval: 300, // seconds (5 minutes)
            requireCompletionConfirmation: true,
            showProgressPercentage: true,
            certificateAutoGeneration: true,
            
            // Data Management
            autoBackup: true,
            backupFrequency: 'weekly', // daily, weekly, monthly
            retentionPeriod: 365, // days
            
            // System Settings
            startMinimized: false,
            closeToTray: true,
            autoStartApp: false,
            checkUpdatesOnStartup: true,
            
            // Privacy Settings
            analyticsEnabled: false,
            crashReporting: true,
            
            // Department Management
            departments: ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'],
            defaultDepartment: 'Engineering',
            
            // Advanced Settings
            developerMode: false,
            debugLogging: false,
            experimentalFeatures: false
        };
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('training-app-settings');
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('training-app-settings', JSON.stringify(this.settings));
            this.applySettings();
            UIUtils.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            UIUtils.showNotification('Failed to save settings', 'error');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getSetting(key) {
        return this.settings[key];
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            this.renderSettings();
            UIUtils.showNotification('Settings reset to default values', 'success');
        }
    }

    setupEventListeners() {
        // Theme toggle event listener
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });

        // Settings form changes
        document.addEventListener('change', (e) => {
            if (e.target.closest('.settings-section')) {
                this.handleSettingChange(e);
            }
        });

        // Export/Import buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#export-settings-btn')) {
                this.exportSettings();
            }
            if (e.target.closest('#import-settings-btn')) {
                this.importSettings();
            }
            if (e.target.closest('#reset-settings-btn')) {
                this.resetSettings();
            }
        });
    }

    handleSettingChange(event) {
        const { name, value, type, checked } = event.target;
        if (!name) return;

        let newValue = value;
        if (type === 'checkbox') {
            newValue = checked;
        } else if (type === 'number') {
            newValue = parseInt(value);
        }

        this.updateSetting(name, newValue);
    }

    toggleTheme() {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.updateSetting('theme', nextTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Update theme toggle button
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            const text = themeToggle.querySelector('.theme-text');
            if (this.settings.theme === 'dark') {
                if (icon) icon.textContent = '🌙';
                if (text) text.textContent = 'Dark Mode';
            } else {
                if (icon) icon.textContent = '☀️';
                if (text) text.textContent = 'Light Mode';
            }
        }
    }

    applySettings() {
        this.applyTheme();
        
        // Apply other settings
        if (this.settings.animations) {
            document.body.classList.add('animations-enabled');
        } else {
            document.body.classList.remove('animations-enabled');
        }

        // Apply font size
        document.documentElement.style.fontSize = this.getFontSizeValue();
        
        // Apply other visual settings as needed
    }

    getFontSizeValue() {
        const sizes = {
            small: '13px',
            medium: '14px',
            large: '16px'
        };
        return sizes[this.settings.fontSize] || sizes.medium;
    }

    renderSettings() {
        const container = document.getElementById('settings-container');
        if (!container) return;

        container.innerHTML = `
            <div class="settings-header">
                <div class="settings-header-content">
                    <h2>Application Settings</h2>
                    <p class="view-subtitle">Customize your training program experience</p>
                </div>
                <div class="settings-header-actions">
                    <div class="theme-toggle">
                        <span class="theme-icon">${this.settings.theme === 'dark' ? '🌙' : '☀️'}</span>
                        <span class="theme-text">${this.settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </div>
            </div>

            <div class="settings-grid">
                ${this.renderAppearanceSettings()}
                ${this.renderNotificationSettings()}
                ${this.renderTrainingSettings()}
                ${this.renderDataSettings()}
                ${this.renderSystemSettings()}
                ${this.renderAdvancedSettings()}
            </div>

            <div class="settings-actions">
                <button id="export-settings-btn" class="btn btn-secondary">
                    <span class="btn-icon">📤</span>
                    Export Settings
                </button>
                <button id="import-settings-btn" class="btn btn-secondary">
                    <span class="btn-icon">📥</span>
                    Import Settings
                </button>
                <button id="reset-settings-btn" class="btn btn-danger">
                    <span class="btn-icon">🔄</span>
                    Reset to Default
                </button>
            </div>
        `;

        this.attachSettingsEventListeners();
    }

    renderAppearanceSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">🎨</span>
                    Appearance
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Theme</div>
                        <div class="settings-item-description">Choose your preferred color scheme</div>
                    </div>
                    <div class="settings-item-control">
                        <select name="theme" value="${this.settings.theme}">
                            <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            <option value="auto" ${this.settings.theme === 'auto' ? 'selected' : ''}>Auto</option>
                        </select>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Font Size</div>
                        <div class="settings-item-description">Adjust text size for better readability</div>
                    </div>
                    <div class="settings-item-control">
                        <select name="fontSize" value="${this.settings.fontSize}">
                            <option value="small" ${this.settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                            <option value="medium" ${this.settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="large" ${this.settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                        </select>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Animations</div>
                        <div class="settings-item-description">Enable smooth transitions and animations</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.animations ? 'active' : ''}" data-setting="animations">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">🔔</span>
                    Notifications
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Desktop Notifications</div>
                        <div class="settings-item-description">Show notifications for training updates</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.enableNotifications ? 'active' : ''}" data-setting="enableNotifications">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Notification Sound</div>
                        <div class="settings-item-description">Play sound with notifications</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.notificationSound ? 'active' : ''}" data-setting="notificationSound">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Email Notifications</div>
                        <div class="settings-item-description">Receive email updates for important events</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.emailNotifications ? 'active' : ''}" data-setting="emailNotifications">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Reminder Frequency</div>
                        <div class="settings-item-description">How often to send training reminders</div>
                    </div>
                    <div class="settings-item-control">
                        <select name="reminderFrequency" value="${this.settings.reminderFrequency}">
                            <option value="daily" ${this.settings.reminderFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${this.settings.reminderFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${this.settings.reminderFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderTrainingSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">📚</span>
                    Training
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Default Duration</div>
                        <div class="settings-item-description">Default time allocation for new training modules (minutes)</div>
                    </div>
                    <div class="settings-item-control">
                        <input type="number" name="defaultTrainingDuration" value="${this.settings.defaultTrainingDuration}" min="5" max="480" />
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Auto-save Interval</div>
                        <div class="settings-item-description">How often to auto-save progress (seconds)</div>
                    </div>
                    <div class="settings-item-control">
                        <select name="autoSaveInterval">
                            <option value="60" ${this.settings.autoSaveInterval === 60 ? 'selected' : ''}>1 minute</option>
                            <option value="300" ${this.settings.autoSaveInterval === 300 ? 'selected' : ''}>5 minutes</option>
                            <option value="600" ${this.settings.autoSaveInterval === 600 ? 'selected' : ''}>10 minutes</option>
                        </select>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Completion Confirmation</div>
                        <div class="settings-item-description">Require confirmation before marking training as complete</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.requireCompletionConfirmation ? 'active' : ''}" data-setting="requireCompletionConfirmation">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Show Progress Percentage</div>
                        <div class="settings-item-description">Display numerical progress percentages</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.showProgressPercentage ? 'active' : ''}" data-setting="showProgressPercentage">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Auto-generate Certificates</div>
                        <div class="settings-item-description">Automatically create certificates upon completion</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.certificateAutoGeneration ? 'active' : ''}" data-setting="certificateAutoGeneration">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDataSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">💾</span>
                    Data Management
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Auto Backup</div>
                        <div class="settings-item-description">Automatically backup your data</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.autoBackup ? 'active' : ''}" data-setting="autoBackup">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Backup Frequency</div>
                        <div class="settings-item-description">How often to create automatic backups</div>
                    </div>
                    <div class="settings-item-control">
                        <select name="backupFrequency" value="${this.settings.backupFrequency}">
                            <option value="daily" ${this.settings.backupFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                            <option value="weekly" ${this.settings.backupFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${this.settings.backupFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        </select>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Data Retention</div>
                        <div class="settings-item-description">How long to keep completed training records (days)</div>
                    </div>
                    <div class="settings-item-control">
                        <input type="number" name="retentionPeriod" value="${this.settings.retentionPeriod}" min="30" max="3650" />
                    </div>
                </div>

                <div class="settings-actions-inline">
                    <button class="btn btn-secondary" onclick="window.app.settingsManager.exportData()">
                        <span class="btn-icon">📤</span>
                        Export Data
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.settingsManager.importData()">
                        <span class="btn-icon">📥</span>
                        Import Data
                    </button>
                </div>
            </div>
        `;
    }

    renderSystemSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">⚙️</span>
                    System
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Start Minimized</div>
                        <div class="settings-item-description">Start the application minimized to system tray</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.startMinimized ? 'active' : ''}" data-setting="startMinimized">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Close to Tray</div>
                        <div class="settings-item-description">Minimize to system tray instead of closing</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.closeToTray ? 'active' : ''}" data-setting="closeToTray">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Auto Start</div>
                        <div class="settings-item-description">Start application when system boots</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.autoStartApp ? 'active' : ''}" data-setting="autoStartApp">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Check for Updates</div>
                        <div class="settings-item-description">Automatically check for updates on startup</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.checkUpdatesOnStartup ? 'active' : ''}" data-setting="checkUpdatesOnStartup">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAdvancedSettings() {
        return `
            <div class="settings-section">
                <h3>
                    <span class="settings-section-icon">🔧</span>
                    Advanced
                </h3>
                
                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Developer Mode</div>
                        <div class="settings-item-description">Enable developer tools and debugging features</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.developerMode ? 'active' : ''}" data-setting="developerMode">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Debug Logging</div>
                        <div class="settings-item-description">Enable detailed logging for troubleshooting</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.debugLogging ? 'active' : ''}" data-setting="debugLogging">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Analytics</div>
                        <div class="settings-item-description">Share anonymous usage data to help improve the app</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.analyticsEnabled ? 'active' : ''}" data-setting="analyticsEnabled">
                        </div>
                    </div>
                </div>

                <div class="settings-item">
                    <div class="settings-item-info">
                        <div class="settings-item-title">Crash Reporting</div>
                        <div class="settings-item-description">Automatically send crash reports to help fix bugs</div>
                    </div>
                    <div class="settings-item-control">
                        <div class="toggle-switch ${this.settings.crashReporting ? 'active' : ''}" data-setting="crashReporting">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachSettingsEventListeners() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.dataset.setting;
                if (setting) {
                    const newValue = !this.settings[setting];
                    toggle.classList.toggle('active');
                    this.updateSetting(setting, newValue);
                }
            });
        });

        // Select and input changes
        document.querySelectorAll('.settings-section select, .settings-section input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleSettingChange(e);
            });
        });
    }

    exportSettings() {
        try {
            const dataStr = JSON.stringify(this.settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `training-app-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            UIUtils.showNotification('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting settings:', error);
            UIUtils.showNotification('Failed to export settings', 'error');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.getDefaultSettings(), ...importedSettings };
                        this.saveSettings();
                        this.renderSettings();
                        UIUtils.showNotification('Settings imported successfully!', 'success');
                    } catch (error) {
                        console.error('Error importing settings:', error);
                        UIUtils.showNotification('Invalid settings file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    exportData() {
        // This would export all training data - implement based on your data structure
        UIUtils.showNotification('Data export feature coming soon!', 'info');
    }

    importData() {
        // This would import training data - implement based on your data structure
        UIUtils.showNotification('Data import feature coming soon!', 'info');
    }
}

// Make available globally
window.SettingsManager = SettingsManager;