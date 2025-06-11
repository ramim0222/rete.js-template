export class ContextMenu {
    constructor() {
        this.menu = null;
        this.isVisible = false;

        // Close menu when clicking elsewhere
        document.addEventListener('click', () => {
            this.hide();
        });
    }

    show(x, y, items) {
        this.hide(); // Hide any existing menu

        this.menu = this.createMenu(items);
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;

        document.body.appendChild(this.menu);
        this.isVisible = true;

        // Adjust position if menu goes off screen
        this.adjustPosition();
    }

    createMenu(items) {
        const menu = document.createElement('div');
        menu.className = 'context-menu fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48';

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center';

            if (item.icon) {
                menuItem.innerHTML = `
                    <span class="mr-2">${item.icon}</span>
                    ${item.label}
                `;
            } else {
                menuItem.textContent = item.label;
            }

            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide();
                item.action();
            });

            menu.appendChild(menuItem);
        });

        return menu;
    }

    adjustPosition() {
        if (!this.menu) return;

        const rect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position
        if (rect.right > viewportWidth) {
            this.menu.style.left = `${viewportWidth - rect.width - 10}px`;
        }

        // Adjust vertical position
        if (rect.bottom > viewportHeight) {
            this.menu.style.top = `${viewportHeight - rect.height - 10}px`;
        }
    }

    hide() {
        if (this.menu && this.menu.parentNode) {
            this.menu.parentNode.removeChild(this.menu);
        }
        this.menu = null;
        this.isVisible = false;
    }
}