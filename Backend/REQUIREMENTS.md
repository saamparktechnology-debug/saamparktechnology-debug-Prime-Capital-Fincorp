# Requirements Specification

## 1. Authentication

### Admin

-   Login with email
-   Password verification
-   OTP verification
-   Successful login only after OTP verification

### Agent

-   Login with email
-   Password verification
-   OTP verification
-   Successful login only after OTP verification

### OTP

OTP may be used for: - Login - Alerts/authorization

Delivery: - Email - SMS

------------------------------------------------------------------------

## 2. Agent Management

Admin must be able to:

-   Create agent
-   View agent
-   Update agent
-   Delete agent
-   Enable agent
-   Disable agent
-   Manage agent permissions

An agent may have different permissions at different times.

------------------------------------------------------------------------

## 3. Agent Permissions

Admin controls access individually for every agent.

The final permission matrix must define CRUD access for each applicable
module.

Permission changes must take effect according to the final authorization
design.

------------------------------------------------------------------------

## 4. Customer Management

### Ownership

-   Customer belongs to one agent.
-   Agent cannot transfer customer to another agent.
-   Agent can only access their own customers.
-   Admin can access all customers.

### CRUD

Agent: - Create according to permission - Read own customers according
to permission - Update own customers according to permission - Delete
own customers according to permission

Admin: - Full customer management

### Customer information categories

All of these categories are required:

1.  Basic / Personal Information
2.  Contact Information
3.  Address Information
4.  Family Information
5.  Identity / KYC Information
6.  Bank Information
7.  Employment / Occupation Information
8.  Income Information
9.  Nominee Information
10. Documents

Exact fields are pending final specification.

------------------------------------------------------------------------

## 5. KYC Management

### Agent

-   Enter KYC information
-   Upload documents
-   Submit KYC
-   Fix rejected KYC
-   Resubmit KYC

### Admin

-   Review KYC
-   Approve KYC
-   Reject KYC
-   Enter rejection reason

### KYC rule

KYC is treated as a whole. Individual document approval states are not
required.

### Loan gate

Loan application is permitted only after Admin-approved KYC.

------------------------------------------------------------------------

## 6. Loan Management

### Agent

-   Create loan application if permitted
-   View own loan records if permitted
-   Update loan only before approval if permitted
-   Cannot update approved loan

### Admin

-   View loan records
-   Update loan status
-   Manage loan records according to final permission design

### Loan statuses

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

### External approval

Bank is the actual loan approver. Admin updates the application's status
based on the external bank process.

------------------------------------------------------------------------

## 7. Repayment / EMI Records

The system does not implement a full collection transaction workflow.

The system must be capable of maintaining repayment/EMI records for
tracking.

Example data: - Customer - Loan - EMI amount - EMI date - Installment
information - Installments left

EMI reminder example: - Send an email reminder 7 days before the EMI
date.

Exact data fields, status rules, and update permissions are pending.

------------------------------------------------------------------------

## 8. Reports

Required reports:

1.  Customer Report
2.  Agent Report
3.  KYC Report
4.  Loan Application Report
5.  Approved Loan Report
6.  Rejected Loan Report
7.  Disbursement Report
8.  Collection Report
9.  Outstanding Loan Report

Admin can access applicable data.

Agent can access reports according to individual report permissions and
only for their permitted/owned data.

Exact report columns, filters, sorting, export formats, and chart
requirements are pending.

------------------------------------------------------------------------

## 9. Notifications

Confirmed channels: - Email - SMS

Required areas include: - OTP - Alerts - Authorization/security use
cases - EMI reminders

Exact event-to-notification mapping is pending.

------------------------------------------------------------------------

## 10. Documents

Documents will be stored in backend storage.

Required document categories are to be defined during customer/KYC
specification.

Individual document verification status is not required.

Overall KYC may be approved/rejected.

------------------------------------------------------------------------

## 11. Audit Logs

System must record business changes with:

-   Who performed the action
-   What changed
-   When it changed
-   Old value
-   New value

Audit coverage will be finalized before implementation.

------------------------------------------------------------------------

## 12. Out of Scope

-   Field Officer Management
-   Branch Management
-   Advanced AI
-   Full collection/payment transaction system
-   SSL implementation as a product feature
-   Data backup as a product-development module
-   Cloud/automation module
