import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// ─── Standalone clients ─────────────────────────────────────────────────────
// Cannot import from app/auth/config/server.ts because it uses the @/ path
// alias which only resolves inside Next.js. We replicate the auth config here.

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: ["tpa", "sponsor", "user"] as const,
        required: true,
        defaultValue: "user",
        input: true,
      },
    },
  },
});

// ─── Seed Data Definitions ──────────────────────────────────────────────────

const TPA_USERS = [
  { name: "Alice Martin", email: "alice@tpa-benefits.com", password: "Password123!", role: "tpa" as const },
  { name: "Bob Reynolds", email: "bob@tpa-compliance.com", password: "Password123!", role: "tpa" as const },
];

const SPONSOR_USERS = [
  { name: "Carol Chen", email: "carol@acme-corp.com", password: "Password123!", role: "sponsor" as const },
  { name: "David Park", email: "david@globex-inc.com", password: "Password123!", role: "sponsor" as const },
  { name: "Eva Schmidt", email: "eva@initech-llc.com", password: "Password123!", role: "sponsor" as const },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function signUpUser(user: { name: string; email: string; password: string; role: "tpa" | "sponsor" }) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    console.log(`  ✓ User already exists: ${user.email}`);
    return existing;
  }

  const response = await auth.api.signUpEmail({
    body: {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    },
  });

  console.log(`  + Created user: ${user.email} (${user.role})`);
  return response.user;
}

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Seeding database...\n");

  // 1. Create Users via better-auth
  console.log("── Users ──");
  const tpaUsers = [];
  for (const u of TPA_USERS) {
    tpaUsers.push(await signUpUser(u));
  }
  const sponsorUsers = [];
  for (const u of SPONSOR_USERS) {
    sponsorUsers.push(await signUpUser(u));
  }

  // 2. Create TPA profiles
  console.log("\n── TPA Profiles ──");
  const tpaProfiles = [
    { userId: tpaUsers[0].id, organizationName: "TPA Benefits Group", contactNumber: "+1-555-100-2000", address: "100 Compliance Ave, New York, NY 10001" },
    { userId: tpaUsers[1].id, organizationName: "TPA Compliance Partners", contactNumber: "+1-555-200-3000", address: "200 Regulatory Blvd, Chicago, IL 60601" },
  ];

  const tpas = [];
  for (const t of tpaProfiles) {
    const tpa = await prisma.tpa.upsert({
      where: { userId: t.userId },
      update: {},
      create: t,
    });
    console.log(`  + TPA: ${t.organizationName}`);
    tpas.push(tpa);
  }

  // 3. Create Sponsor profiles
  console.log("\n── Sponsor Profiles ──");
  const sponsorProfiles = [
    { userId: sponsorUsers[0].id, organizationName: "Acme Corporation", contactNumber: "+1-555-300-4000", address: "300 Innovation Dr, San Francisco, CA 94105", status: "ACTIVE" as const },
    { userId: sponsorUsers[1].id, organizationName: "Globex Inc.", contactNumber: "+1-555-400-5000", address: "400 Enterprise Way, Austin, TX 73301", status: "ACTIVE" as const },
    { userId: sponsorUsers[2].id, organizationName: "Initech LLC", contactNumber: "+1-555-500-6000", address: "500 Corporate Pkwy, Seattle, WA 98101", status: "PENDING" as const },
  ];

  const sponsors = [];
  for (const s of sponsorProfiles) {
    const sponsor = await prisma.sponsor.upsert({
      where: { userId: s.userId },
      update: {},
      create: s,
    });
    console.log(`  + Sponsor: ${s.organizationName} (${s.status})`);
    sponsors.push(sponsor);
  }

  // 4. TPA-Sponsor relationships
  console.log("\n── TPA-Sponsor Relationships ──");
  const tpaSponsorPairs = [
    { tpaId: tpas[0].id, sponsorId: sponsors[0].id },
    { tpaId: tpas[0].id, sponsorId: sponsors[1].id },
    { tpaId: tpas[1].id, sponsorId: sponsors[1].id },
    { tpaId: tpas[1].id, sponsorId: sponsors[2].id },
  ];

  for (const pair of tpaSponsorPairs) {
    await prisma.tpaSponsor.upsert({
      where: { tpaId_sponsorId: { tpaId: pair.tpaId, sponsorId: pair.sponsorId } },
      update: {},
      create: pair,
    });
  }
  console.log(`  + Created ${tpaSponsorPairs.length} TPA-Sponsor links`);

  // 5. Plans
  console.log("\n── Plans ──");
  const planDefs = [
    { sponsorId: sponsors[0].id, planName: "Acme Health Plan", planType: "Health", description: "Comprehensive health insurance for all Acme employees", effectiveDate: new Date("2024-01-01"), status: "ACTIVE" as const },
    { sponsorId: sponsors[0].id, planName: "Acme 401(k) Plan", planType: "Retirement", description: "Employee retirement savings plan with employer match", effectiveDate: new Date("2024-01-01"), status: "ACTIVE" as const },
    { sponsorId: sponsors[1].id, planName: "Globex Dental Plan", planType: "Dental", description: "Dental coverage for Globex employees and dependents", effectiveDate: new Date("2024-06-01"), status: "ACTIVE" as const },
    { sponsorId: sponsors[1].id, planName: "Globex Vision Plan", planType: "Vision", description: "Vision benefits including annual eye exams", effectiveDate: new Date("2023-01-01"), status: "INACTIVE" as const },
    { sponsorId: sponsors[2].id, planName: "Initech Health Plan", planType: "Health", description: "Basic health coverage for Initech staff", effectiveDate: new Date("2025-01-01"), status: "ACTIVE" as const },
    { sponsorId: sponsors[2].id, planName: "Initech Legacy Pension", planType: "Pension", description: "Legacy defined-benefit pension plan", effectiveDate: new Date("2010-01-01"), status: "TERMINATED" as const },
  ];

  const plans = [];
  for (const p of planDefs) {
    const plan = await prisma.plan.create({ data: p });
    console.log(`  + Plan: ${p.planName} (${p.status})`);
    plans.push(plan);
  }

  // 6. Requirements
  console.log("\n── Requirements ──");
  const now = new Date();
  const requirementDefs = [
    { tpaId: tpas[0].id, planId: plans[0].id, title: "Annual Financial Audit Report", type: "FINANCIAL_REPORT" as const, priority: "HIGH" as const, status: "OPEN" as const, description: "Submit the annual audited financial statements for the health plan", dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 15), approvalWorkflow: "SINGLE_REVIEWER" as const, assignedAt: now },
    { tpaId: tpas[0].id, planId: plans[0].id, title: "HIPAA Compliance Certificate", type: "COMPLIANCE_DOCUMENT" as const, priority: "HIGH" as const, status: "IN_PROGRESS" as const, description: "Provide current HIPAA compliance certification", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 30), approvalWorkflow: "MULTI_REVIEWER" as const, assignedAt: new Date(now.getTime() - 7 * 86400000) },
    { tpaId: tpas[0].id, planId: plans[1].id, title: "Form 5500 Filing", type: "TAX_FILING" as const, priority: "MEDIUM" as const, status: "COMPLETED" as const, description: "Annual Form 5500 filing for the 401(k) plan", dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 31), approvalWorkflow: "SINGLE_REVIEWER" as const, assignedAt: new Date(now.getTime() - 60 * 86400000), closedAt: new Date(now.getTime() - 5 * 86400000) },
    { tpaId: tpas[1].id, planId: plans[2].id, title: "Summary Plan Description Update", type: "PLAN_DOCUMENT" as const, priority: "MEDIUM" as const, status: "OPEN" as const, description: "Updated SPD reflecting 2025 plan amendments", dueDate: new Date(now.getFullYear(), now.getMonth() + 3, 1), approvalWorkflow: "SEQUENTIAL" as const, assignedAt: now },
    { tpaId: tpas[1].id, planId: plans[2].id, title: "Provider Network Agreement", type: "LEGAL_DOCUMENT" as const, priority: "LOW" as const, status: "OPEN" as const, description: "Signed agreement with the dental provider network", dueDate: new Date(now.getFullYear(), now.getMonth() + 4, 15), approvalWorkflow: "SINGLE_REVIEWER" as const },
    { tpaId: tpas[1].id, planId: plans[4].id, title: "Internal Audit Report Q4", type: "AUDIT_REPORT" as const, priority: "HIGH" as const, status: "OVERDUE" as const, description: "Q4 internal audit report for the health plan", dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15), approvalWorkflow: "SINGLE_REVIEWER" as const, assignedAt: new Date(now.getTime() - 90 * 86400000) },
    { tpaId: tpas[0].id, planId: plans[1].id, title: "Investment Policy Statement", type: "OTHER" as const, priority: "MEDIUM" as const, status: "IN_PROGRESS" as const, description: "Current investment policy statement for the retirement plan", dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), approvalWorkflow: "SINGLE_REVIEWER" as const, assignedAt: new Date(now.getTime() - 14 * 86400000) },
    { tpaId: tpas[0].id, planId: plans[0].id, title: "Plan Amendment Notice", type: "PLAN_DOCUMENT" as const, priority: "LOW" as const, status: "CLOSED" as const, description: "Notice of plan amendments effective Jan 2025", dueDate: new Date(now.getFullYear(), 0, 31), approvalWorkflow: "SINGLE_REVIEWER" as const, assignedAt: new Date(now.getFullYear() - 1, 11, 1), closedAt: new Date(now.getFullYear(), 0, 20) },
  ];

  const requirements = [];
  for (const r of requirementDefs) {
    const req = await prisma.requirement.create({ data: r });
    console.log(`  + Requirement: ${r.title} (${r.status})`);
    requirements.push(req);
  }

  // 7. RequirementSponsor assignments
  console.log("\n── Requirement-Sponsor Assignments ──");
  const reqSponsorPairs = [
    { requirementId: requirements[0].id, sponsorId: sponsors[0].id },
    { requirementId: requirements[1].id, sponsorId: sponsors[0].id },
    { requirementId: requirements[2].id, sponsorId: sponsors[0].id },
    { requirementId: requirements[3].id, sponsorId: sponsors[1].id },
    { requirementId: requirements[4].id, sponsorId: sponsors[1].id },
    { requirementId: requirements[5].id, sponsorId: sponsors[2].id },
    { requirementId: requirements[6].id, sponsorId: sponsors[0].id },
    { requirementId: requirements[7].id, sponsorId: sponsors[0].id },
  ];

  for (const rs of reqSponsorPairs) {
    await prisma.requirementSponsor.create({ data: rs });
  }
  console.log(`  + Assigned ${reqSponsorPairs.length} requirement-sponsor links`);

  // 8. Reviews
  console.log("\n── Reviews ──");
  const reviewDefs = [
    { requirementId: requirements[1].id, sponsorId: sponsors[0].id, tpaId: tpas[0].id, status: "IN_REVIEW" as const, submittedAt: new Date(now.getTime() - 3 * 86400000) },
    { requirementId: requirements[2].id, sponsorId: sponsors[0].id, tpaId: tpas[0].id, status: "CLOSED" as const, submittedAt: new Date(now.getTime() - 30 * 86400000), closedAt: new Date(now.getTime() - 5 * 86400000) },
    { requirementId: requirements[3].id, sponsorId: sponsors[1].id, tpaId: tpas[1].id, status: "OPEN" as const },
    { requirementId: requirements[5].id, sponsorId: sponsors[2].id, tpaId: tpas[1].id, status: "IN_REVIEW" as const, submittedAt: new Date(now.getTime() - 10 * 86400000) },
    { requirementId: requirements[6].id, sponsorId: sponsors[0].id, tpaId: tpas[0].id, status: "IN_REVIEW" as const, submittedAt: new Date(now.getTime() - 2 * 86400000) },
  ];

  const reviews = [];
  for (const rv of reviewDefs) {
    const review = await prisma.review.create({ data: rv });
    console.log(`  + Review for requirement "${requirements[reviewDefs.indexOf(rv)].id}" (${rv.status})`);
    reviews.push(review);
  }

  // 9. Documents
  console.log("\n── Documents ──");
  const documentDefs = [
    { reviewId: reviews[0].id, filePath: "/uploads/hipaa-cert-2025.pdf", fileName: "hipaa-cert-2025.pdf", fileSize: "1.2 MB", fileFormat: "application/pdf", version: 1, description: "HIPAA compliance certificate", certifications: ["HIPAA"], status: "PENDING_REVIEW" as const, uploadedById: sponsorUsers[0].id },
    { reviewId: reviews[1].id, filePath: "/uploads/form-5500-2024.pdf", fileName: "form-5500-2024.pdf", fileSize: "3.8 MB", fileFormat: "application/pdf", version: 1, description: "Form 5500 annual filing", certifications: ["DOL"], status: "APPROVED" as const, uploadedById: sponsorUsers[0].id },
    { reviewId: reviews[1].id, filePath: "/uploads/form-5500-schedule-c.pdf", fileName: "form-5500-schedule-c.pdf", fileSize: "890 KB", fileFormat: "application/pdf", version: 1, description: "Schedule C - Service provider fee disclosure", status: "APPROVED" as const, uploadedById: sponsorUsers[0].id },
    { reviewId: reviews[3].id, filePath: "/uploads/q4-audit-draft.pdf", fileName: "q4-audit-draft.pdf", fileSize: "2.1 MB", fileFormat: "application/pdf", version: 1, description: "Q4 internal audit report - draft", status: "REJECTED" as const, uploadedById: sponsorUsers[2].id },
    { reviewId: reviews[3].id, filePath: "/uploads/q4-audit-v2.pdf", fileName: "q4-audit-v2.pdf", fileSize: "2.3 MB", fileFormat: "application/pdf", version: 2, description: "Q4 internal audit report - revised", status: "PENDING_REVIEW" as const, uploadedById: sponsorUsers[2].id },
    { reviewId: reviews[4].id, filePath: "/uploads/ips-2025.pdf", fileName: "ips-2025.pdf", fileSize: "1.5 MB", fileFormat: "application/pdf", version: 1, description: "Investment policy statement 2025", status: "REVISION_REQUESTED" as const, uploadedById: sponsorUsers[0].id },
    { reviewId: reviews[4].id, filePath: "/uploads/ips-2025-appendix.xlsx", fileName: "ips-2025-appendix.xlsx", fileSize: "450 KB", fileFormat: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", version: 1, description: "IPS appendix - fund performance data", status: "PENDING_REVIEW" as const, uploadedById: sponsorUsers[0].id },
  ];

  for (const d of documentDefs) {
    await prisma.document.create({ data: d });
    console.log(`  + Document: ${d.fileName} (${d.status})`);
  }

  // 10. Comments
  console.log("\n── Comments ──");
  const commentDefs = [
    { reviewId: reviews[0].id, authorId: tpaUsers[0].id, content: "Please ensure the HIPAA certificate includes the latest privacy rule amendments.", isRevisionRequest: false },
    { reviewId: reviews[1].id, authorId: tpaUsers[0].id, content: "Form 5500 looks good. Approved.", isRevisionRequest: false },
    { requirementId: requirements[0].id, authorId: tpaUsers[0].id, content: "Reminder: the annual financial audit is due in 2 months. Please begin preparing.", isRevisionRequest: false },
    { reviewId: reviews[3].id, authorId: tpaUsers[1].id, content: "The draft audit report is missing the management response section. Please revise and resubmit.", isRevisionRequest: true },
    { reviewId: reviews[3].id, authorId: sponsorUsers[2].id, content: "Updated version uploaded with management responses included.", isRevisionRequest: false },
    { reviewId: reviews[4].id, authorId: tpaUsers[0].id, content: "The IPS needs to include the updated asset allocation targets for 2025.", isRevisionRequest: true },
    { requirementId: requirements[3].id, authorId: sponsorUsers[1].id, content: "We are working on the SPD update. Expected to submit by end of next week.", isRevisionRequest: false },
  ];

  for (const c of commentDefs) {
    await prisma.comment.create({ data: c });
    console.log(`  + Comment by ${c.authorId.substring(0, 8)}...`);
  }

  // 11. Notifications
  console.log("\n── Notifications ──");
  const notificationDefs = [
    { userId: sponsorUsers[0].id, type: "NEW_REQUIREMENT" as const, title: "New Requirement Assigned", message: "You have been assigned: Annual Financial Audit Report", actionRequired: true },
    { userId: sponsorUsers[0].id, type: "NEW_REQUIREMENT" as const, title: "New Requirement Assigned", message: "You have been assigned: HIPAA Compliance Certificate", actionRequired: true, readAt: new Date(now.getTime() - 5 * 86400000) },
    { userId: sponsorUsers[0].id, type: "DEADLINE_APPROACHING" as const, title: "Deadline Approaching", message: "HIPAA Compliance Certificate is due in 30 days", actionRequired: true },
    { userId: sponsorUsers[1].id, type: "NEW_REQUIREMENT" as const, title: "New Requirement Assigned", message: "You have been assigned: Summary Plan Description Update", actionRequired: true },
    { userId: sponsorUsers[2].id, type: "REVIEW_DECISION" as const, title: "Document Rejected", message: "Your Q4 audit report draft has been rejected. Please review feedback.", actionRequired: true },
    { userId: sponsorUsers[2].id, type: "FEEDBACK_RECEIVED" as const, title: "New Feedback", message: "TPA Compliance Partners left a comment on your Q4 audit review.", actionRequired: false, readAt: new Date(now.getTime() - 8 * 86400000) },
    { userId: sponsorUsers[2].id, type: "DEADLINE_APPROACHING" as const, title: "Overdue Requirement", message: "Internal Audit Report Q4 is past its due date", actionRequired: true },
    { userId: tpaUsers[0].id, type: "FEEDBACK_RECEIVED" as const, title: "Sponsor Response", message: "Acme Corporation submitted documents for HIPAA Compliance Certificate", actionRequired: true },
    { userId: tpaUsers[0].id, type: "REVIEW_DECISION" as const, title: "Revision Requested", message: "You requested a revision on the Investment Policy Statement", actionRequired: false, readAt: new Date(now.getTime() - 1 * 86400000) },
    { userId: tpaUsers[1].id, type: "FEEDBACK_RECEIVED" as const, title: "Revised Document Uploaded", message: "Initech LLC uploaded a revised Q4 audit report", actionRequired: true },
  ];

  for (const n of notificationDefs) {
    await prisma.notification.create({ data: n });
  }
  console.log(`  + Created ${notificationDefs.length} notifications`);

  console.log("\n✅ Seeding complete!\n");
}

// ─── Run ─────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
