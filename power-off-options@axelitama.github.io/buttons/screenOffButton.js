import Gio from 'gi://Gio';
import GLib from 'gi://GLib'; // <--- Добавлено
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import Button from './_button.js';

export default class ScreenOffButton extends Button {

    constructor(systemMenu) {
        super(systemMenu, _('Turn Off Screen'));
    }

    _execute() {
        try {
            // Используем прямой D-Bus вызов к Mutter
            const bus = Gio.DBus.session;
            bus.call(
                'org.gnome.Mutter.DisplayConfig',
                '/org/gnome/Mutter/DisplayConfig',
                'org.gnome.Mutter.DisplayConfig',
                'SetPowerSaveMode',
                new GLib.Variant('(i)', [1]), // 1 = POWER_SAVE_OFF (Экран выкл)
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                (proxy, result) => {
                    try {
                        proxy.call_finish(result);
                    } catch (e) {
                        console.error('[PowerOffOptions] Failed to turn off screen:', e);
                    }
                }
            );
        } catch (e) {
            console.error('[PowerOffOptions] DBus error:', e);
        }
    }
}
