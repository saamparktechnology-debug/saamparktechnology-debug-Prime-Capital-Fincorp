# Microfinance Management System

> Master overview / source of truth\
> Status: Requirements discovery completed for the current scope. **No
> coding started.**

## 1. Project Goal

Build a digital microfinance management system with exactly two
application panels:

1.  **Admin Panel**
2.  **Agent Panel**

The system will manage agents, customers, KYC, loan applications/status,
repayment/EMI records, notifications, audit history, and reports.

An **Agent** is an independent person who brings customers to the
microfinance business.

## 2. Confirmed Technology Stack

### Backend

-   Node.js
-   Express.js
-   MySQL

### Frontend

-   Next.js
-   Page routing
-   Tailwind CSS
-   TanStack
-   Axios
-   DevExtreme
-   Other suitable free/open-source UI libraries
-   Rich chart libraries where required

### Development principle

Do not start implementation until the relevant requirement/specification
has been reviewed and marked ready.

## 3. Application Panels

### Admin Panel

Admin is the controlling user of the system.

Admin can: - Manage agents - Create/view/update/delete agents -
Enable/disable agents - Manage permissions for each individual agent -
Manage customers - Review KYC - Approve/reject KYC - Provide KYC
rejection reason - View/manage loan records - Update loan status - View
reports - View audit/activity history

### Agent Panel

Agents can work only with customers assigned/created by themselves.

An agent: - Creates customers - Manages customer information according
to permissions - Uploads customer/KYC documents - Submits KYC - Fixes
rejected KYC information/documents - Applies for loans after KYC
approval - Can update a loan application only before approval - Can
access reports only when the relevant permission is granted - Must never
see another agent's customers/data

## 4. Core Ownership Rules

-   One customer belongs to exactly one agent.
-   A customer cannot have multiple agents.
-   Customer transfer between agents is not allowed.
-   Agents cannot see each other's customers.
-   Admin can see all customers.
-   Backend must enforce ownership; frontend hiding alone is not
    sufficient.
-   Individual agent permissions are configurable by Admin and can
    change later.

## 5. Core Modules

1.  Authentication
2.  Agent Management
3.  Individual Agent Permissions
4.  Customer Management
5.  KYC Management
6.  Document Management
7.  Loan Management
8.  Repayment / EMI Records
9.  Notifications
10. Reports
11. Audit Logs

## 6. Explicitly Out of Scope

The following are not part of the current scope:

-   Field Officer Management
-   Multi-branch management
-   Advanced AI
-   Cloud/automation features as a development module
-   SSL as an application-development module
-   Infrastructure/data-backup concerns as application modules
-   Full collection/payment transaction management

## 7. KYC Business Flow

Agent creates customer -\> enters all required KYC information -\>
uploads documents -\> submits KYC -\> Admin reviews.

Possible confirmed outcomes: - `pending` - `approved` - `rejected`

If rejected: - Admin must provide a rejection reason. - Agent fixes the
information/documents according to the reason. - Agent resubmits KYC.

Loan application is allowed **only after Admin approves KYC**.

KYC is rejected/approved as a whole. Individual documents do not have
separate verification statuses.

## 8. Loan Statuses

Confirmed loan statuses:

-   Draft
-   Applied
-   Under Review
-   Approved
-   Rejected
-   Disbursed
-   Active
-   Completed
-   Overdue
-   Cancelled

The bank is the actual loan approver. The software records the business
status, and Admin updates the status based on the external bank process.

Agent loan editing is allowed only before the loan is approved.

## 9. Repayment / EMI Scope

There is no full collection/payment transaction workflow.

The system will maintain repayment/EMI-related records for tracking and
reporting.

Example concept:

-   Customer: Rahul
-   EMI amount
-   EMI date
-   Installment information
-   Installments left
-   Reminder before EMI date

Example reminder requirement: - Send an email reminder when an EMI date
is approaching, e.g. 7 days before the due date.

Exact EMI data model and payment-status rules are still to be finalized.

## 10. Reports

Required reports:

-   Customer Report
-   Agent Report
-   KYC Report
-   Loan Application Report
-   Approved Loan Report
-   Rejected Loan Report
-   Disbursement Report
-   Collection Report
-   Outstanding Loan Report

Agents may access reports according to their individual permissions and
must only receive their own permitted data.

## 11. Authentication

Login flow:

Email + Password -\> OTP -\> Successful Login

OTP can also be used for alert/authorization purposes.

OTP delivery channels: - Email - SMS

## 12. Notifications

Confirmed channels: - Email - SMS

Use cases will be defined per module, including security/authorization
and EMI reminders.

## 13. Documents

Customer/KYC/loan documents will initially be stored under backend
storage.

Exact directory structure, file naming, validation, size limits, and
access rules are to be finalized before implementation.

## 14. Audit History

The system must maintain business activity/audit history.

Minimum audit information:

-   WHO
-   WHAT
-   WHEN
-   OLD VALUE
-   NEW VALUE

Example: Admin changes `kyc_status` from `pending` to `approved`.

## 15. Architecture Principle

The system must be designed around: - Individual agent CRUD
permissions - Customer ownership - Backend authorization - KYC approval
gate before loan application - Loan approval boundary - Auditability -
Report access control

No unconfirmed business rule should be silently invented during
implementation.

## 16. Current Phase

**Phase 0 --- Requirements & Architecture Discovery**

Completed: - Product scope clarified - Panel structure clarified - Agent
definition clarified - Customer ownership clarified - KYC workflow
clarified - Loan status workflow clarified - Agent permission model
clarified - Report list clarified - Authentication direction clarified -
Notification channels clarified - Out-of-scope features clarified

Next: - Finalize remaining business fields/rules - Produce system
specification - Produce permission matrix - Produce database/entity
design - Review architecture - Only then start backend/frontend
implementation
