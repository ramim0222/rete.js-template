export class PropertiesPanel {
    constructor() {
        this.panel = document.getElementById('properties-panel');
        this.content = document.getElementById('panel-content');
        this.currentData = null;
        this.onSave = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Save button
        const saveButton = document.getElementById('save-properties');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.save());
        }

        // Cancel button
        const cancelButton = document.getElementById('cancel-properties');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.hide());
        }
    }

    show(data, onSave) {
        this.currentData = { ...data };
        this.onSave = onSave;

        // Update panel content
        this.content.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="status-name" value="${data.name}"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="status-description" rows="3"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">${data.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Color</label>
                    <input type="color" id="status-color" value="${data.color_code}"
                           class="mt-1 block rounded-md border-gray-300 shadow-sm h-10 w-full">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Allowed Roles</label>
                    <select id="status-roles" multiple class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="admin" ${data.allowed_roles.includes('admin') ? 'selected' : ''}>Admin</option>
                        <option value="manager" ${data.allowed_roles.includes('manager') ? 'selected' : ''}>Manager</option>
                        <option value="user" ${data.allowed_roles.includes('user') ? 'selected' : ''}>User</option>
                    </select>
                </div>
                <div class="pt-4 border-t border-gray-200">
                    <button type="button" id="delete-status" class="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete Status
                    </button>
                </div>
            </div>
        `;

        // Add delete handler
        const deleteButton = document.getElementById('delete-status');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.deleteStatus());
        }

        // Show panel with animation
        this.panel.classList.remove('hidden');
        this.panel.classList.add('block');
        requestAnimationFrame(() => {
            this.panel.style.transform = 'translate(0, -50%)';
        });
    }

    hide() {
        // Hide with animation
        this.panel.style.transform = 'translate(100%, -50%)';
        setTimeout(() => {
            this.panel.classList.remove('block');
            this.panel.classList.add('hidden');
            this.currentData = null;
            this.onSave = null;
        }, 300);
    }

    save() {
        if (!this.currentData || !this.onSave) return;

        const updatedData = {
            ...this.currentData,
            name: document.getElementById('status-name').value,
            description: document.getElementById('status-description').value,
            color_code: document.getElementById('status-color').value,
            allowed_roles: Array.from(document.getElementById('status-roles').selectedOptions).map(option => option.value)
        };

        this.onSave(updatedData);
        this.hide();
    }

    deleteStatus() {
        if (confirm('Are you sure you want to delete this status?')) {
            this.onSave({ ...this.currentData, _delete: true });
            this.hide();
        }
    }
}
