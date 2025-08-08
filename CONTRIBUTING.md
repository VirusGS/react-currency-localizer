# Contributing to React Currency Localizer

Thank you for your interest in contributing to React Currency Localizer! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+ or equivalent package manager
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-currency-localizer.git
   cd react-currency-localizer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Add your ExchangeRate-API key to .env
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Build the Package**
   ```bash
   npm run build
   ```

## 🔧 Development Workflow

### Branch Naming

- `feature/your-feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation updates
- `refactor/code-improvement` - Code refactoring

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write code following our style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commits:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Build process or tool changes

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (for significant changes)

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## 🧪 Testing Guidelines

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test hook interactions with APIs
- **Component Tests**: Test React component rendering and behavior

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('when condition', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData()
      
      // Act
      const result = performAction(input)
      
      // Assert
      expect(result).toEqual(expectedOutput)
    })
  })
})
```

### Mock Guidelines

- Mock external APIs consistently
- Use test data that represents real-world scenarios
- Keep mocks simple and focused

## 🎨 Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper JSDoc comments for public APIs
- Avoid `any` types - use proper typing

### React

- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Use proper error boundaries where needed
- Follow React best practices for performance

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow the existing code style

## 📁 Project Structure

```
src/
├── components/          # React components
│   └── LocalizedPrice.tsx
├── hooks/              # Custom React hooks
│   └── useCurrencyConverter.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── provider.tsx        # React Query provider
└── index.ts           # Main exports

tests/
├── __mocks__/         # Test mocks
├── components/        # Component tests
├── hooks/            # Hook tests
└── setup.ts          # Test setup

docs/                 # Additional documentation
examples/            # Usage examples
```

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Environment Details**
   - React version
   - Node.js version
   - Package version
   - Browser (if applicable)

2. **Steps to Reproduce**
   - Clear step-by-step instructions
   - Minimal code example
   - Expected vs actual behavior

3. **Additional Context**
   - Error messages or logs
   - Screenshots (if applicable)
   - Related issues or PRs

## 💡 Feature Requests

Before submitting a feature request:

1. Check if it already exists in the issues
2. Consider if it fits the project scope
3. Provide a clear use case and benefit
4. Consider if it could be implemented as a separate package

## 📝 Documentation

### Types of Documentation

- **README.md**: Main package documentation
- **API Reference**: Detailed API documentation
- **Examples**: Practical usage examples
- **Contributing**: This file
- **Changelog**: Version history

### Writing Guidelines

- Use clear, concise language
- Include code examples for all features
- Keep examples up-to-date with the latest API
- Use proper markdown formatting

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features (backward compatible)
- **PATCH** (0.0.x): Bug fixes (backward compatible)

### Release Checklist

- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Build artifacts generated
- [ ] Git tag created
- [ ] NPM package published

## 🤝 Community

### Code of Conduct

Please be respectful and inclusive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

### Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: For security concerns or private matters

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- CHANGELOG.md for significant contributions
- GitHub contributors page

Thank you for contributing to React Currency Localizer! 🎉
