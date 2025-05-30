# Training Program Builder

A professional desktop application for creating and managing employee training programs, built with Electron.

## Features

- Create structured training programs with modules
- Track employee progress and completion
- Generate compliance reports
- Offline-first design with local SQLite database
- Cross-platform support (Windows, Mac, Linux)

## Project Structure

```
training-program-builder/
├── src/
│   ├── main/                 # Main process (Node.js)
│   │   ├── main.js          # Application entry point
│   │   └── database.js      # SQLite database operations
│   ├── renderer/            # Renderer process (UI)
│   │   ├── index.html       # Main application interface
│   │   ├── js/
│   │   │   ├── renderer.js  # Frontend application logic
│   │   │   └── preload.js   # Security bridge script
│   │   ├── css/
│   │   │   └── styles.css   # Application styling
│   │   └── pages/           # Additional pages (future)
│   └── shared/              # Shared utilities
├── assets/                  # Application assets
├── dist/                    # Build output
└── package.json            # Project configuration
```

## Development

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm start
   ```

### Building

Build for your current platform:
```bash
npm run build
```

### Database

The application uses SQLite for local data storage. The database file is automatically created in the user's application data directory:

- **Linux**: `~/.config/training-program-builder/`
- **Windows**: `%APPDATA%/training-program-builder/`
- **macOS**: `~/Library/Application Support/training-program-builder/`

## Current Status

### ✅ Completed
- Project structure and build system
- Basic UI with navigation
- SQLite database integration
- Training program creation
- Dashboard with statistics

### 🚧 In Progress
- Module management
- Employee management
- Progress tracking

### 📋 Planned
- Assessment tools
- Reporting system
- Import/export functionality
- Advanced search and filtering

## Contributing

This is a personal project, but suggestions and feedback are welcome.

## License

MIT License