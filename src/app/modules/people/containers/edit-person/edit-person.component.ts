import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { getPersonForm } from '../../person-form.config';

@Component({
    selector: 'app-edit-person',
    templateUrl: './edit-person.component.html',
    styleUrls: ['./edit-person.component.scss'],
})
export class EditPersonComponent {
    memberId = this.route.snapshot.paramMap.get('memberId') || '';
    personForm = getPersonForm();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private memberCol: MembersCollection,
        private toastService: ToastService
    ) {
        this.memberCol.getMember(this.memberId).pipe(first()).subscribe((member) => {
            if (member) {
                this.personForm.setValue({ name: member.name });
            } else {
                this.navigateBack();
            }
        });
    }

    savePerson(): void {
        this.personForm.markAllAsTouched();
        if (this.personForm.invalid) return;

        this.memberCol
            .updateMember(this.memberId, {
                name: this.personForm.getRawValue().name,
            })
            .pipe(first())
            .subscribe(() => {
                this.navigateBack();
            });
    }

    removePerson(): void {
        this.memberCol.removeMember(this.memberId).pipe(first()).subscribe({
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
