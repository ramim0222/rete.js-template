export class ContextMenu {
    constructor() {
        this.menu = null;
        this.clickHandler = this.handleClick.bind(this);
    }

    show(x, y, items) {
        this.hide(); // Hide any existing menu

        // Create menu element
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;

        // Add menu items
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.label;
            menuItem.addEventListener('click', () => {
                item.action();
                this.hide();
            });
            this.menu.appendChild(menuItem);
        });

        // Add to document
        document.body.appendChild(this.menu);

        // Add global click handler to hide menu
        setTimeout(() => {
            document.addEventListener('click', this.clickHandler);
        }, 0);
    }

    handleClick(event) {
        if (this.menu && !this.menu.contains(event.target)) {
            this.hide();
        }
    }

    hide() {
        if (this.menu) {
            this.menu.remove();
            this.menu = null;
            document.removeEventListener('click', this.clickHandler);
        }
    }
}
