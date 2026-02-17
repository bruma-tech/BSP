import { NextResponse } from "next/server";
import { commentSchema } from "@/lib/validation/commentSchema";

export async function POST(req: Request) {
    console.log("========== COMMENT API HIT ==========");

    try {
        const body = await req.json();
        console.log("Incoming Comment Data:");
        console.log(body);

        const parsed = commentSchema.safeParse(body);
        if (!parsed.success) {
            console.log("Comment Validation Failed");
            const errors = parsed.error.issues.map(issue => ({
                field: issue.path[0],
                message: issue.message
            }));
            console.log(errors);
            return NextResponse.json(
                { success: false, errors },
                { status: 400 }
            );
        }
        console.log("Comment Validation Passed");
        return NextResponse.json({
            success: true,
            message: "Comment stored successfully (mock)",
            data: parsed.data
        });

    } catch (err) {
        console.log("Server Error:", err);
        return NextResponse.json(
            { success: false, message: "Invalid JSON" },
            { status: 500 }
        );
    }
}