import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ArticleListComponent } from './article-list.component';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;
  let articleServiceMock: jasmine.SpyObj<ArticleService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockArticles: Article[] = [
    {
      id: 'article-1',
      title: 'First Article',
      content: 'Content of first article',
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    },
    {
      id: 'article-2',
      title: 'Second Article',
      content: 'Content of second article',
      createdAt: 1700100000000,
      updatedAt: 1700100000000
    }
  ];

  beforeEach(async () => {
    articleServiceMock = jasmine.createSpyObj('ArticleService', ['getAll', 'delete']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    articleServiceMock.getAll.and.returnValue(of(mockArticles));
    articleServiceMock.delete.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [
        { provide: ArticleService, useValue: articleServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load articles on init', () => {
      fixture.detectChanges();

      expect(articleServiceMock.getAll).toHaveBeenCalled();
      expect(component.articles$).toBeDefined();
    });
  });

  describe('createNewArticle', () => {
    it('should navigate to new article page', () => {
      component.createNewArticle();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/articles/new']);
    });
  });

  describe('editArticle', () => {
    it('should navigate to edit page for specific article', () => {
      component.editArticle('article-1');

      expect(routerMock.navigate).toHaveBeenCalledWith(['/articles', 'article-1', 'edit']);
    });
  });

  describe('viewArticle', () => {
    it('should navigate to view page for specific article', () => {
      component.viewArticle('article-2');

      expect(routerMock.navigate).toHaveBeenCalledWith(['/articles', 'article-2']);
    });
  });

  describe('deleteArticle', () => {
    it('should not delete article if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.deleteArticle(event, 'article-1');

      expect(articleServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should delete article if user confirms', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.deleteArticle(event, 'article-1');
      tick();

      expect(articleServiceMock.delete).toHaveBeenCalledWith('article-1');
    }));

    it('should stop event propagation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const event = {
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as unknown as Event;

      component.deleteArticle(event, 'article-1');

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format timestamp to localized date string', () => {
      const timestamp = 1700000000000;
      const formatted = component.formatDate(timestamp);

      expect(formatted).toContain('2023');
    });

    it('should handle different timestamps', () => {
      const timestamp1 = 1600000000000;
      const timestamp2 = 1800000000000;

      const formatted1 = component.formatDate(timestamp1);
      const formatted2 = component.formatDate(timestamp2);

      expect(formatted1).not.toBe(formatted2);
    });
  });
});
