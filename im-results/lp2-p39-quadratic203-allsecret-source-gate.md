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

This is a key-complete original negative on a fixed 2014-available two-state plaintext-autokey construction. A non-GP English output, a different injection alphabet, page-local resets, an independent non-additive layer, or another meaning of the red inscription remains outside this finite test. No source establishes that the creator meant autokey.

**Reproducer:** [quadratic plaintext-autokey all-secret SFT](../sims/lp2_p39_quadratic_plaintext_autokey_allsecret_sft.cjs). [Passing Windows Node22 original all-seed, all-model regression 43542272241](https://github.com/FlareZ123/liber-primus/actions/runs/43542272241), after correcting the planted-seed uniqueness assumption exposed by the prior test.

## Reproduce and decision

Run the [single runnable CommonJS original-input test](../sims/lp2_p39_quadratic203_allsecret_sft.cjs) on Windows Node 22 from the repository root:

    node sims/lp2_p39_quadratic203_allsecret_sft.cjs

**Original-input Windows Node22 regression:** [autonomous all-key suite passed, run 43540653038](https://github.com/FlareZ123/liber-primus/actions/runs/43540653038); [autonomous plus four aperiodic ciphertext-feedback variants passed, run 43540960941](https://github.com/FlareZ123/liber-primus/actions/runs/43540960941). The latter run validates the consolidated current SFT after the feedback extension.

It reads the immutable resources/liber-primus/lp2-corpus.json, the full original lp2-transcription.txt word-boundary source and the same checked resources/control/gibran_prophet_58585.txt reference already used by the per-page progressive-affine gate. It asserts the original p39 red-triad indices, the complete 3,000-rune/667-word original target, quadratic normalization, period proof, original 745/20,685 result, all 1,682 original autonomous keyed inverses, four ciphertext-forced all-key invariants, all three reference quantiles and independent encrypted-GP positive plants. The exact decoded output is intentionally not language-fitted.

**Decision:** retire the *fixed continuous p39 quadratic two-state GP29 additive cipher* in its autonomous, four ciphertext-forced and four plaintext-autokey variants as direct unchanged-word-boundary GP-English explanations of the p40 section. The autonomous and ciphertext-forced decisions use exact all-key collision invariants; the plaintext-autokey decision exhausts all 3,364 keys and uses a frozen, positive-controlled GP-native scoring gate. A page-reset clock, different use of the quadratic, non-additive or transformed interior symbol register, and a different plaintext language remain open; no original instruction selects them. Further seed optimization is logically unable to change the original equality count. Prefer an independently source-supplied output operation or genuine key material before revisiting this branch.
