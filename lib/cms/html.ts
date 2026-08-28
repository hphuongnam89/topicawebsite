import "server-only";

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
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
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
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: { ...attributes, loading: "lazy", decoding: "async" },
      }),
    },
  }) as SanitizedHtml;
}

export function wordpressText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
