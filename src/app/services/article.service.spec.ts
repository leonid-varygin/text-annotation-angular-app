import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ArticleService } from './article.service';
import { Article } from '../models/article.model';

describe('ArticleService', () => {
  let service: ArticleService;

  const mockArticle: Article = {
    id: 'test-id-1',
    title: 'Test Article',
    content: 'Test content for the article',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an observable of articles', (done) => {
      service.getAll().subscribe(articles => {
        expect(Array.isArray(articles)).toBe(true);
        done();
      });
    });

    it('should return empty array when no articles in storage', (done) => {
      service.getAll().subscribe(articles => {
        expect(articles.length).toBe(0);
        done();
      });
    });
  });

  describe('create', () => {
    it('should create a new article and return it', fakeAsync(() => {
      let createdArticle: Article | undefined;
      let allArticles: Article[] = [];

      service.create('New Article', 'New content').subscribe(article => {
        createdArticle = article;
      });

      tick();

      expect(createdArticle).toBeDefined();
      expect(createdArticle?.title).toBe('New Article');
      expect(createdArticle?.content).toBe('New content');
      expect(createdArticle?.id).toBeDefined();
      expect(createdArticle?.createdAt).toBeDefined();
      expect(createdArticle?.updatedAt).toBeDefined();

      service.getAll().subscribe(articles => {
        allArticles = articles;
      });
      tick();

      expect(allArticles.length).toBe(1);
    }));

    it('should save article to localStorage', fakeAsync(() => {
      service.create('Test', 'Content').subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_articles');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].title).toBe('Test');
    }));

    it('should generate unique IDs for different articles', fakeAsync(() => {
      let article1: Article | undefined;
      let article2: Article | undefined;

      service.create('Article 1', 'Content 1').subscribe(a => article1 = a);
      tick();

      service.create('Article 2', 'Content 2').subscribe(a => article2 = a);
      tick();

      expect(article1?.id).not.toBe(article2?.id);
    }));
  });

  describe('getById', () => {
    it('should return article by id', fakeAsync(() => {
      let createdArticle: Article | undefined;
      let foundArticle: Article | undefined;

      service.create('Test Article', 'Test Content').subscribe(a => createdArticle = a);
      tick();

      service.getById(createdArticle!.id).subscribe(article => foundArticle = article);
      tick();

      expect(foundArticle).toBeDefined();
      expect(foundArticle?.id).toBe(createdArticle?.id);
      expect(foundArticle?.title).toBe('Test Article');
    }));

    it('should return undefined for non-existent id', fakeAsync(() => {
      let foundArticle: Article | undefined;

      service.getById('non-existent-id').subscribe(article => foundArticle = article);
      tick();

      expect(foundArticle).toBeUndefined();
    }));
  });

  describe('update', () => {
    it('should update existing article', fakeAsync(() => {
      let createdArticle: Article | undefined;
      let updatedArticle: Article | null | undefined;

      service.create('Original Title', 'Original Content').subscribe(a => createdArticle = a);
      tick();

      service.update(createdArticle!.id, { title: 'Updated Title' }).subscribe(a => updatedArticle = a);
      tick();

      expect(updatedArticle).not.toBeNull();
      if (updatedArticle) {
        expect(updatedArticle.title).toBe('Updated Title');
        expect(updatedArticle.content).toBe('Original Content');
        expect(updatedArticle.updatedAt).toBeGreaterThanOrEqual(createdArticle!.updatedAt);
      }
    }));

    it('should return null for non-existent article', fakeAsync(() => {
      let result: Article | null = null;

      service.update('non-existent-id', { title: 'New Title' }).subscribe(a => result = a);
      tick();

      expect(result).toBeNull();
    }));

    it('should persist updates to localStorage', fakeAsync(() => {
      let createdArticle: Article | undefined;

      service.create('Original', 'Content').subscribe(a => createdArticle = a);
      tick();

      service.update(createdArticle!.id, { content: 'Updated Content' }).subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_articles');
      const parsed = JSON.parse(stored!);
      expect(parsed[0].content).toBe('Updated Content');
    }));
  });

  describe('delete', () => {
    it('should delete existing article', fakeAsync(() => {
      let createdArticle: Article | undefined;
      let deleteResult: boolean | undefined;
      let remainingArticles: Article[] = [];

      service.create('To Delete', 'Content').subscribe(a => createdArticle = a);
      tick();

      service.delete(createdArticle!.id).subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(true);

      service.getAll().subscribe(articles => remainingArticles = articles);
      tick();

      expect(remainingArticles.length).toBe(0);
    }));

    it('should return false for non-existent article', fakeAsync(() => {
      let deleteResult: boolean | undefined;

      service.delete('non-existent-id').subscribe(result => deleteResult = result);
      tick();

      expect(deleteResult).toBe(false);
    }));

    it('should update localStorage after delete', fakeAsync(() => {
      let article1: Article | undefined;
      let article2: Article | undefined;

      service.create('Article 1', 'Content 1').subscribe(a => article1 = a);
      tick();

      service.create('Article 2', 'Content 2').subscribe(a => article2 = a);
      tick();

      service.delete(article1!.id).subscribe();
      tick();

      const stored = localStorage.getItem('text_annotation_articles');
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(article2!.id);
    }));
  });

  describe('loadFromStorage', () => {
    it('should load articles from localStorage on initialization', (done) => {
      const storedArticles: Article[] = [
        {
          id: 'stored-1',
          title: 'Stored Article',
          content: 'Stored content',
          createdAt: 1000,
          updatedAt: 1000
        }
      ];
      localStorage.clear();
      localStorage.setItem('text_annotation_articles', JSON.stringify(storedArticles));

      // Create a new instance directly to test initialization from localStorage
      const newService = new ArticleService();

      newService.getAll().subscribe(articles => {
        expect(articles.length).toBe(1);
        expect(articles[0].title).toBe('Stored Article');
        done();
      });
    });

    it('should handle invalid JSON in localStorage gracefully', (done) => {
      localStorage.clear();
      localStorage.setItem('text_annotation_articles', 'invalid json');

      // Create a new instance directly to test initialization from localStorage
      const newService = new ArticleService();

      newService.getAll().subscribe(articles => {
        expect(articles.length).toBe(0);
        done();
      });
    });
  });
});
