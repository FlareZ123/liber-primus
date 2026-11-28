# A complete 2012 Mayan-banner/title cue ablation, and its LP2 receiver limit

**Decision for #3321 (28 November 2026):** One fully bounded, authentic 2012 solved-stage receiver is reproducible from a documented visible numeric cue. It recovers the **entire 12,385-character archived 2012 Reddit ciphertext**, not just a four-word crib. The analogous original LP2 receiver remains **unselected**: no independently authored pair of a numeric prefix chart and its longer same-alphabet key string has been identified in LP2. This finding is about the *selection mechanism*, not previously unknown LP2 plaintext.

## Independent historical source and the clue

The contemporary, first-person [ClevCode account, originally published 13 January 2012](https://clevcode.org/cicada-3301/), documents the Reddit original title `a2e7j6ic78h0j7eiejd0120`, a Mayan numerical banner, and ciphertext lines. The later [neuroretransmit/cicada archive](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/003-subreddit), pinned to **ade9a02889ef8acbc8cde8edbfd0a785c369f4c3** (2024 archive commit), provides the complete **185 nonempty lines** as `ciphertext.txt` (Git blob `785e7d964770a07d99d11934f129ab1ee4f98aad`) and an independently archived `plaintext.txt` (Git blob `da595691468ae514686ac693ac6ee70411fb06ec`). This is a community archive of original puzzle posts, not an independently PGP-signed text transcript. The contemporary account reproduces its first two ciphertext lines and the matching English and independently corroborates the core method.

The source-visible banner gives **13 numbers**:
`10 2 14 7 19 6 18 12 7 8 17 0 19`.

Reading the 23-character title as base-20 single digits (0–9 literal, a–j = 10–19) reproduces **all 13 banner entries in order**, then continues deterministically:
`10 2 14 7 19 6 18 12 7 8 17 0 19 7 14 18 14 19 13 0 1 2 0`.

Thus the banner *selects a numerical interpretation of a longer visible string* without guessing a high-entropy key. It does **not** by itself state subtract rather than add, establish per-line reset, or prove that all historical posted lines were authored by the same actor. The historical `Verify: 7A35090F` supplies a PGP verification identifier for signed messages, not a signature over every Reddit post.

## Controlled ablations and complete receiver

Let `K` be the 23 numbers above. At letter position `i` on each original printed line, decrypt `P_i = (C_i-K_{i mod 23}) mod 26` with A=0; preserve punctuation, spaces, and capitalization, and **reset the letter clock at the next printed line**. The reset is recovered from the complete English result, not commanded by the numeric banner. The data are a full original input and independently preserved full plaintext, not a selected LP2 crib.

| Receiver on 12,385 source characters | Full characters correct, case-insensitive | Letters correct of 9,526 |
| --- | ---: | ---: |
| Base-20 title key, subtract, reset at each line | **12,385** | **9,526** |
| Same key and sign, continuous clock across lines | 3,846 | 987 |
| Title letters as a=0 instead of a=10, same reset/sign | 7,370 | 4,511 |
| Title ASCII values mod 26, same reset/sign | 2,859 | 0 |
| Base-20 key, opposite sign, same reset | 4,320 | 1,461 |

The independent graphic is a genuine discriminator for the numerical *key representation*: the correct title mapping agrees with the 13 banner positions **13/13**, the zero-based literal-letter alternative agrees **6/13**, and an ASCII-mod-26 title map agrees **0/13**. In the controlled *banner-ablated* problem, the latter two are still syntactically valid repeating-key inverses and preserve ciphertext length and punctuation. Restoring the banner selects the correct numeric representation. Restoring full ciphertext and line geometry, complete English then selects subtraction/reset; source metadata alone does not prove those choices.

The replay opens exactly (line-ordered as archived):

```text
King Arthur was at Caerlleon upon Usk; and one day he sat in his
chamber; and with him were Owain the son of Urien, and Kynon the son
handmaidens at needlework by the window.  And if it should be said
```

Reproduction code: [`sims/cicada2012_reddit_maya_cue_ablation.cjs`](../sims/cicada2012_reddit_maya_cue_ablation.cjs). Invoke with the two source files from the pinned archive as arguments. It validates both Git blob SHA-1 values and asserts the exact case-insensitive character match. With no arguments, it runs the first three source/known-answer lines as an embedded smoke test. The full archive pair, not the smoke test, supports the counts above.

## Does LP2 contain the same *typed* clue and recipient?

The transferable source type would require **(1)** a visible short numerical chart, **(2)** a separate, longer public string whose prefix can be checked against that chart under a fixed alphabet mapping, and **(3)** an independently identified cipher-text recipient and event/reset geometry. Merely finding thirteen dots or a numeric coincidence does not establish this type.

The most tempting LP2 object is original physical **p0**: 13 red heading runes arranged 8+5, followed by a distinct 13-dot marker and 249 black-body runes. This is **not** the 2012 cue. The dots give a count/mark, not thirteen ordered numeric values; the red GP29 heading is not a public base-20 numeral title or an independently checked longer key. A 23-value extension is absent. Treating the 13 red runes as a periodic cipher key for black p0 would silently invent the missing conversion and reset rule. Existing original-cipher studies already preflight this surface: [#2114](https://github.com/FlareZ123/liber-primus/issues/2114), [#2181](https://github.com/FlareZ123/liber-primus/issues/2181), [#2305](https://github.com/FlareZ123/liber-primus/issues/2305), and [#2401](https://github.com/FlareZ123/liber-primus/issues/2401) cover source selection, red13 state, canonical Vigenere and a custom alphabet. No unexamined, source-typed 2012-style LP2 chart/string pair emerged; **no redundant original-key sweep was run**.


### Complete visible LP2 numerical-object gate (#3325, Agent3)

Reviewed all 58 original physical pages in image order from the supplied JPEG archive, enlarging the cuneiform motif and consulting the previously source-adjudicated numerical registers. The normalized inline-number inventory contains exactly six Arabic number occurrences: the isolated 7 on p10 and the red list labels 1–5 on p36–38. This is a census of visible **typed numeral objects**, not of every potential count of strokes, leaves or punctuation. The criterion is a proper ordered numerical prefix of a separately authored longer key, with independently selected representation and recipient. On the confirmed 2012 base20 title the exact prefix length is 13 of 23.

| Physical source | Actual ordered object | Decision under this criterion |
| --- | --- | --- |
| p0 / p57 red marks; p7/p23/p56 five-dot and p33/p39 three-dot ornaments | Counts or geometric marks, not an ordered array of numeral values | No prefix vector. p0's 13 red GP29 glyphs are ciphertext, not an independently readable key witness. |
| p10 | Single inline Arabic 7 | No prefix chart or linked longer key. |
| p15 | 16 decimal cells in the source-selected spiral: 3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516 | All 16 exceed the 2012 base20 and both GP index/prime ranges; the [established formula](../results/lp2-p15-fibonacci-prime-spiral.md) generates them, but there is no separately authored longer key or typed recipient. Extending its mathematical sequence is not independent key verification. |
| p33–39 | One repeated two-line emblem: top (17,13)₆₀=1033; bottom (55,1)₆₀=3301 | Real historical numeric match, but see the order/role obstruction below. Seven copies are one artwork, not seven independent key entries. |
| p36–38 | Enumerated red labels 1,2,3,4,5 | Explicit consecutive passage labels. Against title 133 only its first digit agrees, and the title is shorter than the list. |
| p49–51 | 256 two-character cells; starts 3N 3p 2l 36, yielding 203,231,167,186 in radix60 or 200,227,164,183 in radix59 | Both grammars have 241/256 values ≥20, and neither begins with the historical title's first digit10. The radix is unresolved and no independently visible >256-value key is selected. Historical 256-byte solver copies are derivatives of this very panel, not independent longer keys. |
| p56 | 128 hex characters, starts 36367763; literal byte prefix 54,54,119,99 | The solved recipient clause gives the printed digest a specific external-page hash role. No separate longer key; the 2014 binary witness is its own conversion. |

The direct-prefix comparison against the actual 23-value 2012 title returns length **0** for each of the eight typed readings (p15, cuneiform composite and digit-group readings, labels, both p49 codecs, p56 hex digit and byte readings). This is a finite necessary-condition check, not an attack against unknown keys. The 2013 **The Instar Emergence** is actual prior audio title metadata, not a signed numeral key; earlier direct text transfers are [negative](lp2-2013-instar-title-native-fskip-original-gate.md). The signed 2012 song message is an actual instruction about the chorus and its recipient, not a numerical-key title; the 2014 distribution HTML independently has the three-digit title 133 and div ID 331, but neither is a longer key register. No signed pre-release message in the established historical source contract identifies a title as the numerical extension of an LP2 panel. The post-release 2016 EPIPHANY SEEKS wording cannot serve as a pre-release title.

**The strongest near-match has an exact ordering and recipient distinction.** The signed Stage10 instructions explicitly ask for the three magic squares; the preserved original form [archive](../resources/external/cicada2014-onion6-magic-form-and-response.json) names the fields 53301,71033,51033 with visible order/sum pairs (5,3301),(7,1033),(5,1033). The [actual 99-cell Stage7 output](../resources/cicada2014-openpuff-magic-squares.txt) independently reproduces those sums. The top-to-bottom LP2 emblem [1033,3301] has common-prefix length **0** against the Stage10 sums [3301,1033,1033]. Reversing the two emblem rows gives common-prefix length **2**, but there is no independent bottom-up reading rule or indication that the third sum is an LP2 key extension. Furthermore the exact verified 2014 OpenPuff password 33011033 is **the entire reversed two-number serialization**, not a longer key, and its authentic recipient is the Stage7 MP3. The actual first two square cells are 434,1311, so the emblem is not a literal prefix of that longer 99-cell numeric sequence either. This supports a cross-round numerical reference, already established by #3001, and rejects treating it as the 2012 typed prefix/key construction. The direct seven-by-seven square consumers have already been [tested on original p33–39](lp2-seven-cuneiform-magic7-rowkey-gate.md).

The finite comparisons were executed over the source-derived grid tokens, archived form HTML, actual square file, original digest, original distribution HTML and published historical control values. In particular, a positive historical control gives 13/13 prefix entries using the source's base20 alphabet. No unknown recipient or key was selected; hence the whole-text receiver/holdout fork is not authorized, and no original rune fit or redundant historical full-text replay was run. A future positive must present an actual independent longer key string with a literal worked match and identified LP2 receiving interval, rather than an extended mathematical sequence or two recurrent constants.

**Positive fork:** An independently visible LP2 chart consisting of ordered values that exactly register against the prefix of a longer author-supplied key could fix a recipient/key representation before decrypting; then use a frozen full-text receiver, controls and holdout. **Negative fork, presently supported:** a single count, illustration, repeated page length or cipher-title guess does not fix a key. Preserve this historical selector as a calibrated example; do not treat the 2012 title key as an LP2 key or transfer it to p0 merely because both display the number thirteen.

**Status:** complete historical control and explicit missing LP2 input; **no unknown LP2 plaintext, key, receiver, or continuation recovered**.
