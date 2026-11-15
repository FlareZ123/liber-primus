# Word-local five-phase predecessor marker: held-out original-cipher test

**Agent 13, 15 November 2026. Status: conditional negative; no unknown LP2 plaintext, source-authenticated key or final destination recovered.**

## Distinct model and cipher-invariant

Original LP2 pages 0–55 contain 12,956 GP29 ciphertext runes and only **86 adjacent identical glyphs among 12,901 possible same-page pairs**. The ciphertext also has a word-local lag-five echo enrichment. Existing tests already exclude a *single* globally fixed predecessor-copy plaintext marker, a *five-back* copy marker, and five alphabets reused per physical page. This test addresses a distinct reversible **one-back copy marker that changes by printed-word phase modulo five**.

For each non-page-initial rune, a secret plaintext marker S[j mod 5], where j is the original printed-word-local offset, is encoded as the previous ciphertext rune. The other 28 plaintext GP symbols are bijected to all 28 other GP ciphertext symbols using a different arbitrary secret permutation at every position. All 29 inputs remain invertible. Irrespective of the unobserved permutations, **adjacent equal ciphertext glyphs occur exactly where plaintext equals the corresponding marker**. No original instruction establishes this encoder; it is a candidate motivated by two actual source phenomena.

## Frozen training and held-out evidence

The self-contained Windows Node22/CommonJS SFT at sims/lp2_wordphase_predecessor_marker_heldout_sft.cjs reads the canonical original transcription and all 2,896 printed-word offsets. Its source-native English position profiles are trained on the repository Shakespeare, Gibran and Emerson text controls, using the authentic solved LP1/P57 spellings ING→GP21 and IO→GP27 and 0.5-per-symbol smoothing. First runes of physical pages are excluded because their predecessor is unobserved.

Each of five marker runes was optimized **exclusively on physical pages 0–39**, 9,600 eligible positions with 65 adjacent-repeat events. The selected five GP rune markers are **G, NG, W, NG, W** (indices 6, 21, 7, 21, 7). The best single-marker comparator was **G**. No marker, language profile, phase or word boundary was fitted to pp40–55.

| Source-native GP event model | Training log likelihood | Untouched pp40–55 log likelihood |
| --- | ---: | ---: |
| Five word-phase marker runes | −417.1120 | **−141.9270** |
| One globally fixed marker rune G | −445.8492 | −156.7084 |
| Fixed event probability measured on pp0–39 | **−389.4630** | **−127.1816** |

The untouched pp40–55 consist of **3,301 eligible positions with 21 repeated pairs**. The five-marker model predicts **41.2557** repeated pairs, and its held-out log likelihood is **14.7454 lower** than the stationary Bernoulli comparator. A supplementary fixed-count shuffle, preserving the held-out repeated-pair count separately for every physical page, gives mean **−149.2598**, SD **6.3995**, with **2,513/20,000** shuffles at least as favorable as original. The location-only exploratory upper-tail frequency is **0.12569**, not a strong marker-location recovery.

The SFT includes two fully reversible **12,956-rune planted native-English controls** with different arbitrary five-marker vectors, asserts their complete plaintext recovery and exact event equivalence, and also reencrpyts the entire original ciphertext under a proposed wrong-key inverse. The latter roundtrip is an implementation invariant and does not authenticate the historical cipher.

## Research consequence

The five-phase predecessor-copy explanation improves upon a fixed single-marker model, yet **fails to predict the untouched original ciphertext as well as an unstructured repeat baseline**. Do not promote the fitted marker sequence as a discovered key. This is a probabilistic, source-register-conditional exclusion. Different original languages, dynamic or page-varying markers, changed segmentation, and a different stateful transport survive.

To advance this family, acquire an independently published clue that fixes how its reserved symbol changes or a reversible operation yielding coherent original unknown-page plaintext. Unconstrained marker fitting alone is not a route to the book's plaintext. Existing upstream context: im-results/lp2-reserved-ea-repeat-transport-original-gate.md and im-results/lp2-lag5-fixedrune-boundary-alignment.md.
