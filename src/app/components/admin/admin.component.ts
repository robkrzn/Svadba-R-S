import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { FirebaseService, AccessCode } from '../../services/firebase.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  accessCodes: AccessCode[] = [];
  codeForm: FormGroup;
  editMode = false;
  currentEditId: string | null = null;
  isLoading = true;
  message = '';
  isError = false;
  adminPassword = 'admin123'; // Jednoduchý admin password, v produkcii použite bezpečnejšie riešenie
  isAuthenticated = false;
  passwordInput = '';

  constructor(
    private firebaseService: FirebaseService,
    private formBuilder: FormBuilder
  ) {
    this.codeForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(4)]],
      name: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Dáta načítame až po autentifikácii
  }

  login(): void {
    if (this.passwordInput === this.adminPassword) {
      this.isAuthenticated = true;
      this.loadAccessCodes();
    } else {
      this.message = 'Nesprávne heslo';
      this.isError = true;
    }
  }

  loadAccessCodes(): void {
    this.isLoading = true;
    
    this.firebaseService.getAccessCodes().subscribe(
      codes => {
        this.accessCodes = codes;
        this.isLoading = false;
      },
      error => {
        console.error('Chyba pri načítaní kódov', error);
        this.message = 'Nastala chyba pri načítaní prístupových kódov';
        this.isError = true;
        this.isLoading = false;
      }
    );
  }

  async onSubmit(): Promise<void> {
    if (this.codeForm.invalid) {
      return;
    }

    const formValue = this.codeForm.value;
    const codeData: AccessCode = {
      code: formValue.code,
      name: formValue.name,
      isActive: formValue.isActive
    };

    try {
      if (this.editMode && this.currentEditId) {
        await this.firebaseService.updateAccessCode(this.currentEditId, codeData);
        this.resetForm();
        this.message = 'Kód bol úspešne aktualizovaný';
        this.isError = false;
      } else {
        await this.firebaseService.addAccessCode(codeData);
        this.resetForm();
        this.message = 'Nový kód bol úspešne pridaný';
        this.isError = false;
      }
      
      // Znovu načítame zoznam kódov
      this.loadAccessCodes();
    } catch (error) {
      console.error('Chyba pri operácii s kódom', error);
      this.message = 'Nastala chyba pri operácii s kódom';
      this.isError = true;
    }
  }

  editAccessCode(code: AccessCode): void {
    this.editMode = true;
    this.currentEditId = code.id!;
    this.codeForm.setValue({
      code: code.code,
      name: code.name || '',
      isActive: code.isActive
    });
  }

  async deleteAccessCode(id: string): Promise<void> {
    if (confirm('Naozaj chcete odstrániť tento prístupový kód?')) {
      try {
        await this.firebaseService.deleteAccessCode(id);
        this.message = 'Kód bol úspešne odstránený';
        this.isError = false;
        
        // Znovu načítame zoznam kódov
        this.loadAccessCodes();
      } catch (error) {
        console.error('Chyba pri odstránení kódu', error);
        this.message = 'Nastala chyba pri odstránení kódu';
        this.isError = true;
      }
    }
  }

  async toggleStatus(code: AccessCode): Promise<void> {
    const newStatus = !code.isActive;
    
    try {
      await this.firebaseService.updateAccessCode(code.id!, { isActive: newStatus });
      this.message = `Kód bol ${newStatus ? 'aktivovaný' : 'deaktivovaný'}`;
      this.isError = false;
      
      // Znovu načítame zoznam kódov
      this.loadAccessCodes();
    } catch (error) {
      console.error('Chyba pri zmene stavu kódu', error);
      this.message = 'Nastala chyba pri zmene stavu kódu';
      this.isError = true;
    }
  }

  resetForm(): void {
    this.codeForm.reset({ isActive: true });
    this.editMode = false;
    this.currentEditId = null;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.passwordInput = '';
    this.accessCodes = [];
  }
}