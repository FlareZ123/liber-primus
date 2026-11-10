# The 2014 onion7 133/331 pair: GF29 inverse and original-cipher frequency obstruction

**Agent 13, 10 November 2026. Classification:** an exact cross-source arithmetic observation and a bounded, executable negative for a specific source-defined two-rune decoder. **No unknown LP2 plaintext, original cryptographic key, authorial arithmetic link, or final destination has been recovered.**

## Independent historical and manuscript inputs

The preserved [2014 onion7 HTML](../resources/cicada2014-onion7-index.html) has HTML title **133**, a div identifier **331**, and **58 numbered page-image references**. The second Liber Primus release has 58 physical pages, and the [Gematria Primus cipher alphabet](../resources/liber-primus/lp2-corpus.json) has 29 symbols. These are externally fixed numbers; their relevance to each other has not been authenticated.

They satisfy four exact identities:

- `133 + 331 = 464 = 8 × 58`; `133 × 331 = 44,023 = 759 × 58 + 1`.
- Over GF(29), `133 = 17` and `331 = 12 = -17`.
- `17² = 12² = -1 (mod 29)` and `17 × 12 = 1 (mod 29)`.
- The same residues modulo 58 are **17** and **41**, and `17² = -1`, `17 × 41 = 1 (mod 58)`. Hence either source number proposes a 4-cycle multiplicative page permutation, with the other as inverse.

The numbers appear in the historical HTML source; the resulting congruences are mathematical deductions, **not historical evidence of a chosen cipher**. Reverse-digit structure and the fixed 29/58 moduli suggest an explicit finite-field test rather than further unconstrained key search.

## A source-locked reversible two-rune proposal

A GP29 two-point mixing model using the two signed roots is

[
\begin{bmatrix} C_0\\ C_1\end{bmatrix}
=
\begin{bmatrix}17 & 17\\12 & 17\end{bmatrix}
\begin{bmatrix} P_0\\ P_1\end{bmatrix}
\pmod{29}.
]

Its determinant is 27, so the inverse exists and is particularly simple:

[
(P_0,P_1) = \big(6(C_0-C_1),\,6(C_0+C_1)\big)\pmod{29}.
]

The [complete source-driven inverse](../sims/onion7_133331_pair_inverse.cjs) tests this mapping and the three signed/swap variants from the two roots. It uses all 12,956 original unknown LP2 ciphertext runes in 55 rune-bearing pages, **2,896 complete source words**, and both pair phases under each of book-continuous, page-restarted and word-restarted pair framing: **24 fixed original-input configurations**. All rune sources agree exactly, and the cipher maps whole two-rune blocks invertibly.

The highest decoded 29-symbol coincidence rate among all 24 is **0.0347510202** (page-reset phase0), close to uniform `1/29 = 0.0344827586`; the canonical book-continuous phase0 inverse yields **0.0346608281**. Its beginning transliterates `POEOINCBBNGXJTHEPUSCC...`, with no sustained readable text. A disjoint GP-encoded Shakespeare reference of the same 12,956-rune length has **0.0592783412** coincidence.

### An exact obstruction even with secret output alphabets

The inverse produces two rune channels of roughly equal length. Suppose a further unknown substitution maps each channel to GP plaintext with a **completely arbitrary 29-symbol permutation**, independently for the first and second channel. For any one plaintext rune, the most it can receive is the largest observed frequency in channel A **plus** the largest in channel B. Unpaired source runes are generously counted as *all* that target rune. This is a necessary condition that does **not** depend on knowing either substitution.

A concrete native-GP benchmark is the letter E, GP index 18, occurring **1,546 times** in the independently held-out Shakespeare 12,956-rune reference:

| Pair framing | Actual paired rune blocks | Unpaired runes granted freely | Absolute maximum E after any two secret channel substitutions | Minimum edits to permit 1,546 E runes |
| --- | ---: | ---: | ---: | ---: |
| Whole book, phase0 | 6,478 | 0 | **512** | **517** |
| Whole book, phase1 | 6,477 | 2 | **524** | **511** |
| Physical page, phase0 | 6,462 | 32 | **543** | **502** |
| Physical page, phase1 | 6,439 | 78 | **578** | **484** |
| Whole word, phase0 | 5,753 | 1,450 | 1,921 | Not excluded by this E bound |
| Whole word, phase1 | 4,307 | 4,342 | 4,705 | Not excluded by this E bound |

Allowing **different secret channel alphabets independently on every physical page** still gives only **1,006 / 1,032** possible E instances in page phases 0 / 1, with all 32 / 78 unmatched glyphs counted as E. This is a stricter family than unconstrained word-local substitution; it still cannot directly encode the native benchmark without additional alterations.

The final column is a conservative bound: changing a printed ciphertext rune in this pair transform can affect **at most two recovered plaintext positions**, so reaching the reference E count after an unknown rewrite layer needs at least `ceil((1546-capacity)/2)` altered ciphertext runes. These thresholds are specific to the reference's E count. They are **not** universal bounds for Latin, non-natural-language text or a different plaintext distribution; a changing state or nonstationary glyph register can escape them.

## True encrypted plaintext and 81% collision-repair controls

Encrypt the native Shakespeare GP control with the exact source-root forward pair matrix, then invert the output: **all 12,956 plaintext runes recovered exactly**. A separate forward control uses the existing 81%-of-tentative-doublets correction rule, replacing colliding ciphertext with a nonrepeating symbol before word-local index6 or with `24−2×C[i−6] (mod29)` thereafter. The deterministic seed `0x133331` produces **266 genuine printed-cipher edits** on a 12,956-rune encrypted English book of the same source word lengths.

Despite 266 ciphertext edits, the unchanged direct inverse still recovers **12,432/12,956 source plaintext runes**, and its output IoC is **0.0581891696**. The original LP2's best original inverse stays near **0.03475**. This is direct discrimination against a source-root pair cipher followed by *that specific* sparse collision repair. A different, more destructive or state-dependent rewrite rule remains possible.

The small page-order hypothesis from the same 58-page residues fares poorly: the previously identified 12–17 GP step arc appears in **23/54 actual sequential page joins**, compared with **10/54** in the 17-multiplier page order and **18/54** in the inverse 41-multiplier order. These are descriptive counts on a previously selected statistic, and no discovery-wide significance attaches to them.

## Original-input GP29 quarter-turn feedback oscillator with fully exhausted hidden seeds

A source-root two-rune *static* transform is excluded above. A changing, source-constrained mechanism is substantially different: use the two square roots of minus one as time-evolution multipliers, with **the previously emitted ciphertext** driving the state:

```text
u[t+1] = (17*u[t] + C[t]) mod 29
v[t+1] = (12*v[t] + C[t]) mod 29
K[t]   = (u[t] + v[t]) mod 29
```

Since `17+12 = 0 mod29` and `17^2 = 12^2 = -1 mod29`, every possible such state obeys the **observable feedback recurrence**:

```text
K[t+2] = (2*C[t+1] - K[t]) mod 29
```

The two unrestricted initial GP29 registers `(K[0],K[1])` cover *all* possible initial oscillator states: the two corresponding observation equations are invertible because `12−17 = −5` is nonzero modulo29. Model encryption is `C[t] = (P[t] + sign*K[t]) mod29`, with `sign` chosen independently as +1 or −1. Decrypt and re-encrypt follow exactly by recurrence, **without guessing missing ciphertext or constructing a heuristic plaintext**. There are **2 × 29² = 1,682** distinct source-fixed seed/sign choices per reset stream.

[Source-locked blind inverse and actual-English control](../sims/onion7_133331_feedback_inverse.cjs) exhaustively fits every seed/sign on the **first half of each reset unit**, then freezes that choice for the completely untouched second half. The only GP-language model is the 174,207 GP runes obtained from the first 240,000 bytes of the independent Shakespeare control text, with GP-word transliteration and 0.5 unigram pseudocounts. Scores below are mean natural-log ratios of the candidate's GP symbol likelihood relative to a uniform GP29 source; positive numbers denote natural-English-like concentration under this frozen prior.

| State reset scope | Exact original models searched | Original fitted train log ratio/rune | Original untouched heldout log ratio/rune | Blind native-English true seed recovered | Native-English with sparse repair heldout ratio/rune |
| --- | ---: | ---: | ---: | ---: | ---: |
| Whole book | 1,682 | −0.810570 | **−0.941854** | **1/1** | **+0.338908** |
| Eight source sections | 13,456 | −0.676652 | **−0.930013** | **8/8** | **+0.346014** |
| 55 rune-bearing physical pages | 92,510 | −0.396626 | **−0.921263** | **54/55** | **+0.344001** |

These are **107,648 independently scored candidate seed/sign configurations across the three declared clocks**, with no unrestricted per-symbol key fitting. The original's apparent training improvement from more resets is a multiple-selection effect: the independently heldout output remains dramatically unlike native GP-English for all clocks.

**Genuine forward-encrypted source control:** draw the final 12,956 held-out Shakespeare GP runes and encrypt under *unseen random 29² register seeds* at the beginning of each reset unit, always using sign +1. The encoder optionally overwrites a tentative repeated ciphertext rune with a different rune at probability 0.81 and feeds the actual published glyph back into the oscillator. This is a **causally synchronized edit model**: any changed glyph corrupts only its own decoded plaintext position. Respectively 369, 365 and 362 genuine edits occur under whole-book, section and page resets. The blind, first-half-selected search recovers the exact hidden oscillator seeds in 1/1, 8/8 and 54/55 units. With the genuine keys, the decoder recovers exactly **12,587 / 12,591 / 12,594** original English GP runes in the three controls, and the recovered rune sequence re-encrypts to the **identical 12,956 printed ciphertext runes in all three cases**. This provides both independent key-recovery power and a full forward-inverse channel witness.

The original LP2 has no positive heldout GP likelihood, no authentic key and no recoverable GP-English span in this reversible oscillator class. Evolving state and sparse collision handling alone do not rescue this exact source-root mechanism, although a different state recurrence, hidden non-GP intermediate, or side-channel key remains possible.

This section's complete original and planted assertions passed [GitHub Actions run 42853638723](https://github.com/FlareZ123/liber-primus/actions/runs/42853638723) on Node.js 22. Unlike our initial static pair inverse, the feedback oscillator has no independent static equality/frequency bound; its conclusion is an **exhaustive key-conditional likelihood negative**, backed by true-key blind plant recovery.

## Exhaustive 29⁴-key order-four public-feedback closure

The fixed two-register oscillator above is only one choice of ciphertext drive into the source-root quarter-turn. Consider the entire algebraic family of two-register linear states over F29 whose state matrix A satisfies A² = −I, public ciphertext drive B and output row L. For the hidden scalar key K[t]=L*S[t], matrix elimination gives the exact recurrence

\[
K_{t+2}=-K_t+aC_t+bC_{t+1}\pmod{29},\qquad a=LAB,\ b=LB\pmod{29}.
\]

Encryption is \(\ C_t=P_t+K_t\pmod{29}\). All 29² tap choices (a,b) and all 29² startup keys (K0,K1) are allowed, yielding exactly **29⁴=707,281 distinct keys** in the book-continuous model. Opposite additive signs are absorbed by negating both taps and both seeds.

The [full 707,281-key original-inverse SFT](../sims/onion7_133331_general_oscillator.cjs) exhausts every one analytically: compute source-only response streams \(X_t=C_{t-2}-X_{t-2}\) and \(Y_t=C_{t-1}-Y_{t-2}\) modulo29 (both initialized at zero), then use

\[
K_t=aX_t+bY_t+(-1)^{\lfloor t/2\rfloor}s_{t\bmod2}\pmod{29}.
\]

For each of the 841 tap pairs, group candidate GP plaintext symbols into four source-phase histograms. The even and odd startup seeds independently shift disjoint phase groups and each is maximized exactly over all 29 possibilities. This is a mathematical reparameterization of **every** four-parameter key, with no beam-search or approximate search. Select exclusively from the first **6,478 original runes** and score the *unchanged selected key* against the final **6,478 untouched original runes** under the same frozen GP-English source prior described above.

| Original-input quantity | Exact result |
| --- | ---: |
| Exhausted tap-and-key combinations | **707,281/707,281** |
| Training-selected (a,b,K0,K1) | **(16,16,26,4)** |
| First-half GP-vs-uniform log ratio/rune | **−0.80037106** |
| Second-half frozen log ratio/rune | **−0.92493693** |
| Original unknown LP2 plaintext/key recovered | **None** |

**Blind original-layout English positive:** Encrypt the final 12,956 Shakespeare GP runes with source-root taps **(17,12)** and hidden seed pair **(13,11)**. When a tentative emitted rune duplicates its predecessor, perform a different-symbol rewrite at probability **0.81**, feeding the **actual emitted rune** into the future key recurrence. The deterministic control generates **331 genuinely changed glyphs**. The exact exhaustive key-recovery search returns **all four correct hidden parameters**, despite the rewrites, with GP log ratios **+0.36565050** on first-half training and **+0.34562865** on untouched heldout. Given the true key, decoding recovers **12,625/12,956** original English runes; re-encrypting this decoded control yields the **exact 12,956 emitted ciphertext runes**.

The same script verifies that a deliberately wrong key **also** perfectly decrypts/re-encrypts all 12,956 original manuscript glyphs. This check detects encoder/decoder bugs, and has **zero key-identification power**. The actual exclusion comes from the frozen-language failure on the original, compared with robust blind planted true-key recovery.

This is an exact, full finite-family original-input negative **only under one book-continuous state, the GF29 order-four public-feedback linear register and immediate GP29 English-like additive plaintext**. Per-page independent state changes, an unobserved plaintext drive, nonlinear or variable-length transformations, and other registers remain open. It **does not** identify the historical encryption method.

The executable original data analysis and both controls passed [manually dispatched GitHub Actions run 42854934864](https://github.com/FlareZ123/liber-primus/actions/runs/42854934864) on Node.js 22.

## Decision

The historical source numbers provide an exact, constrained **candidate** for a GP29 quarter-turn, two-rune mixing and a two-register ciphertext-feedback mechanism. All tested inverse families, including the complete 707,281-key book-continuous order-four linear feedback closure, fail to recover native GP-English from original LP2. Crucially, an unconstrained secret permutation of each whole-book or page-wide output channel cannot rescue normal English-like letter frequencies without a substantial, otherwise unexplained edit or evolving-state layer.

**Prioritize a different mechanism if pursuing 133/331:** a key schedule or state rule beyond the now-exhausted whole-book order-four linear public-feedback family, with a key independently recovered and a held-out original plaintext interval. The arithmetical coincidences alone cannot authenticate a key.

The complete self-contained Node.js 22/CommonJS runner reads the archived HTML, original rune corpus and independent English control, enforces the 58/29 arithmetic, performs 24 original inversions, calculates all source-symbol capacity bounds and executes both true-key positives. It passed [manual GitHub Actions run 42850152363](https://github.com/FlareZ123/liber-primus/actions/runs/42850152363) with all assertions.
