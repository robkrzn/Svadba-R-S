import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedIn = false;
    private hardcodedCode = 'R-S2025'; // Záložný kód pre prípad, že Firebase nefunguje

    constructor(private firebaseService: FirebaseService) {
        // Kontrola, či je užívateľ už prihlásený (napríklad po refreshe stránky)
        this.isLoggedIn = localStorage.getItem('authenticated') === 'true';
        console.log('AuthService: Stav autentifikácie pri inicializácii:', this.isLoggedIn);
    }

    async login(code: string): Promise<boolean> {
        console.log('AuthService: Pokus o prihlásenie s kódom:', code);

        // Najprv skontrolujeme pevne nastavený kód
        if (code === this.hardcodedCode) {
            this.isLoggedIn = true;
            localStorage.setItem('authenticated', 'true');
            console.log('AuthService: Užívateľ úspešne prihlásený s pevným kódom');
            return true;
        }

        try {
            // Overíme kód cez Firebase service
            const isValid = await this.firebaseService.verifyAccessCode(code);

            if (isValid) {
                this.isLoggedIn = true;
                localStorage.setItem('authenticated', 'true');
                console.log('AuthService: Užívateľ úspešne prihlásený');
                return true;
            } else {
                console.log('AuthService: Neplatný prístupový kód');
                return false;
            }
        } catch (error) {
            console.error('AuthService: Chyba pri overovaní kódu', error);
            return false;
        }
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