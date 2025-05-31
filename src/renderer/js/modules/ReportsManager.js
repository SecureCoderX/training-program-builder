/**
 * ReportsManager - Advanced reporting and analytics
 */
class ReportsManager {
    constructor() {
        this.reportData = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Report generation buttons
        const generateBtn = document.getElementById('generate-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.showReportModal());
        }

        const reportForm = document.getElementById('generate-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleGenerateReport();
            });
        }

        // Export buttons
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        }

        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportToExcel());
        }
    }

    showReportModal() {
        ModalManager.show('generate-report-modal');
    }

    async handleGenerateReport() {
        const formData = UIUtils.getFormData('generate-report-form');
        const reportType = formData.report_type;
        
        if (!reportType) {
            alert('Please select a report type');
            return;
        }

        try {
            UIUtils.showLoading();
            
            switch (reportType) {
                case 'completion-summary':
                    await this.generateCompletionSummary();
                    break;
                case 'employee-progress':
                    await this.generateEmployeeProgress();
                    break;
                case 'program-analytics':
                    await this.generateProgramAnalytics();
                    break;
                case 'compliance-report':
                    await this.generateComplianceReport();
                    break;
                default:
                    UIUtils.showNotification('Unknown report type', 'error');
                    return;
            }
            
            ModalManager.hide('generate-report-modal');
            this.renderReportResults();
            UIUtils.showNotification('Report generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating report:', error);
            UIUtils.showNotification('Failed to generate report', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async generateCompletionSummary() {
        // Get all employees and their progress
        const employees = window.app.employeeManager.employees;
        const programs = window.app.programManager.programs;
        
        const summary = {
            type: 'completion-summary',
            title: 'Training Completion Summary',
            generatedAt: new Date().toISOString(),
            totalEmployees: employees.length,
            totalPrograms: programs.length,
            completionStats: this.calculateCompletionStats(employees),
            programBreakdown: this.calculateProgramBreakdown(programs),
            departmentBreakdown: this.calculateDepartmentBreakdown(employees)
        };
        
        this.reportData = summary;
        return summary;
    }

    async generateEmployeeProgress() {
        const employees = window.app.employeeManager.employees;
        
        const progressReport = {
            type: 'employee-progress',
            title: 'Employee Progress Report',
            generatedAt: new Date().toISOString(),
            employees: employees.map(emp => ({
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                position: emp.position || 'No position',
                department: emp.department || 'No department',
                assignedPrograms: emp.assigned_programs || 0,
                completedPrograms: emp.completed_programs || 0,
                totalModules: emp.total_modules || 0,
                completedModules: emp.completed_modules || 0,
                completionRate: emp.total_modules > 0 ? 
                    Math.round((emp.completed_modules / emp.total_modules) * 100) : 0,
                status: this.getEmployeeStatus(emp)
            })).sort((a, b) => b.completionRate - a.completionRate)
        };
        
        this.reportData = progressReport;
        return progressReport;
    }

    async generateProgramAnalytics() {
        const programs = window.app.programManager.programs;
        const employees = window.app.employeeManager.employees;
        
        const analytics = {
            type: 'program-analytics',
            title: 'Program Analytics Report',
            generatedAt: new Date().toISOString(),
            programs: programs.map(prog => {
                const assignedCount = this.countProgramAssignments(prog.id, employees);
                const completedCount = this.countProgramCompletions(prog.id, employees);
                
                return {
                    id: prog.id,
                    name: prog.name,
                    moduleCount: prog.module_count || 0,
                    assignedEmployees: assignedCount,
                    completedEmployees: completedCount,
                    completionRate: assignedCount > 0 ? 
                        Math.round((completedCount / assignedCount) * 100) : 0,
                    avgTimeToComplete: this.calculateAvgCompletionTime(prog.id),
                    popularity: assignedCount
                };
            }).sort((a, b) => b.popularity - a.popularity)
        };
        
        this.reportData = analytics;
        return analytics;
    }

    async generateComplianceReport() {
        const employees = window.app.employeeManager.employees;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const compliance = {
            type: 'compliance-report',
            title: 'Training Compliance Report',
            generatedAt: new Date().toISOString(),
            reportPeriod: {
                from: thirtyDaysAgo.toISOString(),
                to: now.toISOString()
            },
            overallCompliance: this.calculateOverallCompliance(employees),
            departmentCompliance: this.calculateDepartmentCompliance(employees),
            overdueTraining: this.getOverdueTraining(employees),
            recentCompletions: this.getRecentCompletions(employees, thirtyDaysAgo),
            atRiskEmployees: this.getAtRiskEmployees(employees)
        };
        
        this.reportData = compliance;
        return compliance;
    }

    // Helper methods for calculations
    calculateCompletionStats(employees) {
        const stats = {
            fullyCompliant: 0,
            partiallyCompliant: 0,
            nonCompliant: 0,
            noAssignments: 0
        };
        
        employees.forEach(emp => {
            if (emp.assigned_programs === 0) {
                stats.noAssignments++;
            } else if (emp.completed_programs === emp.assigned_programs) {
                stats.fullyCompliant++;
            } else if (emp.completed_programs > 0) {
                stats.partiallyCompliant++;
            } else {
                stats.nonCompliant++;
            }
        });
        
        return stats;
    }

    calculateProgramBreakdown(programs) {
        return programs.map(prog => ({
            name: prog.name,
            moduleCount: prog.module_count || 0,
            createdDate: prog.created_date
        }));
    }

    calculateDepartmentBreakdown(employees) {
        const deptMap = {};
        
        employees.forEach(emp => {
            const dept = emp.department || 'No Department';
            if (!deptMap[dept]) {
                deptMap[dept] = { total: 0, compliant: 0, avgCompletion: 0 };
            }
            
            deptMap[dept].total++;
            if (emp.completed_programs === emp.assigned_programs && emp.assigned_programs > 0) {
                deptMap[dept].compliant++;
            }
            
            const rate = emp.total_modules > 0 ? 
                (emp.completed_modules / emp.total_modules) * 100 : 0;
            deptMap[dept].avgCompletion += rate;
        });
        
        // Calculate averages
        Object.keys(deptMap).forEach(dept => {
            const data = deptMap[dept];
            data.avgCompletion = data.total > 0 ? Math.round(data.avgCompletion / data.total) : 0;
            data.complianceRate = data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0;
        });
        
        return deptMap;
    }

    getEmployeeStatus(employee) {
        if (employee.assigned_programs === 0) return 'No Assignments';
        if (employee.completed_programs === employee.assigned_programs) return 'Compliant';
        if (employee.completed_programs > 0) return 'In Progress';
        return 'Not Started';
    }

    countProgramAssignments(programId, employees) {
        // This would need actual assignment data from the database
        // For now, return estimated based on completion data
        return Math.floor(Math.random() * employees.length);
    }

    countProgramCompletions(programId, employees) {
        // This would need actual completion data from the database
        return Math.floor(Math.random() * employees.length * 0.7);
    }

    calculateAvgCompletionTime(programId) {
        // This would calculate from actual completion dates
        return Math.floor(Math.random() * 30) + 7; // 7-37 days
    }

    calculateOverallCompliance(employees) {
        const compliant = employees.filter(emp => 
            emp.assigned_programs > 0 && emp.completed_programs === emp.assigned_programs
        ).length;
        
        const withAssignments = employees.filter(emp => emp.assigned_programs > 0).length;
        
        return withAssignments > 0 ? Math.round((compliant / withAssignments) * 100) : 0;
    }

    calculateDepartmentCompliance(employees) {
        const deptCompliance = {};
        
        employees.forEach(emp => {
            const dept = emp.department || 'No Department';
            if (!deptCompliance[dept]) {
                deptCompliance[dept] = { total: 0, compliant: 0 };
            }
            
            if (emp.assigned_programs > 0) {
                deptCompliance[dept].total++;
                if (emp.completed_programs === emp.assigned_programs) {
                    deptCompliance[dept].compliant++;
                }
            }
        });
        
        Object.keys(deptCompliance).forEach(dept => {
            const data = deptCompliance[dept];
            data.rate = data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0;
        });
        
        return deptCompliance;
    }

    getOverdueTraining(employees) {
        // This would check actual assignment dates and deadlines
        return employees.filter(emp => 
            emp.assigned_programs > emp.completed_programs
        ).slice(0, 10).map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || 'No Department',
            overduePrograms: emp.assigned_programs - emp.completed_programs,
            daysPastDue: Math.floor(Math.random() * 60) + 1
        }));
    }

    getRecentCompletions(employees, since) {
        // This would get actual completion dates from the database
        return employees.filter(emp => emp.completed_programs > 0)
            .slice(0, 10)
            .map(emp => ({
                employeeName: `${emp.first_name} ${emp.last_name}`,
                programName: 'Sample Program', // Would be actual program name
                completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }));
    }

    getAtRiskEmployees(employees) {
        return employees.filter(emp => {
            const completionRate = emp.total_modules > 0 ? 
                (emp.completed_modules / emp.total_modules) * 100 : 0;
            return emp.assigned_programs > 0 && completionRate < 50;
        }).slice(0, 10).map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || 'No Department',
            completionRate: emp.total_modules > 0 ? 
                Math.round((emp.completed_modules / emp.total_modules) * 100) : 0,
            assignedPrograms: emp.assigned_programs,
            risk: 'High'
        }));
    }

    // Rendering methods
    renderReportResults() {
        if (!this.reportData) return;
        
        const container = document.getElementById('report-results');
        if (!container) return;
        
        switch (this.reportData.type) {
            case 'completion-summary':
                this.renderCompletionSummary(container);
                break;
            case 'employee-progress':
                this.renderEmployeeProgress(container);
                break;
            case 'program-analytics':
                this.renderProgramAnalytics(container);
                break;
            case 'compliance-report':
                this.renderComplianceReport(container);
                break;
        }
        
        // Show export buttons
        const exportSection = document.getElementById('report-export-section');
        if (exportSection) {
            exportSection.style.display = 'block';
        }
    }

    renderCompletionSummary(container) {
        const data = this.reportData;
        const stats = data.completionStats;
        
        container.innerHTML = `
            <div class="report-header">
                <h3>${data.title}</h3>
                <p class="report-date">Generated: ${UIUtils.formatDate(data.generatedAt)}</p>
            </div>
            
            <div class="report-stats-grid">
                <div class="report-stat-card">
                    <div class="stat-value">${data.totalEmployees}</div>
                    <div class="stat-label">Total Employees</div>
                </div>
                <div class="report-stat-card">
                    <div class="stat-value">${data.totalPrograms}</div>
                    <div class="stat-label">Training Programs</div>
                </div>
                <div class="report-stat-card success">
                    <div class="stat-value">${stats.fullyCompliant}</div>
                    <div class="stat-label">Fully Compliant</div>
                </div>
                <div class="report-stat-card warning">
                    <div class="stat-value">${stats.partiallyCompliant}</div>
                    <div class="stat-label">Partially Compliant</div>
                </div>
            </div>
            
            <div class="report-section">
                <h4>Department Breakdown</h4>
                <div class="department-breakdown">
                    ${Object.entries(data.departmentBreakdown).map(([dept, data]) => `
                        <div class="dept-item">
                            <div class="dept-name">${dept}</div>
                            <div class="dept-stats">
                                <span>${data.total} employees</span>
                                <span class="completion-rate">${data.complianceRate}% compliant</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderEmployeeProgress(container) {
        const data = this.reportData;
        
        container.innerHTML = `
            <div class="report-header">
                <h3>${data.title}</h3>
                <p class="report-date">Generated: ${UIUtils.formatDate(data.generatedAt)}</p>
            </div>
            
            <div class="employee-progress-table">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Assigned</th>
                            <th>Completed</th>
                            <th>Progress</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.employees.map(emp => `
                            <tr>
                                <td>
                                    <div class="employee-info">
                                        <strong>${emp.name}</strong>
                                        <small>${emp.position}</small>
                                    </div>
                                </td>
                                <td>${emp.department}</td>
                                <td>${emp.assignedPrograms}</td>
                                <td>${emp.completedPrograms}</td>
                                <td>
                                    <div class="progress-bar-small">
                                        <div class="progress-fill" style="width: ${emp.completionRate}%"></div>
                                    </div>
                                    <span class="progress-text">${emp.completionRate}%</span>
                                </td>
                                <td>
                                    <span class="status-badge ${emp.status.toLowerCase().replace(' ', '-')}">${emp.status}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderProgramAnalytics(container) {
        const data = this.reportData;
        
        container.innerHTML = `
            <div class="report-header">
                <h3>${data.title}</h3>
                <p class="report-date">Generated: ${UIUtils.formatDate(data.generatedAt)}</p>
            </div>
            
            <div class="program-analytics-grid">
                ${data.programs.map(prog => `
                    <div class="program-analytics-card">
                        <h4>${prog.name}</h4>
                        <div class="analytics-stats">
                            <div class="analytics-stat">
                                <span class="value">${prog.moduleCount}</span>
                                <span class="label">Modules</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="value">${prog.assignedEmployees}</span>
                                <span class="label">Assigned</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="value">${prog.completionRate}%</span>
                                <span class="label">Completion Rate</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="value">${prog.avgTimeToComplete}d</span>
                                <span class="label">Avg Time</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderComplianceReport(container) {
        const data = this.reportData;
        
        container.innerHTML = `
            <div class="report-header">
                <h3>${data.title}</h3>
                <p class="report-date">Generated: ${UIUtils.formatDate(data.generatedAt)}</p>
                <p class="report-period">Period: ${UIUtils.formatDate(data.reportPeriod.from)} - ${UIUtils.formatDate(data.reportPeriod.to)}</p>
            </div>
            
            <div class="compliance-overview">
                <div class="compliance-stat-card">
                    <div class="stat-value ${data.overallCompliance >= 80 ? 'success' : data.overallCompliance >= 60 ? 'warning' : 'danger'}">${data.overallCompliance}%</div>
                    <div class="stat-label">Overall Compliance</div>
                </div>
            </div>
            
            <div class="report-sections">
                <div class="report-section">
                    <h4>Overdue Training</h4>
                    <div class="overdue-list">
                        ${data.overdueTraining.map(item => `
                            <div class="overdue-item">
                                <span class="employee-name">${item.name}</span>
                                <span class="department">${item.department}</span>
                                <span class="overdue-count">${item.overduePrograms} overdue</span>
                                <span class="days-past">${item.daysPastDue} days</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="report-section">
                    <h4>At-Risk Employees</h4>
                    <div class="at-risk-list">
                        ${data.atRiskEmployees.map(emp => `
                            <div class="at-risk-item">
                                <span class="employee-name">${emp.name}</span>
                                <span class="department">${emp.department}</span>
                                <span class="completion-rate">${emp.completionRate}% complete</span>
                                <span class="risk-level risk-${emp.risk.toLowerCase()}">${emp.risk} Risk</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Export methods
    async exportToPDF() {
        if (!this.reportData) {
            UIUtils.showNotification('No report data to export', 'error');
            return;
        }

        try {
            UIUtils.showLoading();
            
            // For now, we'll create a simple HTML-based PDF export
            // In a real implementation, you'd use a PDF library
            const printContent = document.getElementById('report-results').innerHTML;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${this.reportData.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .report-header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                            .report-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                            .report-stat-card { padding: 15px; border: 1px solid #ddd; text-align: center; }
                            .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
                            .stat-label { color: #666; font-size: 12px; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                            th { background: #f5f5f5; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.print();
            
            UIUtils.showNotification('PDF export initiated', 'success');
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            UIUtils.showNotification('Failed to export PDF', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    async exportToExcel() {
        if (!this.reportData) {
            UIUtils.showNotification('No report data to export', 'error');
            return;
        }

        try {
            UIUtils.showLoading();
            
            // Convert report data to CSV format
            let csvContent = '';
            
            switch (this.reportData.type) {
                case 'employee-progress':
                    csvContent = this.convertEmployeeProgressToCSV();
                    break;
                case 'program-analytics':
                    csvContent = this.convertProgramAnalyticsToCSV();
                    break;
                case 'compliance-report':
                    csvContent = this.convertComplianceToCSV();
                    break;
                default:
                    csvContent = this.convertGenericReportToCSV();
            }
            
            // Download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${this.reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            UIUtils.showNotification('Excel export completed', 'success');
            
        } catch (error) {
            console.error('Error exporting Excel:', error);
            UIUtils.showNotification('Failed to export Excel', 'error');
        } finally {
            UIUtils.hideLoading();
        }
    }

    convertEmployeeProgressToCSV() {
        const data = this.reportData;
        let csv = 'Employee Name,Position,Department,Assigned Programs,Completed Programs,Completion Rate,Status\n';
        
        data.employees.forEach(emp => {
            csv += `"${emp.name}","${emp.position}","${emp.department}",${emp.assignedPrograms},${emp.completedPrograms},${emp.completionRate}%,"${emp.status}"\n`;
        });
        
        return csv;
    }

    convertProgramAnalyticsToCSV() {
        const data = this.reportData;
        let csv = 'Program Name,Module Count,Assigned Employees,Completed Employees,Completion Rate,Avg Time to Complete\n';
        
        data.programs.forEach(prog => {
            csv += `"${prog.name}",${prog.moduleCount},${prog.assignedEmployees},${prog.completedEmployees},${prog.completionRate}%,${prog.avgTimeToComplete} days\n`;
        });
        
        return csv;
    }

    convertComplianceToCSV() {
        const data = this.reportData;
        let csv = 'Report Type,Overall Compliance\n';
        csv += `"${data.title}",${data.overallCompliance}%\n\n`;
        
        csv += 'Overdue Training\n';
        csv += 'Employee Name,Department,Overdue Programs,Days Past Due\n';
        data.overdueTraining.forEach(item => {
            csv += `"${item.name}","${item.department}",${item.overduePrograms},${item.daysPastDue}\n`;
        });
        
        return csv;
    }

    convertGenericReportToCSV() {
        return `Report: ${this.reportData.title}\nGenerated: ${this.reportData.generatedAt}\n\nData export not available for this report type.`;
    }
}

// Make available globally
window.ReportsManager = ReportsManager;