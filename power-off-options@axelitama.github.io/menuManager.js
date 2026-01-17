import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib'; // <--- Добавлено
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export const MenuManager = GObject.registerClass(
class MenuManager extends Adw.PreferencesGroup {
    _init(settings) {
        super._init({
            title: _('Menu Items'),
            description: _('Arrange and configure menu items. Drag to reorder.'),
        });

        this._settings = settings;
        this._items = [];

        // List Box
        this._listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            css_classes: ['boxed-list'],
        });
        this.add(this._listBox);

        // Drop Target on ListBox
        const dropTarget = new Gtk.DropTarget({
            actions: Gdk.DragAction.MOVE,
            formats: Gdk.ContentFormats.new(['application/x-power-options-item'])
        });

        dropTarget.connect('drop', (target, value, x, y) => {
             if (value === null) return false;

             try {
                 // Декодируем байты обратно в строку
                 const text = new TextDecoder().decode(value);
                 const data = JSON.parse(text);
                 const srcIndex = data.index;

                 const row = this._listBox.get_row_at_y(y);
                 let destIndex;

                 if (row) {
                     destIndex = row.get_index();
                 } else {
                     destIndex = this._items.length;
                 }

                 this._moveItem(srcIndex, destIndex);
                 return true;
             } catch (e) {
                 console.error('[PowerOffOptions] Drop error:', e);
                 return false;
             }
        });
        this._listBox.add_controller(dropTarget);

        // Add Button
        const addButton = new Gtk.Button({
            label: _('Add Custom Button'),
            halign: Gtk.Align.CENTER,
            css_classes: ['pill'],
            margin_top: 10,
            margin_bottom: 10,
        });
        addButton.connect('clicked', () => this._showEditor());
        this.add(addButton);

        this._reload();
    }

    _reload() {
        let child = this._listBox.get_first_child();
        while (child) {
            const next = child.get_next_sibling();
            this._listBox.remove(child);
            child = next;
        }

        try {
            const jsonStr = this._settings.get_string('menu-items');
            if (!jsonStr || jsonStr === '[]') {
                this._items = [
                    {"id": "screen-off", "type": "system", "enabled": true},
                    {"id": "suspend", "type": "system", "enabled": true},
                    {"id": "hibernate", "type": "system", "enabled": true},
                    {"id": "reboot", "type": "system", "enabled": true},
                    {"id": "poweroff", "type": "system", "enabled": true}
                ];
            } else {
                this._items = JSON.parse(jsonStr);
            }
        } catch (e) {
            console.error('Failed to parse menu-items:', e);
            this._items = [];
        }

        this._items.forEach((item, index) => {
            const row = this._createRow(item, index);
            this._listBox.append(row);
        });
    }

    _createRow(item, index) {
        const row = new Adw.ActionRow({
            title: item.name || this._getSystemName(item.id),
            subtitle: item.type === 'custom' ? item.command : null
        });

        const dragHandle = new Gtk.Image({
            icon_name: 'list-drag-handle-symbolic',
            css_classes: ['dim-label'],
        });
        row.add_prefix(dragHandle);

        const dragSource = new Gtk.DragSource({
            actions: Gdk.DragAction.MOVE,
        });

        // Используем GLib.Bytes для передачи данных
        const jsonStr = JSON.stringify({index: index});
        const bytes = new GLib.Bytes(new TextEncoder().encode(jsonStr));
        const content = Gdk.ContentProvider.new_for_bytes(
            'application/x-power-options-item',
            bytes
        );

        dragSource.connect('prepare', (source, x, y) => {
            return content;
        });

        row.add_controller(dragSource);

        const toggle = new Gtk.Switch({
            active: item.enabled,
            valign: Gtk.Align.CENTER,
        });
        toggle.connect('state-set', (sw, state) => {
            item.enabled = state;
            this._save();
            return true;
        });
        row.add_suffix(toggle);

        if (item.type === 'custom') {
            const editBtn = new Gtk.Button({
                icon_name: 'document-edit-symbolic',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat', 'circular'],
            });
            editBtn.connect('clicked', () => this._showEditor(item));
            row.add_suffix(editBtn);
        }

        return row;
    }

    _getSystemName(id) {
        const names = {
            'screen-off': _('Turn Off Screen'),
            'suspend': _('Suspend'),
            'hybrid-sleep': _('Hybrid Sleep'),
            'suspend-then-hibernate': _('Suspend then Hibernate'),
            'hibernate': _('Hibernate'),
            'reboot': _('Restart'),
            'soft-reboot': _('Soft Reboot'),
            'reboot-to-bios': _('Restart to BIOS'),
            'poweroff': _('Power Off'),
            'settings': _('Settings'),
        };
        return names[id] || id;
    }

    _save() {
        this._settings.set_string('menu-items', JSON.stringify(this._items));
    }

    _moveItem(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        const item = this._items[fromIndex];
        this._items.splice(fromIndex, 1);

        if (fromIndex < toIndex) {
            toIndex--;
        }

        this._items.splice(toIndex, 0, item);

        this._save();
        this._reload();
    }

    _showEditor(item = null) {
        const win = new Adw.Window({
            title: item ? _('Edit Button') : _('New Button'),
            modal: true,
            default_width: 400,
            default_height: 300,
        });

        // Пытаемся привязать окно к родительскому (чтобы было модальным)
        const root = this.get_root ? this.get_root() : null;
        if (root) win.set_transient_for(root);

        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        win.set_content(box);

        const page = new Adw.PreferencesPage();
        box.append(page);

        const group = new Adw.PreferencesGroup();
        page.add(group);

        const nameEntry = new Adw.EntryRow({ title: _('Name') });
        if (item) nameEntry.set_text(item.name);
        group.add(nameEntry);

        const cmdEntry = new Adw.EntryRow({ title: _('Command') });
        if (item) cmdEntry.set_text(item.command);
        group.add(cmdEntry);

        const btnBox = new Gtk.Box({ spacing: 10, margin_top: 20, margin_bottom: 20, margin_start: 20, margin_end: 20 });
        box.append(btnBox);

        if (item) {
             const deleteBtn = new Gtk.Button({
                 label: _('Delete'),
                 css_classes: ['destructive-action']
             });
             deleteBtn.connect('clicked', () => {
                 const idx = this._items.indexOf(item);
                 if (idx > -1) {
                     this._items.splice(idx, 1);
                     this._save();
                     this._reload();
                 }
                 win.close();
             });
             btnBox.append(deleteBtn);
        }

        const saveBtn = new Gtk.Button({
            label: _('Save'),
            css_classes: ['suggested-action'],
            hexpand: true
        });
        saveBtn.connect('clicked', () => {
             const name = nameEntry.get_text();
             const cmd = cmdEntry.get_text();

             if (!name || !cmd) return;

             if (item) {
                 item.name = name;
                 item.command = cmd;
             } else {
                 this._items.push({
                     id: 'custom_' + Date.now(),
                     type: 'custom',
                     name: name,
                     command: cmd,
                     enabled: true
                 });
             }
             this._save();
             this._reload();
             win.close();
        });
        btnBox.append(saveBtn);

        win.present();
    }
});
