import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Article } from '../models/article.model';

const ARTICLES_STORAGE_KEY = 'text_annotation_articles';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private articlesSubject = new BehaviorSubject<Article[]>([]);
  public articles$ = this.articlesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (stored) {
      try {
        const articles = JSON.parse(stored) as Article[];
        this.articlesSubject.next(articles);
      } catch (e) {
        console.error('Error parsing articles from localStorage', e);
        this.articlesSubject.next([]);
      }
    }
  }

  private saveToStorage(articles: Article[]): void {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAll(): Observable<Article[]> {
    return this.articles$;
  }

  getById(id: string): Observable<Article | undefined> {
    return this.articles$.pipe(
      map(articles => articles.find(article => article.id === id))
    );
  }

  create(title: string, content: string): Observable<Article> {
    const now = Date.now();
    const newArticle: Article = {
      id: this.generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now
    };

    const currentArticles = this.articlesSubject.value;
    const updatedArticles = [...currentArticles, newArticle];

    this.articlesSubject.next(updatedArticles);
    this.saveToStorage(updatedArticles);

    return new Observable(observer => {
      observer.next(newArticle);
      observer.complete();
    });
  }

  update(id: string, updates: Partial<Pick<Article, 'title' | 'content'>>): Observable<Article | null> {
    const currentArticles = this.articlesSubject.value;
    const index = currentArticles.findIndex(article => article.id === id);

    if (index === -1) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    const updatedArticle: Article = {
      ...currentArticles[index],
      ...updates,
      updatedAt: Date.now()
    };

    const updatedArticles = [...currentArticles];
    updatedArticles[index] = updatedArticle;

    this.articlesSubject.next(updatedArticles);
    this.saveToStorage(updatedArticles);

    return new Observable(observer => {
      observer.next(updatedArticle);
      observer.complete();
    });
  }

  delete(id: string): Observable<boolean> {
    const currentArticles = this.articlesSubject.value;
    const filteredArticles = currentArticles.filter(article => article.id !== id);

    if (filteredArticles.length === currentArticles.length) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    this.articlesSubject.next(filteredArticles);
    this.saveToStorage(filteredArticles);

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}
