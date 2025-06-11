export class PropertiesPanel {
    constructor() {
        this.panel = document.getElementById('properties-panel');
        this.titleElement = document.getElementById('panel-title');
        this.contentElement = document.getElementById('panel-content');
        this.currentCallback = null;
        this.currentData = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Save button
        document.getElementById('save-properties')?.addEventListener('click', () => {
            this.saveProperties();
        });

        // Cancel button
        document.getElementById('cancel-properties')?.addEventListener('click', () => {
            this.hide();
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.panel && !this.panel.contains(e.target) && this.panel.style.display !== 'none') {
                // Don't close if clicking on a node or canvas
                if (!e.target.closest('.status-node') && !e.target.closest('#workflow-editor')) {
                    this.hide();
                }
            }
        });
    }

    show(data, callback) {
        this.currentData = { ...data };
        this.currentCallback = callback;

        this.titleElement.textContent = 'Status Properties';
        this.renderForm();

        this.panel.classList.remove('hidden');
        this.panel.style.transform = 'translate(0, -50%)';
    }

    hide() {
        this.panel.classList.add('hidden');
        this.panel.style.transform = 'translate(100%, -50%)';
        this.currentCallback = null;
        this.currentData = null;
    }

    renderForm() {
        const roles = ['admin', 'manager', 'finance', 'procurement', 'user'];
        const currentRoles = this.currentData.allowed_roles || [];

        this.contentElement.innerHTML = `
            <div class="space-y-4">
                <!-- Status Name -->
                <div>
                    <label for="status-name" class="block text-sm font-medium text-gray-700 mb-1">
                        Status Name
                    </label>
                    <input
                        type="text"
                        id="status-name"
                        value="${this.currentData.name || ''}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter status name"
                    />
                </div>

                <!-- Description -->
                <div>
                    <label for="status-description" class="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="status-description"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description"
                    >${this.currentData.description || ''}</textarea>
                </div>

                <!-- Color -->
                <div>
                    <label for="status-color" class="block text-sm font-medium text-gray-700 mb-1">
                        Color
                    </label>
                    <input
                        type="color"
                        id="status-color"
                        value="${this.currentData.color_code || '#3B82F6'}"
                        class="w-full h-10 p-1 border border-gray-300 rounded-md"
                    />
                </div>

                <!-- Roles -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Roles
                    </label>
                    <div class="space-y-2">
                        ${roles.map(role => `
                            <label class="flex items-center">
                                <input
                                    type="checkbox"
                                    value="${role}"
                                    class="role-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                                    ${currentRoles.includes(role) ? 'checked' : ''}
                                />
                                <span class="ml-2 text-sm text-gray-700">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="pt-2 border-t border-gray-200">
                    <button
                        type="button"
                        id="delete-status"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete Status
                    </button>
                </div>
            </div>
        `;

        // Setup delete button
        document.getElementById('delete-status')?.addEventListener('click', () => {
            this.deleteStatus();
        });
    }

    saveProperties() {
        const name = document.getElementById('status-name')?.value?.trim();
        const description = document.getElementById('status-description')?.value?.trim();
        const colorCode = document.getElementById('status-color')?.value;
        const selectedRoles = Array.from(document.querySelectorAll('.role-checkbox:checked'))
            .map(checkbox => checkbox.value);

        if (!name) {
            alert('Status name is required');
            return;
        }

        if (selectedRoles.length === 0) {
            alert('At least one role must be selected');
            return;
        }

        const updatedData = {
            ...this.currentData,
            name,
            description,
            color_code: colorCode,
            allowed_roles: selectedRoles
        };

        if (this.currentCallback) {
            this.currentCallback(updatedData);
        }

        this.hide();
    }

    deleteStatus() {
        if (confirm('Are you sure you want to delete this status?')) {
            // Emit delete event
            if (this.currentCallback) {
                this.currentCallback({ ...this.currentData, _delete: true });
            }
            this.hide();
        }
    }
}
