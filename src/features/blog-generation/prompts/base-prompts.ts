import { isSliceEnabled } from "src/shared/config/sliceConfig";

export function getSlicePrompt(): string {
  return `
**Beschikbare Slice Markers voor Prismic:**

${isSliceEnabled('notification') ? `**1. Notification Slices (belangrijke informatie, tips, waarschuwingen):**
"""
:::notification:default
**Belangrijke Tip:** [korte krachtige titel]

[Content in markdown met paragrafen en lijsten]
:::
"""

Variaties: ":default" (grijs), ":base100" (huisstyle), ":purple" (paars), ":orange` : ''}

${isSliceEnabled('accordion') ? `**2. Accordion/FAQ Slices:**
"""
:::accordion
## [Vraag of titel 1]
[Antwoord content in markdown]

## [Vraag of titel 2] 
[Antwoord content in markdown]
:::
"""` : ''}

${isSliceEnabled('pros_cons') ? `**3. Pros/Cons Slices (voor alle voor-/nadeel content):**
"""
:::pros-cons
**Voordelen van [onderwerp]:**
- [Voordeel 1]
- [Voordeel 2]
- [Voordeel 3]

**Nadelen van [onderwerp]:**
- [Nadeel 1]
- [Nadeel 2]
- [Nadeel 3]
:::
"""` : ''}

${isSliceEnabled('checklist') ? `**4. Checklist Slices (voor praktische stappen en overzichten):**
"""
:::checklist
**[Titel van checklist]**

[Optionele beschrijving]

- [Checklist item 1]
- [Checklist item 2]
- [Checklist item 3]
:::
"""` : ''}

${isSliceEnabled('tips') ? `**5. Tips Slices (voor praktische tips en adviezen):**
"""
:::tips:numbered
**[Titel van tips sectie]**

## [Tip titel 1]
[Tip uitleg]

## [Tip titel 2]
[Tip uitleg]
:::
"""

Variaties: ":default", ":numbered" (genummerd), ":bulleted" (bullets)` : ''}

${isSliceEnabled('dos_donts') ? `**6. Do's & Don'ts Slices:**
"""
:::dos-donts
**SEO Do's:**
- [Do item 1]
- [Do item 2]

**SEO Don'ts:**
- [Don't item 1]
- [Don't item 2]
:::
"""` : ''}

${isSliceEnabled('table') ? `**7. Table Slices (voor vergelijkingen en data):**
"""
:::table
**[Tabel titel]**

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
:::
"""` : ''}

${isSliceEnabled('quote') ? `**8. Quote Slices:**
"""
:::quote:highlight
> [Quote tekst hier]

**— [Auteur naam]**, [Functie/titel]
:::
"""

Variaties: ":default", ":highlight", ":testimonial"` : ''}

${isSliceEnabled('call_to_action') ? `**9. Call-to-Action Slices:**
"""
:::call-to-action:primary
**[CTA titel]**

[CTA beschrijving]

[Button: Tekst|/link]
:::
"""

Variaties: ":default", ":primary", ":secondary"` : ''}

**10. Visual/Image Placeholders:**
"""
:::image:default
![Alt text beschrijving van afbeelding](https://via.placeholder.com/800x600/E5E7EB/374151?text=BESCHRIJVING)
:::
"""

Variatie: ":imageWithBorder" voor afbeeldingen met border

**11. Dividers (visuele scheiding):**
"""
:::divider
:::
"""

**12. Blog Link References:**
"""
:::blog-link:/blog/slug-van-gerelateerde-post
[Link tekst die getoond wordt]
:::
"""
`.trim();
}