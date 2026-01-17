import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import LoginManagerButton from './_loginManagerButton.js';

export default class PowerOffButton extends LoginManagerButton {

    constructor(systemMenu, loginManager) {
        super(systemMenu, _('Power Off'), 'system-shutdown-symbolic', loginManager, 'PowerOff');
    }

}
