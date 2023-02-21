import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateExpenseShellComponent } from './create-expense-shell.component';

describe('CreateExpenseShellComponent', () => {
    let component: CreateExpenseShellComponent;
    let fixture: ComponentFixture<CreateExpenseShellComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateExpenseShellComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateExpenseShellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
