export class ContextMenu {
    constructor() {
        this.menu = null;
        this.setupMenu();
    }

    setupMenu() {
        // Create menu element if it doesn't exist
        if (!this.menu) {
            this.menu = document.createElement('div');
            this.menu.className = 'fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] hidden';
            document.body.appendChild(this.menu);

            // Hide menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.menu && !this.menu.contains(e.target)) {
                    this.hide();
                }
            });
        }
    }

    show(x, y, items) {
        this.menu.innerHTML = items.map(item => `
            <button class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                <span>${item.icon}</span>
                <span>${item.label}</span>
            </button>
        `).join('');

        // Add click handlers
        const buttons = this.menu.querySelectorAll('button');
        items.forEach((item, index) => {
            buttons[index].addEventListener('click', () => {
                item.action();
                this.hide();
            });
        });

        // Position menu
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;

        // Show menu
        this.menu.classList.remove('hidden');
    }

    hide() {
        if (this.menu) {
            this.menu.classList.add('hidden');
        }
    }
}
