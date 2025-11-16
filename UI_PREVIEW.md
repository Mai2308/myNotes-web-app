# UI Preview - Folder/File Grouping Feature

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Welcome, [Username]!                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┬─────────────────────────────────────────────────┐
│  📁 Folders  [+] │  📝 All Notes                     [+ New Note]   │
│ ─────────────────│─────────────────────────────────────────────────│
│                  │                                                  │
│  📝 All Notes    │  ┌──────────────────────────────────────────┐   │
│  📄 Unassigned   │  │ 📄 My First Note              [✏️] [🗑️]  │   │
│                  │  │ This is the content of my note...         │   │
│  📁 Work         │  │ 📁 Work | Nov 16, 2025                   │   │
│  📁 Personal     │  └──────────────────────────────────────────┘   │
│  📁 Ideas        │                                                  │
│                  │  ┌──────────────────────────────────────────┐   │
│                  │  │ 📄 Shopping List              [✏️] [🗑️]  │   │
│                  │  │ Buy milk, eggs, bread...                  │   │
│                  │  │ 📁 Personal | Nov 15, 2025               │   │
│                  │  └──────────────────────────────────────────┘   │
│                  │                                                  │
└──────────────────┴─────────────────────────────────────────────────┘
```

## Features Illustrated

### Folder Sidebar (Left Panel)
- **Header**: "📁 Folders" with [+] button to create new folder
- **Special Views**:
  - 📝 All Notes (shows everything)
  - 📄 Unassigned (notes without a folder)
- **User Folders**: List of folders created by the user
- **Hover Actions**: Edit (✏️) and Delete (🗑️) buttons appear on hover
- **Inline Editing**: Click edit to rename folder inline

### Notes List (Right Panel)
- **Header**: Current view name with [+ New Note] button
- **Note Cards**: Grid layout with cards showing:
  - Title and preview of content
  - Folder tag (if assigned)
  - Creation date
  - Edit and delete buttons
- **Filter**: Shows only notes from selected folder when clicked

### Creating a New Note

```
┌───────────────────────────────────────────────────────────────┐
│  Create New Note                                              │
│ ──────────────────────────────────────────────────────────────│
│                                                               │
│  Title:  [_________________________________________]          │
│                                                               │
│  Content:                                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                                                       │     │
│  │                                                       │     │
│  │                                                       │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  Folder: [Select folder ▼]                                   │
│           ├── No Folder                                       │
│           ├── Work                                            │
│           ├── Personal                                        │
│           └── Ideas                                           │
│                                                               │
│  [Create]  [Cancel]                                          │
└───────────────────────────────────────────────────────────────┘
```

### Creating a New Folder

```
┌──────────────────┐
│  📁 Folders  [+] │
│ ─────────────────│
│  ┌─────────────┐ │
│  │ Folder name │ │
│  │ [________]  │ │
│  │  [✓]  [✕]  │ │
│  └─────────────┘ │
│                  │
│  📝 All Notes    │
│  📄 Unassigned   │
└──────────────────┘
```

## Color Scheme

- **Primary Blue**: #6366f1 (buttons, active states)
- **Background**: White cards on gradient background
- **Text**: Dark blue for headers, gray for content
- **Hover**: Light blue/gray backgrounds
- **Active**: Blue highlight for selected folder

## Responsive Design

On mobile devices (< 768px):
- Sidebar stacks on top of notes list
- Single column layout
- Folder sidebar is collapsible
- Touch-friendly button sizes

## Interaction Patterns

1. **Click folder** → Filter notes to that folder
2. **Hover folder** → Show edit/delete actions
3. **Click [+] on folders** → Create new folder form
4. **Click [+ New Note]** → Create new note form
5. **Click note title** → Not implemented (could open full view)
6. **Click [✏️] on note** → Edit note inline
7. **Click [🗑️] on note** → Delete with confirmation

## User Experience Highlights

✨ **Smooth Animations**: Hover effects and transitions  
✨ **Visual Feedback**: Messages for create/update/delete actions  
✨ **Intuitive Navigation**: Clear folder structure  
✨ **Quick Actions**: Inline editing without page navigation  
✨ **Responsive Layout**: Works on all screen sizes  

