# Source-motivated p0–p1 crossed-page shared GP29 pad: exact original-word inverse

**Current decision (Agent19, 13 November; Agent42 chain extension, 17 November 2026):** The repeated 180-degree black-cross artwork on original LP2 pp0–2 motivates checking whether the pages reuse one arbitrary secret GP29 pad after a page-local reset. Two mathematically distinct, key-independent hypotheses fail against the unchanged pp0–1 word register. The direct character-pad gate requires **12–16** complete printed words outside a generous English dictionary, and the independently source-motivated *chained-step* pad gate likewise requires **12–16**, even when all key symbols are unknown, each page may read in either direction, and either pad sign is permitted. Matched-key native English controls distinguish the proposed family from independent pads; neither yields original unknown plaintext. This excludes these source-frozen shared keys under the stated native-GP register and fixed original word divisions.

## Original data and source cue

- Source scans `resources/liber-primus/17.jpg` and `18.jpg` are physical p0 and p1. The hypothesis is motivated by their conspicuous matching black cross motifs, **not** by a cipher clue explicitly instructing pad reuse, reversal or subtraction. The artwork has not been shown pixel-identical.
- Rune positions and the printed word partitions are fixed by `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. Physical p0 has **262** runes and p1 has **266**; the compared original span is the full **262** positions of p0. Each orientation reads its own complete physical page in either ordinary or reversed rune order, and p1's extra four terminal readout positions are not paired with p0. The inverse leaves any original printed word fragment truncated by the overlap unconstrained.
- The only native vocabulary is the already pinned `resources/control/english_wordfreq_textblob.txt`, with **29,157** input rows, **29,061** distinct GP forms and **74,946** forward-trie nodes. English orthography follows the existing project's GP29 transliteration normalization.

## Frozen reversible families

Let `C0[t]` and `C1[t]` be the two original page-local rune indices, each independently read in forward physical order or in the **complete reversed physical page order**. The eight frozen models exhaust the four combinations of these two reading directions, each with both pad signs. A single arbitrary secret GP29 pad `K[t]` can act in either direction:

1. Same sign: `C0[t]=P0[t]+K[t]`, `C1[t]=P1[t]+K[t]` (mod29). The secret cancels: `P0[t]-P1[t]=C0[t]-C1[t]`.
2. Opposite signs: `C0[t]=P0[t]+K[t]`, `C1[t]=P1[t]-K[t]`. The secret cancels: `P0[t]+P1[t]=C0[t]+C1[t]`.

Every comparison grants **all 29 choices of plaintext rune** at every position, with the corresponding paired plaintext rune forced by the cancellation identity. An exact dynamic program follows both printed-word dictionary tries and minimizes the total count of complete words outside the generous dictionary. An unmatched word is charged once, then its remaining runes are arbitrary. Page-edge fragments are unconstrained. No beam search, plaintext guess, fitted key, or language-model scoring is used.

**Important reversed-reading correction:** for either page in reverse physical order, every word must be accepted by a **reverse-word GP29 trie**, constructed from the identical fixed dictionary. Swapping the first/last word-boundary labels while keeping a forward dictionary incorrectly penalizes naturally spelled words and invalidates the negative. The final committed SFT uses the correct forward or reverse trie independently on each page and passes all eight native-plaintext controls.

| p0 rune order | p1 rune order | p1 pad sign | Original exact minimum nonlexicon words | First forced index | Common-pad native plant | Independent-pad plant |
|---|---|---|---:|---:|---:|---:|
| Forward | Forward | same | **14** | 12 | 2 | 14 |
| Forward | Forward | opposite | **16** | 12 | 2 | 11 |
| Forward | Reversed | same | **16** | 12 | 2 | 16 |
| Forward | Reversed | opposite | **14** | 7 | 1 | 16 |
| Reversed | Forward | same | **14** | 12 | 1 | 12 |
| Reversed | Forward | opposite | **14** | 12 | 1 | 15 |
| Reversed | Reversed | same | **15** | 15 | 1 | 14 |
| Reversed | Reversed | opposite | **12** | 19 | 3 | 14 |

The original overlap contains 58 complete p0 word endings and 61 (forward) or 62 (reversed) p1 word endings in forward p0 reading; reversing p0 changes which edge is truncated. All eight original minima are rigorous within the dictionary-paired DP and the frozen source layout; they **do not** universally forbid rare neologisms, another language, secret alphabet relabelings, word-boundary resegmentation, a nonadditive generator, offsets or unrelated keys.

## Reused chain pad after a page-local derivative (Agent42, 17 November 2026)

The existing direct C=P+K model is insensitive to the striking scarcity of adjacent identical source ciphertext runes. A different model derives a nonzero-first-order chain step before applying a shared key:

\[
D(C)[i]=(C[i]-C[i-1])\bmod29,\qquad C[-1]=0,
\]

and supposes \(D(C_0)=P_0+K\), with \(D(C_1)=P_1+K\) or \(D(C_1)=P_1-K\). Both original pages independently use either their forward or complete reversed rune order **before** taking \(D\). A common unknown key cancels exactly as \(D(C_0)-D(C_1)=P_0-P_1\), or \(D(C_0)+D(C_1)=P_0+P_1\). No initial pad, prefix, phase, rune substitution or key file is fitted. The 180° source-cross geometry provides the two reading orientations; the anti-repeat fingerprint suggests a chain state, while the artwork does not explicitly instruct this cipher.

The original page spans are unchanged: **262** p0 and **266** p1 symbols; the first 262 of each source-selected reading overlap. There are **two p0 adjacent identical pairs** and **one p1 pair**. Using the original printed word endings and the existing independently built **74,946-node forward / 85,577-node reverse GP29 English tries**, a complete dynamic program grants all 29 plaintext-rune possibilities at each location. It exactly minimizes the number of entire completed printed words that cannot belong to the 29,061-entry vocabulary, with crossed physical-edge fragments uncharged.

| p0 read | p1 read | Shared step-pad sign | Exact minimum nonlexicon complete words | First forced position |
|---|---|---|---:|---:|
| Forward | Forward | Same | **16** | 12 |
| Forward | Forward | Opposite | **14** | 12 |
| Forward | Reverse | Same | **15** | 12 |
| Forward | Reverse | Opposite | **16** | 7 |
| Reverse | Forward | Same | **16** | 11 |
| Reverse | Forward | Opposite | **14** | 12 |
| Reverse | Reverse | Same | **14** | 15 |
| Reverse | Reverse | Opposite | **12** | 16 |

These are exact original-data minima, computed independently from the direct C=P+K tests. The different mathematical operand does not change the result: *every frozen model forces a large out-of-dictionary budget before the end of the original overlap*. The [new original-source CommonJS SFT](../sims/lp2_p0_p1_cross_chain_sharedpad_sft.cjs) asserts all eight original minima and earliest forced positions, and contains independent native-dictionary matched-chain-pad and mismatched-pad controls. These controls are intended to test that the negative reflects the source rather than an implementation incapable of recovering natural GP text.

**Scope:** This test rejects a **shared additive pad on ciphertext differences** across the repeated-cross pages. It does not cover a key generator which skips/advances based on plaintext or ciphertext, per-page independent secret keys, unknown word divisions, or a different operation selected by a future original clue. In particular, an *additive* difference pad does not automatically reproduce the source's exceptionally low adjacent-doublet rate, so such a chain mode would need an independently authorized zero-step rule to explain the full cipher fingerprint. No plaintext or keyed decoder is recovered.

## Reproduction and next decision

- Standalone **CommonJS/Node 22 SFT:** [`sims/lp2_p0_p1_cross_sharedpad_sft.cjs`](../sims/lp2_p0_p1_cross_sharedpad_sft.cjs). The script asserts the exact original ciphertext source and partitions, eight minimum costs, eight first-forced offsets, cipher/key recovery for native GP plants, and the matched and independent-pad control costs.
- [Successful full eight-orientation original-source/native-control CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43397319351). The subsequent exact-assert commit freezes all eight observed source minima and both control families.
- The cross artwork still does not select a recoverable high-entropy key or lossless cipher. The direct and chained shared-pad families have both been tested under all eight key-cancelling source-orientation variants. **Do not expand further source-free shared-pad variants** without a new original clue; the repository's [all-page original start-pad test](lp2-allpage-pagestart-commonpad-original-gate.md) independently excludes even a broad forward comparison. Return attention to locating an original author-selected key or an executable plaintext-producing rule.

**Classification:** finite original-input negative, supporting research only. No correction to established plaintext or the authoritative overall synthesis is implied.
