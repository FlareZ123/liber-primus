# Period rune compositor input-grammar gate (issue #2682)

## Decision

A genuinely period-native grammar exists, but no independent evidence selects it as the LP2 cipher/input mapping. Close this bounded investigation at the missing discriminator; do not reinterpret font slots as cryptanalytic symbols or rerun the font-outline sweep (#2673).

## Executed control

Candidate: Carl-Gustav Werner, allrunes v2.1, 2004-01-06; [period documentation](https://www.sys.kth.se/docs/texlive/texmf-dist/doc/fonts/allrunes/allrunes.pdf). Installed TeX Live package files identify this exact version. Local allrunes.sty SHA256 4c93f631aba350b8bf75db08e52e520762b53cc39b5a0097975c45e235cd3f8d; ara.fd SHA256 1ae41eb82ff615c65df6bbfc16aaee81898f56a217ce55495e24e633205a840b. The manual's graphical PDF screenshot endpoint was unavailable; inspect the installed original package's source and actual compiled DVI instead.

Run fixture ../sims/lp2_allrunes_2004_input_grammar_sft.tex with latex, dvitype -output-level=2, dvips, then Ghostscript rasterization. Actual local execution succeeded through all four stages, including 826 x 1169 grayscale raster at 100 dpi. Modern LaTeX already defines swdefault, so the fixture resets only that control sequence before package load; the initial unshimmed run failed. This is a modern engine running period package sources, not a historical engine fingerprint reproduction.

DVI glyph codes, omitting kern and movement commands:
- documented-style fu\th{}orcgwh: 102 117 254 111 114 99 103 119 104 (9 glyphs).
- literal th ng oe ae ea io ia: 116 104 110 103 111 101 97 101 101 97 105 111 105 97 (14 glyphs).
- native explicit thorn, ng, oe, ae, ea: 254 173 247 230 196 (5 glyphs).
- separator fixture: 102 117 46 111 114 99 58 103 119 104 59 110 105 60 106 61 112.
- native main sequence: 102 117 254 111 114 99 103 119 104 110 105 106 73 112 120 115 116 98 101 109 108 173 100 247 97 230 121 196 (28 glyphs).

## Discriminating evidence

The published Anglo-Frisian main sequence has 28 entries and orders d before oe. GP has 29 entries, orders OE before D, and distinguishes IA/IO from J. The standard sequence lacks a separately named IOR/IA/IO entry, although the font has additional shapes/variants that could be deliberately assigned. No automatic digraph conversion exists for the tested pairs. The actual ara.fd assigns explicit macros and multiple flipped variants; a native slot permutation is therefore not forced by the GP chart.

The supplied native dot/doubledot/tripledot/quaddot/pentdot commands emit single font slots 46,58,59,60,61. They do not supply stock 13-dot or 23-dot macros. These LP-specific signs could be built with custom commands or imported artwork; this is not an impossibility result for a customized TeX document.

Known LP2 production-chain compatibility with PostScript/Ghostscript is not sufficient to choose this package's encoding. Independent #2673 font comparison already found no match to the tested allrunes variants. No observed original source token, macro convention, or slot remnant identifies a particular custom 29-entry mapping. A manufactured mapping followed by decrypting a rubric would add free choices, not test a prediction. Reopen only on independently selected source/macro/encoding evidence; no new plaintext or authentic key is claimed.
