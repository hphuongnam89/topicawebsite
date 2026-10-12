# Font sources

Downloaded on 2026-10-12 from the official Google Fonts repository:

- [Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro): Regular 400, Medium 500, SemiBold 600, Bold 700.
- [Lora](https://github.com/google/fonts/tree/main/ofl/lora): upright variable font, weights 400–700.

The unmodified font files retain their accompanying SIL Open Font License files.
`app/layout.tsx` loads these files using `next/font/local`, so builds do not need
to fetch Google Fonts. The families, CSS variables and `display: swap` remain
the same. File hashes are recorded in the overnight evidence manifest. No new
font family or external runtime provider is introduced.
