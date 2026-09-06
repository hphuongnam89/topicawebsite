import { headers } from "next/headers";

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };

export async function JsonLd({ data }: { data: JsonLdValue }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const serialized = JSON.stringify(data).replace(/[<>&]/g, (character) => ({
    "<": "\\u003c",
    ">": "\\u003e",
    "&": "\\u0026",
  })[character]!);

  return (
    <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />
  );
}
