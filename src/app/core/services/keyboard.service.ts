import { Keyboard } from '@capacitor/keyboard';
import { isPlatform } from '@ionic/angular';

if (isPlatform('capacitor')) {
    Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.setProperty('--keyboard-height', info.keyboardHeight + 'px');
        document.body.classList.add('keyboard-visible');
    });

    Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.setProperty('--keyboard-height', '0px');
        document.body.classList.remove('keyboard-visible');
    });
}
