import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Currency } from 'src/app/core/constants/currencies.const';
import { Member } from 'src/app/database/storage.interface';
import { TransferForm } from '../../transfer-form.interface';

@Component({
    selector: 'app-transfer-form',
    templateUrl: './transfer-form.component.html',
    styleUrls: ['./transfer-form.component.scss'],
})
export class TransferFormComponent{
    @Input() members$!: Observable<Member[]>;
    @Input() currency!: string;
    @Input() form!: FormGroup<TransferForm>;

    placeholder!: string;
    selectedSender$!: Observable<string>;
    selectedRecipient$!: Observable<string>;

    ngOnInit() {
        this.placeholder = Currency.getPlaceholder(this.currency);
        this.selectedSender$ = this.getSelectedMember(this.form.controls.senderId);
        this.selectedRecipient$ = this.getSelectedMember(this.form.controls.recipientId);
    }

    getSelectedMember(control: FormControl) {
        return combineLatest([
            control.valueChanges.pipe(
                startWith(control.value)
            ),
            this.members$
        ]).pipe(
            map(([memberId, members]) =>
                members.find(m => m.id === memberId)?.name || ""
            )
        );
    }
}
