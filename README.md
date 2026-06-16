# Portfolio Todo App

A polished React todo application for managing authenticated task lists. The app supports adding, editing, deleting, completing, uncompleting, sorting, searching, and filtering todos through a responsive interface designed for portfolio presentation.

## Live Demo

https://vercel.com/huy-tran-todo-apps

## Features

- User logon and logoff with protected todo and profile routes
- Add, edit, delete, complete, and uncomplete todos
- Sort by creation date or title
- Filter by all, active, or completed status
- Search todos by title
- Optimistic UI updates with clear rollback messages
- Client-side validation, length limits, and DOMPurify sanitization
- Responsive layout for mobile, tablet, and desktop
- Accessible labels, focus states, loading states, error states, and empty states

## Technologies Used

- React
- React Router
- Vite
- DOMPurify
- CSS
- Vercel rewrites for production API proxying

## Screenshots

Add screenshots before submitting:

- Desktop todo dashboard
- Mobile todo dashboard
- Login screen
- Profile statistics screen

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```powershell
cd D:\Git\Todo-App
npm install
```

### Run Locally

```powershell
npm run dev
```

### Build for Production

```powershell
npm run build
```

### Preview Production Build

```powershell
npm run preview
```

## Available Scripts

- `npm run dev`: starts the Vite development server
- `npm run build`: creates a production build in `dist`
- `npm run preview`: serves the production build locally for testing

## Design Decisions

The app uses a clean CSS-based design system with a blue primary color, restrained neutral surfaces, clear typography hierarchy, and consistent 8px radii. Controls are at least 44px tall for touch accessibility, and todo actions stay visible so CRUD behavior is obvious without extra instructions.

Security work focuses on validating user input before submission, applying maximum length limits, sanitizing todo and search text with DOMPurify, avoiding raw HTML rendering, and showing user-friendly errors that do not expose system details.

## Deployment

This project includes `vercel.json` so production `/api/*` calls are forwarded to the CTD backend:

```json
{
  "source": "/api/:path*",
  "destination": "https://ctd-learns-node-l42tx.ondigitalocean.app/api/:path*"
}
```

## Future Improvements

- Add automated component tests for todo CRUD flows
- Add user-controlled light and dark themes
- Add due dates and priority levels
- Add drag-and-drop task ordering
- Add inline toast notifications

## License Information

This project was created for educational and portfolio purposes.

## Contact

Github: https://github.com/HT-Jasper
