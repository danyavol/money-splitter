import { Injectable } from "@angular/core";
import { AnimationController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ModalAnimation {
    constructor(private animationCtrl: AnimationController) {}

    enterAnimation = (baseEl: HTMLElement) => {
      const root = baseEl.shadowRoot!;

      const backdropAnimation = this.animationCtrl
        .create()
        .addElement(root.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

      const wrapperAnimation = this.animationCtrl
        .create()
        .addElement(root.querySelector('.modal-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(0.5)' },
          { offset: 1, opacity: '1', transform: 'scale(1)' },
        ]);

      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    leaveAnimation = (baseEl: HTMLElement) => {
      return this.enterAnimation(baseEl).direction('reverse');
    };
}
