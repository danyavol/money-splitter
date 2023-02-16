import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { PersonForm } from '../../interfaces/person-form.interface';

@Component({
    selector: 'app-edit-person',
    templateUrl: './edit-person.component.html',
    styleUrls: ['./edit-person.component.scss'],
})
export class EditPersonComponent {
    memberId = this.route.snapshot.paramMap.get('memberId') || '';
    memberForm = new FormGroup<PersonForm>({
        name: new FormControl('', { nonNullable: true }),
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private memberCol: MembersCollection,
        private toastService: ToastService
    ) {
        this.memberCol.getMember(this.memberId).subscribe((member) => {
            if (member) {
                this.memberForm.setValue({ name: member.name });
            } else {
                this.navigateBack();
            }
        });
    }

    savePerson(): void {
        this.memberCol
            .updateMember(this.memberId, {
                name: this.memberForm.getRawValue().name,
            })
            .subscribe(() => {
                this.navigateBack();
            });
    }

    removePerson(): void {
        this.memberCol.removeMember(this.memberId).subscribe({
            next: () => {
                this.navigateBack();
            },
            error: (error: Error) => {
                this.toastService.error(error.message);
            },
        });
    }

    private navigateBack(): void {
        this.router.navigate(['/people']);
    }
}
