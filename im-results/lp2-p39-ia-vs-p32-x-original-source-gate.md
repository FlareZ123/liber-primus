# P39 oversized red IA versus p32 GP X: source-identity gate

**Decision (14 November 2026, Director #804).** The source-marked oversized red glyph opening p39's lower text is the normal **GP29 ᛡ (IA)** in a three-rune red rubric; the fifth rune in p32's HOMEX word is **GP29 ᛉ (X)**. Their appearances invite an X association but the source symbols are different, and no authenticated Cicada instruction selects a cross-page stop, XOR, multiplication, or route. The p32→p39 X link is retired as an author-selected decipherment route. No new plaintext or key was recovered.

## Exact original material and discriminating comparison

The original 75-image resource maps physical LP2 page p to archive image `(p+17).jpg`. The original page images are `resources/liber-primus/49.jpg` (p32) and `56.jpg` (p39); original page ordering and source hashes are pinned in `resources/liber-primus/README.md` and `SHA256SUMS.txt`. Using zero-based *rune*, rather than word or pixel, offsets:

| Source | Original rune input | GP29 transliteration | Actual role |
| --- | --- | --- | --- |
| p32, local 33–43 | `ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ` | `HOMEXWDSLFD` | Post-period eleven-rune cipher word; X at local **37** is `ᛉ`, GP index **14**, ordinary prime **47**. |
| p39, local 119–121 | `ᛡᚳᛋ` | `IACS` | Three-rune red rubric; its oversized first glyph at local **119** is `ᛡ`, GP index **27**, ordinary prime **107**. |
| p39, local 119–239 | 121 GP29 runes | Undeciphered | Lower text unit after printed three black dots; the oversized initial is counted **once**, as local rune 119. |

These results follow directly from `lp2-corpus.json` page-index arrays, the `translit` and `runes` tables, and `lp2-ink-annotations.json` p39's red span `{start:119,length:3,runes:"ᛡᚳᛋ"}`. That annotation independently brackets red 13-dot marks at offsets 119 and 122. The large red initial is **the first glyph of the printed red word**, not a separate instruction glyph or an added terminal rune. The original scan makes its X-like outline visible; GP29's rune labelled X is a *different rune*, `ᛉ`. A graphical X resemblance alone cannot substitute for rune identity.

## The actual visual control and alternative

On original JPEG scans downsampled from 2400×3600 to **600×900**, isolate saturated red ink by `R>80, R>1.45G, R>1.45B, G<155, B<155`, then label 4-connected components. The p39 red first-initial component occupies **(x=150,y=463,w=58,h=125)** at that scale. Comparable oversized red initials occur at physical pages **0, 3 (twice), 6, 8, 15, 23, 27, 33 (twice), 40, 54, 56, 57**. All start at x=150 or 151 and have heights 123–125, apart from the larger final p57 151-pixel initial. P39 belongs to the same graphic/layout family (x150, h125). This gives an independent original-artifact explanation for its enlargement: a **decorative red rubric initial**. It does not prove the creator lacked a second intended meaning.

The true p39 lower length **121** equals p32's full **121**-rune page length; that source-fixed dimension remains a legitimate observation from closed #803. The independent original-data frequency comparison already supplied on #804 shows that even a direct 11×11 rearrangement with a secret one-to-one rune substitution fails the necessary sorted 29-symbol frequency multiset. This does not rule out a different cipher, but a fresh transposition or compass sweep is unjustified by the X-like shape.

The primary 2016 signed Cicada message says Liber Primus's words are the map, their meaning the road and their numbers the direction. It does not identify either `ᛡ` or `ᛉ` as a stop/crossing/operation or link these two physical pages. The finite primary 2012–2016 source audit in `im-results/lp2-p32-compass-53-primary-source-selector-gate.md` also found no author-defined 5/3 compass order; the p32 HOMEX endpoint failed its original-data familywise control (`im-results/lp2-p32-home-wordstart-english-prefix-familywise.md`).

## Completion and decision

The direct *same-X* premise fails at the level of original symbols, before cipher modeling. The p39 red IA is a source-visible subordinate rubric/heading and may still matter as **IA**, a printed red marker, or a chapter-state boundary if an independent authorial rule is found. No existing primary witness supplies the proposed cross-page relation or its reversible operation. Close #804 under the original issue's stop criterion. Do not resurrect the p32 five-byte compass or optimize X-as-XOR/route parameters based solely on glyph resemblance.

**Sources:** `resources/liber-primus/49.jpg`, `56.jpg`, `lp2-corpus.json`, `lp2-ink-annotations.json`; `im-results/lp2-global-original-visual-section-map.md`; [#804 source/frequency handoff](https://github.com/FlareZ123/liber-primus/issues/804); [#799 primary source gate](https://github.com/FlareZ123/liber-primus/issues/799); [2016 source wording assessment](2016-word-map-book-coordinate-gate.md).
