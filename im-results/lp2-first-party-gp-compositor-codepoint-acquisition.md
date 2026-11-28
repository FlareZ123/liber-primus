# First-party Gematria Primus compositor / codepoint acquisition gate

**Agent16, 28 November 2026 — Director #3338. Decision: no first-party editable compositor, font cmap, keyboard map, or codepoint serialization is present in the strongest reachable period source package. The only contemporaneously committed original GP artifact is the signed raster JPEG itself. Later Unicode/font tables remain participant reconstructions and cannot select a new raw-codepoint cipher alphabet.**

This report extends the #3138 input-identifiability result by inspecting the historical Git provenance of the strongest named source archives rather than re-running font matching or Unicode arithmetic.

## Contemporaneous source package: micheloosterhof/cicada-2014

`micheloosterhof/cicada-2014` was created **2014-01-10 12:05:58Z**, during the live puzzle. This makes it qualitatively different from later retrospective archives.

The key commit is:

`391ad9908eeecb3ae90cdae4357ab787d3bc2bdb` — 2014-01-10 15:43:50Z  
message: **"add gematria primus (is original, you can outguess it and see pgp sig)"**

Its commit diff adds exactly one file:

`stage4/gematria-primus.jpg`

Git blob SHA-1: `412ecb2225a9485375981a864896a85da06e2cba`  
size: **53,549 bytes**

The entire tree at that commit contains puzzle JPEGs, OutGuess payloads, text/HTML captures, the server-status capture and derived matrix data. There is no TTF/OTF/WOFF, SFD, PostScript/EPS/PDF, TeX, SVG, font map, AFM/PFB/PFA, keyboard map, XKB file, editable vector source, or authoring project adjacent to the GP image.

The later 2014 period tree at `b1d7412afae69e4109223dd8561ae57b73ac4798` has 190 tracked objects. A typed path census for editable/font/input extensions and names such as `gematria`, `rune`, `font`, `keyboard`, and `keymap` leaves only:

- `stage04/gematria-primus.jpg` — the same 53,549-byte original raster object;
- `stage11/56.runes` — a solver transcription introduced after LP2 release.

No editable GP source appears in that period tree.

The May 2014 Stage11 release commit likewise distributes the Liber Primus as JPEG page objects and HTML/listing material. This agrees with the earlier publication-envelope audit: no source PDF, embedded author font, stylesheet font, or editable manuscript object was distributed with LP2.

### What this proves and what it does not

This does **not** prove the creator never had an editable master. It establishes that the strongest surviving contemporaneous solver mirror preserved the authentic GP chart only as the signed raster object, and that no creator-side codepoint/compositor asset entered its live-puzzle Git history at the points where the chart and LP2 were archived.

Therefore the raster glyph sequence authenticates **GP order and prime assignments as printed**, but does not authenticate Unicode scalars, keyboard positions, font glyph IDs, or a raw input serialization.

## Later archive candidates are preservation sources, not creator encoding witnesses

Repository creation dates from GitHub metadata:

| Repository | Created | Provenance consequence |
| --- | --- | --- |
| `micheloosterhof/cicada-2014` | **2014-01-10** | contemporaneous; strongest package |
| `rtkd/iddqd` | 2017-01-04 | retrospective |
| `scream314/cicada3301` | 2018-01-24 | retrospective |
| `Hadyn/cicada` | 2018-07-01 | retrospective |
| `neuroretransmit/cicada` | 2022-12-22 | reconstruction/archive |
| `iBotPeaches/cicada_3301` | 2024-01-20 | modern tooling/archive |

The old-looking files inside these later repositories can still preserve period bytes, but their Git creation dates do not establish that a Unicode or font mapping was used by Cicada.

The one dated runic font already isolated by the prior font-source gate, `BabelStoneRunicBeorhtnoth.ttf` (embedded version 1.06, 2014-04-01), is a third-party font later collected by participants. It is independently excluded as the unmodified LP renderer by the original p0 width geometry. Its cmap is consequently not an authored GP input mapping.

Likewise, participant rune lookup scripts are explicit reconstructions. The neuroretransmit `gematriaprimus.py` comments that its author chose one rune convention relative to another repository; that is evidence of community serialization ambiguity, not of a hidden creator alphabet.

## Search envelope and negative result

Targeted public source searches were run for combinations of `Gematria Primus` / Cicada with TTF, OTF, TeX, SVG, PostScript, font, keyboard and mapping terms. No pre/early-2014 first-party editable source surfaced. Current hits resolve to later documentation, modern rendering assets, retrospective fonts, or participant code.

This search is intentionally not treated as proof of global absence. The acquisition result is bounded to named public archives and indexed source. The missing artifact classes remain:

1. creator-side editable GP chart/manuscript source;
2. original font or subset with cmap/glyph IDs;
3. TeX/PostScript/PDF text objects retaining encoded character strings;
4. keyboard/input/transliteration map used to compose the runes;
5. build script or font-feature map connecting typed input to the printed GP glyphs;
6. a signed first-party worked example that binds raw input codes to multiple GP runes.

## Cryptanalytic consequence

#3138 already demonstrated why this source matters: two community Unicode conventions can change hundreds of raw scalar values while leaving every GP29 index unchanged, and naive Unicode-mod-29 is non-bijective. The new provenance audit removes the strongest remaining route for promoting one of those conventions: **the contemporaneous source package contains no such mapping.**

Accordingly:

- GP29 ordinal/prime structure remains the only authenticated machine representation supplied by the puzzle.
- Raw Unicode scalar arithmetic, Unicode-rank permutations, keyboard coordinates, and later font cmap values remain analyst/community choices.
- No new reversible numeric alphabet is source-selected, so none should be fit to unknown LP2 ciphertext.
- A future positive must include internal mapping data that reproduces a multi-rune original GP string or chart sequence before it earns an unknown-page decoder test.

**Decision:** close #3338 as a bounded acquisition negative. Reopen only on recovery of a creator-attributable editable/vector/font/input artifact or signed worked serialization, not another visual font match or later transcription table.

Related existing evidence:
- `im-results/lp2-original-font-source-gate.md` — font/source and #3138 input-identifiability gates.
- `sims/lp2_input_encoding_ambiguity_sft.cjs` — exact Unicode-convention ambiguity reproducer.
- `im-results/lp2-stage11-original-release-index-envelope.md` — original Stage11 publication envelope.
