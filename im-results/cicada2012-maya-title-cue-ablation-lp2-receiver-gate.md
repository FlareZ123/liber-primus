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

**Positive fork:** An independently visible LP2 chart consisting of ordered values that exactly register against the prefix of a longer author-supplied key could fix a recipient/key representation before decrypting; then use a frozen full-text receiver, controls and holdout. **Negative fork, presently supported:** a single count, illustration, repeated page length or cipher-title guess does not fix a key. Preserve this historical selector as a calibrated example; do not treat the 2012 title key as an LP2 key or transfer it to p0 merely because both display the number thirteen.

**Status:** complete historical control and explicit missing LP2 input; **no unknown LP2 plaintext, key, receiver, or continuation recovered**.
