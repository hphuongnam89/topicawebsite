type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };

export function JsonLd({ data }: { data: JsonLdValue }) {
  const serialized = JSON.stringify(data).replace(/[<>&]/g, (character) => ({
    "<": "\\u003c",
    ">": "\\u003e",
    "&": "\\u0026",
  })[character]!);

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />
  );
}
