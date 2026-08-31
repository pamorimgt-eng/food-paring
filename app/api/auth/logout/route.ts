import { NextResponse } from "next/server";
import { terminarSessao } from "@/lib/auth";

export async function POST() {
  await terminarSessao();
  return NextResponse.json({ ok: true });
}
