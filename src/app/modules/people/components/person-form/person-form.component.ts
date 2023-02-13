import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PersonForm } from '../../interfaces/person-form.interface';

@Component({
    selector: 'app-person-form',
    templateUrl: './person-form.component.html',
    styleUrls: ['./person-form.component.scss'],
})
export class PersonFormComponent {
    @Input() form?: FormGroup<PersonForm>;
}
