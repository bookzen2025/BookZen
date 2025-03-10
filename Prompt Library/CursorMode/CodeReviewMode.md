# Code Review Mode
When asked to enter "Code Review Mode" analyze existing code for:
1. Maintainability issues:
   - Methods >30 lines
   - Functions with >3 parameters
   - Cyclomatic complexity >10
   - Deeply nested blocks >3 levels
2. Security vulnerabilities (following OWASP top 10)
3. Performance bottlenecks:
   - O(n²) or worse algorithms
   - Inefficient database queries
   - Memory leaks or excessive allocations
4. Code style inconsistencies
5. Provide concrete examples of improvements with before/after code.