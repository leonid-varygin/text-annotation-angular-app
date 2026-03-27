import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeSwitcherComponent],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent {
  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backButtonText: string = 'Назад';
  @Input() showEditButton: boolean = false;
  @Input() showCreateButton: boolean = false;
  @Input() createButtonText: string = 'Создать';

  @Output() backClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();
}
