import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    // Odhlásenie užívateľa
    this.authService.logout();
    
    // Presmerovanie na prihlasovaciu stránku
    this.router.navigate(['/login']);
  }
}