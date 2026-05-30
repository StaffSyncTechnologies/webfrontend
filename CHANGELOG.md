# Changelog

All notable changes to the StaffSync Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- SSL certificate configuration for development
- GitHub Actions CI/CD workflows
- Comprehensive API endpoint fixes
- Environment variable management

### Fixed
- 400 error on `/api/v1/locations` endpoint
- Geocoding 403 Forbidden errors
- Frontend API configuration issues
- Authentication header problems

### Changed
- Improved rate limiting for development
- Updated API base URL configuration
- Enhanced error handling

## [1.0.0] - 2026-04-16

### Added
- Initial StaffSync frontend application
- Location management system
- Organization settings
- Staff user management
- Authentication system
- Real-time notifications
- File upload capabilities
- Responsive design
- Dark mode support

### Features
- Dashboard with analytics
- Shift management
- Payroll system
- Document management
- Skills management
- Client registration
- Worker onboarding

### Security
- JWT authentication
- API key validation
- Role-based access control
- Input validation
- XSS protection
- CSRF protection

### Infrastructure
- Vite build system
- TypeScript support
- ESLint configuration
- Prettier formatting
- CI/CD pipelines
- Environment management
- Docker support
