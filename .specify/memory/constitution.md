<!--
Sync Impact Report:
- Version: 1.0.0 → 2.0.0
- Rationale: Major revision shifting focus to code quality, best practices, UX consistency, and performance
- Modified Principles:
  * Principle I: Specification-First → Code Quality & Maintainability
  * Principle II: Independent User Stories → Best Practices & Standards
  * Principle III: Clarification Before Planning → User Experience Consistency
  * Principle IV: Design Before Tasks → Performance & Optimization
  * Principle V: Quality Gates → Testing & Validation (expanded)
- Added Sections: None
- Removed Sections: None
- Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with new principles
  ✅ spec-template.md - Success criteria supports UX consistency and performance
  ✅ tasks-template.md - Task organization supports quality and testing practices
- Follow-up TODOs: None
-->

# ChulasArts Constitution

## Core Principles

### I. Code Quality & Maintainability

All code MUST be readable, maintainable, and follow established coding standards. Code is read 10x more than written—optimize for comprehension. REQUIRED practices:
- Meaningful variable and function names (no abbreviations except industry standard)
- Functions under 50 lines, single responsibility principle
- No commented-out code in production branches
- Dependencies must be justified and documented
- Technical debt tracked and addressed systematically

**Rationale**: Maintainable code reduces onboarding time, accelerates feature velocity, and minimizes defect injection. Code quality compounds—every shortcut taken today costs exponentially more tomorrow.

### II. Best Practices & Standards

Development MUST follow industry best practices and established patterns. Consistency over cleverness. REQUIRED standards:
- Language-specific style guides (PEP 8 for Python, Airbnb for JavaScript, etc.)
- Version control: atomic commits with descriptive messages
- Code review: all changes reviewed before merge, no self-approval
- Documentation: README, API docs, inline comments for complex logic only
- Security: OWASP guidelines, no credentials in code, dependency scanning

**Rationale**: Standards eliminate bikeshedding, reduce cognitive load, and create a predictable codebase. Best practices are lessons learned from industry-wide failures—leverage collective wisdom.

### III. User Experience Consistency

User interfaces MUST be consistent, intuitive, and accessible. Users should never need to "learn" different patterns within the same application. REQUIRED practices:
- Design system or component library for visual consistency
- Interaction patterns follow platform conventions (iOS HIG, Material Design, etc.)
- Accessibility: WCAG 2.1 AA minimum, keyboard navigation, screen reader support
- Error messages: clear, actionable, user-friendly (no technical jargon)
- Loading and empty states explicitly designed
- Mobile-first or responsive design by default

**Rationale**: Consistency reduces cognitive load and learning curve. Accessible design serves all users and is legally required in many jurisdictions. Poor UX directly correlates with user churn and support costs.

### IV. Performance & Optimization

Applications MUST be performant and resource-efficient. Performance is a feature, not an afterthought. REQUIRED standards:
- Quantified performance budgets defined during planning (load time, response time, memory)
- Frontend: <3s page load, <100ms interaction response, <50ms animation frame time
- Backend: <200ms API p95 latency for critical paths, <500ms for secondary
- Database queries optimized with proper indexing, no N+1 queries
- Assets optimized: images compressed, code minified, lazy loading implemented
- Performance monitoring: track metrics, alert on regressions

**Rationale**: Performance directly impacts user satisfaction, conversion rates, and operational costs. Slow applications lose users—53% abandon sites taking >3 seconds to load. Optimization is cheaper than scaling.

### V. Testing & Validation

Quality MUST be validated through comprehensive testing. Ship features with confidence, not hope. REQUIRED practices:
- Unit tests for business logic (>80% coverage for critical paths)
- Integration tests for API contracts and data flows
- End-to-end tests for critical user journeys
- Test-Driven Development (TDD) for complex logic or bug fixes
- Automated testing in CI/CD pipeline, blocking deploys on failure
- Manual exploratory testing for UX validation
- Performance testing for high-traffic features

**Rationale**: Testing catches defects before users do. Automated tests enable confident refactoring and rapid deployment. The cost of a production defect is 10-100x the cost of catching it in development.

## Quality Standards

### Code Review Requirements

All code changes MUST undergo review:
- At least one approving review from qualified reviewer
- Automated checks passed (linting, tests, security scans)
- Documentation updated if behavior changes
- Performance impact assessed for critical paths
- Accessibility verified for UI changes

### Performance Budgets

Every feature MUST define and meet performance budgets:
- Page load time targets
- API response time targets
- Memory consumption limits
- Bundle size constraints
- Database query performance thresholds

Budgets are non-negotiable unless explicitly justified and approved.

### UX Consistency Guidelines

User interfaces MUST adhere to:
- Established design system and component library
- Platform-specific interaction patterns
- WCAG 2.1 AA accessibility standards
- Consistent error handling and messaging
- Responsive design across target devices

### Testing Requirements

Features MUST include appropriate test coverage:
- Critical business logic: Unit tests required
- API endpoints: Integration tests required
- User journeys: End-to-end tests for P1 stories
- Performance-sensitive code: Benchmark tests required
- Bug fixes: Regression tests required

## Development Workflow

### Planning Phase

Technical plans MUST include:
- Performance budgets and optimization strategy
- UX consistency checklist (design system compliance)
- Code quality standards enforcement plan
- Testing strategy with coverage targets
- Security considerations and compliance requirements

### Implementation Phase

Developers MUST:
- Follow language-specific style guides and linting rules
- Write tests before or alongside implementation (TDD preferred)
- Ensure performance budgets are met (measure, don't guess)
- Follow accessibility guidelines for all UI work
- Document complex logic and architectural decisions
- Keep functions focused and modules cohesive

### Review Phase

Reviewers MUST verify:
- Code quality: readability, maintainability, standards compliance
- Test coverage: adequate and meaningful tests
- Performance: budgets met, no obvious bottlenecks
- UX consistency: design system adherence, accessibility
- Security: no vulnerabilities introduced
- Documentation: adequate for maintenance

### Deployment Phase

Before deployment, verify:
- All tests passing in production-like environment
- Performance metrics meet defined budgets
- Security scans clear
- Documentation updated
- Rollback plan documented

## Governance

### Amendment Process

1. Propose changes via `/speckit.constitution` command
2. Version bump follows semantic versioning:
   - MAJOR: Breaking changes to principles or standards
   - MINOR: New principles, sections, or substantial expansions
   - PATCH: Clarifications, corrections, minor refinements
3. Update sync impact report
4. Propagate changes to dependent templates
5. Document rationale for all changes

### Compliance & Enforcement

All development MUST comply with this constitution. Non-compliance is addressed through:

**Preventive measures**:
- Automated linting and formatting in development environment
- Pre-commit hooks for code quality and standards
- CI/CD pipeline enforces test coverage and performance budgets
- Code review process verifies constitution compliance

**Corrective measures**:
- Constitution violations flagged during planning phase must be resolved
- Technical debt for compliance issues tracked and prioritized
- Repeated violations trigger process review and additional training

**Exceptions**:
- Emergency hotfixes may bypass some requirements (document and remediate)
- Performance optimizations may justify code complexity (document trade-offs)
- Legacy code may not meet all standards (improvement plan required)

The constitution is the supreme authority for development standards. When conflicts arise between constitution and other guidance, constitution takes precedence. When constitution cannot be followed, explicit justification and approval required.

### Metrics & Continuous Improvement

Track and review quarterly:
- Code quality metrics (complexity, duplication, test coverage)
- Performance metrics vs. budgets (p50, p95, p99 latencies)
- Accessibility compliance (automated + manual audits)
- User experience metrics (task completion, satisfaction scores)
- Review cycle times and feedback quality

Use data to refine standards and practices. Constitution is living document—evolve it based on team experience and measurable outcomes.

**Version**: 2.0.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
