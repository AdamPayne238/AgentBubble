# Ticket Intake Loop

Before coding, the agent must answer:

- What is the ticket asking?
- What problem is actually being solved?
- What files/domains are likely involved?
- What is unknown?
- What should not change?
- What is the smallest safe implementation?
- What is the acceptance criteria?

## Purpose

Prevent agents from wandering through the codebase or redefining scope.

## Rule

The ticket defines the problem. The agent may identify ambiguity, risk, or missing context, but it must not silently replace the ticket with a different objective.
