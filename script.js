// Task Management Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
    }

    initializeElements() {
        // Input elements
        this.taskInput = document.getElementById('taskInput');
        this.taskDate = document.getElementById('taskDate');
        this.taskTime = document.getElementById('taskTime');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        
        // Edit modal elements
        this.editModal = document.getElementById('editModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editTaskDate = document.getElementById('editTaskDate');
        this.editTaskTime = document.getElementById('editTaskTime');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeModal = document.querySelector('.close-modal');
        
        // Container elements
        this.tasksContainer = document.getElementById('tasksContainer');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Add task events
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Modal events
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        
        // Close modal when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.taskDate.value = today;
        this.taskDate.min = today;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a task!', 'warning');
            return;
        }

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            date: this.taskDate.value,
            time: this.taskTime.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        
        // Reset input
        this.taskInput.value = '';
        this.taskTime.value = '';
        
        this.showNotification('Task added successfully!', 'success');
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        this.editTaskInput.value = task.text;
        this.editTaskDate.value = task.date || '';
        this.editTaskTime.value = task.time || '';
        
        this.editModal.style.display = 'flex';
        this.editTaskInput.focus();
    }

    saveEdit() {
        const text = this.editTaskInput.value.trim();
        if (!text) {
            this.showNotification('Task cannot be empty!', 'warning');
            return;
        }

        const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = text;
            this.tasks[taskIndex].date = this.editTaskDate.value;
            this.tasks[taskIndex].time = this.editTaskTime.value;
            
            this.saveTasks();
            this.renderTasks();
            this.closeEditModal();
            
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    closeEditModal() {
        this.editModal.style.display = 'none';
        this.editingTaskId = null;
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task deleted!', 'info');
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    formatDateTime(date, time) {
        if (!date) return '';
        
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateStr = new Date(date).toLocaleDateString('en-US', options);
        
        if (!time) return dateStr;
        
        let timeStr = time;
        if (time.includes(':')) {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            timeStr = `${displayHour}:${minutes} ${ampm}`;
        }
        
        return `${dateStr} • ${timeStr}`;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first task to get started!' : 
                         this.currentFilter === 'completed' ? 'No completed tasks yet!' : 
                         'All tasks are completed! Great job!'}</p>
                </div>
            `;
            return;
        }

        this.tasksContainer.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="app.toggleTask('${task.id}')">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        ${task.date ? `
                            <div class="task-due">
                                <i class="far fa-calendar"></i>
                                <span>${this.formatDateTime(task.date, task.time)}</span>
                            </div>
                        ` : ''}
                        <div class="task-created">
                            <i class="far fa-clock"></i>
                            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="app.editTask('${task.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="app.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles for notification
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1001;
                animation: slideIn 0.3s ease;
                border-left: 4px solid var(--${type});
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-success { border-left-color: var(--success); }
            .notification-warning { border-left-color: var(--warning); }
            .notification-info { border-left-color: var(--primary); }
            .notification-error { border-left-color: var(--danger); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle',
            error: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});