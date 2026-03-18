import { verifySession } from "@/app/lib/dal";
import { NextResponse } from "next/server";
import { Client } from "pg";


export const dynamic = "force-dynamic";

export async function GET() {
  const { isAuthenticated, user } = await verifySession();
  if (!isAuthenticated || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const channel = `notif:user:${user.id}`;
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

  const encode = (data: object) =>
    new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await pgClient.connect();
        await pgClient.query(`LISTEN "${channel}"`);

        pgClient.on("notification", (msg) => {
          if (msg.channel === channel && msg.payload) {
            try {
              controller.enqueue(encode({
                type: "notification",
                payload: JSON.parse(msg.payload),
              }));
            } catch {}
          }
        });

        pgClient.on("error", () => {
          try { controller.close(); } catch {}
        });

        controller.enqueue(encode({ type: "connected" }));
      } catch (err) {
        console.error("SSE pg connect error:", err);
        controller.close();
      }
    },

    async cancel() {
      try {
        await pgClient.query(`UNLISTEN "${channel}"`);
      } catch {} finally {
        await pgClient.end().catch(() => {});
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}