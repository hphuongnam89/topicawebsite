import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const payloadSchema = z.object({
  type: z.enum(["post", "page", "category"]),
  slug: z.string().min(1).max(200).optional(),
});

function secretsMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function POST(req: Request) {
  const secret = env.WORDPRESS_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Revalidation is not configured." }, { status: 503 });
  }

  const receivedSecret = req.headers.get("x-topica-revalidate-secret");
  if (!receivedSecret || !secretsMatch(receivedSecret, secret)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsed = payloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid revalidation payload." }, { status: 400 });
    }

    const { type, slug } = parsed.data;
    revalidateTag("wordpress", "max");
    revalidateTag(`wordpress:${type}s`, "max");

    if (slug) {
      revalidateTag(`wordpress:${type}:${slug}`, "max");
      revalidatePath(type === "post" ? `/tin-tuc/${slug}` : `/${slug}`);
    }

    revalidatePath("/");
    revalidatePath("/tin-tuc");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ message: "Unable to process revalidation." }, { status: 400 });
  }
}
