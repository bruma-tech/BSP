# Database Documentation

## Overview

BRUMA Portal uses **PostgreSQL** as its database, managed through **Prisma ORM**. The schema is defined in `prisma/schema.prisma` and the generated client lives at `src/generated/prisma`.

The data model manages relationships between **Third-Party Administrators (TPAs)** and **Sponsors** in a plan management and compliance document system.

---

## Workflow

### 1. User Registration & Profile Setup

A **User** registers via better-auth (email/password). An admin assigns them a role: `tpa`, `sponsor`, or `user`. Based on the role, a corresponding **Tpa** or **Sponsor** profile is created and linked 1:1 to the User.

### 2. TPA-Sponsor Relationship

A TPA onboards Sponsors into their network. This many-to-many relationship is tracked via the **TpaSponsor** junction table. A TPA can manage multiple Sponsors, and a Sponsor can work with multiple TPAs.

### 3. Plan Creation

Sponsors create **Plans** (e.g., health plans, retirement plans) with details like type, effective date, and status. Each plan belongs to exactly one Sponsor.

### 4. Requirement Lifecycle

A TPA raises a **Requirement** against a specific Plan. The requirement specifies what documents are needed, the priority, due date, and approval workflow. It is then assigned to one or more Sponsors via **RequirementSponsor**.

```
OPEN ──> IN_PROGRESS ──> COMPLETED
  │                          │
  └──> OVERDUE               └──> CLOSED
```

### 5. Review & Document Submission

When a Sponsor begins fulfilling a requirement, a **Review** is created linking the Requirement, Sponsor, and TPA. The Sponsor uploads **Documents** (versioned files with metadata) into the review. The TPA reviews and approves/rejects each document.

```
Review:   OPEN ──> IN_REVIEW ──> CLOSED

Document: PENDING_REVIEW ──> APPROVED
                │
                └──> REJECTED ──> REVISION_REQUESTED ──> PENDING_REVIEW (resubmit)
```

### 6. Collaboration

**Comments** can be posted on either a Review or a Requirement. Comments flagged as `isRevisionRequest` indicate that the TPA is requesting changes to a document.

### 7. Notifications

The system generates **Notifications** for users when key events occur: new requirements, approaching deadlines, review decisions, and feedback received.

---

## Entity Relationship Diagram

```
┌──────────────────────┐
│        User          │
│  (better-auth)       │
│──────────────────────│
│  id            PK    │
│  name                │
│  email         UQ    │
│  role                │
│  ...                 │
└──────────┬───────────┘
           │ 1:1 (userId)
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│   Tpa   │  │ Sponsor  │
│─────────│  │──────────│
│ id   PK │  │ id    PK │
│ userId  │  │ userId   │
│ org...  │  │ org...   │
│ ...     │  │ status   │
└────┬────┘  └────┬─────┘
     │            │
     │   M:N via  │
     │ TpaSponsor │
     │  ┌──────┐  │
     └─►│ tpaId│◄─┘
        │sponsId│
        └──────┘

┌──────────┐         ┌──────────────┐        ┌───────────────────┐
│ Sponsor  │────────►│     Plan     │───────►│   Requirement     │
│          │  1:M    │──────────────│  1:M   │───────────────────│
└──────────┘         │ id        PK │        │ id             PK │
                     │ sponsorId FK │        │ tpaId          FK │◄──── Tpa (who raised)
                     │ planName     │        │ planId         FK │
                     │ planType     │        │ title              │
                     │ status       │        │ type, priority     │
                     └──────────────┘        │ dueDate, status    │
                                             │ approvalWorkflow   │
                                             └────────┬──────────┘
                                                      │
                              ┌────────────────┬──────┴───────┐
                              │                │              │
                              ▼                ▼              ▼
                     ┌─────────────────┐ ┌──────────┐ ┌───────────┐
                     │ RequirementSpon │ │  Review   │ │  Comment  │
                     │ (M:N junction)  │ │──────────│ │───────────│
                     │─────────────────│ │ id    PK │ │ id     PK │
                     │ requirementId   │ │ reqId FK │ │ reviewId? │
                     │ sponsorId       │ │ sponId FK│ │ reqId?    │
                     └─────────────────┘ │ tpaId FK │ │ authorId  │
                                         │ status   │ │ content   │
                                         └────┬─────┘ │ isRevisn  │
                                              │       └───────────┘
                                              ▼
                                        ┌───────────┐
                                        │ Document   │
                                        │───────────│
                                        │ id      PK │
                                        │ reviewId FK │
                                        │ filePath    │
                                        │ version     │
                                        │ status      │
                                        │ uploadedBy  │──── FK to User
                                        └─────────────┘

┌────────────────┐
│  Notification  │
│────────────────│
│ id          PK │
│ userId      FK │──── FK to User
│ type           │
│ title, message │
│ actionRequired │
│ readAt         │
└────────────────┘
```

### Relationship Summary

| Relationship | Type | Via |
|---|---|---|
| User &harr; Tpa | One-to-One | `tpa.userId` |
| User &harr; Sponsor | One-to-One | `sponsor.userId` |
| Tpa &harr; Sponsor | Many-to-Many | `tpa_sponsor` junction |
| Sponsor &harr; Plan | One-to-Many | `plan.sponsorId` |
| Plan &harr; Requirement | One-to-Many | `requirement.planId` |
| Tpa &rarr; Requirement | One-to-Many | `requirement.tpaId` |
| Requirement &harr; Sponsor | Many-to-Many | `requirement_sponsor` junction |
| Requirement &harr; Review | One-to-Many | `review.requirementId` |
| Review &harr; Document | One-to-Many | `document.reviewId` |
| Review &harr; Comment | One-to-Many | `comment.reviewId` |
| Requirement &harr; Comment | One-to-Many | `comment.requirementId` |
| User &rarr; Document | One-to-Many | `document.uploadedById` |
| User &rarr; Comment | One-to-Many | `comment.authorId` |
| User &rarr; Notification | One-to-Many | `notification.userId` |

---

## Data Dictionary

### Enums

#### SponsorStatus
| Value | Description |
|---|---|
| `ACTIVE` | Sponsor is active and operational |
| `PENDING` | Sponsor registration is awaiting approval |
| `INACTIVE` | Sponsor account is deactivated |
| `SUSPENDED` | Sponsor account is temporarily suspended |

#### PlanStatus
| Value | Description |
|---|---|
| `ACTIVE` | Plan is currently active |
| `INACTIVE` | Plan is not currently in use |
| `TERMINATED` | Plan has been permanently ended |

#### RequirementStatus
| Value | Description |
|---|---|
| `OPEN` | Requirement has been created, not yet started |
| `IN_PROGRESS` | Sponsors are actively working on it |
| `COMPLETED` | All required documents submitted and approved |
| `OVERDUE` | Due date has passed without completion |
| `CLOSED` | Requirement closed by TPA (final state) |

#### RequirementPriority
| Value | Description |
|---|---|
| `LOW` | Non-urgent, flexible timeline |
| `MEDIUM` | Standard priority (default) |
| `HIGH` | Urgent, needs immediate attention |

#### RequirementType
| Value | Description |
|---|---|
| `FINANCIAL_REPORT` | Financial statements or audit reports |
| `COMPLIANCE_DOCUMENT` | Regulatory compliance documentation |
| `PLAN_DOCUMENT` | Plan-specific documentation (SPD, amendments) |
| `AUDIT_REPORT` | Internal or external audit reports |
| `TAX_FILING` | Tax-related filings (5500, etc.) |
| `LEGAL_DOCUMENT` | Legal agreements, contracts |
| `OTHER` | Uncategorized document type |

#### ApprovalWorkflow
| Value | Description |
|---|---|
| `SINGLE_REVIEWER` | One TPA reviewer approves/rejects (default) |
| `MULTI_REVIEWER` | Multiple reviewers must all approve |
| `SEQUENTIAL` | Reviewers approve in a defined order |

#### ReviewStatus
| Value | Description |
|---|---|
| `OPEN` | Review created, awaiting document submission |
| `IN_REVIEW` | Documents submitted, TPA is reviewing |
| `CLOSED` | Review completed (approved or rejected) |

#### DocumentStatus
| Value | Description |
|---|---|
| `PENDING_REVIEW` | Document uploaded, awaiting TPA review |
| `APPROVED` | Document approved by TPA |
| `REJECTED` | Document rejected by TPA |
| `REVISION_REQUESTED` | TPA requested changes before re-review |

#### NotificationType
| Value | Description |
|---|---|
| `NEW_REQUIREMENT` | A new requirement has been assigned |
| `DEADLINE_APPROACHING` | A requirement due date is near |
| `REVIEW_DECISION` | A document was approved or rejected |
| `FEEDBACK_RECEIVED` | A comment or revision request was posted |

---

### Models

#### User
> Managed by better-auth. Base identity for all users.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK | Unique identifier (set by better-auth) |
| `name` | String | required | Display name |
| `email` | String | unique, required | Login email |
| `emailVerified` | Boolean | default: `false` | Whether email is verified |
| `image` | String? | optional | Profile image URL |
| `role` | String | default: `"user"` | User role: `tpa`, `sponsor`, or `user` |
| `createdAt` | DateTime | auto | Account creation timestamp |
| `updatedAt` | DateTime | auto | Last update timestamp |

---

#### Session
> Managed by better-auth. Active login sessions.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK | Session identifier |
| `expiresAt` | DateTime | required | Session expiry time |
| `token` | String | unique | Session token |
| `ipAddress` | String? | optional | Client IP address |
| `userAgent` | String? | optional | Client user agent string |
| `userId` | String | FK &rarr; User | Owner of the session |
| `createdAt` | DateTime | auto | Session creation time |
| `updatedAt` | DateTime | auto | Last activity time |

---

#### Account
> Managed by better-auth. Auth provider accounts (email/password, OAuth).

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK | Account identifier |
| `accountId` | String | required | Provider-specific account ID |
| `providerId` | String | required | Auth provider name (e.g., `credential`) |
| `userId` | String | FK &rarr; User | User this account belongs to |
| `accessToken` | String? | optional | OAuth access token |
| `refreshToken` | String? | optional | OAuth refresh token |
| `idToken` | String? | optional | OAuth ID token |
| `accessTokenExpiresAt` | DateTime? | optional | Access token expiry |
| `refreshTokenExpiresAt` | DateTime? | optional | Refresh token expiry |
| `scope` | String? | optional | OAuth scope |
| `password` | String? | optional | Hashed password (for email/password auth) |
| `createdAt` | DateTime | auto | Account creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Verification
> Managed by better-auth. Email verification and password reset tokens.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK | Verification identifier |
| `identifier` | String | indexed | Email or identifier being verified |
| `value` | String | required | Verification token value |
| `expiresAt` | DateTime | required | Token expiry time |
| `createdAt` | DateTime | auto | Token creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Tpa
> TPA organization profile. Linked 1:1 to a User with role `tpa`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique TPA identifier |
| `userId` | String | unique, FK &rarr; User | Linked user account |
| `organizationName` | String | required | TPA organization name |
| `contactNumber` | String | required | Primary phone number |
| `address` | String | required | Business address |
| `createdAt` | DateTime | auto | Profile creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Sponsor
> Sponsor organization profile. Linked 1:1 to a User with role `sponsor`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique Sponsor identifier |
| `userId` | String | unique, FK &rarr; User | Linked user account |
| `organizationName` | String | required | Sponsor organization name |
| `contactNumber` | String | required | Primary phone number |
| `address` | String | required | Business address |
| `status` | SponsorStatus | default: `PENDING` | Account status |
| `createdAt` | DateTime | auto | Profile creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### TpaSponsor
> Junction table for the many-to-many TPA-Sponsor relationship.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Row identifier |
| `tpaId` | String | FK &rarr; Tpa | TPA in the relationship |
| `sponsorId` | String | FK &rarr; Sponsor | Sponsor in the relationship |
| `createdAt` | DateTime | auto | When the relationship was established |

**Unique constraint:** `(tpaId, sponsorId)` -- prevents duplicate pairings.

---

#### Plan
> A benefit plan owned by a Sponsor.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique plan identifier |
| `sponsorId` | String | FK &rarr; Sponsor | Sponsor who owns this plan |
| `planName` | String | required | Plan display name |
| `planType` | String | required | Type of plan (e.g., health, retirement) |
| `description` | String? | optional | Detailed plan description |
| `effectiveDate` | DateTime? | optional | Date the plan takes effect |
| `status` | PlanStatus | default: `ACTIVE` | Current plan status |
| `createdAt` | DateTime | auto | Plan creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Requirement
> A compliance requirement raised by a TPA against a specific Plan.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique requirement identifier |
| `tpaId` | String | FK &rarr; Tpa | TPA who raised the requirement |
| `planId` | String | FK &rarr; Plan | Plan this requirement applies to |
| `title` | String | required | Short title of the requirement |
| `description` | String? | optional | Detailed description of what is needed |
| `type` | RequirementType | default: `OTHER` | Category of the requirement |
| `priority` | RequirementPriority | default: `MEDIUM` | Urgency level |
| `rules` | String? | optional | Applicable rules or regulations |
| `policies` | String? | optional | Related policy references |
| `documentSpecs` | String? | optional | Specifications for required documents |
| `approvalWorkflow` | ApprovalWorkflow | default: `SINGLE_REVIEWER` | How approvals are handled |
| `notifyOnSubmission` | Boolean | default: `true` | Send notification when a document is submitted |
| `allowResubmission` | Boolean | default: `true` | Allow sponsors to resubmit after rejection |
| `dueDate` | DateTime? | optional | Deadline for fulfilling the requirement |
| `assignedAt` | DateTime? | optional | When the requirement was assigned to sponsors |
| `closedAt` | DateTime? | optional | When the requirement was closed |
| `status` | RequirementStatus | default: `OPEN` | Current lifecycle status |
| `createdAt` | DateTime | auto | Requirement creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### RequirementSponsor
> Junction table assigning Requirements to Sponsors.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Row identifier |
| `requirementId` | String | FK &rarr; Requirement | The requirement being assigned |
| `sponsorId` | String | FK &rarr; Sponsor | The sponsor it is assigned to |
| `createdAt` | DateTime | auto | When the assignment was made |

**Unique constraint:** `(requirementId, sponsorId)` -- prevents duplicate assignments.

---

#### Review
> A submission/review cycle where a Sponsor responds to a Requirement and a TPA reviews it.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique review identifier |
| `requirementId` | String | FK &rarr; Requirement | Requirement being fulfilled |
| `sponsorId` | String | FK &rarr; Sponsor | Sponsor submitting documents |
| `tpaId` | String | FK &rarr; Tpa | TPA responsible for reviewing |
| `status` | ReviewStatus | default: `OPEN` | Current review status |
| `submittedAt` | DateTime? | optional | When documents were submitted for review |
| `closedAt` | DateTime? | optional | When the review was closed |
| `createdAt` | DateTime | auto | Review creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Document
> A versioned file uploaded as part of a Review.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique document identifier |
| `reviewId` | String | FK &rarr; Review | Review this document belongs to |
| `filePath` | String | required | Storage path of the file |
| `fileName` | String | required | Original file name |
| `fileSize` | String? | optional | Human-readable file size (e.g., "2.4 MB") |
| `fileFormat` | String? | optional | File format/MIME type |
| `version` | Int | default: `1` | Document version number |
| `description` | String? | optional | Description of the document contents |
| `certifications` | String[] | default: `[]` | Compliance certifications (HIPAA, SOC 2, etc.) |
| `effectiveDate` | DateTime? | optional | Date the document takes effect |
| `expirationDate` | DateTime? | optional | Date the document expires |
| `status` | DocumentStatus | default: `PENDING_REVIEW` | Approval status |
| `uploadedAt` | DateTime | auto | Upload timestamp |
| `uploadedById` | String | FK &rarr; User | User who uploaded the document |
| `createdAt` | DateTime | auto | Record creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Comment
> A comment on a Review or Requirement. At least one of `reviewId` or `requirementId` should be set.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique comment identifier |
| `reviewId` | String? | FK &rarr; Review, optional | Review being commented on |
| `requirementId` | String? | FK &rarr; Requirement, optional | Requirement being commented on |
| `authorId` | String | FK &rarr; User | User who wrote the comment |
| `content` | String | required | Comment text |
| `isRevisionRequest` | Boolean | default: `false` | Whether this comment requests a document revision |
| `createdAt` | DateTime | auto | Comment creation time |
| `updatedAt` | DateTime | auto | Last update time |

---

#### Notification
> In-app notifications delivered to users.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, cuid | Unique notification identifier |
| `userId` | String | FK &rarr; User | Recipient user |
| `type` | NotificationType | required | Category of the notification |
| `title` | String | required | Notification headline |
| `message` | String | required | Notification body text |
| `actionRequired` | Boolean | default: `false` | Whether the user needs to take action |
| `readAt` | DateTime? | optional | When the notification was read (`null` = unread) |
| `createdAt` | DateTime | auto | Notification creation time |

---

## Indexes

All foreign key columns are indexed for query performance. Additional indexes:

| Table | Index | Purpose |
|---|---|---|
| `requirement` | `status` | Filter requirements by status |
| `notification` | `(userId, readAt)` | Fetch unread notifications for a user |
| `tpa_sponsor` | `(tpaId, sponsorId)` unique | Prevent duplicate TPA-Sponsor pairs |
| `requirement_sponsor` | `(requirementId, sponsorId)` unique | Prevent duplicate assignments |
