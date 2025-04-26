import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

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
  accessCode = 'R&S2025'; // Prístupový kód pre svadbu

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      accessCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Kontrola, či bol kód zadaný v URL (napr. z QR kódu)
    this.route.queryParams.subscribe(params => {
      if (params['code'] && params['code'] === this.accessCode) {
        this.authService.login(params['code']);
        this.router.navigate(['/info']);
      }
    });
    
    // Ak je už užívateľ prihlásený, presmerujeme ho na info stránku
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/info']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const submittedCode = this.loginForm.get('accessCode')?.value;
    
    if (submittedCode === this.accessCode) {
      console.log('Správny kód:', submittedCode);
      
      // Označíme užívateľa ako autentifikovaného
      this.authService.login(submittedCode);
      
      // Navigácia na info stránku
      this.router.navigate(['/info']);
    } else {
      // Nesprávny kód
      this.errorMessage = 'Nesprávny prístupový kód. Skúste to znova.';
    }
  }
}