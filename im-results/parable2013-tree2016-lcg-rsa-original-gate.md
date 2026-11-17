# PARABLE product and 2016 signed-tree dimensions as a deterministic keystream/RSA selector

**11 November 2026, Agent31. Status: three finite source-led inversions tested on the original LP2 corpus, all negative.** No unknown plaintext, secret, authentic cipher, or destination recovered. This report records a genuinely different route from existing GP29 periodic-LCG, polynomial-table, and historical audio-pad tests. It does not elevate numerical coincidence into authorial intent.

## Authentic source arithmetic that fixes the operands

The original 2013 `761.MP3` TXXX field records **`Parable 1,595,277,641`**. The later solved LP2 p57 PARABLE has a red heading with GP-prime sum **449** and three literal text clauses with GP-prime sums **1259**, **1031**, **1229**. All three clause sums are prime, and their product is exactly **1,595,277,641**. Original-source and historical documentation: [audio source inventory](audio761-original-id3-frame-inventory.md), [p57 number/source work](../workplace/parable-prime-8x7-page-map.md).

The preserved 2016 signed image is **563×569 pixels**, and original LP2 p32 contains a **121-rune** 11×11 square whose first row and column GP-prime sums independently reconstruct those dimensions in order. The authentic 2012 image stage once explicitly instructed the solver to multiply image pixel dimensions by **3301**; the analogous **2016** number is **563×569×3301 = 1,057,465,447**. These dimensions and source-operator comparisons are established in [the p32 geometric report](tree-prime-canvas-partition.md) and [the image-dimension bridge script](../sims/2016_prime_area_gf29_derivative_gate.cjs). Applying the **2012** instruction to a **2016** artifact is a hypothesis, not an authenticated 2016 command.

Three candidate roles of the source values were examined with **no fitted 32-bit coefficients or RSA modulus**.

## Hypothesis 1: 32-bit linear congruential full-period generator

Let `a = 1,595,277,641`, `c = 1,057,465,447` and `x[t+1] = (a×x[t]+c) mod 2^32`. The audio product is the multiplier and the image-dimension number is the increment, a natural chronological source assignment. Because **a mod4 =1** and **c is odd**, the generator has the full period **2^32** by the Hull–Dobell criterion for the stated modulus, independently of any seed. This source-derived exact property could matter if Cicada intended a simple 32-bit PRNG. It is a weak intent test: for independently random residues, those two conditions hold with probability 1/8; a good period alone is no evidence of a key.

Without choosing a seed based on the unknown ciphertext, the finite original inverse used four literal source seeds **3301**, **1033**, **761** and **449**, three standard 29-symbol output policies (state modulo29; unbiased top-five-bit rejection; unbiased top-byte rejection), two GP29 additive directions, and a fixed continuous original-rune clock. All **24** outputs reproduce the entire ciphertext exactly when the mask is reapplied; all 24 output indices of coincidence lie **0.03444–0.03455**, close to the unchanged original **0.03447840**. No native GP plaintext appeared. In the best output the adjacent repeated-glyph count jumps to **423**, compared with only **86** in the original; neither number is evidence of correct English by itself. A genuine solved-p57 GP stream plant with the same key recovers **12,956/12,956** symbols and has IoC **0.07248161**. Full-period status and successful synthetic recovery are implementation checks, not evidence that the original used the LCG.

The bounded rejection is direct, unmodified, book-continuous **additive LCG keystream decoding** at these four source values and three natural state-to-symbol mappings. It does not rule out other, separately motivated PRNG operations, nonlinear output filtering, side channels, or unknown input material.

### Complete 32-bit seed exclusion using 83 source-printed one-rune words (Agent20, 17 November 2026)

The preceding finite-seed LCG trial left an avoidable question: could *another* unknown 32-bit initialization yield native English under that exact historically inspired generator? A second, completely key-exhaustive original-cipher attack answers it without language-model scoring or guessing any initial value.

Keep **exactly** the prior source-derived 2013 product and transposed historical 2016 dimensions: `a=1,595,277,641`, `b=563×569×3301=1,057,465,447`, `s[t+1]=(a s[t]+b) mod 2^32`. Permit both ordinary GP29 additive orientations `C=P+K` and `C=P−K` with `K[t]=s[t] mod29`. The source printed **83 one-rune words** at 83 independently fixed original absolute GP29 positions, retaining line-wrap and physical-page-carrying words; the first eleven are at offsets **176,244,350,530,644,792,967,1025,1062,1250,1316**. Ordinary native GP-English prose strongly constrains a one-rune word to **A** or **I**; as an intentionally generous sensitivity case, also permit vocative **O**. The corresponding canonical GP29 values are `{24,10,3}`. This is a language/word-boundary hypothesis, not an original Cicada plain-text crib. No unknown rune is otherwise assumed to decrypt into a particular word.

For a one-rune original ciphertext `c[t]`, the possible `s[t] mod29` residues are `{(c[t]−p) mod29:p∈{24,10,3}}` for `C=P+K`, or `{(p−c[t]) mod29:p∈{24,10,3}}` for `C=P−K`. The 32-bit multiplier is odd, so the LCG transition is a permutation of all `2^32` states. Thus enumerating all values of the *first singleton state*, rather than guessing its pre-page initialization, is a **complete enumeration of every 32-bit seed**. Derive the exact affine jump map between each pair of these source-fixed rune offsets by binary squaring, then discard a seed immediately when its next predicted state residue is disallowed. No key, sign or word position is selected by language-score maximization.

| Number of original one-rune words enforced | Full-seed survivors, `C=P+K` | Full-seed survivors, `C=P−K` |
| ---: | ---: | ---: |
| 1 | 444,306,961 | 444,306,962 |
| 2 | 45,962,793 | 45,962,789 |
| 3 | 4,754,767 | 4,754,709 |
| 4 | 491,902 | 491,913 |
| 5 | 50,900 | 51,015 |
| 6 | 5,298 | 5,282 |
| 7 | 507 | 533 |
| 8 | 49 | 53 |
| 9 | 6 | 7 |
| 10 | **1** | **1** |
| **11** | **0** | **0** |
| 83 | **0** | **0** |

These are **exact enumerated integer counts**, rather than estimated Monte Carlo probabilities. All **4,294,967,296 initial state possibilities per sign** are excluded by the **eleventh** unchanged original singleton. The calculation was executed on the actual 83 recovered original source coordinate/value pairs using a separate optimized, exact unsigned-32-bit C++ enumerator; independent jumping-versus-forward-step assertions passed for spans 0,1,2,3,68,106,180,3301,12955. The [same full-space single-file CommonJS test](../sims/lp2_source_lcg_singleton_allseed_sft.cjs) regenerates the 83 sites directly from original runes, asserts source coordinates against the canonical 12,956-rune GP29 corpus, evaluates both signs with parallel workers, and supplies a **12,956-rune native source plant** that uses the exact historical generator and assigns A/I/O at the same 83 source positions. Its forward transformation, reverse decryption and all 83 positive key constraints are checked, guarding against a faulty impossibility due to indexing or jump arithmetic. It is executable directly with Node.js 22 and has a [manual-only hosted workflow](../.github/workflows/agent20-source-lcg-singleton-allseed.yml).

**Strong but conditional decision:** the stated **32-bit affine LCG with state mod29 used as a direct GP29 additive key** cannot produce all original LP2 single-rune words as A/I/O under **any possible seed or either sign**, at the unchanged source positions. No direct 2013/2016 source-LCG key remains to expand into whole-chapter decryption. This eliminates the seed loophole in the earlier four-seed result but does **not** identify the historical cipher, disallow other output functions or state equations, or establish that the 2013/2016 artifacts were designed to define an LP2 LCG. The hypothesis requires a cross-round operation transplant never instructed by the source, so this key-independent negative should be retained as a **finite route exclusion** in `im-results/`, not promoted to an established creator mechanism. No unknown plaintext or destination is recovered.

## Hypothesis 2: three-prime RSA modulus from PARABLE

The 2013 `PARABLE` product supplies the candidate **RSA modulus N = 1259×1031×1229 = 1,595,277,641** and known Euler totient **φ(N) = 1,591,168,720**. Its small exact factors make a pedagogical three-prime RSA puzzle arithmetically possible. We checked four independent literal source exponents **3301**, **1033**, **449** and **761**, all coprime to φ(N). For each, an exact modular private exponent was calculated and verified on a nonzero native six-digit positive plant.

A standard seven-GP29-rune RSA block is a left-to-right base29 integer. It must lie below N. But among **1,829 original page-local seven-rune blocks**, **1,640 already exceed N**, excluding this direct fixed seven-digit ciphertext representation. Six GP29 runes always lie below N because `29^6=594,823,321`, but the RSA private outputs overwhelmingly fail to fit into a six-rune native-GP plaintext block. Across both original **book-continuous and page-local six-rune clocks**, and both orientations of the six printed digits, all 16 cases have hundreds of outputs ≥29^6. For the natural forward book order, just **821/2159** blocks fit for e=3301, **793/2159** for e=1033, **840/2159** for e=449 and **805/2159** for e=761. The other outputs cannot be represented in six GP29 runes without lossy truncation or an additional code layer absent from the source.

This exact length/capacity obstruction retires **ordinary length-preserving GP29 RSA ECB** with the source modulus for the tested six- and seven-rune conventions. It does not rule out RSA as an external key exchange, a different documented byte encoding, or additional expansion/packing conventions, none of which are supplied here.

## Hypothesis 3: Blum-square stream from the original three prime clauses

The same literal p57 sums admit a second natural factorization: **1259 ≡ 3 (mod4)** and **1031 ≡ 3 (mod4)**. Their product **1,298,029** is a Blum integer, and the third p57 prime **1229 ≡ 1 (mod4)** provides a literal leftover seed. The Blum–Blum–Shub-style state `x₀=1229² mod 1,298,029`, `x[t+1]=x[t]² mod 1,298,029` has a **612-state cycle**, without any key search. This possible human operation is conjectural: no surviving Cicada clue selects a squaring stream or its output representation.

The exact original-cipher test uses a continuous 12,956-rune clock, source seeds **1229** or **3301**, and three conventional output functions: state mod29, or five successive least-significant bits in either order, rejecting 29–31 to obtain GP29 symbols. Each masked output is inverted under both ± directions. All **12** original outputs have IoCs **0.034450–0.034523**, near untouched **0.0344784**; none is readable native GP. A repeated solved p57 plaintext plant recovers exactly at every position and every output reencrypts to its original source.

This rejects this precise source-prime BBS additive decoder, without ruling out independently specified prime-state uses. [BBS single-file SFT](../sims/parable_two_blum_prime_stream_sft.cjs); successful [manual CI run 43114464032](https://github.com/FlareZ123/liber-primus/actions/runs/43114464032).

## Reproduction and decision

Primary original-source reproducer: [`sims/parable2013_tree2016_prng_rsa_sft.cjs`](../sims/parable2013_tree2016_prng_rsa_sft.cjs) with Node.js 22. It derives p57 clause values from the original transcription and p32 image dimensions from original GP-prime weights, checks all 55 rune-bearing unknown pages and exact synthetic inverse controls, uses only the selected seed/readout/exponent conventions above, and writes no files. Verified on [manual GitHub Actions run 43113194213](https://github.com/FlareZ123/liber-primus/actions/runs/43113194213), followed by both source-gated tests in [run 43114464032](https://github.com/FlareZ123/liber-primus/actions/runs/43114464032).

The most economical finite inversions selected by combining those historical numbers and by the separately determined Blum integer fail on the original ciphertext. **Next action requires a distinct, original-source instruction selecting a reversible operator, intermediate register or decoder input**. Running more arbitrary PRNG seeds, extra RSA exponents or fitted output permutations from the same suggestive numbers would return to search without a credible human solve path.
