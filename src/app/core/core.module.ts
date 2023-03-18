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
        SelectCurrencyModalComponent
    ],
    providers: [
        MembersListPipe
    ]
})
export class CoreModule {}
