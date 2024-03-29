import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { SelectPersonModalComponent } from "./components/select-person-modal/select-person-modal.component";
import { CurrencyMaskDirective } from "./directives/currency-mask.directive";
import { ControlWrapperComponent } from "./components/control-wrapper/control-wrapper.component";
import { CurrencyPipe } from "./pipes/currency.pipe";
import { MembersListPipe } from "./pipes/members-list.pipe";
import { NgLetModule } from "ng-let";
import { SelectCurrencyModalComponent } from "./components/select-currency-modal/select-currency-modal.component";
import { ButtonComponent } from "./components/button/button.component";
import { UploadPhotoComponent } from "./components/upload-photo/upload-photo.component";
import { ErrorMessageDirective } from "./directives/error-message.directive";
import { StaticVirtualScrollDirective } from "./directives/static-virtual-scroll.directive";
import { IonErrorMessageDirective } from "./directives/ion-error-message.directive";
import { AutofocusDirective } from "./directives/autofocus.directive";

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        SelectPersonModalComponent,
        CurrencyMaskDirective,
        ControlWrapperComponent,
        CurrencyPipe,
        MembersListPipe,
        NgLetModule,
        SelectCurrencyModalComponent,
        ButtonComponent,
        UploadPhotoComponent,
        ErrorMessageDirective,
        StaticVirtualScrollDirective,
        IonErrorMessageDirective,
        AutofocusDirective,
    ],
    exports: [
        CommonModule,
        IonicModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        SelectPersonModalComponent,
        CurrencyMaskDirective,
        ControlWrapperComponent,
        CurrencyPipe,
        MembersListPipe,
        NgLetModule,
        SelectCurrencyModalComponent,
        ButtonComponent,
        UploadPhotoComponent,
        ErrorMessageDirective,
        StaticVirtualScrollDirective,
        IonErrorMessageDirective,
        AutofocusDirective,
    ],
    providers: [
        MembersListPipe
    ]
})
export class CoreModule {}
