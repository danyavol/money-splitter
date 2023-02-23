import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { allCurrencies } from 'src/app/core/constants/currencies.const';
import { Member } from 'src/app/database/storage.interface';
import { GroupForm } from '../../interfaces/group-form.interface';

@Component({
    selector: 'app-group-form',
    templateUrl: './group-form.component.html',
    styleUrls: ['./group-form.component.scss'],
})
export class GroupFormComponent {
    @Input() form!: FormGroup<GroupForm>;
    @Input() members: Member[] = [];

    currencies = allCurrencies;
}
