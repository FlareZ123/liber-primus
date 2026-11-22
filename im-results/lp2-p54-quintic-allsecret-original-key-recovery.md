# Entire hidden five-rune state of the original p54 primitive quintic: exhaustive terminal inversion

**Agent 41, 17 November 2026. Decision: no authentic native-GP plaintext from the exact additive cipher, even allowing every possible secret seed.** The full 29^5 = **20,511,149** five-rune states, under both plus and minus GP29 key conventions, have now been exhausted on original p54 black text and physical p55. The attack recovers independently planted 299-, 223- and 76-rune source-native prose and every corresponding hidden state, but **no unknown Liber Primus plaintext, key or destination**.

## Source-selected hypothesis and competing explanation

Original LP2 physical p54 begins with **nine red GP29 runes** \`[24,19,21,23,27,2,14,10,19]\`, followed by **223 black ciphertext runes** and then p55's **76 ciphertext runes**. As established in [the earlier source-factor report](lp2-p54-red9-triple-linear-factor-gate.md), reading the visible nine-symbol heading as descending GF29 polynomial coefficients gives

\`R(X) = (X-24)(X-19)^2(24X^5+28X^4+2X^3+5X^2+2X+11)\`.

The quotient's monic form \`Q(X) = X^5+6X^4+17X^3+28X^2+17X+21\` is a **primitive irreducible quintic**. A human encountering these numbers could hypothesize a maximal-period, five-state feedback keystream. The previous original-input test fixed the seed to the heading's first five glyphs; the present experiment removes that restrictive assumption entirely. The strongest rival remains that polynomial factoring is an incidental mathematical interpretation of ordinary encrypted heading text. No original Cicada instruction authenticates this cipher family.

Under the exact proposed reversible operation, choose **any** secret \`K[0..4]\` in GF29 and generate all later keys by

\`K[n+5] = -(21K[n]+17K[n+1]+28K[n+2]+17K[n+3]+6K[n+4]) mod 29\`.

Decode with \`P[n]=(C[n]+s*K[n]) mod29\`, \`s∈{-1,+1}\`. Freeze source order and consume every rune exactly once; the main experiment starts at the first **black** p54 rune, carries the clock through the original p54/p55 page seam and includes all **299 original symbols**. To avoid forcing a shared-page key hypothesis, independently exhaust the same full seedspace and both signs on p54 black223 alone and p55's76 alone. No key mask, hidden offset, glyph skip, dictionary-word insertion, cryptogram editing or postselected field polynomial is permitted.

## Exact source, search and controls

- Original input is [canonical physical LP2 indices](../resources/liber-primus/lp2-corpus.json), Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`: physical p54 \`indices[9..231]\` followed by p55 \`indices[0..75]\`. Original runes are embedded as **299 immutable hexadecimal GP indices** in the SFT. The script asserts lengths and exact native-symbol range.
- The GP29 language objective is \`round(1024*ln(29*(f_i+1)/(2950+29)))\` summed over plaintext runes, where the 29 frequencies are frozen from [known solved LP1 Latin reference](../resources/liber-primus/lp1-plaintext-reference.txt) (Git blob \`8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d\`) after source GP digraphs and documented K/V/Z/Q folds. Its **299-rune true-prose interval [500,799)** is strictly excluded from the 2,950-rune prior.
- For **each and every 20,511,149** base29 little-endian initial state, evaluate all ciphertext positions, both sign conventions, and retain the global optimum. The full-score search is exhaustive, with no beam, local optimum or candidate shortlist. Sign-flipped states can be equivalent, so key representatives are not uniquely significant. All reported score units are approximate natural-log relative-to-uniform **per rune**.
- **Positive controls:** independently encrypt the held-out **299 actual native GP runes** with secret state \`1428357\`, and independently encrypt the first223 of this source and the first76 original clear p57 runes. The *same unrestricted full-keyspace inversion*, without being given the state, recovers exactly **299/299, 223/223 and 76/76 source plaintext runes**, respectively; in each case the planted secret belongs to the optimal sign-equivalent state pair. Both the actual original optimum and all controls exactly forward-reencode their input.

| Exact original-input target | Original best log-relative score/rune | Independently planted native-GP control score/rune |
|---|---:|---:|
| **p54 black223 + p55 76**, one continuing key | **−0.304410** | **+0.410555**, 299/299 recovered |
| **p54 black223**, independently initialized key | **−0.251498** | **+0.418696**, 223/223 recovered |
| **p55 76**, independently initialized key | **+0.091052** | **+0.447163**, 76/76 recovered |

The unrestricted original 299-rune optimum has seed representatives \`9525691\` (subtractive) and \`11717998\` (additive), giving the same output. Its beginning in GP transliteration is \`A C Y H B NG S TH AE A F AE B W U AE I NG TH B A H D D N H R T T OE X W O W Y G X R EA R\`: no coherent prose. Even the separately optimized p55 optimum yields no complete English sentence. The **independent planted positives score far above** every original exact-key candidate, despite original optimization over all secrets. This comparison is a language-register-conditioned exclusion, rather than a language-universal impossibility theorem.

## Decision and next causal fork

This closes the source-selected **p54 primitive-quintic + stationary direct additive GP29** hypothesis for the exact terminal text under *all possible* five-rune secret seeds, including independent page resets. The small hidden seed was not the missing ingredient. Different field operations, output alphabets, changing key clocks, literal F skips, non-English plaintext or other source-selected receivers lie outside this gate. They require an independent creator-era cue; parameter rescues on this same original span would only overfit the ciphertext.

**Executable standalone C++17 SFT:** [complete original-cipher exhaustive search](../sims/lp2_p54_quintic_allsecret_nativegp_sft.cpp). It runs on Windows with a C++17 compiler, optionally parallelized by OpenMP. It includes embedded source-fixed hexadecimal original text, independently held-out known plaintext, all 20,511,149 state searches for each of six original/control experiments, exact plaintext/forward assertions and decoded previews. Local compiled execution completed successfully with eight OpenMP threads and produced the scores above. No additional plaintext is claimed.
