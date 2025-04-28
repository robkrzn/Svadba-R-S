import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;
  testCode: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
    this.loginForm = this.formBuilder.group({
      accessCode: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Pokus o načítanie TestCode hodnoty z Firestore
      this.testCode = await this.firebaseService.getTestCode();
      console.log('Načítaný TestCode z Firestore:', this.testCode);
    } catch (error) {
      console.error('Chyba pri načítaní TestCode', error);
    }
    
    // Spracovanie parametru code z URL
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.verifyCodeFromUrl(params['code']);
      }
    });
  }

  async verifyCodeFromUrl(code: string): Promise<void> {
    try {
      const isValid = await this.authService.login(code);
      if (isValid) {
        this.router.navigate(['/info']);
      } else {
        console.log('Kód z URL je nesprávny');
      }
    } catch (error) {
      console.error('Chyba pri overovaní kódu z URL', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const submittedCode = this.loginForm.get('accessCode')?.value;
    
    try {
      // Overenie prístupového kódu cez AuthService
      const isValid = await this.authService.login(submittedCode);
      
      if (isValid) {
        console.log('Správny kód:', submittedCode);
        this.router.navigate(['/info']);
      } else {
        this.errorMessage = 'Nesprávny prístupový kód. Skúste to znova.';
      }
    } catch (error) {
      console.error('Chyba pri prihlasovaní', error);
      this.errorMessage = 'Nastala chyba pri overovaní kódu. Skúste to prosím neskôr.';
    } finally {
      this.loading = false;
    }
  }
}