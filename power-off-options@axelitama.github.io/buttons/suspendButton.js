import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import LoginManagerButton from './_loginManagerButton.js';

export default class SuspendButton extends LoginManagerButton {

    constructor(systemMenu, loginManager) {
        super(systemMenu, _('Suspend'), 'system-suspend-symbolic', loginManager, 'Suspend');
    }

}
