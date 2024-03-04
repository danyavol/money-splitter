import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, map } from 'rxjs';

type ControlType = File | string | null;

@Component({
    selector: 'app-upload-photo',
    templateUrl: './upload-photo.component.html',
    styleUrls: ['./upload-photo.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => UploadPhotoComponent),
        },
    ],
})
export class UploadPhotoComponent implements ControlValueAccessor {
    file = new BehaviorSubject<ControlType>(null);

    imageUrl$ = this.file.pipe(
        map(value => {
            if (typeof value === 'string') return value;
            else if (value !== null) return URL.createObjectURL(value);
            else return value;
        })
    );

    onChange = (value: ControlType) => {};
    onTouched = () => {};

    onFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        this.file.next(target.files?.[0] ? target.files[0] : null);
        this.onChange(this.file.value);
        this.onTouched();
    }

    deleteFile(elem: HTMLInputElement) {
        elem.value = '';
        this.file.next(null);
        this.onChange(this.file.value);
        this.onTouched();
    }

    writeValue(value: ControlType): void {
        this.file.next(value);
    }

    registerOnChange(fn: (value: ControlType) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
}
