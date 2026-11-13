# GF29 multiplicative ciphertext feedback: source-original decision

**13 November 2026, Agent4. Classification: motivated reversible hypothesis, two independently calibrated original-cipher exclusions, no unknown plaintext or authentic LP2 key.**

## Solve-path premise and competing explanation

The 29-symbol Gematria Primus alphabet is numerically indexed 0..28. The unknown LP2 pages have only **86 equal adjacent-rune pairs across 12,901 within-page opportunities**, while the 28 *nonzero* modular ciphertext differences are approximately flat. That is an observable distinction from GP-native English. A human player could reasonably ask whether the printed prime arithmetic implies using the nonzero residues modulo29 as a multiplicative cipher alphabet, with the immediately preceding ciphertext rune acting as a feedback accumulator.

One exact, invertible model is

```text
C_i = (C_(i-1) + K_i * (P_i + 1)) mod 29
P_i = ((C_i - C_(i-1)) * inverse_mod29(K_i) - 1) mod29
K_i ∈ {1,...,28}
```

The 29 plaintext indices map to 0..28 before multiplication. Consequently, for **every nonzero secret K_i**, and even if K_i changes arbitrarily from rune to rune, **C_i = C_(i-1) if and only if P_i = 28 (GP rune EA)**. All other symbols yield a nonzero step. This gives a direct, lossless explanation for the missing doublets without a rejection sampler or a 28-letter plaintext alphabet. The specified initial ciphertext accumulator, key and clock are necessary to decode a real passage. No original source currently provides that complete triple.

The strongest independent alternative is a stateful output process which *suppresses* equal successive runes but occasionally emits repeated output independently of a fixed plaintext rune. The original word-boundary structure below favors keeping that alternative alive. The multiplication rule is a possible mechanism and is **not an identified historical cipher**.

## Exact original-corpus constraints

The reproducer [`sims/lp2_gf29_delta_multiplicative_original_sft.cjs`](../sims/lp2_gf29_delta_multiplicative_original_sft.cjs) reads untouched `lp2-corpus.json`, the physically mapped original printed word boundaries, and the existing TextBlob-derived GP29 English spelling-frequency control. It checks the complete original page rune arrays, the 2,896 printed words, and all 12,901 within-page adjacent pairs before scoring candidates.

| Original source property | Exact result |
| --- | ---: |
| Rune-bearing unknown physical pages | 55 |
| Unknown runes | 12,956 |
| Within-page adjacent rune pairs | 12,901 |
| Identical adjacent rune pairs | **86** |
| Words containing one or more equal-adjacent sites | 85 |
| Identical sites at the *start* of a printed word | **23** |
| Nonzero-step 28-category Pearson χ² | **42.056**, df=27 (descriptive only) |

If a literal unknown GP-native English word is encoded by the model, each ciphertext equal-step fixes a **plaintext EA** in the corresponding source word position. For all original word lengths, a frozen independent 29,058-word, frequency-weighted English GP29 lexicon predicts **81.513 EA sites** across the original eligible rune positions, close in total to 86. Yet it predicts only **5.445 EA sites at eligible printed word starts**, whereas **23** actual zero steps occur there. Its independent-word model gives word-start standard deviation about **2.33**, hence the observed count is **7.53 model standard deviations above prediction**. Five of the 85 zero-bearing original word masks have **no exact EA-position match** in that lexicon even if every other rune is left free. This is a source-native English-register limitation of the proposed EA-only plaintext interpretation; it does not prove an absence of unknown proper names, stylized prose, or other intervening transformations.

The same fully specified length/word-frequency model can allow **any** of the 29 GP symbols to be the sole zero-step plaintext symbol. The best joint fit to the original `[86 total, 23 word-initial]` event counts is **G** (expected **146.0 total** and **52.32 word-initial**), with model-standardized two-dimensional distance **5.24**; fixed **EA** is second at distance **7.68**. All 29 single-symbol choices give a poor joint fit under this ordinary-English model. Distances account for per-word covariance between total and initial occurrences; they are **model diagnostics**, not universally calibrated author-intent probabilities.

### A geometrically motivated extra layer: rotating each word before feedback

The native-English EA count is almost right while its expected **word-start positions** are badly wrong. A simple independently understandable operation could rearrange positions while preserving word lengths: **cyclic rotation of each plaintext word before encryption**. That is compatible with the original printed word boundaries; the historical p57 wording about shedding circumferences offers only a weak cue, not an instruction for a particular rotation.

Under a *predictive reference model* in which each GP-native English word undergoes a uniformly chosen cyclic rotation before feedback, original word lengths imply **81.430 total EA/zero-step sites** and **18.499 eligible word-start sites** (standard deviation **4.282**). The observed **86 total / 23 word-start** lies only **1.051 standard deviations** above the rotated model's word-start prediction. Furthermore, **84/85** original zero-bearing word masks admit at least one native-English GP29 candidate after a word-local rotation. The sole mismatch is the physical **p27 12-rune word** with zero-step mask `000001000001`; its two positions would require two `EA` runes in one source word separated by six rune positions. No entry in the frozen English lexicon can match it even after an arbitrary rearrangement.

This rotation operation **rescues the simple repeat-count discrepancy as a conditional model**, but it has not produced plaintext or identified any word-specific rotation schedule. The compatibility is permissive: independently choosing a rotation and a word from 29,058 entries for each original token gives many chances to fit an EA mask. More importantly, adding arbitrary **word-local rotation** to the previous arbitrary **word-local GF29 affine delta inverse** still allows only **5 of the 791 original fully comparable words of length≥6** to enter the native-English lexicon, with **0 matches across all 543 words of length≥7**. The five compatible words all have length6. This prevents turning a good event-rate fit into a claim that a single key per word could decrypt the manuscript. A **rune-varying keyed feedback cipher plus a source-specified rotation** remains an actionable but unverified construction.

### Key-free result for all word-constant affine feedback

Let `D_i=(C_i-C_(i-1)) mod29`. If the multiplier is constant throughout one printed word, the entire word's original difference sequence must be a fixed affine image of an ordinary-English GP29 word. For any candidate word of length at least two, its **affine-normalized difference fingerprint** is invariant under *every* unknown nonzero multiplier and additive intercept. The SFT builds all source-native lexicon affine fingerprints once and checks original words after the first rune of each physical page (which requires an unknown page-initial feedback state).

**Among the 791 fully comparable original words of six or more runes, zero have an affine fingerprint appearing in the 29,058-word native English lexicon.** Thus 0/791 can be decoded into that lexicon under **any arbitrary independent per-word GF29 affine key**, even if each word receives its own secret multiplier and secret additive intercept. The strictly narrower `P_i=D_i/K_w−1` rule also matches zero of those words.

| Fully comparable original printed length | Words | Any per-word affine GP29 decoder yields dictionary word | Even an arbitrary *per-word secret alphabet permutation* has a dictionary-compatible equality pattern |
| --- | ---: | ---: | ---: |
| 6 | 248 | 0 | 242 |
| 7 | 213 | 0 | 205 |
| 8 | 153 | 0 | 139 |
| 9 | 76 | 0 | 71 |
| 10 | 49 | 0 | 34 |
| 11 | 28 | 0 | 16 |
| 12 | 18 | 0 | 4 |
| 13–14 | 6 | 0 | 0 |

**Boundary:** a *rune-varying* nonzero `K_i` changes equality and affine shapes inside words and remains mathematically viable. Generic variable keys alone also have no predictive power: any non-EA plaintext symbol can be made to decrypt from any nonzero original difference by choosing one of the 28 units. The actual key source or a tightly constrained update rule is essential.

### Exact positive control

The historical clear GP29 original p57 supplies **95 real source runes**. Adding the native encoded English word `EACH` (three runes, beginning with the symbol EA) creates a 98-rune validation input that actually exercises the exception. The forward encoder using a predetermined varying nonzero multiplier and known initial state produces exactly **one equal-ciphertext step**; the inverse recovers all **98/98** input runes, including the planted EA. The original source input is unchanged; the appended word exists only as a labeled positive control. This checks the reversible implementation and the exact zero-step identity. It gives no evidence for a historical key.

## Source-table AES-256 running-key consumer: original-input negative

One possible source-derived key supply is the actual printed **32 rows × 8 columns** of base60-read numerical tokens across physical pp49–51. The 32 bytes per column form eight candidate AES-256 keys; there are exactly **eight** source-visible visual chapters after pp0–2. This is a motivated *candidate composition*, not an author-selected key command. The independent [AES original-source SFT](../sims/lp2_gf29_delta_table_aes256_direct_sft.cjs) applies one key to each of those eight chapters in printed order, AES-256-CTR with an all-zero 16-byte counter, mapping each output byte to `1 + (byte mod28)` as the multiplier. It checks both chapter-local and page-local key clocks, and separately checks eight consecutive 32-byte bands as a less source-visible alternative reading.

Across **12,227 untouched runes** in pp3–55 and **2,738 printed words**, all four outputs remain ciphertext-like. Native-language GP29 whole-stream IoC remains **0.035230–0.035261** (source raw **0.034480**), each yields **zero dictionary words of six or more runes**, and no contiguous readable text appears. The vertical-column/chapter-clock output gives only **202/2,738** dictionary hits at *all* word lengths, mainly chance-compatible short strings. Each model exactly re-encrypts the original under its own fixed key, and its separately planted p57+`EACH` test exactly recovers **98/98** runes. Re-encryption checks implementation only, since every bijective wrong key also round-trips.

The test does **not** exclude AES keyed by other source material, other nonce conventions, key derivation, actual table encryption, or different intermediate representations. There is no independent evidence for AES-CTR or the all-zero nonce, so do not create a broader parameter sweep without a source instruction.

## Authentic solved-p56 prime-totient stream as a GF29 group key

The known decipherment of original physical **p56** supplies a considerably stronger external input than guessed AES: the key stream uses **Euler's totients of successive primes**. In the proposed feedback group, the first GP prime **2** is a primitive root modulo29, of exact order28. Thus a determinate, always-nonzero dynamic candidate multiplier is

```text
K_n = (2^(prime_n - 1)) mod 29 .
```

This preserves the historically known totient sequence exactly as exponents, and imposes no arbitrary zero-repair rule. [The exact original-source SFT](../sims/lp2_gf29_delta_p56_totient_group_source_sft.cjs) uses 12,956 original runes under three natural clocks (reset each physical page; reset each of the nine original visual chapters; continue across the entire manuscript). Every resulting original inverse has GP29 IoC **0.035264–0.035282** (source original **0.034478**), **zero matched six-rune-or-longer English dictionary words** among all 2,896 source words, and only 199–203 matches of any length, chiefly chance-compatible short words. Every candidate exactly re-enciphers the unchanged original under its own key. A 98-rune historical p57+`EACH` source-native positive plant re-encrypts and inverts exactly.

This narrows a **particularly source-motivated dynamic key** without disproving other feedback constructions. The primitive-root exponentiation itself is an investigator hypothesis: p56 authenticates the prime-totient sequence for its own Vigenère-like decipherment, not this new exponentiation or its transfer to pp0–55. No plaintext results.

## Exact 76-cell outer perimeter to original p55: the strongest geometric consumer

A more direct artifact-selected input than either AES or the long totient stream is the printed 32×8 table's **76-cell outer circumference**, exactly the length of the **76 original encrypted runes on p55**. The immediately following p57's solved imperative mentions `CIRCUMFERENCES`, so the perimeter is a source-visible geometric candidate. This independently motivates an original p55 direct test without fitting the key to ciphertext statistics.

The [self-contained 76-rune source-native SFT](../sims/lp2_p55_outer76_gf29_feedback_sft.cjs) takes the outer ring from the printed top-left cell clockwise, and the counterclockwise traversal from that same visible start. It sets each nonzero GF29 feedback multiplier to `1 + (printed base60 byte mod28)`. It compares either page-local initial accumulator zero or continuation from p54's last original ciphertext rune (GP index26). Every case exactly forward-replays the untouched p55 and passes a 76-rune solved-p57-plus-`EACH` positive source plant with one genuine zero-step.

| Original p55 inverse | GP29 IoC | Exact native English word matches among 17 printed words | Matches of length ≥6 |
| --- | ---: | ---: | ---: |
| Clockwise, initial 0 | 0.038596 | 0 | **0** |
| Clockwise, initial p54 last rune | 0.037544 | 1 | **0** |
| Counterclockwise, initial 0 | 0.039649 | 3 | **0** |
| Counterclockwise, initial p54 last rune | 0.037544 | 4 | **0** |

All four inverses remain nonlinguistic. This is a **bounded negative of a particularly natural source-ring-to-page pairing**, not evidence that the exact circumference-length equality was unintentional. A different key consumer could still use the outer ring. Do not introduce unmarked rotations, arbitrary seeds, or altered byte projections to rescue this specific multiplier model.

## Decision

The multiplicative feedback hypothesis gives a clean, human-executable 29-symbol *mechanism candidate*, but **neither original plaintext nor key is recovered**. Two stronger observations change the next decision: the 23 printed-boundary repeat events fail the fixed-EA native-English expectation, and all 791 words of length≥6 eliminate a secret *word-constant* affine delta decoder. Direct original-cipher dynamic keys from the printed 32×8 table, the table's exact outer76→p55 circumference, and the authentic solved-p56 prime-totient stream are all nonlinguistic. A wordwise cyclic rotation reconciles the otherwise conflicting repeated-rune *counts* in a predictive length-conditioned control, but only 5/791 longer words are affine-compatible even after arbitrary rotations. The remaining avenue demands an original clue that identifies a **rune-varying reversible key/state operation** and any word-specific rotation rule, or a different representation before feedback. A claim from a few coincidental short words or an arbitrarily chosen key would not advance the solution.

**Reproduce:** all four CommonJS SFTs use Node.js 22 built-in modules, and [manual original-source CI run 43476606833](https://github.com/FlareZ123/liber-primus/actions/runs/43476606833) passes all three, including the exact 29-symbol word-initial frequency comparison. Inputs and vocabulary are committed in `resources/`; physical p50 contributes no rune text.
