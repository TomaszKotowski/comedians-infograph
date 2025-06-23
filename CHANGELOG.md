# Changelog

## [0.2.0] - 2023-10-27

### Added
- **Movie Star Poster Generator**: New feature to search for movie stars and generate a unique poster based on their filmography.
- **TMDb Integration**: Fetches actor details and movie credits from The Movie Database (TMDb).
- **Actor Search UI**: New interface to search for an actor by name and view their profile picture and a timeline of their movies.
- **Dynamic Poster Generation**: The "Generate Poster" button now creates a detailed prompt for the image model using the actor's name and notable movies.

### Changed
- The main UI has been updated from a simple text prompt to the new movie star search interface.
- The prediction API (`/api/predictions`) now accepts actor data to generate posters.

### Fixed
- Resolved all outstanding TypeScript and linting errors across the application, ensuring better code quality and type safety.

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- A larger text area for the prompt input to allow for more detailed descriptions.
