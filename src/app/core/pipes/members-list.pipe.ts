import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'appMembersList',
    standalone: true
})
export class MembersListPipe implements PipeTransform {
    transform(value: ({ name: string } | string)[], maxLength = 25): string {
        const membersCopy = [...value];

        let membersStr = getName(membersCopy.splice(0, 1)[0]);
        for (let member of membersCopy) {
            const nextName = ', ' + getName(member);

            if (membersStr.length + nextName.length < maxLength) {
                membersStr += nextName;
            } else {
                membersStr += ', ...';
                break;
            }
        }

        function getName(member: { name: string } | string): string {
            if (typeof member === "string") return member;
            return member.name;
        }

        return membersStr;
    }
}
