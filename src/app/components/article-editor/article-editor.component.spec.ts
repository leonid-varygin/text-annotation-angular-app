import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ArticleEditorComponent } from './article-editor.component';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { Article, Annotation } from '../../models/article.model';

describe('ArticleEditorComponent', () => {
  let component: ArticleEditorComponent;
  let fixture: ComponentFixture<ArticleEditorComponent>;
  let articleServiceMock: jasmine.SpyObj<ArticleService>;
  let annotationServiceMock: jasmine.SpyObj<AnnotationService>;
  let routerMock: jasmine.SpyObj<Router>;
  let paramsSubject: Subject<{ id?: string }>;
  let queryParamsSubject: Subject<{ edit?: string }>;

  const mockArticle: Article = {
    id: 'article-1',
    title: 'Test Article',
    content: 'Test content for the article',
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  };

  const mockAnnotations: Annotation[] = [
    {
      id: 'ann-1',
      articleId: 'article-1',
      startIndex: 0,
      endIndex: 4,
      selectedText: 'Test',
      color: '#ffeb3b',
      note: 'Test note',
      createdAt: 1700000000000
    }
  ];

  beforeEach(async () => {
    articleServiceMock = jasmine.createSpyObj('ArticleService', ['getAll', 'getById', 'create', 'update', 'delete']);
    annotationServiceMock = jasmine.createSpyObj('AnnotationService', ['getByArticleId', 'create', 'update', 'delete', 'deleteByArticleId']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    paramsSubject = new Subject<{ id?: string }>();
    queryParamsSubject = new Subject<{ edit?: string }>();

    articleServiceMock.getById.and.callFake(() => of({ ...mockArticle }));
    articleServiceMock.create.and.returnValue(of(mockArticle));
    articleServiceMock.update.and.callFake((id: string, updates: Partial<Article>) => {
      return of({ ...mockArticle, ...updates, updatedAt: Date.now() });
    });
    articleServiceMock.delete.and.returnValue(of(true));
    annotationServiceMock.getByArticleId.and.returnValue(of(mockAnnotations));
    annotationServiceMock.create.and.returnValue(of(mockAnnotations[0]));
    annotationServiceMock.update.and.returnValue(of(mockAnnotations[0]));
    annotationServiceMock.delete.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [ArticleEditorComponent],
      providers: [
        { provide: ArticleService, useValue: articleServiceMock },
        { provide: AnnotationService, useValue: annotationServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(),
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit - New Article', () => {
    it('should initialize new article mode when id is undefined', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({});
      queryParamsSubject.next({});
      tick();

      expect(component.isNewArticle).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.article).toBeNull();
    }));

    it('should initialize new article mode when id is "new"', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'new' });
      queryParamsSubject.next({});
      tick();

      expect(component.isNewArticle).toBe(true);
      expect(component.isEditMode).toBe(true);
    }));
  });

  describe('ngOnInit - Edit Mode', () => {
    it('should set editMode to true when query param edit is "true"', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({ edit: 'true' });
      tick();

      expect(component.isEditMode).toBe(true);
    }));
  });

  describe('ngOnInit - Load Article', () => {
    it('should load article and annotations by id', fakeAsync(() => {
      // Reset component state to ensure fresh data
      component.article = null as any;
      component.title = '';
      component.content = '';

      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({});
      tick();

      expect(articleServiceMock.getById).toHaveBeenCalledWith('article-1');
      expect(annotationServiceMock.getByArticleId).toHaveBeenCalledWith('article-1');
      expect(component.article).toEqual(mockArticle);
      expect(component.title).toBe('Test Article');
      expect(component.content).toBe('Test content for the article');
    }));

    it('should navigate to home if article not found', fakeAsync(() => {
      articleServiceMock.getById.and.returnValue(of(undefined));

      fixture.detectChanges();
      paramsSubject.next({ id: 'non-existent' });
      queryParamsSubject.next({});
      tick();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    }));
  });

  describe('saveArticle - New Article', () => {
    it('should create new article', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({});
      queryParamsSubject.next({});
      tick();

      component.title = 'New Title';
      component.content = 'New Content';
      component.saveArticle();
      tick();

      expect(articleServiceMock.create).toHaveBeenCalledWith('New Title', 'New Content');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/articles', mockArticle.id]);
    }));

    it('should not save if title and content are empty', fakeAsync(() => {
      spyOn(window, 'alert');

      fixture.detectChanges();
      paramsSubject.next({});
      queryParamsSubject.next({});
      tick();

      component.title = '   ';
      component.content = '   ';
      component.saveArticle();
      tick();

      expect(articleServiceMock.create).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
    }));
  });

  describe('saveArticle - Existing Article', () => {
    it('should update existing article', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({});
      tick();

      component.title = 'Updated Title';
      component.content = 'Updated Content';
      component.saveArticle();
      tick();

      expect(articleServiceMock.update).toHaveBeenCalledWith('article-1', {
        title: 'Updated Title',
        content: 'Updated Content'
      });
      expect(component.isEditMode).toBe(false);
    }));
  });

  describe('cancelEdit', () => {
    it('should navigate to home for new article', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({});
      queryParamsSubject.next({});
      tick();

      component.cancelEdit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should exit edit mode for existing article', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({});
      tick();

      component.isEditMode = true;
      component.cancelEdit();

      expect(component.isEditMode).toBe(false);
    }));
  });

  describe('enterEditMode', () => {
    it('should set editMode to true', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({});
      tick();

      component.isEditMode = false;
      component.enterEditMode();

      expect(component.isEditMode).toBe(true);
    }));
  });

  describe('goBack', () => {
    it('should navigate to home', () => {
      component.goBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('createAnnotation', () => {
    it('should create annotation and close modal', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({ id: 'article-1' });
      queryParamsSubject.next({});
      tick();

      component.selectedText = 'Test';
      component.selectedStartIndex = 0;
      component.selectedEndIndex = 4;
      component.annotationNote = 'Note';
      component.annotationColor = '#ffeb3b';
      component.showAnnotationModal = true;

      component.createAnnotation();
      tick();

      expect(annotationServiceMock.create).toHaveBeenCalled();
      expect(component.showAnnotationModal).toBe(false);
    }));

    it('should not create annotation if no article', fakeAsync(() => {
      fixture.detectChanges();
      paramsSubject.next({});
      queryParamsSubject.next({});
      tick();

      component.selectedText = '';
      component.createAnnotation();
      tick();

      expect(annotationServiceMock.create).not.toHaveBeenCalled();
    }));
  });

  describe('cancelAnnotation', () => {
    it('should close annotation modal', () => {
      component.showAnnotationModal = true;
      component.cancelAnnotation();

      expect(component.showAnnotationModal).toBe(false);
    });
  });

  describe('hideTooltip', () => {
    it('should hide tooltip and reset hovered annotation', () => {
      component.tooltipVisible = true;
      component.currentHoveredAnnotation = mockAnnotations[0];

      component.hideTooltip();

      expect(component.tooltipVisible).toBe(false);
      expect(component.currentHoveredAnnotation).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('should format timestamp to localized date string', () => {
      const timestamp = 1700000000000;
      const formatted = component.formatDate(timestamp);

      expect(formatted).toContain('2023');
    });
  });

  describe('darkenColor', () => {
    it('should darken hex color', () => {
      const color = '#ffffff';
      const darkened = component['darkenColor'](color);

      expect(darkened).not.toBe(color);
      expect(darkened.startsWith('#')).toBe(true);
    });

    it('should not go below 0 for color values', () => {
      const color = '#000000';
      const darkened = component['darkenColor'](color);

      expect(darkened).toBe('#000000');
    });
  });

  describe('colors', () => {
    it('should have 6 available colors', () => {
      expect(component.colors.length).toBe(6);
    });

    it('should have yellow as first color', () => {
      expect(component.colors[0].value).toBe('#ffeb3b');
      expect(component.colors[0].label).toBe('Желтый');
    });
  });
});
