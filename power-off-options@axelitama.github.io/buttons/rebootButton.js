import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import LoginManagerButton from './_loginManagerButton.js';

export default class RebootButton extends LoginManagerButton {

    constructor(systemMenu, loginManager) {
        super(systemMenu, _('Restart'), 'system-reboot-symbolic', loginManager, 'Reboot');
    }

}
