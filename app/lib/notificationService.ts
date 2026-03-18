import prisma from "@/app/lib/prisma";
import type { NotificationType } from "@/src/generated/prisma/enums";
import { notifyUser } from "@/app/lib/pgNotify";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionRequired?: boolean;
}


export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionRequired: input.actionRequired ?? false,
    },
  });

  notifyUser(input.userId, {
    type: "notification",
    payload: {
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      actionRequired: notification.actionRequired,
      read: false,
      createdAt: notification.createdAt.toISOString(),
    },
  }).catch((err) => console.error("pgNotify failed:", err));
}


export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  if (inputs.length === 0) return;
  await Promise.all(inputs.map((input) => createNotification(input)));
}


/** TPA creates a requirement → notify every assigned sponsor. */
export async function notifyNewRequirement(
  requirementId: string,
  requirementTitle: string,
  dueDate: Date | null,
  assignedSponsorIds: string[]
): Promise<void> {
  if (assignedSponsorIds.length === 0) return;

  const sponsors = await prisma.sponsor.findMany({
    where: { id: { in: assignedSponsorIds } },
    select: { userId: true },
  });

  const dueDateStr = dueDate
    ? ` Due: ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
    : "";

  await createNotifications(
    sponsors.map((s) => ({
      userId: s.userId,
      type: "NEW_REQUIREMENT" as NotificationType,
      title: "New Requirement Assigned",
      message: `"${requirementTitle}" has been assigned to you.${dueDateStr}`,
      actionRequired: true,
    }))
  );
}

/** TPA approves a document → notify the sponsor. */
export async function notifyDocumentApproved(
  sponsorUserId: string,
  requirementTitle: string,
  documentName: string
): Promise<void> {
  await createNotification({
    userId: sponsorUserId,
    type: "REVIEW_DECISION" as NotificationType,
    title: "Document Approved",
    message: `"${documentName}" for requirement "${requirementTitle}" has been approved.`,
    actionRequired: false,
  });
}

/** TPA rejects a document → notify the sponsor. */
export async function notifyDocumentRejected(
  sponsorUserId: string,
  requirementTitle: string,
  documentName: string
): Promise<void> {
  await createNotification({
    userId: sponsorUserId,
    type: "REVIEW_DECISION" as NotificationType,
    title: "Document Rejected — Action Required",
    message: `"${documentName}" for requirement "${requirementTitle}" was rejected. Please resubmit.`,
    actionRequired: true,
  });
}

/** TPA leaves a comment / revision request → notify the sponsor. */
export async function notifyFeedbackFromTPA(
  sponsorUserId: string,
  requirementTitle: string,
  isRevisionRequest: boolean
): Promise<void> {
  await createNotification({
    userId: sponsorUserId,
    type: "FEEDBACK_RECEIVED" as NotificationType,
    title: isRevisionRequest ? "Revision Requested" : "New Comment from TPA",
    message: isRevisionRequest
      ? `A revision has been requested on your submission for "${requirementTitle}".`
      : `The TPA has left a comment on your submission for "${requirementTitle}".`,
    actionRequired: isRevisionRequest,
  });
}

/** Sponsor submits / resubmits a document → notify the TPA. */
export async function notifyDocumentSubmitted(
  tpaUserId: string,
  sponsorName: string,
  requirementTitle: string,
  isResubmission: boolean
): Promise<void> {
  await createNotification({
    userId: tpaUserId,
    type: "FEEDBACK_RECEIVED" as NotificationType,
    title: isResubmission ? "Document Resubmitted" : "New Document Submitted",
    message: isResubmission
      ? `${sponsorName} has resubmitted a document for "${requirementTitle}". Review required.`
      : `${sponsorName} submitted a new document for "${requirementTitle}". Review required.`,
    actionRequired: true,
  });
}

/** Sponsor leaves a comment → notify the TPA. */
export async function notifyCommentFromSponsor(
  tpaUserId: string,
  sponsorName: string,
  requirementTitle: string
): Promise<void> {
  await createNotification({
    userId: tpaUserId,
    type: "FEEDBACK_RECEIVED" as NotificationType,
    title: "New Comment from Sponsor",
    message: `${sponsorName} left a comment on the review for "${requirementTitle}".`,
    actionRequired: false,
  });
}