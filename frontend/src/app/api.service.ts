
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskList, ContentItem } from './types'; // Assuming types.ts is in the app folder

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api'; // URL of your Express backend

  constructor(private http: HttpClient) { }

  getTaskLists(): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`${this.apiUrl}/lists`);
  }

  addItem(listId: string, item: Partial<ContentItem>): Observable<ContentItem> {
    return this.http.post<ContentItem>(`${this.apiUrl}/lists/${listId}/items`, item);
  }
  
  updateItem(listId: string, itemId: string, updates: Partial<ContentItem>): Observable<ContentItem> {
    return this.http.put<ContentItem>(`${this.apiUrl}/lists/${listId}/items/${itemId}`, updates);
  }

  // AI Service Calls
  parseItemFromString(prompt: string): Observable<Partial<ContentItem>> {
    return this.http.post<Partial<ContentItem>>(`${this.apiUrl}/ai/parse-item`, { prompt });
  }
}
