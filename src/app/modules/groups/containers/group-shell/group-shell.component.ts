import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { Group } from 'src/app/database/storage.interface';

@Component({
    selector: 'app-group-shell',
    templateUrl: './group-shell.component.html',
    styleUrls: ['./group-shell.component.scss'],
})
export class GroupShellComponent {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    group$ = this.groupsCol.getGroup(this.groupId).pipe(
        filter((group) => {
            if (!group) this.navigateBack();
            return !!group;
        })
    ) as Observable<Group>;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private groupsCol: GroupsCollection
    ) {}

    private navigateBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
