# QA Checklist

## Build Verification

- [ ] Build passes.
- [ ] No unexpected build warnings or errors.

## Test Verification

- [ ] Relevant automated tests pass.
- [ ] Manual test cases match acceptance criteria.

## UI Verification

- [ ] Primary flow works.
- [ ] Empty, loading, and error states are acceptable.
- [ ] Layout works across required viewports.

## Auth Verification

- [ ] Authenticated access works as expected.
- [ ] Unauthorized access is blocked.
- [ ] Role-based behavior is correct.

## Data Verification

- [ ] Data reads are correct.
- [ ] Data writes are correct.
- [ ] No unintended records are created, modified, or deleted.

## Error State Verification

- [ ] Expected errors are handled.
- [ ] User-facing error messages are acceptable.
- [ ] Failures do not leave inconsistent state.

## Logging/Monitoring Verification

- [ ] Relevant errors are logged.
- [ ] No sensitive data is logged.
- [ ] Monitoring impact is understood.
