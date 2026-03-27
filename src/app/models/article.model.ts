export interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Annotation {
  id: string;
  articleId: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  color: string;
  note: string;
  createdAt: number;
}

export interface AnnotationCreate {
  articleId: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  color: string;
  note: string;
}
