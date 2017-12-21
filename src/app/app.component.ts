import {
	AfterContentInit,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthService, User } from '@app/core';
import { SidenavComponent } from '@app/lib';
import { BreakpointObserver, Breakpoints } from '@app/cdk';



@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {}