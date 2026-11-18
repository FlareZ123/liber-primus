# Original LP2 one-rune crib inversion of source-derived GF(29) LFSR keys

**Current decision, 18 November 2026:** The six previously source-derived or source-inferred low-order linear polynomials H/G/χ and constant-mode extensions remain **completely excluded** as continuous direct GP29 additive-key generators under ordinary English original word boundaries. A distinct, **fixed genuinely source-derived degree-nine polynomial N9**, appearing as an exact irreducible factor of the manuscript's original p50 numerical table, is now also excluded in *both* natural register-coefficient orientations under **all 29⁹ unknown initial register states** and an entirely hidden **fixed** GP29 plaintext alphabet. This ninth-order result survives a fresh chapter-specific key and alphabet on physical pp15–22. No original unknown plaintext, creator-specified key, underlying cipher, or final destination was recovered. The weakest common premise is unchanged: no original source says its numerical polynomials operate as additive key generators on preserved English words.

## Exact original p50 degree-nine factor: all-state, any fixed hidden alphabet (Agent26, 18 November)

An independently exact original 256-cell table polynomial over GF29 has the irreducible primitive degree-nine factor

\[
N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^2+15X+11.
\]

This is a **particular source-fixed, human-visible numeric input**, unlike fitting a ninth-order recurrence to the ciphertext. Its previously tested *red-nine title seed* readings failed direct downstream decoding; this additional test grants **every possible nine-symbol initial secret key**, without requiring the visible red words to be seeds, and grants **any unknown fixed output alphabet permutation**, even though no printed instruction selects LFSR addition. Both ascending-power coefficient order and its reciprocal are tested without tuning their phases.

For each coefficient orientation and each singleton original rune at position \(t\), calculate exactly the nine GF29 linear coefficients of \(K_t\) in an otherwise completely unknown state \((K_0,\ldots,K_8)\) of the recurrence \(N(T)K=0\). Hypothesize only the necessary plain-English fact that each preserved one-rune word is A, I or archaic O. Because any stationary output relabeling is allowed, its unknown pre-output symbol belongs to **at most three field identities** whose actual values are additional unknowns. Branch over every canonical partition into up to three such labels, then use rank-aware GF29 elimination on the **12 unconstrained field variables** (nine seed values and three label values). All singular systems retain their free parameters. This covers all **29⁹ = 14,507,145,975,869** possible initial state *tuples* for each orientation and all 29! fixed alphabet mappings without enumerating them.

| Source-fixed N9 register, exact original cipher | Printed singleton words | Exhaustive consistent-prefix search nodes | Longest compatible prefix | Full secret solutions |
| --- | ---: | ---: | ---: | ---: |
| Continuous full-book clock, ascending N9 coefficients | 83 | **137,204** | **17** | **0** |
| Continuous full-book clock, reciprocal coefficients | 83 | **137,267** | **17** | **0** |
| Independent chapter pp15–22, fresh arbitrary initial state and alphabet, ascending | 18 | **137,433** | **16** | **0** |
| Independent chapter pp15–22, reciprocal | 18 | **137,629** | **16** | **0** |

An original full-length **12,956-GP29-rune source-native English plant** preserving all 2,896 physical word lengths is encrypted under a chosen nine-register seed and arbitrary nonidentity fixed alphabet; exact reencryption/decipherment reproduces every source symbol. The independent solver accepts **8,746** consistent parameter/label assignments on the positive's first thirteen singleton constraints (including the planted assignment); the unconstrained positive is deliberately stopped after thirteen anchors to avoid enumerating exponentially many redundant all-secret explanations of genuine language. All 83 original sites are actually tested on the negatives. Reproduction: [source-original Node22/CommonJS SFT](../sims/lp2_n9_allseed_anyalphabet_singleton_sft.cjs), [successful untouched-source Windows CI 44271306771](https://github.com/FlareZ123/liber-primus/actions/runs/44271306771), and the earlier [complete table factorization](lp2-grid-complete-gf29-factorization.md).

**Decision:** The p50 N9 factor *as a fixed order-nine direct additive keystream* has no valid original continuous key or separately reset p15–22 state under preserved English singleton boundaries. This exhausts the entire unknown-initial-state register in both natural coefficient readings and one arbitrary stationary alphabet. It does not invalidate an N9-consuming cipher with changing alphabet, additional plaintext-dependent skip, per-page resets, nonadditive state, resegmented words or external metadata. The factor still exists exactly as arithmetic; its role in a Cicada-authored solve path is **unproven**. Do not continue tuning new seed phases to rescue this direct receiver.

## Previously established six source-polynomial models (Agent15, 17 November)

## Human-visible evidence and explicit hypothesis

Original LP2 p0–55 has **12,956 original GP29 runes** in **2,896 complete printed words** when page and line wraps are joined. Exactly **83** words contain one GP rune. For an ordinary English plaintext preserving those precise printed word boundaries and GP spelling, each one-rune word must be **A** or **I**, the actual GP29 indices **24** and **10**; permitting the historical poetic interjection **O** additionally grants GP index **3**. This is a linguistic conditional assumption, not a fact about the unknown plaintext. A changing word-separator rule, another language or a nonletter coding layer would invalidate it.

A human player has several unusual, independently visible finite-field inputs. The signed 2013 Cicada `BASE29 3301=3QO` example gives an *inferred* ascending-order polynomial `H=[3,26,24]`; the original red p39 triad gives an independently inferred `G=[27,5,15]`. Their exact product `HG=[23,21,11,17,12]` is a factor of the source p49–51 table's conventional-base60 GF29 polynomial. The signed variant of the original p15 Fibonacci-prime square has characteristic polynomial `χ=[7,10,27,14,1]`. The original p15 signs were restored from its mathematical number construction; the page itself prints only magnitudes. A solver could hypothetically try these small polynomial objects as field-linear key recurrences. **No authenticated Cicada instruction selects a polynomial/LFSR or the additive cipher.** That is the branch's critical unsupported premise.

To grant an additional unknown stationary affine offset without choosing it, also test the characteristic polynomials `HG·(x−1)=[6,2,10,23,5,12]` and `χ·(x−1)=[22,26,12,13,13,1]`. A constant keystream is a solution of the added `(x−1)` factor, so these fifth-order classes include sums of the fourth-order streams with any constant shift. All coefficients are ascending-power GF29 residues.

## Exact original-input all-secret test

For the hypothetical direct additive stream cipher, at each original rune position `i`:

`C[i] = P[i] + K[i] (mod29)`.

Let one of the six fixed source polynomials be `F(x)=a₀+a₁x+...+aᵣxʳ` with `aᵣ≠0`. Its keystream satisfies

`K[i+r] = −aᵣ⁻¹ Σ(j=0..r−1) aⱼ K[i+j] (mod29)`.

Every key coordinate is thus a known linear form in *r otherwise completely unknown initial GF29 symbols*. An original singleton ciphertext `C[t]` yields the **exact key disjunction** `K[t] ∈ {C[t]−24, C[t]−10}` or the broader three-way set including `C[t]−3`. Choose any r singleton positions whose coefficient rows are linearly independent (no plaintext is selected), exhaust **2^r** or **3^r** possible plaintext assignments to those positions, invert the r×r GF29 system to recover each proposed original secret seed, and check all other 83 source positions. This is *complete over the whole unknown seed space* for the defined recurrence and clock; the number of mathematical states 29^r is never approximated or sampled.

The additive sign does not need an extra menu: negating all secret initial states covers the opposite shift sign. Original GP29 letters, punctuation, word lengths, page positions and zero-valued keys are preserved exactly. All 83 anchors and all nine original illustrated chapters have source-established absolute offsets; chapter-reset variants grant a separate arbitrary seed to each chapter.

## Original-cipher decisions

Whole-book continuous 12,956-rune clock, all possible secret initial states, zero survivors:

| Original/inferred characteristic polynomial | Order | Maximum exact A/I matches /83 | Maximum exact A/I/O matches /83 | Complete valid secret keys |
| --- | ---: | ---: | ---: | ---: |
| 2013 H | 2 | 10 | 16 | **0** |
| Original p39 G | 2 | 10 | 14 | **0** |
| H×G, factor of numeric table | 4 | 13 | 19 | **0** |
| Signed-p15 χ | 4 | 16 | 21 | **0** |
| H×G with constant-mode factor x−1 | 5 | 15 | 21 | **0** |
| Signed-p15 χ with constant-mode factor x−1 | 5 | 16 | 23 | **0** |

The original chapter-reset check is separately meaningful because the title/main-body visual layout plausibly suggests nine start positions. For **every order-2 source polynomial**, the chapter p3–7 (eight singleton words) is already impossible under either A/I or A/I/O. For all four order-4/5 variants, p3–7 is impossible under A/I. Under A/I/O, the added constant-mode **χ·(x−1)** order-5 model has one surviving seed on p3–7's eight anchors; it is therefore a clear exception to any blanket chapter-wide claim. The short p54–55 chapter has only two one-rune words; the order-4/5 chapter-reset problem is underdetermined there. Independent fourth-order chapter starts on p0–2 also survive some A/I and A/I/O assignments because only five anchors exist. For these reasons this result excludes the **whole-book recurrence exactly**, and only the individually failed chapters when resets are allowed.

These counts are *exact compatibility bounds for stated English singleton assumptions*. They are a stronger and cheaper key-independent discriminator than choosing a handful of best keys from a language score, but do **not** establish a plaintext phrase or identify the intended Cicada operation. The original HG4 additive family had previously been tested by exhaustive 29⁴ language-score search [here](lp2-hg-fourstate-lfsr-allsecret.md); this new independent test contributes an explicit sparse-crib certificate, the H/G/χ and constant-mode families on one common source-native register, and a reusable seed-recovery procedure. It does not supersede earlier unrelated negative tests.

## Reproducibility and native positive

[Read-only Node22 CommonJS SFT](../sims/lp2_singleton_crib_source_poly_lfsr_sft.cjs) parses the original 58-page source corpus and plaintext-layout transcription from `resources/liber-primus/`, asserts all **2,896 words / 12,956 runes / 83 singletons** with their source offsets, constructs and solves all finite GF29 matrices, and prints whole-book and nine-chapter results for both plaintext grammars. Its independent positive encrypts an alternating authentic A/I string at the **same 83 original anchor offsets** under a hidden `[2,3,5,7,11]` initial key (truncated to recurrence order), then rediscovers that exact unknown seed with one compatible solution. The model can recover the key when its assumptions hold.

**Source-to-solve fork:** Prefer a first-party clue that identifies the next original key state/cipher operation, or a reconstruction of the historical external resource needed for a full direct decoder. Re-run this tiny sparse-crib certificate on that newly specified recurrence *before* a costly beam search. A proposed skip clock or different word-boundary transport needs its own full inverse and cannot be declared excluded by these results. Do not extend to arbitrary higher-order polynomials or other free key families without an independent source instruction.
