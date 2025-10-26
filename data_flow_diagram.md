# AI Content Hub - Data Flow Diagram

## Overview
This document describes the data flow architecture of the AI Content Hub application, showing how data moves between components, state management, APIs, and external services.

## Data Flow Architecture

### 1. Frontend Data Flow (React Components)

```
User Interface Layer
├── LoginView
├── Header (with user selection)
├── Sidebar (task list navigation)
├── TaskList (main content view)
├── TaskItem (individual items)
├── SmartAddModal (AI-powered task creation)
├── TaskDetailModal (item editing)
├── BrainstormView (idea generation)
├── CollaborationReportModal (AI analysis)
└── ContentWeaverModal (AI text rewriting)
```

### 2. State Management Flow

```
App.tsx (Root Component)
├── Local State:
│   ├── isLoggedIn (boolean)
│   ├── isSmartAddOpen (boolean)
│   ├── isDetailModalOpen (boolean)
│   ├── isCollaborationReportOpen (boolean)
│   ├── selectedItem (ContentItem | null)
│   └── currentView ('tasks' | 'brainstorm')
│
└── useTaskManager Hook:
    ├── taskLists (TaskList[])
    ├── activeListId (string | null)
    ├── users (User[])
    ├── currentUser (User)
    ├── CRUD Operations:
    │   ├── selectList()
    │   ├── addList()
    │   ├── addItem()
    │   ├── updateItem()
    │   ├── deleteItem()
    │   └── updateSubtask()
    └── Persistence:
        └── localStorage (LOCAL_STORAGE_KEY)
```

### 3. Data Types and Models

```
ContentItem:
├── id: string
├── type: 'task' | 'note'
├── title: string
├── description: string
├── completed: boolean
├── subtasks: Subtask[]
├── createdAt: string
├── createdBy: string (User ID)
├── dueDate?: string
└── tags?: string[]

TaskList:
├── id: string
├── name: string
└── items: ContentItem[]

User:
├── id: string
├── name: string
└── avatarColor: string

Subtask:
├── id: string
├── title: string
└── completed: boolean
```

### 4. API Communication Flow

```
Frontend (React) ←→ Backend (Express.js) ←→ External Services

Frontend API Calls:
├── SmartAddModal → geminiService.parseTaskFromString()
├── BrainstormView → geminiService.generateIdeas()
├── CollaborationReportModal → geminiService.analyzeHubContent()
└── ContentWeaverModal → geminiService.rewriteText()

Backend API Routes:
├── /api/lists (GET) - Get all task lists
├── /api/lists/:listId/items (POST) - Add item to list
├── /api/lists/:listId/items/:itemId (PUT) - Update item
└── /api/ai/parse-item (POST) - AI parsing endpoint

External Services:
└── Google Gemini AI API (via @google/genai)
```

### 5. Complete Data Flow Scenarios

#### Scenario 1: User Creates a New Task via Smart Add

```
1. User clicks "Smart Add" button
   ↓
2. App.tsx: setIsSmartAddOpen(true)
   ↓
3. SmartAddModal renders with prompt input
   ↓
4. User enters natural language prompt
   ↓
5. User clicks "Parse with AI"
   ↓
6. SmartAddModal → geminiService.parseTaskFromString(prompt)
   ↓
7. geminiService → Google Gemini API
   ↓
8. AI returns structured ContentItem data
   ↓
9. SmartAddModal shows confirmation stage
   ↓
10. User selects "Add as Task" or "Add as Note"
    ↓
11. SmartAddModal → App.handleSmartAdd(itemData)
    ↓
12. App → useTaskManager.addItem(activeListId, itemData)
    ↓
13. useTaskManager updates taskLists state
    ↓
14. useTaskManager → localStorage.setItem() (persistence)
    ↓
15. TaskList re-renders with new item
    ↓
16. SmartAddModal closes
```

#### Scenario 2: User Edits Task Details

```
1. User clicks on TaskItem
   ↓
2. TaskItem → App.handleSelectItem(item)
   ↓
3. App: setSelectedItem(item) + setIsDetailModalOpen(true)
   ↓
4. TaskDetailModal renders with item data
   ↓
5. User modifies title/description
   ↓
6. TaskDetailModal → App.handleUpdateItem(updates)
   ↓
7. App → useTaskManager.updateItem(activeListId, itemId, updates)
   ↓
8. useTaskManager updates taskLists state
   ↓
9. useTaskManager → localStorage.setItem() (persistence)
   ↓
10. TaskList re-renders with updated item
    ↓
11. TaskDetailModal updates local state for immediate feedback
```

#### Scenario 3: AI-Powered Brainstorming

```
1. User navigates to Brainstorm tab
   ↓
2. App: setCurrentView('brainstorm')
   ↓
3. BrainstormView renders
   ↓
4. User enters topic/prompt
   ↓
5. User clicks "Generate Ideas"
   ↓
6. BrainstormView → geminiService.generateIdeas(topic)
   ↓
7. geminiService → Google Gemini API
   ↓
8. AI returns array of idea strings
   ↓
9. BrainstormView displays generated ideas
   ↓
10. User clicks "+" on an idea
    ↓
11. BrainstormView → App.handleAddIdeaAsNote(idea)
    ↓
12. App → useTaskManager.addItem(activeListId, {title: idea, type: 'note'})
    ↓
13. App: setCurrentView('tasks') (switch back to tasks view)
    ↓
14. TaskList shows new note item
```

#### Scenario 4: Hub Analysis and Collaboration Report

```
1. User clicks "Analyze Hub" button
   ↓
2. TaskList → App.handleAnalyzeHub()
   ↓
3. App: setIsCollaborationReportOpen(true)
   ↓
4. CollaborationReportModal renders
   ↓
5. Modal → geminiService.analyzeHubContent(hub, users)
   ↓
6. geminiService → Google Gemini API with hub data
   ↓
7. AI analyzes content and returns HubAnalysis
   ↓
8. Modal displays:
   ├── Knowledge gaps
   └── Merge suggestions
```

### 6. Data Persistence Strategy

```
Client-Side Storage:
├── localStorage (primary persistence)
│   └── Key: 'ai-task-manager-data'
│   └── Value: JSON.stringify(taskLists)
│
└── React State (in-memory)
    ├── taskLists (TaskList[])
    ├── activeListId (string | null)
    ├── users (User[])
    └── currentUser (User)

Backend Storage (Optional):
└── MongoDB (when MONGO_URI is configured)
    ├── TaskList collection
    └── ContentItem subdocuments
```

### 7. Error Handling Flow

```
Frontend Error Handling:
├── geminiService functions return fallback data when API key missing
├── try/catch blocks in async operations
├── Error states in modals (SmartAddModal, BrainstormView, etc.)
└── Console error logging

Backend Error Handling:
├── Express error middleware
├── MongoDB connection graceful degradation
└── API route error responses (500 status)
```

### 8. Real-time Updates and Synchronization

```
State Updates:
├── Immediate UI updates via React state
├── Optimistic updates for better UX
├── localStorage persistence on every state change
└── No real-time synchronization (single-user app)

Data Consistency:
├── Single source of truth: useTaskManager hook
├── Immutable state updates
└── Automatic re-rendering via React
```

## Key Data Flow Principles

1. **Unidirectional Data Flow**: Data flows down from App → Components, events flow up from Components → App
2. **Centralized State Management**: All task data managed in useTaskManager hook
3. **Local-First Architecture**: Primary storage in localStorage, backend optional
4. **AI Integration**: External AI services called through dedicated service layer
5. **Optimistic Updates**: UI updates immediately, persistence happens asynchronously
6. **Graceful Degradation**: App works without API keys or backend connection

## Performance Considerations

- **Lazy Loading**: AI client created only when needed
- **Memoization**: useCallback for event handlers to prevent unnecessary re-renders
- **Local Storage**: Efficient JSON serialization/deserialization
- **Component Splitting**: Modals and views loaded conditionally
- **Error Boundaries**: Graceful handling of component errors


