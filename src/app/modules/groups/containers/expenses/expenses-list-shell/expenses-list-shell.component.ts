import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';

@Component({
    selector: 'app-expenses-list-shell',
    templateUrl: './expenses-list-shell.component.html',
    styleUrls: ['./expenses-list-shell.component.scss'],
})
export class ExpensesListShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    fullExpenses$ = this.expensesCol.getFullExpenses(this.groupId);

    constructor(
        private expensesCol: ExpensesCollection,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {}
}
