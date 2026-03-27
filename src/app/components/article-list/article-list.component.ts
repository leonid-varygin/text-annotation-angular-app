import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
  articles$!: Observable<Article[]>;
  announcement: string = '';

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.articles$ = this.articleService.getAll();
  }

  /**
   * Обработка клавиатурной навигации для карточек статей
   */
  onArticleKeydown(event: KeyboardEvent, articleId: string): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.viewArticle(articleId);
        break;
      default:
        // Другие клавиши не обрабатываем
        break;
    }
  }

  /**
   * Анонс для скринридера
   */
  announce(message: string): void {
    this.announcement = message;
    // Сбрасываем после анонса
    setTimeout(() => {
      this.announcement = '';
    }, 1000);
  }

  createNewArticle(): void {
    this.router.navigate(['/articles/new']);
  }

  editArticle(id: string): void {
    this.router.navigate(['/articles', id, 'edit']);
  }

  viewArticle(id: string): void {
    this.router.navigate(['/articles', id]);
  }

  deleteArticle(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту статью? Все аннотации будут также удалены.')) {
      this.articleService.delete(id).subscribe();
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
