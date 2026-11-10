# Red-pointer F79 primitive-root cycle: source-defined candidate and heldout failure

**Agent 28, 10 November 2026.** Classification: exact arithmetic plus a bounded, unsuccessful cryptanalytic inverse. The red numeric relationship was established by other agents, and its primitive-root extension is exploratory. **No original unsolved LP2 plaintext, key, cipher architecture or destination was recovered.**

## New field-group connection

Original red spans give GP prime sums p40 **435 = 29 × 15**, p15 **638 = 29 × 22**, and p53 **2262 = 29 × 78**. The independently documented page-pointer triangle interprets 15 as zero-based GP index 15 with assigned prime **53**, and 22 as the one-based ordinal of ordinary prime **79**. Since 79 is prime, its nonzero multiplicative group has **78** elements. The source-selected integer **53 is a primitive root modulo 79**: its powers include 53^6 ≡ 22, 53^26 ≡ 55, 53^39 ≡ −1 (all mod79) and 53^78 ≡ 1, with no earlier return to 1. Equivalently, for the distinct prime divisors 2,3,13 of 78, the tests 53^(78/q) ≢ 1 mod79 all pass. Thus the red page values provide a mathematically valid, fully specified 78-cycle: 1,53,44,41,40,66,22,60, ... .

The **2262 = 29 × 78** identity also equals the state count of a product clock combining the 29-rune alphabet with a 78-position field-unit cycle. It follows arithmetically from the already selected red sum and cannot be treated as independent confirmation of intent. A primitive-root relation is not intrinsically very rare (there are φ(78) = 24 primitive roots among the 78 nonzero residues). The red-triangle rule and this interpretation were post-selected; there is no independent cipher instruction specifying a modular-79 field.

## Stronger exact obstruction: no nonidentity projective field action on the GP-prime alphabet

A field cipher must first specify how its 29 plaintext runes appear as elements of F79. The obvious literal interpretation uses the GP rune weights `E_q(i)=GPprime[i] mod q`. We can determine **mathematically**, independently of the LP2 ciphertext or any English reference, whether a nontrivial reversible projective field operation can permute this 29-rune alphabet without changing its encoding.

Among the **29** prime moduli q listed as GP symbol weights, only **nine** yield 29 distinct embedded residues: **61, 67, 73, 79, 83, 89, 97, 103, 109**. The other 20 identify two or more different source runes as the same residue, so they cannot represent all 29 symbols injectively without another channel. For each of the nine injective alphabets S_q, the complete projective family is

\[
f(x)=(ax+b)(cx+d)^{-1}\pmod q,\qquad ad-bc\ne0.
\]

A valid one-rune-per-rune permutation of *all 29 source symbols* requires every image f(x) to remain in S_q and prohibits a pole at any source rune. This includes all Möbius, affine and scalar field actions as subfamilies, and permits the coefficients to change from position to position as long as each keyed row is a full-alphabet bijection.

The exact [29-symbol projective sieve](../sims/gp_prime_projective_stabilizer.cjs) fixes the source residues of GP indices 0, 1, 2, namely **2, 3, 5**. A projective transformation is determined uniquely by its images at three distinct field points. Thus for each q the source alphabet admits only **29×28×27 = 21,924** possible ordered image triples to test. For each triple the standard projective cross-ratio determines all **26 remaining** rune images exactly. Any pole or image missing from the 29-element subset rejects the candidate.

**Exact exhaustion: 21,924 ordered triples × 9 moduli = 197,316 candidates; every field has exactly one automorphism, the identity.** No nontrivial affine, scalar, fractional-linear or inversion map preserves *any* of these nine literal GP-prime source alphabets.

There is also a short analytic proof for the affine subclass. If `x↦a x+b` permutes a set of 29 distinct residues with mean μ and nonzero centered second moment V, preservation of V forces `a²V=V`, hence `a=±1`. The mean fixes `b=(1−a)μ`. In **F79**, the source alphabet has μ=2 and V=10, so the only candidates are identity and reflection `x↦4−x`. The reflection maps the source residue **3→1**, but residue1 is absent from the GP-prime alphabet. All other eight fields likewise have V≠0 and at least one explicit reflection counterexample, asserted in [the companion finite-field source](../sims/gp_prime_field_unit_marker_family.cjs). In particular, multiplication by the red-selected generator **53** fails as an alphabet permutation immediately: **2×53 ≡ 27 (mod79)**, and 27 is absent from S_79.

A purposefully positive control checks the same complete projective enumerator on a different 29-element field alphabet: the **29 nonzero quadratic residues of F59**, a genuine multiplicative subgroup. This synthetic alphabet has exactly **58** valid projective symmetries, including the nonidentity scalar `x↦4x` and reciprocal `x↦1/x`. All 58 are recovered, confirming the sieve detects the intended affine and nonaffine mechanisms when they are present.

**Implication:** A secret sequence of any field-unit, affine or Möbius keys cannot act as nonidentity **whole-alphabet** bijective substitutions on the literal 29 GP-prime residues in F79 or any other injective GP source-prime field. This is a strict group-theoretic no-go under a stated direct-embedding model. Different embeddings, variable-length output, plaintext-dependent key skipping, and an extra field-to-rune representation remain possible. No original LP2 plaintext is claimed.

[Reproducible exact projective proof and 58-map positive](../sims/gp_prime_projective_stabilizer.cjs) · [successful Windows Node22 CI run 42782627040](https://github.com/FlareZ123/liber-primus/actions/runs/42782627040).

### Source-native alternative: F59's unique 29-unit subgroup and a lag-six incompatibility

The previous nine-field no-go fixes the **literal GP-prime residue embedding**. A different 29-element embedding has a precise origin in the same authentic GP table. The rune **ᛏ (T)** has GP index16 and assigned prime **59**, and **59 = 2×29+1**. It is the **only** GP prime q whose multiplicative group F_q* contains a subgroup of order exactly29, since it is the only original GP prime congruent to1 modulo29. The original red-triangle-selected **53 has order29 modulo59**, and its powers give exactly the **29 nonzero quadratic residues of F59**. That subgroup therefore supplies a natural bijective index-to-field encoding `E(i)=53^i mod59`. The other red-triangle-selected ordinary prime79 obeys **79≡53³≡20 (mod59)**. These are exact identities linking GP-assigned59 with the red-selected53/79. They are post-selection arithmetic opportunities, not evidence of an actual cipher.

This alternative is the previously **constructed synthetic positive alphabet** of the projective sieve, now recognized as being defined by *an actual GP prime modulus*. It does have **58** nontrivial-in-general projective automorphisms, in stark contrast to the nine literal prime-residue embeddings. The exact exhaustive set equals the dihedral group D29: all maps on index exponents `i↦i+k` and `i↦−i+k`, with k from0 to28. Thus even this unusually structured source-native option produces only ordinary mod29 additive shifts and index reflections under full-alphabet Möbius operations. Its 58 projective maps have element orders **1, 2, or 29**. Other field polynomial transformations, keyed nonprojective permutations and variable-length encodings remain untested.

There is a **concrete second-order architecture obstruction**: the historically observed LP2 lag-six affine relation involves `T(i)=24−2i mod29`. On 29 rune labels this permutation fixes index **8** and cycles the other **28** indices with exact order **28**. Conjugating a permutation by any fixed relabeling preserves its cycle type and order. Therefore **no direct Möbius action on the 29 quadratic residues of F59 can induce the 28-order lag-six map**, under any rune relabeling. A field-based candidate that explains the lag-six excess must introduce an additional output or feedback mechanism. This test challenges a specific attempt to identify the lag-six map itself as a field projective automorphism; it does not disprove F59 as an underlying keystream field.

The source59 checks are now included as asserted invariants and group-exhaustion identities in [the projective reproducer](../sims/gp_prime_projective_stabilizer.cjs). [Original source and synthetic group CI 42784904344](https://github.com/FlareZ123/liber-primus/actions/runs/42784904344) passed on Windows Node22.

## Finite source-key inverse

[Reproducer](../sims/red_field79_generator_heldout.cjs) constructs all 78 powers and asserts the exact source spans, group order and independent GP alphabet. It examines three reversible families:

- **Affine:** from source unit v_t=53^(t+phase) mod79 define a_t=1+((v_t−1) mod28), b_t=(t+shift) mod29, and C_t=sign·a_t·P_t+b_t (mod29). The multiplier is in 1..28 and is invertible.
- **Reduced additive:** C_t=P_t+sign·(a_t+b_t) (mod29).
- **Raw-residue additive:** C_t=P_t+sign·((v_t mod29)+b_t) (mod29).

In all cases phases are **{0,15,22,53}** (source-derived), b shifts **{0,15,22}**, signs ±1, and clocks are continuous across selected pages or reset for each page. This is **3×4×3×2×2=144 configured inverses**; some additive b-shift choices are equivalent under rune index-of-coincidence scoring, so there are fewer distinct distributions than 144. The reduction from 79 to 29 and the three transformations are hypothetical; they were chosen before examining heldout scores.

Original unsolved training pages are physical **p16–18 (800 runes)**. The candidate with the largest pooled plaintext rune index of coincidence on those pages is frozen, then evaluated on untouched **p19–22 (944 runes)** and on additional p40 and p53. The train winner is *reduced additive, phase0, shift0, sign+1, page reset*. The code runs all candidates, preserves their parameters, and asserts the best fit.

| Input | Untreated IoC | Frozen best inverse IoC |
| --- | ---: | ---: |
| p16–18 training | 0.034267835 | **0.035303504** |
| p19–22 heldout | 0.034356633 | **0.034606018** |
| p40 and p53 secondary holdout | 0.033883953 | **0.033633490** |

Uniform-symbol reference is 1/29 ≈ 0.034482759. No credible natural GP-English plaintext appears under this finite family; the best heldout outputs retain essentially uniform symbol collision statistics. The original continuous bookwide ciphertext also has only **390/10,694 = 0.036469048** exact rune coincidences at source-selected lag **2262**, with **456/12,878 = 0.035409225** at lag78, values near the random reference. Such raw equality tests alone are weaker than full invert-and-score because changing phases, field reductions, hidden key skips or output substitutions could conceal a periodic stream.

A source-language planted positive uses **1,744 fresh GP-transliterated Shakespeare runes** across the exact 7 training/heldout page lengths, encrypting with the source-derived affine period, phase53, shift22, sign−1, continuous clock. Its ciphertext IoC is **0.034336560**; the exact inverse recovers all 1,744/1,744 source runes and restores **0.063687252** IoC. This demonstrates the tested implementation can detect a real matched cipher with an independently sourced natural-language register.

**Reproduction:** Windows Node.js 22, execute `node sims/red_field79_generator_heldout.cjs`. Original-code [GitHub Actions success, run 42778549768](https://github.com/FlareZ123/liber-primus/actions/runs/42778549768) prints all key selections and rates.

## Independent keyless zero-residue exclusion of pure F79 unit multiplication

A sharper test is available for any cipher using the **literal GP prime weights modulo79 as a 29-element subset of F79**. These 29 residues are distinct, but exactly one is zero: GP rune index21 **ᛝ (NG)** has assigned prime **79 ≡ 0 mod79**. Multiplication by *any nonzero field unit*, including an arbitrarily long private sequence of powers of53, satisfies

\[
E(C_i)=K_i E(P_i)\pmod {79},\quad K_i\in\mathbb F_{79}^{\times}
\quad\Longrightarrow\quad (C_i=21)\iff(P_i=21).
\]

This **necessary equality of entire NG-position masks** remains valid if the key is unknown, changes arbitrarily at every rune, or advances through any number of rejected field values. It assumes exactly one GP rune per source plaintext rune and the stated literal prime-residue embedding; a translation, changing alphabet, insertion/erasure or altered plaintext register defeats the inference.

The unsolved ciphertext has **454 NG runes among 12,956 (3.50417%)**. On three independently sourced GP-English registers, use canonical letter-to-rune aliases (QU→CW, V→U, K→C, Z→S, ING→NG) and scan **every possible contiguous 12,956-rune window**.

| Independent source | Total GP runes | Global NG frequency | Windows scanned | Greatest NG count in any window |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare 300k source characters | 217,644 | 0.7025% | 204,689 | **161** |
| Gibran, *The Prophet* | 62,696 | 0.8342% | 49,741 | **156** |
| Emerson, *Essays* | 323,083 | 0.6048% | 310,128 | **119** |
| **Unsolved LP2** | **12,956** | **3.5042%** | n/a | **454** |

The source-window control preserves authentic contiguous word order and concentration rather than assuming every rune is independently sampled. No compared GP-English window approaches the **454 obligatory NG plaintext positions**. A direct illustrative positive uses a known F79 power-stream unit, advances it until the candidate multiplication lands on one of the 29 allowed prime residues, and verifies the exact NG-position equality for **12,956/12,956** GP-English source runes for each control. Its variable-step forward transformation is only an invariant demonstration and is not asserted to be a uniquely decodable historical cipher. On those source positives, the NG counts remain **68, 104, 71** respectively.

**Conclusion:** The original cannot be explained by unmodified English-like GP plaintext under literal GP-prime-residue F79 unit multiplication, regardless of its hidden key phase, period or skip pattern. This conditional exclusion is stronger than the affine/additive IoC screen for that *restricted* multiplication hypothesis, but does not rule out other F79 encodings or affine shifts, and does not recover plaintext.

[Exact original-source invariant and sliding-window reproducer](../sims/red_f79_zero_mask_invariant.cjs) · [successful Windows manual CI run 42780496333](https://github.com/FlareZ123/liber-primus/actions/runs/42780496333).

## Family-level extension: all nine reversible GP-prime field moduli

The preceding zero-mask theorem generalizes without selecting F79 from the red triangle. Consider *every* modulus in the 29-element canonical GP prime-value list. Under the literal embedding `E_q(i)=GPprime[i] mod q`, a standalone deterministic symbolwise field-unit cipher must have **29 distinct embedded residues**, so that different runes are distinguishable when the nonzero multiplicative key is known. Exactly **nine of 29** possible prime moduli satisfy this necessary injectivity condition:

| Field prime q | Mandatory preserved zero rune | Original rune count |
| ---: | --- | ---: |
| 61 | ᛒ, B (index 17) | 445 |
| 67 | ᛖ, E (18) | 439 |
| 73 | ᛚ, L (20) | 460 |
| 79 | ᛝ, NG (21) | 454 |
| 83 | ᛟ, OE (22) | 492 |
| 89 | ᛞ, D (23) | 439 |
| 97 | ᚪ, A (24) | 482 |
| 103 | ᚣ, Y (26) | 448 |
| 109 | ᛠ, EA (28) | 460 |

The other **20** GP-source prime moduli map at least two GP rune labels to the same field residue, so a literal one-rune-in/one-rune-out unit multiplication cannot invert all 29 different symbols without an extra disambiguating channel. Every injective q has a **specific plaintext rune** fixed at all zero-residue positions, independent of the secret key. This supplies an unknown-key necessary condition for all nine eligible models.

To avoid rejecting on frequency alone, the new source-locked [familywise challenger](../sims/gp_prime_field_unit_marker_family.cjs) uses all **2,896 original LP2 word lengths**, including page-crossing words, and simultaneously measures the fixed marker's **total occurrences, occurrences at word starts and occurrences at word ends**. A source English register is sampled by GP-word length, and analytical expectations and standard deviations are computed for all nine candidates. For each candidate, calculate the largest absolute standardized deviation among the three counts, with a declared +0.25 variance ridge for genuinely rare source cells. Select the **smallest** such deviation across *all nine* candidate moduli, then re-select on 2,000 independently seeded, length-matched source-book replicates. This calibrates the family selection, including cases where a marker's total frequency is close to the ciphertext.

In all three English references, the **most compatible** surviving field is q=73, zero rune **L**. The LP2 original marker-L observations are **(460 total, 97 first, 106 last)**.

| GP-English register | Matched expected L (total, first, last) | Smallest maximum absolute z across nine fields | Null replicate exceedances / 2,000 |
| --- | --- | ---: | ---: |
| Shakespeare | (585.19, 91.59, 107.62) | **5.083** | **0** |
| Gibran | (561.37, 98.27, 85.63) | **4.247** | **0** |
| Emerson | (583.54, 84.81, 122.14) | **5.018** | **0** |

Each source-specific familywise empirical upper tail is **1/2,001 ≈ 0.00049975**; the greatest null minimum-score values were only **1.360, 1.296, 1.209** respectively. The cross-source tests are supporting sensitivity checks, not three statistically independent proofs about the unknown manuscript. The candidate-selection method is exceptionally permissive: it lets the cipher choose *any* injective field modulus as its best source-conditional explanation. It still fails the English GP marker-frequency/word-position gate. In particular, q=89, marker D, can appear superficially plausible by overall frequency in one English register but predicts hundreds of **word-final D** occurrences; LP2 has only **93**.

A complete constructive known-key positive encrypts a fresh **12,956-rune GP-English sample** separately under every one of the nine possible fields, taking nonzero multiplication keys that map the source symbols into the permitted 29-symbol embedding. Given those synthetic keys, each inverse recovers **12,956/12,956** runes, and the corresponding marker's entire zero-position mask is exactly preserved. The forward/inverse code asserts all 9 successes. This establishes the intended exclusion against a working, reversible cryptographic construction.

**Decision:** For ordinary English encoded into canonical GP symbols, a literal GP-prime-residue, source-prime-modulus, one-symbol-per-rune unit cipher fails under every injective field choice. This is conditional on the declared plaintext register and preserved original word boundaries. Unmarked field moduli, alternative symbol embeddings, additive translations, variable-length coding, hidden per-word permutations, and non-English intermediates remain outside the conclusion. **No unknown LP2 plaintext is recovered.**

[Source and reproducible family correction](../sims/gp_prime_field_unit_marker_family.cjs) · [successful Windows Node22 execution 42781511854](https://github.com/FlareZ123/liber-primus/actions/runs/42781511854).

## Original LP2 plaintext-recovery attempt: F79-derived IVs and the 256-byte grid

An exact, constructive challenge translates the source mathematics into candidate **16-byte AES-CTR / ChaCha20 IVs** while retaining the independently documented **32×8-byte original base60 grid** as eight possible 256-bit symmetric keys. The visible page-15 **4×4 Fibonacci prime spiral** specifies 16 positions, and the red triangle selects unit53 in F79, cycle78 and the self-index `53^15≡15 (mod79)`. Two IV-generation routes were fixed before looking at any candidate output:

1. **Common self-indexed IV:** for each of the eight red-heading section bodies, IV byte `i` is `53^(15+i) mod79`, for `i=0..15`.
2. **Original red-heading-local IV:** for each body, let `S` be the exact GP assigned-prime sum of that body's original red heading. The exponent is `e=S mod78`, and byte `i` is `53^(e+i) mod79`. The eight source exponents, in physical section order, are **[38, 40, 56, 40, 6, 17, 61, 45]**.

Both feed the **existing exact real-ciphertext Viterbi implementation** from Agent37, preserving its hidden key-consumption on output collisions, all 16 AES/ChaCha/reversed-key/reducer/sign modes, and optimal assignment of the eight original 32-byte grid columns to eight authentic source text bodies. The original ciphertext tested is **8×300 = 2,400** untouched post-title runes. The language model comes from GP-transliterated English Shakespeare, with the positive plaintext from an independently withheld Shakespeare slice. All input IV bytes, key materials, headings and GP outputs are emitted by the code.

| Fixed F79 IV hypothesis | Authentic original best GP trigram score/rune | Shuffled-grid nulls at least as high | Exact independent planted recovery |
| --- | ---: | ---: | ---: |
| Common self-indexed exponent15 | **−5.598080** | **1/12**, add-one 0.153846 | **2,400/2,400**, exact algorithm and all eight key assignments |
| Per-heading GP-sum exponents | **−5.612557** | **1/12**, add-one 0.153846 | **2,400/2,400**, exact algorithm and all eight key assignments |

The first original winner is AES-256-CTR, ordinary byte mod29, positive sign, with eight chosen original column indices **[3,0,5,7,4,6,1,2]**. The second winner is ChaCha20, byte mod29, negative sign, with indices **[0,5,6,7,1,2,4,3]**. Its prefix outputs and the first model's outputs are unreadable GP sequences. Neither source-locked IV model beats its unchanged-selection randomized-grid controls convincingly. Both exact independent synthetic source models are recovered without error, so the original test has real sensitivity under the specifically proposed AES/ChaCha architecture. No original plaintext or key was recovered.

The small 12-run shuffled control is only a rough failure indicator; it is not a high-precision statistical tail. Further re-fitting of arbitrary start exponents or different GP reductions would lose the independent source constraint. A future shared-grid success should recover real text at unfitted body positions and explain the second-order lag-five/lag-six anomalies.

[Source-determined IV generator and direct original-rune Viterbi wrapper](../sims/red_field79_grid_iv_viterbi.cjs) · [successful Windows Node22 execution 42783339371](https://github.com/FlareZ123/liber-primus/actions/runs/42783339371) · [reused independently powered exact decoder](../sims/red_title_nonce_grid_viterbi.cjs).

## Interpretation and decision

The 53-primitive-root/79-field/78-order relationship is an exact new mathematical refinement of the existing red-pointer triangle. It offers an independently source-bounded candidate generator with 78 values and a product-state period of 2262. **The tested simple additive and affine mappings into the 29-rune cipher are unsupported**, including independently heldout pages. No authentic F79 plaintext representation or 29-rune embedding is specified by the artwork. More unconstrained scans of phase, offset, output alphabet and residue reduction would risk overfitting. Future use of F79 should begin by deriving an independently constrained, invertible mapping or testing a new observable that the above finite family could not reproduce.
