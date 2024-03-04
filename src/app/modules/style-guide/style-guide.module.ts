import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleGuideComponent } from './style-guide.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  declarations: [StyleGuideComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {
            path: '',
            component: StyleGuideComponent
        },
    ]),
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
  ]
})
export class StyleGuideModule { }
