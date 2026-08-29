import sanitizeHtml from "sanitize-html";

declare const sanitizedHtmlBrand: unique symbol;

export type SanitizedHtml = string & { readonly [sanitizedHtmlBrand]: true };

const allowedTags = [
  "p",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "br",
  "hr",
  "span",
  "div",
  "sup",
  "sub",
  "code",
  "pre",
];

const httpsImageHosts = new Set(["topicauni.edu.vn", "nbs.edu.vn"]);

function isDiscardedImage(src?: string): boolean {
  if (!src) return false;

  try {
    const { hostname } = new URL(src);
    return hostname === "static.xx.fbcdn.net" || hostname.endsWith(".fbcdn.net");
  } catch {
    return false;
  }
}

function normalizeImageSrc(src?: string): string | undefined {
  if (!src) return src;

  try {
    const url = new URL(src);
    if (url.protocol === "http:" && httpsImageHosts.has(url.hostname)) {
      url.protocol = "https:";
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}

export function sanitizeWordPressHtml(value: string): SanitizedHtml {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {
      "*": ["class", "id", "aria-label", "aria-hidden", "role"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding", "srcset", "sizes"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === "img" && isDiscardedImage(frame.attribs.src),
    transformTags: {
      a: (_tagName, attributes) => {
        const href = attributes.href ?? "";
        const isExternal = /^https:\/\//i.test(href);

        return {
          tagName: "a",
          attribs: {
            ...attributes,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
      img: (_tagName, attributes) => {
        const src = normalizeImageSrc(attributes.src);

        return {
          tagName: "img",
          attribs: { ...attributes, ...(src ? { src } : {}), loading: "lazy", decoding: "async" },
        };
      },
    },
  }) as SanitizedHtml;
}

export function wordpressText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
