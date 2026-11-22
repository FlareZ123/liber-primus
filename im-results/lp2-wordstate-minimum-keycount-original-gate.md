# A minimum-state theorem for source-word-aligned LP2 decoders

**Agent43, 14 November 2026.** Key-independent necessary condition on any deterministic, lossless, sequential transducer with at most K entry states, preserving each original printed word's GP29 length and boundary. **No original unknown-page plaintext, historical key, or selected deciphering opcode has been recovered.**

## Mechanism-independent theorem

Let a candidate plaintext word P and its original printed ciphertext word C be associated with the encoder's hidden state s *at the beginning of that word*. A deterministic sequential encoder, with no separate absolute-time oracle, fresh word IV, or uncounted key schedule, fixes the complete output word from (P,s). There are K available states, hence

    number of distinct original ciphertext words paired with any one P <= K.

If decryption is lossless given the same entry state, each original C similarly pairs with at most K distinct candidate P words. Construct the **simple bipartite graph** of unique (P,C) word-pairs in fixed source order. Its maximum vertex degree Δ is therefore a **lower bound K >= Δ** for every possible unknown state transition and output codebook. This includes a K-state letter-by-letter rotor, a nonlinear word codebook, and fixed period-K word phases whenever every word's complete ciphertext depends only on its beginning state and plaintext symbols. It does **not** depend on recovering or guessing an alphabet or key.

Under the intentionally generous relaxation allowing the state to be chosen arbitrarily at every word, König's bipartite edge-coloring theorem shows Δ states are also sufficient to assign distinct, invertible per-state codebook correspondences for the observed pairs. A real sequential state-transition rule can impose *additional* constraints. Thus Δ is the exact lower bound for the relaxed arbitrary-state dictionary problem, and a necessary (not sufficient) bound for the stronger historical-cipher problem.

The 29-symbol Gematria Primus inventory does not itself imply 29 internal cipher states. This result tests that *specific low-state architecture*, including one-state, 29-state and 58-state alternatives. It cannot reject a longer PRNG state, per-page/chapter independently keyed transducers, position-dependent schedules, plaintext that uses different segmentation, unknown nonstandard vocabulary, lookahead, or whole-text transpositions.

## Source-exact input and test contract

Use the canonical original unknown LP2 physical pages p0–55: **12,956 runes and 2,896 semantic words**. Preserve printed word boundaries, including physical-line and page carries; p50 is rune-free. Restrict the keyed language controls to the **2,839** original word positions of lengths **1–10**. Exclude the remaining 57 length 11–14 positions before testing, rather than synthesizing unavailable reference words. The nine original artwork/chapter spans also remain fixed, making a chapter-local sensitivity test possible.

For each of Shakespeare, Gibran, Emerson, corrected Old English *Beowulf* and GP-mapped Latin Vulgate, create a GP-native pool by *original rune-word length*. At each retained original position, independently sample a word **with replacement** from the corresponding source-length pool. This creates an exact-length-conditioned hypothetical plaintext occupying *the actual original ciphertext positions*. For every candidate P/C pairing, compute the bipartite vertex degrees; the script does not fit a cipher key, rearrange unknown words, assign an F mask, or choose a plaintext by maximizing K.

The xorshift32 sample seed is **0x43816233**, with **1,000 independently resampled source-length assignments per register** (5,000 total). The source-language samples are **not coherent contiguous passages**. Results are conditional finite-corpus sensitivity checks, not calibrated historical-creator probabilities.

## Exact Windows Node22 original-input results

| Source-native plaintext model | Minimum K among 1,000 | Mean K | Maximum K | Cases K<=29 | Cases K<=58 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | **61** | 78.243 | 103 | 0 | 0 |
| Gibran | **112** | 145.122 | 178 | 0 | 0 |
| Emerson | **107** | 137.454 | 169 | 0 | 0 |
| Corrected Old English *Beowulf* | **58** | 73.728 | 93 | 0 | 1 |
| Latin Vulgate | **142** | 169.599 | 201 | 0 | 0 |

**All 5,000 fixed-length controls violate K<=29**, even when the finite-state encoder and its letter substitutions are arbitrary and every word entry state is freely chosen. This excludes those specific 5,000 *candidate plaintext streams* under any globally shared K<=29 deterministic original-word-preserving transducer. It does **not** prove that every coherent English or Old English manuscript would violate K<=29.

A bounded **visible-chapter restart control** weakens the result as expected. On the longest p40–53 artwork span, containing **656 retained words**, the per-span state minimum among 1,000 length-matched tests is respectively Shakespeare11, Gibran23, Emerson20, Beowulf12, Latin27. The number of samples with K<=29 on that span is respectively **996, 103, 240, 998, 4**. Other chapter segments have fewer words. Therefore the full-book K restriction must **not** be transferred automatically to nine independently keyed or independently resetting chapters. A changing per-chapter hidden alphabet is still viable.

**Independent positive-control plant:** take 2,839 GP-native Shakespeare source-length-matched words and apply a fully specified, word-position-mod-29, per-symbol Caesar codebook. The true state K=29, the inverse exactly returns **2,839/2,839 plaintext words**, and the inferred relaxed graph bound is **27<=29**. This confirms the test does not mechanically reject every 29-state example.

[Reproduction: CommonJS one-file SFT](../sims/lp2_wordstate_minimum_keycount_sft.cjs) · [Successful Windows Node22 original-source run 43586982675](https://github.com/FlareZ123/liber-primus/actions/runs/43586982675).

## Cryptanalytic consequence

Retire low-state, original-word-preserving **bookwide stationary finite-state transducers** as a default explanation for ordinary source-language prose, including unrestricted nonlinear K<=29 word dictionaries and deterministic 29-state character rotors, under the exact empirically tested language profiles. A cipher with a 29-rune *alphabet* remains possible: it would need a richer state/history, independent evolving key schedule, different chapter-state resets, resegmentation, or non-reference plaintext. The test supplies a useful key-capacity requirement, but **no source-authenticated key and no recovered unknown LP2 plaintext**. Direct historical-source evidence for the actual state clock is still necessary.

This complements the [prior source whole-word equality result](lp2-global-wholeword-equality-source-gate.md), which excludes K=1 even with page-local stationary rekeying under native prose references. The present method tests arbitrary *K-state multiplicity* and makes an exact per-word graph certificate available for any future independently supplied plaintext proposal.
