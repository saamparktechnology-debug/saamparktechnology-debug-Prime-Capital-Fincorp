# Changelog

## 2026-09-25

### Backend Implementation Milestone

- Resolved all open requirement issues (`ISSUE-001` through `ISSUE-009`).
- Created complete, copy-paste ready MySQL database schema (`schema.sql`).
- Initialized Node.js and Express backend folder structure and server configuration (`src/server.js`).
- Implemented secure JWT authentication middleware with role-based access control (`authMiddleware.js`).
- Implemented 2-step Email + Password + OTP authentication controller and public routing (`authController.js` & `authRoutes.js`).

## 2026-09-24

### Requirements / Architecture Discovery

- Established two-panel architecture: Admin and Agent.
- Defined Agent as an independent person who brings customers.
- Confirmed one-agent-per-customer ownership and backend authorization.
- Confirmed complete customer information categories and KYC workflow.
- Created master project tracking documentation.
