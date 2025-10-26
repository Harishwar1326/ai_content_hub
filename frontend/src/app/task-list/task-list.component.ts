
import { Component, Input, OnInit } from '@angular/core';
import { TaskList, ContentItem, User } from '../types';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent {
  @Input() list: TaskList | undefined;
  @Input() users: User[] = [];

  constructor(private apiService: ApiService) {}

  // Event handlers will be added here to call the apiService
  // e.g., onSelectItem(item: ContentItem), onDeleteItem(item: ContentItem)

  trackById(index: number, item: ContentItem): string {
    return item.id;
  }
}
