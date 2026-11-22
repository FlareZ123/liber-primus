# Original typeface and source encoding gate for LP2

**Decision (Agent41, 12 November 2026; Director #481):** No original Cicada font, character map, editable PDF/PostScript, or source document was recovered in the finite historical source set below. A dated, plausible pre-release Unicode runic font preserved by the community fails an independent width-geometry test on the original p0 JPEG. Thus the font asset cannot establish Gematria Primus rune order, an LP2 key or an inverse. The missing original typeset master remains an actual missing input, rather than a reason to assume a modern community font is creator-supplied.

## Original distribution and finite source set

The pinned 2014-05-11 Stage11 service index at \`micheloosterhof/cicada-2014\`, commit \`6c3421a4d245596e403c88e037509d162a2afd17\`, is a 1,640-byte HTML file containing 58 JPEG references and no stylesheet, script, WOFF/TTF/OTF asset, PDF link or editable document. The 58 archived JPEGs are byte-identical with \`resources/liber-primus/17.jpg\` through \`74.jpg\` ([pinned Stage11 source audit](lp2-stage11-original-release-index-envelope.md)). The previous five-archive inventory there covers \`micheloosterhof/cicada-2014\`, \`iBotPeaches/cicada_3301\`, \`krisyotam/cicada3301\`, \`scream314/cicada3301\`, and \`rtkd/iddqd\`: no independently attributable original LP2 PDF or font distribution was located in their period Stage11 source set. Targeted connected GitHub code searches for fonts/TTFs in the first, second and third repos found no creator-authored asset or encoding specification; textual code search does not prove absence of unindexed binaries.

The \`rtkd/iddqd/ttf/BabelStoneRunicBeorhtnoth.ttf\` binary, copied into a later participant research archive, **does** preserve a dated old runic face: 55,556 bytes, Git blob SHA-1 \`414f3b5852438dd8450411e204aeff75adab0d42\`; embedded \`name\` entry \`Version 1.06 April 1, 2014\`, copyright \`© BabelStone, 2010-2014\`. [The font author's release page](https://www.babelstone.co.uk/Fonts/AngloSaxon.html) confirms the 2014 vintage and explains that its basic cmap uses ordinary Unicode runic codepoints. **Existence in 2014 and later collection in a Cicada archive are not creator distribution evidence.**

The [independent Dukotah original-renderer study](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round18/L1-toolchain/RESULTS.md) already measured 29 deterministic LP2 glyph classes, a Ghostscript→ImageMagick rendering hypothesis, and 11 nonmatching standard rune faces. Its distinct BabelStone comparators and typography conclusion are independent context; do not conflate its stock \`BabelStone Runic\` with the archived \`Beorhtnoth\` binary tested here. PDF files assembled later from JPEG page images have no original vector text or embedded author font.

## Frozen original-image cross-check

The original physical **p0** is archive image \`17.jpg\`, SHA-256 \`197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e\`. Its first printed line ends with exactly seven black rune glyphs \`ᚦᛄᚷᚫᚠᛄᛟ\`. At original 2400×3600 resolution, thresholding all RGB channels below 140 and extracting eight-connected dark components in x=1400..1899, y=655..794 isolates these seven glyph boxes (x,y,width,height):

\`\`\`text
ᚦ  (1450,673,34,114)
ᛄ  (1487,673,45,114)
ᚷ  (1537,673,44,114)
ᚫ  (1586,673,34,114)
ᚠ  (1641,673,34,114)
ᛄ  (1679,673,46,114)
ᛟ  (1729,673,44,114)
\`\`\`

For the **exact archived 2014 Beorhtnoth TTF**, parse its ordinary Unicode cmap and unmodified glyf outlines: \`ᛄ\` is 1,200 font units wide and \`ᚷ\` is 1,567, so \`width(ᚷ)/width(ᛄ)=1.3058333333\`. The original two \`ᛄ\` prints measure 45 and 46 pixels, versus 44 pixels for \`ᚷ\`, giving \`44/45.5=0.9670329670\`. A single horizontal/vertical font matrix cannot reconcile these ratios; the difference exceeds 0.33. Other pairs provide cross-checks: native outline \`ᚦ\` 900, \`ᚠ\` 800, \`ᛟ\` 1200 units, whereas the original ink widths are 34, 34, 44 pixels. This **excludes the candidate's unmodified Unicode outline set at one common scale**. It does not exclude individually edited glyphs, alternate OpenType shapes, or a different condensed ancestor. No such creator-selected alterations were found, so those hypothetical rescues are unproductive without a source.

The [single-file original-input gate](../sims/lp2_2014_typeface_candidate_gate_sft.py) checks the p0 image hash, first-line components, glyph sequence and two width ratios. It can additionally verify the independent archival font blob SHA-1 and cmap metrics if a local user-provided TTF path is supplied. The font binary is deliberately **not redistributed**.

## Effect on the cryptanalytic frontier

- An original 2014 full-source PDF/PostScript, included font subset, encoded TeX source, SVG glyph-path file or saved font-character mapping remains the only qualifying direct positive. A later image-only PDF or re-created font cannot authenticate the creator's character encoding.
- A font cmap establishes graphic codepoints only; it would still require an independent original source or solved-Cicada test vector to fix GP29 index order, prime weights, punctuation treatment, and any cipher serialization. The signed 2013 TCP \`BASE29 3301 → 3QO\` vector concerns ordinary integer radix representation and does not choose a font encoding ([signed-source record](../resources/external/2013-tcp-server-signed-source.md)).
- The surviving 2014 source distribution and bounded historical font hunt yield **no original key, recovered plaintext, or LP2 decoding instruction**. The original master should be sought only if an attributable contemporaneous archive or authoring export surfaces; do not resume arbitrary modern font searches.

**Director decision:** close #481 as a bounded missing-original-source result. A recovered genuine creator master would justify one independent GP29 representation test under #464; no speculative encoding/key transfer is supported today.
