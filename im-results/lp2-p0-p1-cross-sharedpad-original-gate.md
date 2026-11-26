# Source-motivated p0–p1 crossed-page shared GP29 pad: exact original-word inverse

**Current decision (26 November 2026):** The new three-page inverse permits every literal plaintext-F hold, all 32 full-page directions/signs, and an arbitrary shared consuming key. All strict native-register configurations fail; the natural all-forward same-sign model also requires ≥10 OOV complete groups versus a seven-group allowance. The previous fixed-clock decisions remain valid. **Earlier two-page decisions (Agent19, 13 November; Agent42 chain extension, 17 November 2026):** The repeated 180-degree black-cross artwork on original LP2 pp0–2 motivates checking whether the pages reuse one arbitrary secret GP29 pad after a page-local reset. Two mathematically distinct, key-independent hypotheses fail against the unchanged pp0–1 word register. The direct character-pad gate requires **12–16** complete printed words outside a generous English dictionary, and the independently source-motivated *chained-step* pad gate likewise requires **12–16**, even when all key symbols are unknown, each page may read in either direction, and either pad sign is permitted. Matched-key native English controls distinguish the proposed family from independent pads; neither yields original unknown plaintext. This excludes these source-frozen shared keys under the stated native-GP register and fixed original word divisions.

## Original data and source cue

- Source scans `resources/liber-primus/17.jpg` and `18.jpg` are physical p0 and p1. The hypothesis is motivated by their conspicuous matching black cross motifs, **not** by a cipher clue explicitly instructing pad reuse, reversal or subtraction. The stronger later half-turn source audit establishes the repeated p1/p2 raster and paired 180° relative orientation; p0 differs slightly in JPEG raster pixels.
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

## Three-page latent plaintext-F shared consuming key (Agent44, 26 November 2026)

The identical paired-cross design occurs on all three opening pages, and authentic LP1 encryption sometimes leaves plaintext F literal and non-consuming. The older two-page exact gates above assume one key digit per physical rune, so they do not reject this distinct historical clock. Test the whole source-selected p0–2 chapter as three independent restarts of the **same arbitrary nonperiodic GP29 consuming pad**. This is a hypothesis, not an authored instruction; the motif may simply be ornament. The [half-turn artwork report](lp2-p0-triple-cross-180-source-gate.md) establishes genuine relative rotation and p1/p2 raster identity.

For each page independently choose full forward/reverse physical rune order, with reversed word forms in the latter case. Fix p0 sign positive (global key sign redundancy), allow each other page sign ±. At shared consuming position k, each nonfinished page either has a preceding literal plaintext F (ciphertext F, no k advance), or consumes the same arbitrary key digit K[k] with plaintext P=(C−sign·K[k]) mod29, P≠F. A ciphertext F may itself be consuming. Thus all 32 orientation/sign configurations and every legal F mask are covered. Each page can stop independently; the remaining pages still share the pad until only one is active. The original 262/266/201 runes are checked against the canonical corpus. Source printed page fragments are 59/63/38, of which 58/61/37 are complete groups; the four edge fragments of lengths 1,5,3,2 are unrestricted rather than falsely treated as independent words. This relaxation even permits incompatible plaintext completions of the original carry words. The same 40,540-form native GP register as the [latent-F table-flanks gate](lp2-table-flanks-latent-f-sharedpad.md) includes solved-native forms, all TextBlob spelling variants in the fixed transliteration grammar, Gibran and Shakespeare donor forms. This is a finite register, not a claim about all English.

**Strict joint inverse:** memoized DFS tracks the three physical cursors and three length-conditioned trie states. A legal hold advances one page only; a consuming step enumerates all 29 key digits and advances all nonfinished pages. All 32 source combinations fail, no cap reached, with maximum individual reachable physical prefix 3–10 runes depending on configuration. Four matched-length donor-word plants, with independent F histories, orientations, signs and secret random consuming pads, yield legal witnesses replaying every ciphertext rune. First witness accuracy by page is (250,245,199), (225,226,196), (231,233,196), (239,240,197); exact key-digit matches 241,223,227,235. This is feasibility calibration, not unique key recovery or a blind held-out lexical test: the donor forms are in the register, and the planted word sequences are length-matched samples rather than continuous prose.

### Allow arbitrary unknown words: disjoint consuming-window bound

The forward, same-sign source interpretation is also rejected under a 5% OOV allowance, without presuming a known key or exact F alignment. For each of eight disjoint 24-consuming-digit windows starting at t=0,24,…,168, grant independently every initial physical position p on each page satisfying p≥t and p−t≤the number of ciphertext F symbols strictly before p. This is an overapproximation of the possible earlier holds. Within a window starting at p, enforce only complete printed groups lying entirely in [p,p+24); allow every other group, including the true boundary fragments, to be arbitrary. The actual physical interval consumed by the window has length ≥24 because holds only increase it, so no constrained complete group can be charged by two windows. Since the shortest page has 201 runes and seven ciphertext F, it consumes at least 194 key digits; all eight windows necessarily exist under every F history. For each start triple, DFS permits all local holds, 29 key digits and a wildcard suffix after a word first leaves the trie, charging it once. A valid original solution induces one of the relaxed paths in every window, hence the sum of independently minimized (or soundly lower-bounded) costs is a global lower bound. No assumption of actual word synchronization between pages is used.

| Common consuming start | 0 | 24 | 48 | 72 | 96 | 120 | 144 | 168 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Certified minimum OOV groups (lower bound) | 3 | 1 | 1 | 1 | 1 | 1 | ≥1 | 1 |
| Start triples exhaustively rejected at zero cost | 1 | 3 | 12 | 72 | 168 | 336 | 441 | 567 |

Total **≥10 distinct OOV complete groups** in the first 192 key digits, versus floor(0.05×156)=7 permitted across the entire chapter. The budget-one search for t=144 hit its call cap, so only its completed zero-budget exclusion contributes one; it is not claimed as an exact minimum. Every other tabulated minimum has a relaxed witness at its reported value. All 32 corresponding relaxed window checks on the four planted controls find zero-cost paths without caps. The source-wide OOV allowance result applies only to all-forward same-sign; the other 31 configurations have strict-lexicon exclusions, not a 5% theorem.

**Decision:** independent literal F clock holds do not rescue the natural three-page common-pad reading with native printed words. No authenticated key, title, or unknown plaintext is recovered. Unknown segmentation, independent keys, other registers and nonadditive architectures remain outside the scope. Do not reopen this receiver absent a separate source-selected change.

Reproduce with [SFT](../sims/lp2_opening_triple_latent_f_commonpad_sft.cjs) and [executed raw results](lp2-opening-triple-latent-f-commonpad.json). The code was executed against repository inputs in the connected V8 runtime; no Windows CI run is claimed. The local 1.2M call cap is explicit and never contributes an unproven exclusion.

## Spacing-free constructive inverse (Agent44, 26 November 2026)

The printed-word premise is independently removed here. A width-256 joint beam considers every literal-F hold and all 29 shared consuming digits at each of the first 180 consuming positions on p0–2, forward and same-sign. The scorer is an interpolated four-gram GP29 model trained on the first 70% of each of three literary donors (32,746 Gibran, 151,974 Shakespeare, 214,613 Emerson runes); the donor end markers are checked explicitly. No original printed boundary enters the decoder. Each returned prefix exactly reencrypts. Scores below are per-rune natural log likelihood ratios relative to uniform GP29.

| Input | Key digits correct / 180 | Plaintext runes correct / recovered | Joint score p0 / p1 / p2 |
| --- | ---: | ---: | --- |
| Authentic solved-Cicada passages, shared random pad | 178 | 545/551 | 1.432 / 1.431 / 1.302 |
| Held literary passages, shared random pad | 178 | 543/549 | 1.356 / 1.443 / 1.413 |
| Authentic solved-Cicada passages, three independent pads | 9 (relative to first pad) | 26/547 | 0.751 / 0.987 / 1.141 |
| Original opening pages | unknown | unknown | 0.914 / 0.964 / 0.790 |

The original result remains incoherent, despite the same algorithm recovering nearly all key digits and plaintext from both positive controls. Example original generated p0 prefix: NT HEW LIFE GLAN ANCE ... (the segmentation is illustrative and unsupported). Apparent fragments are selected by the language model and are not recovered words. This is an empirical negative for the specified H-decoy receiver, not an exact exclusion of arbitrary plaintext. Beam pruning can discard the true path; the signs, orders and key law are fixed. The separate p0/p1 fit and frozen p2 decode fails on both shared-pad positives at consuming steps 5 and 48, so its original failure at step 6 is uncalibrated and contributes no negative evidence. The initial literary donor slicing accidentally retained Gutenberg boilerplate; the committed code and raw output correct that error and supersede the first version.

Reproduce with [spacing-free SFT](../sims/lp2_opening_triple_spacingfree_commonpad_sft.cjs) and [raw output](lp2-opening-triple-spacingfree-commonpad.json). Both were executed in V8; no Windows CI claim. No further source-free widening is justified by these outputs.

## Reproduction and next decision

- Standalone **CommonJS/Node 22 SFT:** [`sims/lp2_p0_p1_cross_sharedpad_sft.cjs`](../sims/lp2_p0_p1_cross_sharedpad_sft.cjs). The script asserts the exact original ciphertext source and partitions, eight minimum costs, eight first-forced offsets, cipher/key recovery for native GP plants, and the matched and independent-pad control costs.
- [Successful full eight-orientation original-source/native-control CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43397319351). The subsequent exact-assert commit freezes all eight observed source minima and both control families.
- The cross artwork still does not select a recoverable high-entropy key or lossless cipher. The direct and chained shared-pad families have both been tested under all eight key-cancelling source-orientation variants; the three-page transparent-F extension closes the strict historical hold variant and the natural 5% OOV receiver. **Do not expand further source-free shared-pad variants** without a new original clue; the repository's [all-page original start-pad test](lp2-allpage-pagestart-commonpad-original-gate.md) independently excludes even a broad forward comparison. Return attention to locating an original author-selected key or an executable plaintext-producing rule.

**Classification:** finite original-input negative, supporting research only. No correction to established plaintext or the authoritative overall synthesis is implied.
