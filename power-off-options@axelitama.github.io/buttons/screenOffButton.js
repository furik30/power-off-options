import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import Button from './_button.js';

export default class ScreenOffButton extends Button {

    constructor(systemMenu) {
        super(systemMenu, _('Turn Off Screen'), 'video-display-symbolic');
    }

    _execute() {
        const monitorManager = global.backend.get_monitor_manager();
        if (monitorManager) {
            monitorManager.set_power_save_mode(1); // 1 = POWER_SAVE_OFF
        } else {
            console.warn('[PowerOffOptions] MonitorManager not found');
        }
    }
}
