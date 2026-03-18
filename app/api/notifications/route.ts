import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const { isAuthenticated, user } = await verifySession();
  if (!isAuthenticated || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return NextResponse.json({
      success: true,
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        actionRequired: n.actionRequired,
        read: !!n.readAt,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest) {
  const { isAuthenticated, user } = await verifySession();
  if (!isAuthenticated || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, id } = await req.json() as { action: string; id?: string };

    if (action === "mark_read") {
      if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
      await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { readAt: new Date() } });
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
      return NextResponse.json({ success: true });
    }

    if (action === "clear") {
      if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
      await prisma.notification.deleteMany({ where: { id, userId: user.id } });
      return NextResponse.json({ success: true });
    }

    if (action === "clear_all") {
      await prisma.notification.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ success: false, message: "Failed to update notifications" }, { status: 500 });
  }
}