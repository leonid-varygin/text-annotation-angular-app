import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
})
export class ThemeSwitcherComponent {
  theme$: Observable<ThemeMode>;

  // Конфигурация тем с иконками
  themeConfig: Record<ThemeMode, { icon: string; label: string }> = {
    light: { icon: '☀️', label: 'Светлая тема' },
    dark: { icon: '🌙', label: 'Тёмная тема' },
    auto: { icon: '💻', label: 'Автоматическая тема' }
  };

  constructor(private themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
  }

  /**
   * Переключить тему по кругу: light -> dark -> auto -> light
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Получить иконку для текущей темы
   */
  getThemeIcon(theme: ThemeMode | null): string {
    return this.themeConfig[theme || 'auto'].icon;
  }

  /**
   * Получить название для текущей темы
   */
  getThemeLabel(theme: ThemeMode | null): string {
    return this.themeConfig[theme || 'auto'].label;
  }
}
