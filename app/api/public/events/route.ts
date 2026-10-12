import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/security/request";
import { readBoundedJson, BodyLimitError } from "@/lib/http/read-json";
import { recordAnalyticsEvent } from "@/lib/services/cms-models";

const eventSchema=z.object({eventName:z.enum(["cta_click","search"]),pagePath:z.string().max(2048),button:z.enum(["admission","consultation","program","contact"]).optional()}).strict();
export async function POST(request:Request) {
  if(!isSameOrigin(request))return NextResponse.json({success:false},{status:403});
  try {
    const data=eventSchema.safeParse(await readBoundedJson(request,4096));
    if(!data.success)return NextResponse.json({success:false},{status:422});
    recordAnalyticsEvent({...data.data,metadata:data.data.button?{button:data.data.button}:undefined});
    return NextResponse.json({success:true});
  }catch(error){return NextResponse.json({success:false},{status:error instanceof BodyLimitError?413:400});}
}
