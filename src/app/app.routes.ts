import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleEditorComponent } from './components/article-editor/article-editor.component';

export const routes: Routes = [
  { path: '', component: ArticleListComponent },
  { path: 'articles/new', component: ArticleEditorComponent },
  { path: 'articles/:id', component: ArticleEditorComponent },
  { path: 'articles/:id/edit', component: ArticleEditorComponent },
  { path: '**', redirectTo: '' }
];
