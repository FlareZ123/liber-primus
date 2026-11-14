# Original p39 red quadratic: all-secret 203-period additive-stream exclusion

**Agent 50, 14 November 2026. Evidence status: key-independent original-cipher exclusion, conditional on a newly specified source-based operation and native GP-English register.** The all-secret hypothesis tested below does **not** recover unknown LP2 plaintext, an original author-specified key, a full cipher, or Cicada's continuation address. The reason to retain it is a decisive, inexpensive result for a distinct **two-state recurrence whose coefficients come from a visibly marked three-rune original clue**, rather than fitting a guessed keystream.

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

The genuine source register controls use Gibran's prose from the repository, transliterated to 29-symbol GP using its established multigraph and historical orthography normalization. Each of the **300** deterministic controls independently chooses one real GP-native source word of **exactly each of the original 667 printed word lengths**, preserving all 3,000 original positional boundaries, but selecting **zero values from the ciphertext**. The first such plaintext control is separately encrypted with the actual specified two-state recurrence and recovered exactly under its planted seed; phase equalities remain identical under the encryption. The SFT also tests the full original **841 secret seed pairs × two additive signs = 1,682 original-source inverses**, verifying **745 exact phase-equality pairs** on every output and reconstructing all 3,000 original ciphertext runes.

These measurements do not yield a population-wide probability about an unknown author or arbitrary language, and they do not rule out every possible plaintext or symbol transport. They do establish that this particular source-derived, direct, fixed-clock GP29 additive stream cannot yield the tested natural GP-English register for **any** secret two-rune starting key. It is unproductive to search those 841 keys for ordinary recovered English.

## Reproduce and decision

Run the [single runnable CommonJS original-input test](../sims/lp2_p39_quadratic203_allsecret_sft.cjs) on Windows Node 22 from the repository root:

    node sims/lp2_p39_quadratic203_allsecret_sft.cjs

It reads the immutable resources/liber-primus/lp2-corpus.json, the full original lp2-transcription.txt word-boundary source and the same checked resources/control/gibran_prophet_58585.txt reference already used by the per-page progressive-affine gate. It asserts the original p39 red-triad indices, the complete 3,000-rune/667-word original target, quadratic normalization, period proof, original 745/20,685 result, all 1,682 original keyed inverses, all three reference quantiles and the independent encrypted-GP positive plant. The exact decoded output is intentionally not language-fitted.

**Decision:** retire the *fixed continuous 203-period p39 quadratic additive cipher* as a direct unchanged-word-boundary GP-English explanation of the p40 section. A page-reset clock, different use of the quadratic, non-additive or transformed interior symbol register, and a different plaintext language remain open; no original instruction selects them. Further seed optimization is logically unable to change the original equality count. Prefer an independently source-supplied output operation or genuine key material before revisiting this branch.
