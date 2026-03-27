import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'text_annotation_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject: BehaviorSubject<ThemeMode>;
  public theme$: Observable<ThemeMode>;

  private effectiveThemeSubject: BehaviorSubject<'light' | 'dark'>;
  public effectiveTheme$: Observable<'light' | 'dark'>;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Инициализация темы из localStorage или по умолчанию 'auto'
    const savedTheme = this.isBrowser
      ? (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'auto'
      : 'auto';

    this.themeSubject = new BehaviorSubject<ThemeMode>(savedTheme);
    this.theme$ = this.themeSubject.asObservable();

    // Определяем эффективную тему (light/dark)
    const effectiveTheme = this.getEffectiveTheme(savedTheme);
    this.effectiveThemeSubject = new BehaviorSubject<'light' | 'dark'>(effectiveTheme);
    this.effectiveTheme$ = this.effectiveThemeSubject.asObservable();

    // Применяем тему при инициализации
    if (this.isBrowser) {
      this.applyTheme(effectiveTheme);
      this.listenToSystemThemeChanges();
    }
  }

  /**
   * Получить текущую выбранную тему
   */
  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  /**
   * Получить текущую эффективную тему (light/dark)
   */
  get effectiveTheme(): 'light' | 'dark' {
    return this.effectiveThemeSubject.value;
  }

  /**
   * Установить тему
   */
  setTheme(theme: ThemeMode): void {
    if (this.themeSubject.value === theme) {
      return;
    }

    this.themeSubject.next(theme);

    // Сохраняем в localStorage
    if (this.isBrowser) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    // Применяем эффективную тему
    const effectiveTheme = this.getEffectiveTheme(theme);
    this.effectiveThemeSubject.next(effectiveTheme);
    this.applyTheme(effectiveTheme);
  }

  /**
   * Переключить между темами по кругу: light -> dark -> auto -> light
   */
  toggleTheme(): void {
    const current = this.themeSubject.value;
    const next: ThemeMode = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }

  /**
   * Определить эффективную тему на основе настроек
   */
  private getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Получить системную тему
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (!this.isBrowser) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Применить тему к документу
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) {
      return;
    }

    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
    } else {
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
    }

    // Обновляем meta theme-color для мобильных браузеров
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#f5f5f5');
    }
  }

  /**
   * Слушать изменения системной темы
   */
  private listenToSystemThemeChanges(): void {
    if (!this.isBrowser) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      // Реагируем только если выбрана автоматическая тема
      if (this.themeSubject.value === 'auto') {
        const newEffectiveTheme = e.matches ? 'dark' : 'light';
        this.effectiveThemeSubject.next(newEffectiveTheme);
        this.applyTheme(newEffectiveTheme);
      }
    });
  }
}
