import { NextResponse } from "next/server";

export function apiError(message: string, status: number, code = "REQUEST_ERROR"): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(data: T): NextResponse {
  return NextResponse.json(data);
}
