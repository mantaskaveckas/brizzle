# Contributing to Brizzle

Thank you for your interest in contributing to Brizzle! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mantaskaveckas/brizzle.git
   cd brizzle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Project Structure

```
brizzle/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── generators/           # Code generation modules
│   │   ├── init.ts           # Drizzle ORM setup wizard
│   │   ├── init/             # Init submodules
│   │   │   ├── types.ts      # Driver types and options
│   │   │   ├── drivers.ts    # Driver configurations
│   │   │   ├── templates.ts  # File content generators
│   │   │   └── prompts.ts    # Interactive prompts
│   │   ├── model.ts          # Schema model generation
│   │   ├── actions.ts        # Server actions generation
│   │   ├── scaffold.ts       # Full CRUD scaffolding
│   │   ├── resource.ts       # Model + actions (no UI)
│   │   ├── api.ts            # REST API routes
│   │   ├── destroy.ts        # Cleanup/removal
│   │   └── pages/            # Page template generators
│   └── lib/                  # Utility modules
│       ├── types.ts          # TypeScript interfaces
│       ├── config.ts         # Project detection
│       ├── drizzle/          # Drizzle ORM utilities
│       ├── forms.ts          # Form field generation
│       ├── strings.ts        # String transformations
│       ├── validation.ts     # Input validation
│       ├── parsing.ts        # Field definition parsing
│       ├── files.ts          # File I/O operations
│       └── logger.ts         # CLI output
├── docs/                     # Documentation site
└── dist/                     # Compiled output
```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This watches for file changes and rebuilds automatically.

### Testing Your Changes

Link the package locally to test CLI commands:

```bash
npm link
```

Then in a test Next.js project:

```bash
# Test the init wizard
brizzle init --dry-run

# Test scaffolding
brizzle scaffold post title:string body:text --dry-run
```

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Check for lint errors
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

Pre-commit hooks will automatically run linting and formatting on staged files.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add support for JSON field type`
- `fix: handle nullable enum fields correctly`
- `docs: update README with new examples`
- `refactor: extract form field generation to lib/forms.ts`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass (`npm run test:run`)
4. Ensure code is properly formatted (`npm run lint && npm run format:check`)
5. Update documentation if needed
6. Submit a pull request

### Adding a New Field Type

1. Add the type to `VALID_FIELD_TYPES` in `src/lib/types.ts`
2. Add type mappings for all dialects in `src/lib/drizzle/types.ts`
3. Handle the type in form generation (`src/lib/forms.ts`)
4. Add tests for the new type
5. Update documentation

### Adding a New Generator

1. Create a new file in `src/generators/`
2. Export the main function
3. Add the command to `src/index.ts`
4. Add tests in `src/generators/tests/`
5. Update documentation

### Adding a New Database Driver

1. Add the driver to the `Driver` type in `src/generators/init/types.ts`
2. Add driver configuration to `DRIVERS` in `src/generators/init/drivers.ts`
3. Add client template function in `src/generators/init/templates.ts`
4. Add case to `generateDbClient()` switch statement
5. Add tests in `src/generators/tests/init-*.test.ts`
6. Update documentation

## Testing Guidelines

- Write tests for new functionality
- Tests are located in `*/tests/` directories
- Use Vitest for testing
- Mock file system operations with `vi.mock("fs")`

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Questions?

Feel free to open an issue for questions or discussions.
