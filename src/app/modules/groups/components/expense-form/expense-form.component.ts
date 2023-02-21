import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent implements OnInit {
    control = new FormControl();

    constructor() {
    }

    ngOnInit() {}
}
