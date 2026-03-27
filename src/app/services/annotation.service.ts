import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Annotation, AnnotationCreate } from '../models/article.model';

const ANNOTATIONS_STORAGE_KEY = 'text_annotation_annotations';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private annotationsSubject = new BehaviorSubject<Annotation[]>([]);
  public annotations$ = this.annotationsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(ANNOTATIONS_STORAGE_KEY);
    if (stored) {
      try {
        const annotations = JSON.parse(stored) as Annotation[];
        this.annotationsSubject.next(annotations);
      } catch (e) {
        console.error('Error parsing annotations from localStorage', e);
        this.annotationsSubject.next([]);
      }
    }
  }

  private saveToStorage(annotations: Annotation[]): void {
    localStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
  }

  private generateId(): string {
    return `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getByArticleId(articleId: string): Observable<Annotation[]> {
    return this.annotations$.pipe(
      map(annotations => annotations.filter(ann => ann.articleId === articleId))
    );
  }

  create(data: AnnotationCreate): Observable<Annotation> {
    const now = Date.now();
    const newAnnotation: Annotation = {
      id: this.generateId(),
      ...data,
      createdAt: now
    };

    const currentAnnotations = this.annotationsSubject.value;
    const updatedAnnotations = [...currentAnnotations, newAnnotation];

    this.annotationsSubject.next(updatedAnnotations);
    this.saveToStorage(updatedAnnotations);

    return new Observable(observer => {
      observer.next(newAnnotation);
      observer.complete();
    });
  }

  update(id: string, updates: Partial<Pick<Annotation, 'note' | 'color'>>): Observable<Annotation | null> {
    const currentAnnotations = this.annotationsSubject.value;
    const index = currentAnnotations.findIndex(ann => ann.id === id);

    if (index === -1) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    const updatedAnnotation: Annotation = {
      ...currentAnnotations[index],
      ...updates
    };

    const updatedAnnotations = [...currentAnnotations];
    updatedAnnotations[index] = updatedAnnotation;

    this.annotationsSubject.next(updatedAnnotations);
    this.saveToStorage(updatedAnnotations);

    return new Observable(observer => {
      observer.next(updatedAnnotation);
      observer.complete();
    });
  }

  delete(id: string): Observable<boolean> {
    const currentAnnotations = this.annotationsSubject.value;
    const filteredAnnotations = currentAnnotations.filter(ann => ann.id !== id);

    if (filteredAnnotations.length === currentAnnotations.length) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    this.annotationsSubject.next(filteredAnnotations);
    this.saveToStorage(filteredAnnotations);

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  deleteByArticleId(articleId: string): Observable<boolean> {
    const currentAnnotations = this.annotationsSubject.value;
    const filteredAnnotations = currentAnnotations.filter(ann => ann.articleId !== articleId);

    this.annotationsSubject.next(filteredAnnotations);
    this.saveToStorage(filteredAnnotations);

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}
