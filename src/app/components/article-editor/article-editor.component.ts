import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ArticleService } from '../../services/article.service';
import { AnnotationService } from '../../services/annotation.service';
import { Article, Annotation } from '../../models/article.model';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss']
})
export class ArticleEditorComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('contentContainer') contentContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltip') tooltip!: ElementRef<HTMLDivElement>;

  article: Article | null = null;
  annotations: Annotation[] = [];
  isEditMode = false;
  isNewArticle = false;

  // Form fields
  title = '';
  content = '';

  // Annotation modal
  showAnnotationModal = false;
  selectedText = '';
  selectedStartIndex = 0;
  selectedEndIndex = 0;
  annotationNote = '';
  annotationColor = '#ffeb3b';

  // Available colors for annotations
  colors = [
    { value: '#ffeb3b', label: 'Желтый' },
    { value: '#4caf50', label: 'Зеленый' },
    { value: '#2196f3', label: 'Синий' },
    { value: '#ff9800', label: 'Оранжевый' },
    { value: '#e91e63', label: 'Розовый' },
    { value: '#9c27b0', label: 'Фиолетовый' }
  ];

  // Tooltip
  tooltipVisible = false;
  tooltipText = '';
  tooltipX = 0;
  tooltipY = 0;
  currentHoveredAnnotation: Annotation | null = null;

  private destroy$ = new Subject<void>();
  private annotationsApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private annotationService: AnnotationService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      // Проверяем, что id существует и не равен 'new' (для маршрута articles/new id будет undefined)
      if (id === undefined || id === 'new') {
        this.isNewArticle = true;
        this.isEditMode = true;
        this.article = null;
        this.title = '';
        this.content = '';
        this.annotations = [];
      } else {
        this.isNewArticle = false;
        this.loadArticle(id);
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['edit'] === 'true') {
        this.isEditMode = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.isEditMode && this.article && this.annotations.length > 0 && !this.annotationsApplied) {
      this.applyAnnotations();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadArticle(id: string): void {
    combineLatest([
      this.articleService.getById(id),
      this.annotationService.getByArticleId(id)
    ]).pipe(takeUntil(this.destroy$)).subscribe(([article, annotations]) => {
      if (article) {
        this.article = article;
        this.title = article.title;
        this.content = article.content;
        this.annotations = annotations;
        this.annotationsApplied = false;
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private applyAnnotations(): void {
    if (!this.contentContainer || !this.article) return;

    const container = this.contentContainer.nativeElement;
    const textContent = this.article.content;

    // Reset content
    container.innerHTML = '';

    if (this.annotations.length === 0) {
      container.textContent = textContent;
      this.annotationsApplied = true;
      return;
    }

    // Sort annotations by start index
    const sortedAnnotations = [...this.annotations].sort((a, b) => a.startIndex - b.startIndex);

    // Build fragments with annotations
    let lastIndex = 0;
    const fragments: { text: string; annotation?: Annotation }[] = [];

    for (const annotation of sortedAnnotations) {
      // Add text before annotation
      if (annotation.startIndex > lastIndex) {
        fragments.push({ text: textContent.slice(lastIndex, annotation.startIndex) });
      }
      // Add annotated text
      fragments.push({
        text: textContent.slice(annotation.startIndex, annotation.endIndex),
        annotation
      });
      lastIndex = annotation.endIndex;
    }

    // Add remaining text
    if (lastIndex < textContent.length) {
      fragments.push({ text: textContent.slice(lastIndex) });
    }

    // Create DOM elements
    for (const fragment of fragments) {
      if (fragment.annotation) {
        const span = document.createElement('span');
        span.className = 'annotated-text';
        span.textContent = fragment.text;
        span.style.backgroundColor = fragment.annotation.color;
        span.style.borderBottom = `2px solid ${this.darkenColor(fragment.annotation.color)}`;
        span.dataset['annotationId'] = fragment.annotation.id;
        span.addEventListener('mouseenter', (e) => this.showTooltip(e, fragment.annotation!));
        span.addEventListener('mouseleave', () => this.hideTooltip());
        span.addEventListener('click', (e) => this.onAnnotationClick(e, fragment.annotation!));
        container.appendChild(span);
      } else {
        const textNode = document.createTextNode(fragment.text);
        container.appendChild(textNode);
      }
    }

    this.annotationsApplied = true;
  }

  private darkenColor(color: string): string {
    // Simple color darkening
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 50);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 50);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 50);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  saveArticle(): void {
    if (!this.title.trim() && !this.content.trim()) {
      alert('Пожалуйста, введите заголовок или содержание статьи.');
      return;
    }

    if (this.isNewArticle) {
      this.articleService.create(this.title.trim(), this.content.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe(article => {
          this.router.navigate(['/articles', article.id]);
        });
    } else if (this.article) {
      this.articleService.update(this.article.id, {
        title: this.title.trim(),
        content: this.content.trim()
      }).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.isEditMode = false;
        this.annotationsApplied = false;
        if (this.article) {
          this.article.title = this.title.trim();
          this.article.content = this.content.trim();
        }
      });
    }
  }

  cancelEdit(): void {
    if (this.isNewArticle) {
      this.router.navigate(['/']);
      return;
    }

    this.isEditMode = false;
    this.title = this.article?.title || '';
    this.content = this.article?.content || '';
    this.annotationsApplied = false;
  }

  enterEditMode(): void {
    this.isEditMode = true;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Text selection for annotation
  onTextSelection(): void {
    if (this.isEditMode) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    if (!selectedText.trim()) return;

    // Calculate indices relative to article content
    const container = this.contentContainer.nativeElement;
    const indices = this.getTextIndices(range, container);

    if (indices === null) return;

    this.selectedText = selectedText;
    this.selectedStartIndex = indices.start;
    this.selectedEndIndex = indices.end;
    this.annotationNote = '';
    this.annotationColor = '#ffeb3b';
    this.showAnnotationModal = true;

    // Clear selection
    selection.removeAllRanges();
  }

  private getTextIndices(range: Range, container: HTMLElement): { start: number; end: number } | null {
    if (!this.article) return null;

    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    return {
      start,
      end: start + range.toString().length
    };
  }

  createAnnotation(): void {
    if (!this.article || !this.selectedText.trim()) return;

    this.annotationService.create({
      articleId: this.article.id,
      startIndex: this.selectedStartIndex,
      endIndex: this.selectedEndIndex,
      selectedText: this.selectedText,
      color: this.annotationColor,
      note: this.annotationNote.trim()
    }).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showAnnotationModal = false;
      this.annotationsApplied = false;
    });
  }

  cancelAnnotation(): void {
    this.showAnnotationModal = false;
  }

  // Tooltip
  showTooltip(event: MouseEvent, annotation: Annotation): void {
    if (!annotation.note) return;

    this.tooltipText = annotation.note;
    this.currentHoveredAnnotation = annotation;
    this.tooltipX = event.clientX;
    this.tooltipY = event.clientY;
    this.tooltipVisible = true;

    // Update position after tooltip is visible
    setTimeout(() => {
      this.adjustTooltipPosition();
    }, 0);
  }

  private adjustTooltipPosition(): void {
    if (!this.tooltip || !this.tooltipVisible) return;

    const tooltipEl = this.tooltip.nativeElement;
    const rect = tooltipEl.getBoundingClientRect();

    let x = this.tooltipX + 10;
    let y = this.tooltipY + 20;

    // Adjust if tooltip goes beyond viewport
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 10;
    }
    if (y + rect.height > window.innerHeight) {
      y = this.tooltipY - rect.height - 10;
    }

    this.tooltipX = x;
    this.tooltipY = y;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
    this.currentHoveredAnnotation = null;
  }

  // Annotation click - show edit/delete options
  onAnnotationClick(event: MouseEvent, annotation: Annotation): void {
    event.stopPropagation();

    const action = prompt(
      `Аннотация: "${annotation.note || 'Нет примечания'}"\n\n` +
      `Введите "edit" для редактирования, "delete" для удаления, или "cancel" для отмены:`
    );

    if (action === 'delete') {
      this.annotationService.delete(annotation.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.annotationsApplied = false;
        });
    } else if (action === 'edit') {
      const newNote = prompt('Введите новое примечание:', annotation.note);
      if (newNote !== null) {
        this.annotationService.update(annotation.id, { note: newNote })
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.annotationsApplied = false;
          });
      }
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
