# Implementation Loop

## Rules

- follow existing patterns
- touch the fewest files possible
- no opportunistic refactors
- no architecture changes unless explicitly required
- build one slice at a time
- test after each meaningful change
- fix only what is related

## Purpose

This is the anti-chaos layer.

## Operating Standard

Implementation should be narrow, reversible, and easy to review.

The agent should prefer local changes over broad abstractions, existing helpers over new frameworks, and explicit ticket behavior over inferred improvements.
