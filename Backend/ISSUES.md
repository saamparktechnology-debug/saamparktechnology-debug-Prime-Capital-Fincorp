# Issues / Blockers

## Open Requirement Questions

_(All requirement questions have been successfully resolved.)_

## Resolved Requirement Questions

### ISSUE-001 --- Customer exact fields

**Status:** Resolved\
Finalized across all 10 required information categories (Personal, Contact, Address, Family, KYC, Bank, Employment, Income, Nominee, Documents).

### ISSUE-002 --- Loan application fields

**Status:** Resolved\
Finalized required fields: requested amount, tenure in months, interest rate, purpose, and admin fields (approved amount, bank reference number, rejection reason).

### ISSUE-003 --- EMI/repayment model

**Status:** Resolved\
Maintained for tracking, reporting, and 7-day automated reminders with installment number, amount, due date, status, and paid date.

### ISSUE-004 --- EMI record permissions

**Status:** Resolved\
System auto-generates records upon loan disbursement; Admin has full control to update status; Agents have read-only visibility for their customers.

### ISSUE-005 --- Loan delete behavior

**Status:** Resolved\
Agents can delete loans only in the `Draft` state. Once submitted (`Applied` or beyond), deletion is locked; only Admin can cancel/reject.

### ISSUE-006 --- Report specification

**Status:** Resolved\
All 9 required reports include date range, agent, and status filters, with CSV and PDF export support and strict backend data scoping.

### ISSUE-007 --- Notification event matrix

**Status:** Resolved\
Email and SMS channels configured for OTP, KYC approval/rejection, loan status updates, and 7-day prior EMI payment reminders.

### ISSUE-008 --- Document rules

**Status:** Resolved\
Allowed formats: PDF, JPEG, PNG. Max file size: 5MB. Unique secure naming convention enforced under backend storage.

### ISSUE-009 --- Audit coverage

**Status:** Resolved\
All critical business mutations (Agent management, Customer/KYC updates, Loan modifications, EMI status changes) record WHO, WHAT, WHEN, OLD VALUE, and NEW VALUE.

## Resolved Scope Questions

- Field Officer Management --- Removed
- Advanced AI --- Removed
- Multi Branch --- Removed
- Cloud/Automation as application module --- Removed
- Full collection/payment workflow --- Removed
- Loan application before approved KYC --- Not allowed
- Cross-agent customer visibility --- Not allowed
- Customer transfer --- Not allowed
- Multiple agents per customer --- Not allowed

## Blocker Rule

Do not make implementation assumptions to silently close an open issue. Resolve the requirement first and update this file plus DECISIONS.md.
