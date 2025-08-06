import { TopicalMapEntry } from "@db/client";
import { getSlicePrompt } from "./base-prompts";
import { isSliceEnabled } from "src/shared/config/sliceConfig";

export const pillarSystemPrompt = `
# Pillar System Prompt v2 (Compact) - Prismic Slice Optimized

Je bent een ervaren contentstrateeg en SEO-expert. Schrijf een diepgaande, gezaghebbende Pillar Page als centrale hub van een topical cluster, in gestructureerde Markdown die optimaal geconverteerd kan worden naar Prismic slices. De toon is informatief, empowerend en transparant.

**Markdown Structuur voor Prismic Parsing:**
- H1 met primair zoekwoord, sterke hook in de intro (probleem, verlangen, trend), korte samenvatting en uitnodiging tot verder lezen.
- Sticky inhoudsopgave met links naar alle H2's.
- Duidelijke hiërarchie van H2/H3's. Elke (sub)sectie start met een inleiding (4-6 zinnen, context/storytelling/praktijkvoorbeeld).
- Als een subsectie meerdere sub-subsecties (H3's) bevat, benoem in de inleidende paragraaf van de subsectie kort en in lopende tekst (geen lijst) welke onderwerpen/onderdelen (de H3's) behandeld gaan worden. Je mag belangrijke punten vetgedrukt maken voor scanbaarheid.
- Maak subsecties langer en dieper door elke subsectie te starten met een uitgebreide inleiding (4-6 zinnen) en storytelling of praktijkvoorbeelden te verwerken.
- Korte alinea's (max 3-4 zinnen), strategisch gebruik van lijsten, voldoende witruimte.

${getSlicePrompt()}

**Content-elementen:**
- Per subsectie max 1-2: alleen de hierboven beschikbare slice types gebruiken. Alleen als ze echt waarde toevoegen.
- Gebruik specifiek de juiste slice voor elk type content:
  ${isSliceEnabled('pros_cons') ? '- **pros-cons slice** voor ALLE voor-/nadeel content' : ''}
  ${isSliceEnabled('checklist') ? '- **checklist slice** voor praktische stappen en overzichten' : ''}  
  ${isSliceEnabled('tips') ? '- **tips slice** voor praktische adviezen' : ''}
  ${isSliceEnabled('dos_donts') ? '- **dos-donts slice** voor do\'s & don\'ts lijsten' : ''}
  ${isSliceEnabled('table') ? '- **table slice** voor vergelijkingen en gestructureerde data' : ''}
  ${isSliceEnabled('notification') ? '- **notification slice** voor belangrijke tips, waarschuwingen of call-outs' : ''}
  ${isSliceEnabled('quote') ? '- **quote slice** voor citaten en testimonials' : ''}
  ${isSliceEnabled('call_to_action') ? '- **call-to-action slice** voor acties die de lezer moet ondernemen' : ''}

- Elk element krijgt een korte inleiding, afsluiting en verbindende tekst. Gebruik H3's als er meerdere elementen zijn.
- Definieer vaktermen kort en duidelijk.
- Checklists alleen als uniek/praktisch overzicht, max 1 per hoofdsectie (tenzij aantoonbaar nodig), altijd met motivatie.

**Samenhang & SEO:**
- Gebruik verbindende tekst tussen blokken om de leesflow te behouden en context te bieden. Overgangen mogen nooit abrupt zijn.
- Logische overgangen, verbindende tekst tussen blokken, verwijzingen naar cluster/support content.
- Semantische zoekwoorddekking, natuurlijke interne links, geen keyword stuffing.
- Benoem waar Massive Online Marketing-expertise essentieel is (objectief, niet verkoperig).
- Gebruik blog-link slices voor interne verwijzingen naar gerelateerde content.

**Kwaliteitscontrole:**
- Check of alle instructies zijn gevolgd, slice markers correct gebruikt zijn, geen overlap is, en de tekst >2500 woorden is. Score <9/10? Verbeter.
- Zorg dat elke slice marker correct geformatteerd is en parseerbaar is.
- Gebruik normale markdown (headings, paragrafen, lijsten) voor de hoofdcontent en speciale slice markers alleen voor bijzondere elementen.

`;


export function generatePillarUserPrompt(entry: TopicalMapEntry): string {
  return `
**Onderwerp:** "${entry.titelPagina}"

**Primair zoekwoord:** "${entry.belangrijksteZoekwoorden.join(', ')}"

**Kernonderwerp:** ${entry.kernonderwerp}

**Samenvatting:** ${entry.sammenvatting}

**Inhoudsopgave:**  
${entry.inhoudsopgave?.replace(/<br\s*\/?\>/gi, '\n')}

**Interne links (cluster):**
${entry.linktNaarCluster.map(link => `- ${link}`).join('\n')}

**Interne links (support):**
${entry.linktNaarSupport.map(link => `- ${link}`).join('\n')}

**Tools/case studies:**
${entry.linktNaarTools.map(link => `- ${link}`).join('\n')}

**Bestaande pagina's:**
${entry.linktNaarBestaande.map(link => `- ${link}`).join('\n')}

**Doelgroep:** algemeen publiek (van beginners tot professionals). Pas de toon, complexiteit en voorbeelden aan op hun kennisniveau en pijnpunten.

**Specifieke SEO-instructies voor deze Pillar Page:**
- Primair Zoekwoord Integratie: Integreer het primaire zoekwoord natuurlijk en prominent door de tekst heen, vooral in de H1-titel, introductie en belangrijke H2-koppen. Voorkom zoekwoord stuffing.
- Interne Linking (Uitgaand van Pillar): Gebruik de bovenstaande links als natuurlijke uitgaande interne links met beschrijvende en zoekwoordrijke anchor text.
- Meta Description Generatie: Schrijf 3 overtuigende meta descriptions (elk onder 160 tekens) voor deze Pillar Page. Elke beschrijving moet het hoofdzoekwoord bevatten en gebruikers verleiden om te klikken.

**Structuur- en contentinstructies met Prismic Slice Markers:**
- Gebruik maximaal 1-2 speciale content-elementen per subsectie (${[
  isSliceEnabled('notification') && 'notification slices',
  isSliceEnabled('pros_cons') && 'pros-cons slices',
  isSliceEnabled('checklist') && 'checklists',
  isSliceEnabled('tips') && 'tips',
  isSliceEnabled('dos_donts') && "do's & don'ts",
  isSliceEnabled('table') && 'tabellen',
  isSliceEnabled('accordion') && 'accordions',
  isSliceEnabled('quote') && 'quotes',
  isSliceEnabled('call_to_action') && 'call-to-actions',
].filter(Boolean).join(', ')}), en plaats deze bij voorkeur aan het einde van de subsectie.
${isSliceEnabled('pros_cons') ? "- Voor alle voor-/nadeel content gebruik ALTIJD de pros-cons slice: ':::pros-cons'" : ''}
${isSliceEnabled('checklist') ? "- Voor praktische stappen en overzichten gebruik checklist slices: ':::checklist'" : ''}
${isSliceEnabled('tips') ? "- Voor praktische adviezen gebruik tips slices: ':::tips:numbered'" : ''}
${isSliceEnabled('dos_donts') ? "- Voor do's & don'ts gebruik: ':::dos_donts'" : ''}
${isSliceEnabled('table') ? "- Voor vergelijkingen en data gebruik table slices: ':::table'" : ''}
${isSliceEnabled('notification') ? "- Voor belangrijke tips, waarschuwingen of call-outs gebruik notification slices: ':::notification:default'" : ''}
${isSliceEnabled('accordion') ? "- Voor FAQ-achtige content gebruik accordion slices: ':::accordion'" : ''}
${isSliceEnabled('quote') ? "- Voor citaten en testimonials gebruik quote slices: ':::quote:highlight'" : ''}
${isSliceEnabled('call_to_action') ? "- Voor call-to-actions gebruik: ':::call-to-action:primary'" : ''}
- Voor visuele elementen gebruik image placeholders: ':::image:default'
- Voor interne links naar gerelateerde blog posts gebruik: ':::blog-link:/blog/slug'
- Kies bewust welke slice-elementen het meeste waarde toevoegen aan de uitleg; niet elk element hoeft altijd gebruikt te worden.
- Voeg altijd verbindende tekst toe tussen de blokken voor rust en context; overgangen mogen nooit abrupt zijn.
- Maak subsecties langer en dieper met uitgebreide inleidingen (4-6 zinnen) en storytelling of praktijkvoorbeelden.
- Gebruik H3's voor elk content-element als een subsectie meerdere elementen bevat, met per H3 een eigen inleidende paragraaf en afsluiting.
- Gebruik EXTRA bullet lists (met - of *) voor opsommingen, stappen, tips, etc. Behoud de leesbaarheid en kort geen aleanas af.
- Zorg dat de content logisch inhaakt op eerdere of latere onderdelen van de blog, zodat het geheel samenhangend en overzichtelijk blijft.
- Werk praktijkvoorbeelden uit tot mini-case studies met probleem, aanpak en resultaat, waar relevant.

**Lengte:** Streef naar 3000-5000 woorden, met een minimum van 2500 woorden.
`.trim();
}