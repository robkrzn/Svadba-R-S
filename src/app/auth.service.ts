import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedIn = false;
    private accessCode = 'R&S2025'; // Rovnaký kód ako v LoginComponent

    constructor() {
        // Kontrola, či je užívateľ už prihlásený (napríklad po refreshe stránky)
        this.isLoggedIn = localStorage.getItem('authenticated') === 'true';
    }

    login(code: string): boolean {
        if (code === this.accessCode) {
            this.isLoggedIn = true;
            localStorage.setItem('authenticated', 'true');
            return true;
        }
        return false;
    }

    logout(): void {
        this.isLoggedIn = false;
        localStorage.removeItem('authenticated');
    }

    isAuthenticated(): boolean {
        return this.isLoggedIn;
    }
}