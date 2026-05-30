# Contributing to StaffSync Frontend

Thank you for your interest in contributing to StaffSync! This document provides guidelines for contributing to the frontend application.

## Development Setup

1. **Prerequisites**
   - Node.js 20+ (use `.nvmrc` file)
   - npm or yarn package manager

2. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd frontend/web
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your API configuration
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Linting**
   ```bash
   npm run lint
   npm run lint:fix
   ```

## Code Style

We use the following tools for code consistency:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **EditorConfig** - Editor configuration

### Formatting
Run Prettier to format your code:
```bash
npm run format
```

### Linting
Run ESLint to check for issues:
```bash
npm run lint
```

## Branch Strategy

- `main` - Production branch
- `dev` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Pull Request Process

1. Create a feature branch from `dev`
2. Make your changes
3. Run tests and linting
4. Create a pull request to `dev`
5. Wait for code review
6. Merge after approval

## Environment Variables

Copy `.env.example` to `.env` and update:
- `VITE_API_BASE_URL` - API endpoint URL
- `VITE_API_KEY` - API authentication key
- `VITE_NODE_ENV` - Environment (development/production)

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Development
- Automatically deployed to `web.staffsynctech.co.uk` on push to `dev`

### Production
- Deployed to `www.staffsynctech.co.uk` on push to `main`

## Guidelines

- Follow TypeScript best practices
- Use semantic HTML
- Write meaningful commit messages
- Update documentation for new features
- Test your changes before submitting

## Getting Help

- Create an issue for bugs or feature requests
- Join our development discussions
- Check existing documentation first
