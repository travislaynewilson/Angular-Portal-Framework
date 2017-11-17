import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
    login(username: string, password: string): boolean {
        if(username === 'admin' && password === 'password') {
            localStorage.setItem('username', username);
            return true;
        }

        return false;
    }

    logout(): any {
        localStorage.removeItem('username');
    }

    getUser(): any {
        return localStorage.getItem('username');
    }

    isAuthenticated(): boolean {
        return this.getUser() !== null;
    }
}

export const AUTH_PROVIDERS: Array<any> = [
    { provide: AuthService, useClass: AuthService }
];
