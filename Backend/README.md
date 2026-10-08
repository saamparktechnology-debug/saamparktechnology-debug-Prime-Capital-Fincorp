# Microfinance Management System - Backend Architecture

A robust, enterprise-grade, dual-panel (Admin & Agent) backend built for microfinance operations, prioritizing granular Role-Based Access Control (RBAC), strict data scoping, automated operational workflows, and high-security standards.

## 🛠️ Tech Stack & Dependencies

- **Core Runtime**: Node.js & Express.js
- **Database**: MySQL (via `mysql2` with parameterized prepared statements to prevent SQL injection)
- **Authentication**: JSON Web Tokens (JWT) with 8-hour expiry & 2-Step OTP Verification
- **Security**: Helmet (secure HTTP headers), `express-rate-limit` (DDoS/brute-force prevention), `bcryptjs` (password hashing)
- **File Uploads**: `multer` (strict type validation: PDF/JPEG/PNG, max 5MB limit)
- **Communications**: `nodemailer` & automated cron/interval messaging for EMI reminders

---

## 🔒 Security Hardening

1. **Security Headers**: Managed via Helmet to protect against common web vulnerabilities.
2. **Rate Limiting**:
   - Global API limiter (200 requests per 15 mins per IP).
   - Strict Authentication limiter (10 attempts per 15 mins) on login and OTP verification routes to prevent brute-force attacks.
3. **Data Scoping**: Agents are strictly locked to their own customer and loan portfolios (`agent_id` filtering), while Admins maintain system-wide visibility.
4. **KYC Gateway**: Mandatory validation block ensuring loan applications cannot be created unless customer KYC status is explicitly `approved`.

---

## 📋 Complete API Endpoint Inventory (27 Endpoints)

### System & Authentication

1. `GET /api/v1/health` — System health check and status verification.
2. `POST /api/v1/auth/login` — Step 1: Password verification and OTP dispatch via email/SMS.
3. `POST /api/v1/auth/verify-otp` — Step 2: OTP validation and issuance of the 8-hour JWT access token.

### Agent Management (Admin Only)

4. `POST /api/v1/agents` — Create a new field agent profile (auto-provisions login credentials).
5. `GET /api/v1/agents` — List all registered agents.
6. `PUT /api/v1/agents/:id/status` — Enable or disable agent account access.
7. `PUT /api/v1/agents/:id/permissions` — Configure module-wise permission matrices (`can_create`, `can_read`, `can_update`, `can_delete`).

### Customer Management

8. `POST /api/v1/customers` — Register a new 10-category customer profile (scoped to agent).
9. `GET /api/v1/customers` — List customers (scoped by role/owner).
10. `GET /api/v1/customers/:id` — Retrieve a deep-dive single customer profile.

### KYC & Document Management

11. `PATCH /api/v1/kyc/:customerId/review` — Admin-only: Approve or reject customer KYC.
12. `POST /api/v1/kyc/:customerId/resubmit` — Agent: Resubmit a rejected KYC profile.
13. `POST /api/v1/kyc/:customerId/documents` — Upload KYC documents (5MB limit, PDF/JPEG/PNG).
14. `GET /api/v1/kyc/:customerId/documents` — Fetch uploaded customer documents (scoped by agent ownership or admin access).

### Loan Lifecycle Management

15. `POST /api/v1/loans` — Submit a loan application (enforces KYC approval gate and `loan_type`).
16. `GET /api/v1/loans` — List loan applications (scoped by role).
17. `PUT /api/v1/loans/:loanId` — Update pre-approval loan details (restricted to Draft, Applied, Under Review).
18. `PATCH /api/v1/loans/:loanId/status` — Admin-only: Transition loan states through banking workflows (`Approved`, `Rejected`, `Disbursed`, `Active`, `Completed`, etc.).

### EMI Repayments & Reminders

19. `GET /api/v1/emis/loan/:loanId` — Fetch complete EMI repayment schedule for a specific loan.
20. `PATCH /api/v1/emis/:emiId/status` — Admin-only: Update individual EMI payment status (`Paid`, `Overdue`).
21. `GET /api/v1/emis/upcoming` — Retrieve the list of upcoming pending EMIs.
22. `POST /api/v1/emis/:emiId/send-reminder` — Manually trigger SMS/Email reminders for an upcoming EMI.

### Audit & Governance

23. `GET /api/v1/audits` — Admin-only: View system-wide mutation audit logs tracking actor actions, targets, and old/new values.

### Reports & Analytics

24. `GET /api/v1/reports/:reportType` — Multi-filter scoped operational reports (`customers`, `loans`, `collections`, etc.) filtered by date ranges, statuses, agent IDs, and amounts.
25. `GET /api/v1/analytics/agent-dashboard` — Fetch aggregated chart metrics (KYC breakdowns, loan status distribution, collection stats) for agent/admin dashboards.
26. `GET /api/v1/analytics/admin/agents-overview` — Admin-only: Agent performance overview table and active portfolio values.
27. `GET /api/v1/analytics/admin/agents/:agentId/summary` — Admin-only: Deep-dive profile analytics summary for a single specific agent.

---

## 🚀 Installation & Quick Start

1. **Clone the repository and install dependencies:**
   ```bash
   npm install express mysql2 dotenv bcryptjs jsonwebtoken multer nodemailer cors helmet express-rate-limit
   ```
