import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnnotationService } from './annotation.service';
import { Annotation, AnnotationCreate } from '../models/article.model';

describe('AnnotationService', () => {
  let service: AnnotationService;

  const mockAnnotationCreate: AnnotationCreate = {
    articleId: 'article-1',
    startIndex: 0,
    endIndex: 10,
    selectedText: 'Test text',
    color: '#ffeb3b',
    note: 'Test note'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByArticleId', () => {
    it('should return annotations for specific article', fakeAsync(() => {
      let annotation1: Annotation | undefined;
      let annotation2: Annotation | undefined;
      let article1Annotations: Annotation[] = [];
      let article2Annotations: Annotation[] = [];

      service.create({ ...mockAnnotationCreate, articleId: 'article-1' }).subscribe(a => annotation1 = a);
      tick();

      service.create({ ...mockAnnotationCreate, articleId: 'article-2' }).subscribe(a => annotation2 = a);
      tick();

      service.getByArticleId('article-1').subscribe(anns => article1Annotations = anns);
      tick();

      service.getByArticleId('article-2').subscribe(anns => article2Annotations = anns);
      tick();

      expect(article1Annotations.length).toBe(1);
      expect(article1Annotations[0].articleId).toBe('article-1');

      expect(article2Annotations.length).toBe(1);
      expect(article2Annotations[0].articleId).toBe('article-2');
    }));

    it('should return empty array for article without annotations', fakeAsync(() => {
      let annotations: Annotation[] = [];

      service.getByArticleId('non-existent-article').subscribe(anns => annotations = anns);
      tick();

      expect(annotations.length).toBe(0);
    }));
  });

  describe('create', () => {
    it('should create a new annotation and return it', fakeAsync(() => {
      let createdAnnotation: Annotation | undefined;

      service.create(mockAnnotationCreate).subscribe(annotation => {
        createdAnnotation = annotation;
      });

      tick();

      expect(createdAnnotation).toBeDefined();
      expect(createdAnnotation?.articleId).toBe('article-1');
      expect(createdAnnotation?.selectedText).toBe('Test text');
      expect(createdAnnotation?.color).toBe('#ffeb3b');
      expect(createdAnnotation?.note).toBe('Test note');
      expect(createdAnnotation?.id).toBeDefined();
      expect(createdAnnotation?.id.startsWith('ann-')).toBe(true);
      expect(createdAnnotation?.createdAt).toBeDefined();
    }));

    it('should save annotation to localStorage', fakeAsync(() => {
      service.create(mockAnnotationCreate).subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_annotations');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].note).toBe('Test note');
    }));

    it('should generate unique IDs for different annotations', fakeAsync(() => {
      let annotation1: Annotation | undefined;
      let annotation2: Annotation | undefined;

      service.create(mockAnnotationCreate).subscribe(a => annotation1 = a);
      tick();

      service.create({ ...mockAnnotationCreate, selectedText: 'Another text' }).subscribe(a => annotation2 = a);
      tick();

      expect(annotation1?.id).not.toBe(annotation2?.id);
    }));
  });

  describe('update', () => {
    it('should update existing annotation note', fakeAsync(() => {
      let createdAnnotation: Annotation | undefined;
      let updatedAnnotation: Annotation | undefined;

      service.create(mockAnnotationCreate).subscribe(a => createdAnnotation = a);
      tick();

      service.update(createdAnnotation!.id, { note: 'Updated note' }).subscribe(a => {
        if (a) updatedAnnotation = a;
      });
      tick();

      expect(updatedAnnotation).toBeDefined();
      expect(updatedAnnotation?.note).toBe('Updated note');
      expect(updatedAnnotation?.color).toBe('#ffeb3b');
    }));

    it('should update existing annotation color', fakeAsync(() => {
      let createdAnnotation: Annotation | undefined;
      let updatedAnnotation: Annotation | undefined;

      service.create(mockAnnotationCreate).subscribe(a => createdAnnotation = a);
      tick();

      service.update(createdAnnotation!.id, { color: '#4caf50' }).subscribe(a => {
        if (a) updatedAnnotation = a;
      });
      tick();

      expect(updatedAnnotation?.color).toBe('#4caf50');
    }));

    it('should return null for non-existent annotation', fakeAsync(() => {
      let result: Annotation | null = null;

      service.update('non-existent-id', { note: 'New note' }).subscribe(a => result = a);
      tick();

      expect(result).toBeNull();
    }));

    it('should persist updates to localStorage', fakeAsync(() => {
      let createdAnnotation: Annotation | undefined;

      service.create(mockAnnotationCreate).subscribe(a => createdAnnotation = a);
      tick();

      service.update(createdAnnotation!.id, { note: 'Persisted note' }).subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_annotations');
      const parsed = JSON.parse(stored!);
      expect(parsed[0].note).toBe('Persisted note');
    }));
  });

  describe('delete', () => {
    it('should delete existing annotation', fakeAsync(() => {
      let createdAnnotation: Annotation | undefined;
      let deleteResult: boolean | undefined;
      let remainingAnnotations: Annotation[] = [];

      service.create(mockAnnotationCreate).subscribe(a => createdAnnotation = a);
      tick();

      service.delete(createdAnnotation!.id).subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(true);

      service.getByArticleId('article-1').subscribe(anns => remainingAnnotations = anns);
      tick();

      expect(remainingAnnotations.length).toBe(0);
    }));

    it('should return false for non-existent annotation', fakeAsync(() => {
      let deleteResult: boolean | undefined;

      service.delete('non-existent-id').subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(false);
    }));

    it('should update localStorage after delete', fakeAsync(() => {
      let annotation1: Annotation | undefined;
      let annotation2: Annotation | undefined;

      service.create({ ...mockAnnotationCreate, selectedText: 'Text 1' }).subscribe(a => annotation1 = a);
      tick();

      service.create({ ...mockAnnotationCreate, selectedText: 'Text 2' }).subscribe(a => annotation2 = a);
      tick();

      service.delete(annotation1!.id).subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_annotations');
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(annotation2!.id);
    }));
  });

  describe('deleteByArticleId', () => {
    it('should delete all annotations for specific article', fakeAsync(() => {
      service.create({ ...mockAnnotationCreate, articleId: 'article-1' }).subscribe();
      tick();
      service.create({ ...mockAnnotationCreate, articleId: 'article-1' }).subscribe();
      tick();
      service.create({ ...mockAnnotationCreate, articleId: 'article-2' }).subscribe();
      tick();

      let deleteResult: boolean | undefined;
      service.deleteByArticleId('article-1').subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(true);

      let article1Annotations: Annotation[] = [];
      let article2Annotations: Annotation[] = [];

      service.getByArticleId('article-1').subscribe(anns => article1Annotations = anns);
      tick();

      service.getByArticleId('article-2').subscribe(anns => article2Annotations = anns);
      tick();

      expect(article1Annotations.length).toBe(0);
      expect(article2Annotations.length).toBe(1);
    }));

    it('should return true even when no annotations exist', fakeAsync(() => {
      let deleteResult: boolean | undefined;

      service.deleteByArticleId('non-existent-article').subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(true);
    }));
  });

  describe('loadFromStorage', () => {
    it('should load annotations from localStorage on initialization', (done) => {
      const storedAnnotations: Annotation[] = [
        {
          id: 'ann-stored-1',
          articleId: 'article-1',
          startIndex: 0,
          endIndex: 5,
          selectedText: 'Hello',
          color: '#ffeb3b',
          note: 'Stored note',
          createdAt: 1000
        }
      ];
      localStorage.clear();
      localStorage.setItem('text_annotation_annotations', JSON.stringify(storedAnnotations));

      // Create a new instance directly to test initialization from localStorage
      const newService = new AnnotationService();

      newService.getByArticleId('article-1').subscribe(annotations => {
        expect(annotations.length).toBe(1);
        expect(annotations[0].note).toBe('Stored note');
        done();
      });
    });

    it('should handle invalid JSON in localStorage gracefully', (done) => {
      localStorage.clear();
      localStorage.setItem('text_annotation_annotations', 'invalid json');

      // Create a new instance directly to test initialization from localStorage
      const newService = new AnnotationService();

      newService.getByArticleId('article-1').subscribe(annotations => {
        expect(annotations.length).toBe(0);
        done();
      });
    });
  });
});
