import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';
import { getTransferForm } from '../../transfer-form.config';

@Component({
    selector: 'app-edit-transfer-shell',
    templateUrl: './edit-transfer-shell.component.html',
    styleUrls: ['./edit-transfer-shell.component.scss'],
})
export class EditTransferShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    transferId = this.route.snapshot.paramMap.get('transferId') || '';
    members$ = this.membersCol.getGroupMembers(this.groupId).pipe(first());
    currency$ = this.groupsCol.getGroup(this.groupId).pipe(
        map((group) => {
            if (!group) {
                this.goBack();
                this.toastService.error('Invalid group ID');
                throw new Error('Invalid group ID');
            }
            return group.currency;
        })
    );

    form = getTransferForm();

    constructor(
        private transfersCol: TransfersCollection,
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.transfersCol.getTransfer(this.transferId).pipe(first()).subscribe((transfer) => {
            if (transfer) {
                this.form.patchValue(transfer);
            } else {
                this.goBack();
                this.toastService.error('Invalid transfer ID');
                throw new Error('Invalid transfer ID');
            }
        });
    }

    saveTransfer() {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        const value = this.form.getRawValue();

        this.transfersCol
            .updateTransfer(this.transferId, {
                title: value.title,
                amount: value.amount as number,
                date: value.date,
                senderId: value.senderId as string,
                recipientId: value.recipientId as string
            })
            .pipe(first())
            .subscribe(() => this.goBack());
    }

    removeTransfer() {
        this.transfersCol.removeTransfer(this.transferId).pipe(first()).subscribe(() => this.goBack());
    }

    private goBack() {
        this.router.navigate(['../..'], { relativeTo: this.route });
    }
}
