import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core';



@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	constructor (
		private authService: AuthService,
		private router: Router
	) {

	}

	ngOnInit() {
	}

	login(): void {
		this.authService.login('admin', 'password');
		this.router.navigate(['/']);
	}

}
