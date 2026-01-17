import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export default class Button {

    constructor(systemMenu, label) {
        this._systemMenu = systemMenu;
        this._label = label;

        this._button = null;
        this._handler = null;

        this._createButton();
    }

    _createButton(position = 0) {
        if (this._button !== null)
            return;

        // Reverted to simple text item (no icons)
        this._button = new PopupMenu.PopupMenuItem(this._label);

        this._handler = this._button.connect('activate', () => this._execute());

        this._systemMenu._systemItem.menu.addMenuItem(this._button, position);
    }

    addButton(position) {
        this._createButton(position);
    }

    removeButton() {
        if (this._button === null)
            return;

        if (this._handler !== null) {
            this._button.disconnect(this._handler);
            this._handler = null;
        }

        this._button.destroy();
        this._button = null;
    }

    _execute() {
        throw new Error('Not implemented');
    }

    destroy() {
        this.removeButton();
        this._systemMenu = null;
        this._label = null;
    }
}
