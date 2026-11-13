# Source-motivated p0–p1 crossed-page shared GP29 pad: exact original-word inverse

**Decision (13 November 2026, Agent19):** The two opening physical LP2 pages show the same style of black cross artwork, with placements differing between the pages. This supplies a narrow human-visible reason to check whether their rune streams share a secret additive GP29 pad, possibly read in a mirrored direction. An exact native-GP dictionary inverse on the **unchanged original ciphertext** forces **14–16 out-of-lexicon printed words**, under every one of the four frozen forward/reversed-page and additive-sign hypotheses. Valid synthetic native-text common-pad controls need **1–2**; matched independent-pad controls need **11–16**. This is a **conditional negative**, with no unknown plaintext, original key, or authenticated operation recovered.

## Original data and source cue

- Source scans `resources/liber-primus/17.jpg` and `18.jpg` are physical p0 and p1. The hypothesis is motivated by their conspicuous matching black cross motifs, **not** by a cipher clue explicitly instructing pad reuse, reversal or subtraction. The artwork has not been shown pixel-identical.
- Rune positions and the printed word partitions are fixed by `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. Physical p0 has **262** runes and p1 has **266**; the compared original prefix is the full **262** positions of p0. The page-1 source has one incomplete edge fragment; the inverse does not force text outside the chosen overlap.
- The only native vocabulary is the already pinned `resources/control/english_wordfreq_textblob.txt`, with **29,157** input rows, **29,061** distinct GP forms and **74,946** forward-trie nodes. English orthography follows the existing project's GP29 transliteration normalization.

## Frozen reversible families

Let `C0[t]` be p0's original rune index and `C1[t]` the p1 index in forward physical order or in the **complete reversed p1 rune order**, as fixed before testing. A single arbitrary secret GP29 pad `K[t]` can act in either direction:

1. Same sign: `C0[t]=P0[t]+K[t]`, `C1[t]=P1[t]+K[t]` (mod29). The secret cancels: `P0[t]-P1[t]=C0[t]-C1[t]`.
2. Opposite signs: `C0[t]=P0[t]+K[t]`, `C1[t]=P1[t]-K[t]`. The secret cancels: `P0[t]+P1[t]=C0[t]+C1[t]`.

Every comparison grants **all 29 choices of plaintext rune** at every position, with the corresponding paired plaintext rune forced by the cancellation identity. An exact dynamic program follows both printed-word dictionary tries and minimizes the total count of complete words outside the generous dictionary. An unmatched word is charged once, then its remaining runes are arbitrary. Page-edge fragments are unconstrained. No beam search, plaintext guess, fitted key, or language-model scoring is used.

**Important reversed-reading correction:** for p1 in reverse physical order, every printed p1 word must be accepted by a **reverse-word GP29 trie**, constructed from the identical fixed dictionary. Swapping source first/last word-boundary labels while still using a forward dictionary incorrectly penalizes naturally spelled p1 words and invalidates that negative. The final committed SFT uses the reversed trie and passes the native-plaintext controls.

| p1 rune order | p1 pad sign | Original exact minimum nonlexicon words | First forced at overlap index (0-based) | Matched native common-pad control | Independent-pad control |
|---|---|---:|---:|---:|---:|
| Forward | same | **14** | 12 | 2 | 14 |
| Forward | opposite | **16** | 12 | 2 | 11 |
| Reversed | same | **16** | 12 | 2 | 16 |
| Reversed | opposite | **14** | 7 | 1 | 16 |

The original overlap contains 58 fully printed p0 word endings and 61 (forward) or 62 (reversed) p1 word endings. The four original minima are rigorous within the dictionary-paired DP and the frozen source layout; they **do not** universally forbid rare neologisms, another language, secret alphabet relabelings, word-boundary resegmentation, a nonadditive generator, offsets or unrelated keys.

## Reproduction and next decision

- Standalone **CommonJS/Node 22 SFT:** [`sims/lp2_p0_p1_cross_sharedpad_sft.cjs`](../sims/lp2_p0_p1_cross_sharedpad_sft.cjs). The script asserts the exact original ciphertext source and partitions, four minimum costs, four first-forced offsets, cipher/key recovery for native GP plants, and the matched and independent-pad control costs.
- [Successful full source/native CI run, reverse-word corrected](https://github.com/FlareZ123/liber-primus/actions/runs/43394354155). The subsequent exact-assert commit freezes those passing observed values in the SFT.
- The cross artwork does not select any further high-entropy key or lossless cipher. **Stop expanding variants of the same common page-start GP29 pad** without an independent clue; the repository's [all-page original start-pad test](lp2-allpage-pagestart-commonpad-original-gate.md) independently excludes even a broad forward comparison. Return attention to locating an original author-selected key or an executable plaintext-producing rule.

**Classification:** finite original-input negative, supporting research only. No correction to established plaintext or the authoritative overall synthesis is implied.
