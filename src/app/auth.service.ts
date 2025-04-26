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
        console.log('AuthService: Stav autentifikácie pri inicializácii:', this.isLoggedIn);
    }

    login(code: string): boolean {
        console.log('AuthService: Pokus o prihlásenie s kódom:', code);
        if (code === this.accessCode) {
            this.isLoggedIn = true;
            localStorage.setItem('authenticated', 'true');
            console.log('AuthService: Užívateľ úspešne prihlásený');
            return true;
        }
        console.log('AuthService: Neúspešný pokus o prihlásenie');
        return false;
    }

    logout(): void {
        this.isLoggedIn = false;
        localStorage.removeItem('authenticated');
        console.log('AuthService: Užívateľ odhlásený');
    }

    isAuthenticated(): boolean {
        // Kontrola z localStorage pre prípad refreshu stránky
        const authFromStorage = localStorage.getItem('authenticated') === 'true';
        this.isLoggedIn = this.isLoggedIn || authFromStorage;
        console.log('AuthService: Kontrola autentifikácie:', this.isLoggedIn);
        return this.isLoggedIn;
    }
}