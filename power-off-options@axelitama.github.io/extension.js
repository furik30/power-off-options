import GLib from 'gi://GLib';
import * as LoginManager from 'resource:///org/gnome/shell/misc/loginManager.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import ScreenOffButton from './buttons/screenOffButton.js';
import SuspendButton from './buttons/suspendButton.js';
import HybridSleepButton from './buttons/hybridSleepButton.js';
import SuspendThenHibernateButton from './buttons/suspendThenHibernateButton.js';
import HibernationButton from './buttons/hibernationButton.js';
import RebootButton from './buttons/rebootButton.js';
import SoftRebootButton from './buttons/softRebootButton.js';
import RebootToBiosButton from './buttons/rebootToBiosButton.js';
import PowerOffButton from './buttons/powerOffButton.js';
import SettingsButton from './buttons/settingsButton.js';
import CustomButton from './buttons/customButton.js';

export default class PowerOffOptions extends Extension {
    enable() {
        this._loginManager = LoginManager.getLoginManager();
        this._buttons = [];
        this._settings = this.getSettings();

        this._deferredInitId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._systemMenu = Main.panel.statusArea.quickSettings._system;
            if (!this._systemMenu) return GLib.SOURCE_CONTINUE;

            this._buildMenu();
            this._settingsConnectionId = this._settings.connect('changed::menu-items', () => this._rebuildMenu());

            this._deferredInitId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    disable() {
        if (this._deferredInitId) {
            GLib.Source.remove(this._deferredInitId);
            this._deferredInitId = null;
        }

        if (this._settingsConnectionId) {
            this._settings.disconnect(this._settingsConnectionId);
            this._settingsConnectionId = null;
        }

        this._destroyButtons();
        
        this._loginManager = null;
        this._systemMenu = null;
        this._settings = null;
    }

    _rebuildMenu() {
        this._destroyButtons();
        this._buildMenu();
    }

    _destroyButtons() {
        if (this._buttons) {
            this._buttons.forEach(btn => btn.destroy());
        }
        this._buttons = [];
    }

    _buildMenu() {
        if (!this._systemMenu) return;

        let menuItems = [];
        try {
            // CRITICAL: If this key is missing (schema not updated), it throws or returns null
            const jsonStr = this._settings.get_string('menu-items');
            if (jsonStr) {
                menuItems = JSON.parse(jsonStr);
            }
        } catch (e) {
            console.error('[PowerOffOptions] Failed to load menu-items. Schema might be outdated.', e);
        }

        // Fallback if schema is empty/broken
        if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
            console.warn('[PowerOffOptions] Using fallback menu items.');
            // Default order
            menuItems = [
                {"id": "screen-off", "type": "system", "enabled": true},
                {"id": "suspend", "type": "system", "enabled": true},
                {"id": "hibernate", "type": "system", "enabled": true},
                {"id": "reboot", "type": "system", "enabled": true},
                {"id": "poweroff", "type": "system", "enabled": true}
            ];
        }

        let position = 0;

        menuItems.forEach(item => {
            if (!item.enabled) return;

            let instance = null;

            if (item.type === 'custom') {
                // No icon needed now
                instance = new CustomButton(this._systemMenu, item.name, item.command);
            } else if (item.type === 'system') {
                switch (item.id) {
                    case 'screen-off': instance = new ScreenOffButton(this._systemMenu); break;
                    case 'suspend': instance = new SuspendButton(this._systemMenu, this._loginManager); break;
                    case 'hybrid-sleep': instance = new HybridSleepButton(this._systemMenu, this._loginManager); break;
                    case 'suspend-then-hibernate': instance = new SuspendThenHibernateButton(this._systemMenu, this._loginManager); break;
                    case 'hibernate': instance = new HibernationButton(this._systemMenu, this._loginManager); break;
                    case 'reboot': instance = new RebootButton(this._systemMenu, this._loginManager); break;
                    case 'soft-reboot': instance = new SoftRebootButton(this._systemMenu); break;
                    case 'reboot-to-bios': instance = new RebootToBiosButton(this._systemMenu); break;
                    case 'poweroff': instance = new PowerOffButton(this._systemMenu, this._loginManager); break;
                    case 'settings': instance = new SettingsButton(this._systemMenu); break;
                }
            }

            if (instance) {
                instance.addButton(position);
                this._buttons.push(instance);
                position++;
            }
        });
    }
}
