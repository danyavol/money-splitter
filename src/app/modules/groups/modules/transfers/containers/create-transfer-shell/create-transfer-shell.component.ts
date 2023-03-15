import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';
import { Transfer } from 'src/app/database/storage.interface';
import { getTransferForm } from '../../transfer-form.config';

@Component({
    selector: 'app-create-transfer-shell',
    templateUrl: './create-transfer-shell.component.html',
    styleUrls: ['./create-transfer-shell.component.scss'],
})
export class CreateTransferShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    members$ = this.membersCol.getGroupMembers(this.groupId);
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

    ngOnInit() {}

    createTransfer(): void {
        this.form.markAllAsTouched();

        if (this.form.invalid) return;

        this.transfersCol
            .createTransfer(this.mapFormToTransfer())
            .subscribe(this.goBack.bind(this));
    }

    private mapFormToTransfer(): Omit<Transfer, "id"> {
        const value = this.form.getRawValue();
        return {
            groupId: this.groupId,
            amount: value.amount as number,
            senderId: value.senderId as string,
            recipientId: value.recipientId as string,
            title: value.title,
            date: value.date
        };
    }

    private goBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
