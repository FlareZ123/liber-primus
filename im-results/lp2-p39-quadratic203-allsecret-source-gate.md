# Original p39 red quadratic: all-secret 203-period additive-stream exclusion

**Agent 50, 14 November 2026. Evidence status: key-independent original-cipher exclusion, conditional on a newly specified source-based operation and native GP-English register.** The autonomous, ciphertext-forced and plaintext-autokey hypotheses tested below do **not** recover unknown LP2 plaintext, an original author-specified key, a full cipher, or Cicada's continuation address. The reason to retain it is a decisive, inexpensive result for a distinct **two-state recurrence whose coefficients come from a visibly marked three-rune original clue**, rather than fitting a guessed keystream.

## Authored source and precise missing step

Original physical LP2 **p39**, archive scan 56.jpg, prints the red rune triple at its local rune offsets **119–121**. The canonical original indices are **[27,5,15]**. The independent p15 signed Fibonacci-prime 4×4 matrix shares its eigenvalue **24** with the quadratic obtained by interpreting the p39 triple in ascending coefficient order:

\[
Q(x)=27+5x+15x^2=15(x-24)^2\pmod {29}.
\]

The printed source authenticates only the three runes, not the polynomial or an encryption operation. The earlier full p15/p39 matrix-power attack and the p39 **256-cell table-polynomial derivative** attacks are separate operations, already tested in [the p15/p39 evidence](lp2-p15-p39-signed-matrix-eigen-crosslink.md), [changing Hill gate](lp2-p15-p39-matrix-power-original-inverse.md) and [grid jet report](p39-grid-jet-autonomous-state.md). This gate specifically asks whether the *red quadratic itself* is the characteristic polynomial of a compact **two-state additive pad**, with no assumption about its secret starting values.

## Fully secret key family and its exact invariant

Divide by the nonzero leading coefficient 15 over GF(29). The fixed monic quadratic is

\[
x^2+10x+25=(x-24)^2.
\]

Its standard linear recurrence is

\[
k_{i+2}=19k_{i+1}+4k_i\pmod {29}.
\]

The two initial runes \((k_0,k_1)\) are **completely unknown**, with all **29² = 841** possibilities allowed. An arbitrary sign is allowed in the additive cipher \(C_i=P_i\pm k_i\bmod29\). The source-visible body immediately after the original p40 eight-red-rune heading gives **3,000 original runes** across physical pp40–53, including the runeless p50. The readout clock begins with its first black rune, runs continuously across printed page boundaries, and preserves all printed words and glyphs. There are **667 complete words** in this body.

Every stream satisfying this recurrence has the form \(k_i=(a+bi)24^i\) over GF(29). Since 24 has multiplicative order seven and the linear factor has period 29, **every one of the 841 possible streams repeats after 203 runes**, including the shorter-period special cases. Therefore, for any two original ciphertext positions with the same index modulo 203,

\[
C_i=C_j\quad\Longleftrightarrow\quad P_i=P_j.
\]

This is exact for **every starting key and either sign**, without guessing the two states, any key values, or decoded words. The entire hypothesis can be tested by counting within-phase equality pairs.

## Untouched original result and independent controls

| Original or control input | Equal GP-symbol pairs at same position mod 203 | Total same-phase pairs | Equality rate |
| --- | ---: | ---: | ---: |
| **Original pp40–53 black body** | **745** | **20,685** | **0.0360164370** |
| Lowest of 300 source-native, exact-word-length-matched Gibran controls | 1,129 | 20,685 | 0.0545806140 |
| Median control (index 149 of sorted 300) | 1,236 | 20,685 | 0.0597534445 |
| Highest control | 1,353 | 20,685 | 0.0654097172 |
| Independent positive plaintext sample | **1,205** | 20,685 | **0.0582547740** |
| The same sample truly encrypted under hidden seed (9,24) | **1,205** | 20,685 | **0.0582547740** |

The genuine source register controls use Gibran's prose from the repository, transliterated to 29-symbol GP using its established multigraph and historical orthography normalization. Each of the **300** deterministic controls independently chooses one real GP-native source word of **exactly each of the original 667 printed word lengths**, preserving all 3,000 original positional boundaries, but selecting **zero values from the ciphertext**. The first such plaintext control is separately encrypted with the actual specified two-state recurrence and recovered exactly under its planted seed; phase equalities remain identical under the encryption. For the autonomous model, the SFT also tests the full original **841 secret seed pairs × two additive signs = 1,682 original-source inverses**, verifying **745 exact phase-equality pairs** on every output and reconstructing all 3,000 original ciphertext runes.

These measurements do not yield a population-wide probability about an unknown author or arbitrary language, and they do not rule out every possible plaintext or symbol transport. They do establish that this particular source-derived, direct, fixed-clock GP29 additive stream cannot yield the tested natural GP-English register for **any** secret two-rune starting key. It is unproductive to search those 841 keys for ordinary recovered English.

## Ciphertext-forced two-state feedback, with every secret seed excluded

A new operation within the same visibly supplied quadratic is to **feed the preceding published ciphertext rune into the register**, avoiding the 203-period limitation of an autonomous LFSR. Two independent GP encodings are available from the original alphabet: the rune's zero-based index, or its assigned GP prime value reduced modulo29. Under either source-defined forcing register \(f\), test the exact recurrence

\[
k_{i+2}=19k_{i+1}+4k_i+f(C_i)\pmod{29},\qquad C_i=P_i+s\,k_i\pmod{29},\quad s\in\{+1,-1\}.
\]

This is an exact reversible, **ciphertext-driven** cipher, since \(C_i\) is known before the subsequent pad update. Both initial states \(k_0,k_1\) remain arbitrary over all 841 seed pairs, independently of either sign.

The modified keystream is generally aperiodic, so a direct periodicity claim would be invalid. Its original-cipher **particular solution** is nevertheless fixed by the published ciphertext: compute \(d_0=d_1=0\), with \(d_{i+2}=19d_{i+1}+4d_i+f(C_i)\). Every possible seeded stream has the exact decomposition **\(k=d+h\)**, where the homogeneous difference \(h\) satisfies the original period-203 recurrence. Thus the adjusted published observations **\(R_i=C_i-sd_i\)** have the same equality count modulo203 under *every* arbitrary initial key as the unknown plaintext \(P_i=R_i-sh_i\). The test makes no language-based seed selection.

| Ciphertext forcing value | Cipher sign in \(C=P+s k\) | All-key original adjusted equal pairs / 20,685 | Original equality rate |
| --- | --- | ---: | ---: |
| GP zero-based rune index | +1 | **736** | 0.0355813391 |
| GP zero-based rune index | −1 | **700** | 0.0338409475 |
| GP assigned prime reduced modulo29 | +1 | **739** | 0.0357263718 |
| GP assigned prime reduced modulo29 | −1 | **685** | 0.0331157844 |

Every alternative remains below **1,129 pairs**, the lowest of the **300 exact-original-word-length GP-native controls** frozen independently above. The reproducer constructs the particular solution directly from all 3,000 original runes, asserts these four exact equality counts, and tests the corresponding aperiodic encrypt/decrypt recurrences on an independent native-GP positive plant under seed [9,24]. In all four planted cases, the full original-length plaintext recovers exactly and the adjusted-encoded source has the precise GP-native phase equality count **1,205**.

**Decision for this extension:** these four *source-defined quadratic, ciphertext-forced two-state GP29 additive variants* likewise fail the fixed original pp40–53 English register for **every possible two-rune starting key**. This covers an independent, generally aperiodic feedback family; it does not establish that Cicada used ciphertext-driven feedback, the p39 quadratic as taps, or an additive cipher at all. Secret state-dependent symbol alphabets, word/page clocks and further nonlocal operations are outside these tests.

## Plaintext-driven quadratic autokey: all 3,364 original full-seed inverses

A third, historically familiar operation is a **plaintext-autokey cipher**, advancing a two-rune register from the recovered previous plaintext rather than from published ciphertext. It is a genuinely different family from the additive autonomous and ciphertext-forced cases above. Take the exact same original p39 quadratic and solve

\[
C_i=P_i+s\,k_i\pmod{29},\qquad
k_{i+2}=19k_{i+1}+4k_i+f(P_i)\pmod{29},
\]

where \(s\) is either sign, \(f(P)\) is either the **GP index** or the corresponding **GP prime value reduced modulo29**, and \(k_0,k_1\) are completely unknown. This is a reversible sequential cipher under any initial state: recover \(P_i=C_i-s\,k_i\), then compute \(k_{i+2}\). Plaintext feedback generally destroys the exact 203-period all-secret cancellation of the preceding tests, so here **every one of the 841 possible seed pairs is actually decrypted** for each of the four finite models, **3,364 distinct complete 3,000-rune original inverses**.

Use original printed word boundaries without fitting them. Train a fixed GP29 within-word bigram log model on repository Shakespeare, using standard published GP multigraph and historical orthography normalizations. Evaluate the untouched 2,333 within-word transitions in each original inverse. Independently construct 100 length-matched GP-native Gibran controls using the exact 667 original word sizes; source-word values never enter the original key search. The entire controls' scores are **−2.41812 through −2.30111 nats/within-word pair**, with median **−2.36351**. The unmodified original ciphertext scores **−5.69732**.

| Decoded plaintext feedback injection | Cipher sign | Best secret seed \((k_0,k_1)\) of all 841 | Best original GP-English log score |
| --- | --- | --- | ---: |
| GP rune index | +1 | (10, 5) | **−5.49550** |
| GP rune index | −1 | (26, 10) | **−5.53483** |
| Assigned GP prime modulo29 | +1 | (14, 12) | **−5.73197** |
| Assigned GP prime modulo29 | −1 | (3, 13) | **−5.65701** |

Even the strongest of the **3,364 full original decryptions** falls far below *every* length-matched true English control under this independently fixed text metric. The SFT forward-reconstructs all **3,000 original ciphertext runes** from each of the four best complete keys. Four source-native positive plants of the same length under planted seed [9,24] reverse to their complete native plaintext **exactly**, and the exhaustive language ranker detects the correct native-language register. The ranker is **not assumed to recover the unique planted seed**: in one positive experiment a different seed scored higher while the true seed reconstructed perfectly. This distinction is explicitly preserved in the executable as an identifiability limitation rather than silently calling a score-maximizing seed the true key.

### Stronger all-key period-28/7 invariant for the plaintext-index models

There is a stronger, **language-ranker-independent, key-independent necessary condition** for the two GP-index-feedback models above. Here the injection is exactly the recovered GP-index \(f(P_i)=P_i\), which is linear over GF(29). Hold the published ciphertext \(C\) fixed and compare solutions for any two secret starting states. Their pad differences satisfy

\[
\Delta k_{i+2}=19\,\Delta k_{i+1}+(4-s)\,\Delta k_i\pmod{29},
\]

because \(\Delta P_i=-s\,\Delta k_i\). When cipher sign \(s=+1\), the characteristic roots are **7 and 12**, with multiplicative orders seven and four, so **every** seed difference has period dividing **28**. When \(s=-1\), the roots are **23 and 25**, both of order seven, so **every** seed difference has period dividing **7**. The roots are distinct in each case. Hence at any two positions in the same phase modulo28 or modulo7, respectively, all possible secret seed differences cancel. **Plaintext equality within one phase is an exact invariant of the observed ciphertext under all 841 secret states**.

Count equal rune pairs in the zero-seed decoded particular text; the count is identical for all other keys. Compare with **100 native GP-Gibran controls independently drawn with all 667 exact source word lengths**:

| Original model | Exact phase | Original equal pairs | Total pairs | GP-native 100-control range, equal pairs |
| --- | ---: | ---: | ---: | ---: |
| GP-index autokey, sign +1 | 28 | **5,335** | 159,216 | **9,142–9,970** (median 9,477) |
| GP-index autokey, sign −1 | 7 | **22,194** | 641,358 | **37,098–39,953** (median 38,260) |

These observed counts are far below every original-word-matched control, for **all secret keys**, with no trigram-fitting premise. The new SFT computes both exact original key-independent counts, checks periodic equality of the two independent seed-basis differences, and verifies equality preservation under a **real** source-native GP-encrypted positive plant. [Full original Windows Node22 regression, success run 43542754148](https://github.com/FlareZ123/liber-primus/actions/runs/43542754148).

The **prime-residue plaintext-autokey** variants are nonlinear in the decoded plaintext, so this new cancellation proof does **not** apply to them. Those two variants remain excluded only by the complete 841-key search and source-native score comparison documented above. The original red inscription does not supply an autokey instruction; this is a precisely bounded alternative architecture test.

This is a key-complete original negative on a fixed 2014-available two-state plaintext-autokey construction. A non-GP English output, a different injection alphabet, page-local resets, an independent non-additive layer, or another meaning of the red inscription remains outside this finite test. No source establishes that the creator meant autokey.

**Reproducer:** [quadratic plaintext-autokey all-secret SFT](../sims/lp2_p39_quadratic_plaintext_autokey_allsecret_sft.cjs). [Passing Windows Node22 original all-seed, all-model regression 43542272241](https://github.com/FlareZ123/liber-primus/actions/runs/43542272241), after correcting the planted-seed uniqueness assumption exposed by the prior test.

**Stronger nonparametric corollary for period203:** the autonomous equality obstruction is independent of addition and the specific LFSR once the p39-derived 203-step clock is fixed. For an arbitrary separate, wholly secret GP29 **bijective substitution at each of 203 clock phases**, with **203 independent 29! lookup tables**, equal cipher runes at two positions of the same phase are equivalent to equal native plaintext runes at those positions. The original **745/20,685** comparison therefore excludes, at the same native GP-English register, **every** 203-phase periodic monoalphabetic-substitution channel, even if its lookup tables have no additive or linear structure and even with an additional fixed plaintext relabeling. This is stronger than enumerating any keyspace. A deterministic positive plant using a distinct affine symbol bijection at each of the 203 phases exactly preserves the native phase-equality counts and reverses all 3,000 symbols. The theorem does **not** cover position-dependent clocks, periodicity broken by original ciphertext/letter feedback, symbol deletion, non-bijective encodings or another language register.

### Arbitrary unknown fixed GP29 alphabet extension

The same source-derived **equality proofs cover more than identity rune labels**, at **zero extra key search**. In the autonomous 203-period model, allow **both** (i) an arbitrary fixed unknown bijective relabeling of all 29 native plaintext runes **before** the periodic additive step and (ii) an arbitrary fixed unknown bijection of the final cipher runes **after** the step. For any two positions 203 apart, the identical key value cancels and injectivity preserves equality through both relabelings. Thus **745/20,685** is the required native same-phase coincidence count for **every** possible fixed secret input and output alphabet permutation, including all 29! substitutions in each position. A native-GP positive plant with a hidden outer affine permutation confirms this equality and inverts exactly.

In the four public-ciphertext-forced models, the known particular stream can be subtracted **after** encryption. Their all-secret same-phase equality tests likewise remain valid under an arbitrary fixed unknown **plaintext-input alphabet bijection** in the additive GP29 state register. The extension does **not** cover an arbitrary unknown ciphertext-output permutation in the feedback models, because the literal published ciphertext is itself the state-forcing source.

For the plaintext-**index** autokey, the exact period28/7 **seed-difference proof** remains valid if **all native plaintext runes first pass through any one fixed unknown 29-symbol bijection**, because the feedback is on the transformed index. The decoded particular text's same-phase equality is unchanged by every unknown seed, and equality of the inner transformed plaintext is exactly equality of the native text. A separate source-native positive plant under nonidentity fixed affine relabeling passes both the same-phase invariant and full inverse relabeling. The non-linear plaintext-**prime** feedback remains outside this exact arbitrary-alphabet argument.

**Scope:** the proof handles truly arbitrary *fixed* GP29 bijections without enumerating 29! keys; evolving keys, position-dependent alphabets, non-bijective encoders, variable clocking, altered word segmentation and other plaintext language registers remain untested. The manuscript does not authenticate such a substitution layer.

## Reproduce and decision

Run the [single runnable CommonJS original-input test](../sims/lp2_p39_quadratic203_allsecret_sft.cjs) on Windows Node 22 from the repository root:

    node sims/lp2_p39_quadratic203_allsecret_sft.cjs

**Original-input Windows Node22 regression:** [autonomous all-key suite passed, run 43540653038](https://github.com/FlareZ123/liber-primus/actions/runs/43540653038); [autonomous plus four aperiodic ciphertext-feedback variants passed, run 43540960941](https://github.com/FlareZ123/liber-primus/actions/runs/43540960941). The latter run validates the consolidated current SFT after the feedback extension.

It reads the immutable resources/liber-primus/lp2-corpus.json, the full original lp2-transcription.txt word-boundary source and the same checked resources/control/gibran_prophet_58585.txt reference already used by the per-page progressive-affine gate. It asserts the original p39 red-triad indices, the complete 3,000-rune/667-word original target, quadratic normalization, period proof, original 745/20,685 result, all 1,682 original autonomous keyed inverses, four ciphertext-forced all-key invariants, all three reference quantiles and independent encrypted-GP positive plants. The exact decoded output is intentionally not language-fitted.

**Decision:** retire the *fixed continuous p39 quadratic two-state GP29 additive cipher* in its autonomous, four ciphertext-forced and four plaintext-autokey variants as direct unchanged-word-boundary GP-English explanations of the p40 section. The autonomous and ciphertext-forced decisions use exact all-key collision invariants; both plaintext-index autokey models now also admit exact all-key period-28/7 collision invariants. The two nonlinear plaintext-prime autokey models retain the frozen, positive-controlled exhaustive GP-native scoring gate. A page-reset clock, different use of the quadratic, non-additive or transformed interior symbol register, and a different plaintext language remain open; no original instruction selects them. Further seed optimization is logically unable to change the original equality count. Prefer an independently source-supplied output operation or genuine key material before revisiting this branch.
