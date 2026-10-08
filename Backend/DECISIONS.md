# Architectural Decisions

## Decision 001 --- Two Panels

**Status:** Confirmed

The product has: - Admin Panel - Agent Panel

No separate field-officer panel.

## Decision 002 --- Agent Definition

**Status:** Confirmed

An Agent is an independent person who brings customers to the business.

## Decision 003 --- Customer Ownership

**Status:** Confirmed

- One customer has exactly one agent.
- Agent-to-agent customer transfer is not allowed.
- Agents cannot access each other's customers.
- Admin can access all customers.

## Decision 004 --- Individual Agent Permissions

**Status:** Confirmed

Admin controls CRUD access per agent and per module.

Permissions can be changed after the agent is created.

The exact permission action list will be finalized during the
permission-matrix phase.

## Decision 005 --- Backend Authorization

**Status:** Confirmed

Ownership and permission rules must be enforced on the backend. Frontend
restrictions are not considered security.

## Decision 006 --- KYC Approval Gate

**Status:** Confirmed

A customer can apply for a loan only after Admin has approved the
customer's KYC.

## Decision 007 --- KYC Rejection

**Status:** Confirmed

KYC is rejected as a whole with a reason. Individual documents do not
have separate approval states.

Agent fixes the rejection and resubmits.

## Decision 008 --- Loan Approval

**Status:** Confirmed

The bank approves the loan externally. The system records the loan
status, and Admin updates the status.

## Decision 009 --- Agent Loan Editing

**Status:** Confirmed

Agent can update a loan application only before it is approved.

Exact delete/cancel behavior remains open.

## Decision 010 --- Repayment Scope

**Status:** Confirmed

The product does not implement a full collection/payment transaction
workflow.

Repayment/EMI information is maintained as records for tracking and
reporting.

## Decision 011 --- Authentication

**Status:** Confirmed

Login requires: 1. Email 2. Password 3. OTP

OTP channels: - Email - SMS

## Decision 012 --- Audit History

**Status:** Confirmed

Business audit history records: - WHO - WHAT - WHEN - OLD VALUE - NEW
VALUE

## Decision 013 --- Document Storage

**Status:** Confirmed

Documents are initially stored in backend storage.

## Decision 014 --- Out of Scope

**Status:** Confirmed

Not part of current application scope: - Field officer management -
Multi-branch management - Advanced AI - Cloud/automation feature
modules - SSL/data backup as application-development modules

## Decision 015 --- Technology

**Status:** Confirmed

Backend: - Node.js - Express.js - MySQL

Frontend: - Next.js - Page routing - Tailwind CSS - TanStack - Axios -
DevExtreme - Free/open-source UI libraries as appropriate - Rich chart
libraries as required
