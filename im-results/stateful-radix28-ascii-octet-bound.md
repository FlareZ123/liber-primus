# A key-free printable-ASCII obstruction to stationary stateful radix-28 decoding

**Agent 44, 10 November 2026. Status:** completed original-ciphertext necessary-condition theorem with exact executable and independent planted controls. The original LP2 plaintext, cipher and key remain unknown. This result concerns **direct readable ASCII byte output** under the finite framing and stationary-row assumptions below, rather than an actual successful decryption.

## Mechanism and relevance

The independent preceding-rune alphabet model in [the all-width binary-capacity witness](stateful-radix28-byte-capacity-witness.md) permits a freely chosen permutation for each of the 29 possible previous ciphertext runes. That model can make **836 of 840** tested original-LP2 framings represent *some* valid raw byte values. Binary capacity alone therefore has little decryption-discriminating power. The new question is sharper and directly motivated by recovering text: **could the resulting bytes consist entirely of printable ASCII text, with only the conventional tab/newline/carriage-return controls allowed?**

For every predecessor rune \(a\in\{0,\ldots,28\}\), choose a *single fixed*, otherwise arbitrary row \(S_a:\{0,\ldots,27\}\to\{0,\ldots,28\}\setminus\{a\}\), a bijection. An ordinary published ciphertext transition \((a,b)\) inverts to \(d=S_a^{-1}(b)\). A complete packet of \(D=5n\) such digits, in either natural or reversed packet order, is a big-endian radix-28 integer
\[
V=\sum_{j=0}^{D-1}d_j28^{D-1-j}.
\]
Interpret it as exactly \(3n\) big-endian bytes, so an ASCII text packet must have \(V<256^{3n}\) and its most significant byte must belong to
\[
B=\{9,10,13\}\cup\{32,33,\ldots,126\}.
\]

The finite **840 framing conventions** are six widths \(D\in\{5,10,15,20,25,30\}\), all \(D\) possible initial packet offsets, continuous concatenation or physical-page-local reset, normal or reverse digit order within packets, and two permissive treatments of the original immediately repeated runes: delete the repeated transition from the digit clock or retain the marker in the clock but discard **every** complete packet touching one. The initial rune in each book/page segment supplies predecessor state and is not a digit. Markers are thus not mistakenly claimed to be ordinary reversible transitions.

The source is [the exact 55 rune-bearing unsolved LP2 page arrays](../resources/liber-primus/lp2-corpus.json): 12,956 source glyphs, runeless physical p50 omitted, solved p56–57 omitted. Packet boundaries are model assumptions, not known Cicada instructions. Each framing permits its own secret rows, held fixed across the manuscript for that framing.

## Exact alphabet-free obstruction

Let \(M=28^{D-1}\) and \(H=256^{3n-1}\). If the top octet equals \(b\), then
\[
bH\le V<(b+1)H.
\]
The initial base-28 digit is \(d_0=\lfloor V/M\rfloor\). Thus every possible ASCII top digit is in the finite, exactly computable set
\[
A_D=\bigcup_{b\in B}
\left\{\left\lfloor\frac{bH}{M}\right\rfloor,\ldots,
\left\lfloor\frac{(b+1)H-1}{M}\right\rfloor\right\}
\cap\{0,\ldots,27\}.
\]
The implementation enumerates these intervals using **BigInt**, with no floating-point boundary approximation. It deliberately ignores restrictions on the remaining bytes and digits; those can only strengthen the obstruction.

For a particular framing, gather the **observed packet-leading ciphertext transition** frequencies \(N_{a,b}\) for each preceding rune \(a\). Each row \(S_a\) is a permutation, so at most \(k=|A_D|\) *different outgoing ciphertext glyphs* \(b\) can map to one of the \(k\) permitted initial digits. Even the most favorable secret row must therefore assign forbidden initial digits to at least
\[
F_a=\sum_{b}N_{a,b}-\sum_{\text{largest }k\text{ frequencies in row }a}N_{a,b}
\]
packets. Summing over all 29 predecessor rows gives \(F=\sum_aF_a\). Whenever \(F>0\), **every** possible set of 29 secret row permutations makes at least \(F\) original unmarked packets start with a non-text ASCII octet. This is an exact pigeonhole/counting proof, independent of language frequencies, decryption scoring and the unknown \(28!\) permutation of each row. The fraction \(F/\#\text{clean packets}\) is a conservative lower bound on forced non-text *first octets*, conditional on the framing.

## Executed original-LP2 results

The allowed first-digit sets are \(A_5=A_{10}=\{0,1,3,\ldots,13\}\) (13 values), \(A_{15}=A_{20}=A_{25}=\{0,1,3,\ldots,12\}\) (12), and \(A_{30}=\{0,1,3,\ldots,11\}\) (11). The missing rank 2 is a genuine base-28/ASCII interval artifact.

| Base-28 digits / output bytes | Tested framings | Impossible under every stationary 29-row key | Least forced forbidden-top-byte rate over framings | Minimum predecessor rows violating capacity |
| --- | ---: | ---: | ---: | ---: |
| 5 / 3 | 40 | **40** | **30.47%** | 29 / 29 |
| 10 / 6 | 80 | **80** | **20.51%** | 29 / 29 |
| 15 / 9 | 120 | **120** | **14.88%** | 24 / 29 |
| 20 / 12 | 160 | **160** | **6.26%** | 13 / 29 |
| 25 / 15 | 200 | **200** | **1.62%** | 3 / 29 |
| 30 / 18 | 240 | **239** | **0.00%** | 0 / 29 |
| **Total** | **840** | **839** | | |

There is **one setting unexcluded by this *necessary* condition**: width 30 (18 bytes), physical-page reset, retain doublet markers but ignore marker-affected packets, reverse digit direction, final packet phase **29**. It retains 282 clean packets out of 352 complete packets (70 dropped because they contain a marker). Every predecessor row has at most 11 distinct outgoing glyphs among the 282 first transitions, so the purely first-digit rank pigeonhole is silent. **No actual 29-row mapping has been found that makes this exception decode to ASCII**, and passing this one condition gives no probability or plausibility of readable text.

The five-/ten-digit cases are especially decisive: all 29 predecessor states occur with **more than 13 distinct leading ciphertext successors** in every one of their respective tested frame variants. Their ASCII impossibility cannot be repaired by arbitrarily relabeling the 28 possible successors in every row.

## Independent roundtrip test and preserved execution

The exact [CommonJS implementation](../sims/stateful_28rank_ascii_octet_bound.cjs) checks the original corpus counts, computes the finite exhaustive bound, asserts the 839/840 exclusions and one survivor, and includes a source-disjoint **1,000-packet ASCII plaintext positive control** at each of widths 5, 15 and 30. Each positive picks 29 independently shuffled secret row permutations, encodes genuine ASCII bytes as full-width base-28 integers, emits a valid no-repeat ciphertext stream, then inverts all symbols through the secret rows and recovers the bytes exactly. The key-free bound correctly reports **zero forced forbidden octets** for each planted original-key framing. It recovers all **3,000, 9,000 and 18,000** positive-control bytes, respectively.

[GitHub Actions execution **42788225180**](https://github.com/FlareZ123/liber-primus/actions/runs/42788225180) completed successfully with Node.js 22, including the original-cryptogram 840-case assertions and all positive roundtrips. The existing **manual-only** [adaptive radix-28 workflow](../.github/workflows/lp2-adaptive-base28-manual.yml) now runs the new test alongside the prior binary-capacity witnesses; no per-commit CI trigger was added.

## Implications and the next useful boundary

This is a concrete **no-key exclusion of a broad arbitrary-permutation encoder** for direct printable ASCII, including settings where unconstrained binary-byte capacity is satisfiable. The contrast distinguishes the original ciphertext's incompatibility with this ordinary textual source register from the previously observed nonidentifiability of raw bytes.

It does **not** exclude UTF-8, other alphabets, compressed text, encrypted intermediate bytes, source encoding after arbitrary whitening, ciphertext-dependent changing row permutations, variable-length codes, independent pagewise tables, unknown packet lengths outside the stated finite family, or mechanisms that change the marker/clock interpretation. It also cannot establish that the source was supposed to be ASCII. No output is put forward as recovered Liber Primus plaintext.

The single exceptional 30-digit case could be tested using **two-leading-digit/second-octet constraints**, which couple multiple predecessor rows; a compact constraint-satisfaction formulation might eliminate it without searching \((28!)^{29}\) tables. Any claimed cryptographic breakthrough still requires original-plaintext recovery, a key schedule, and exact forward re-encryption on independently selected LP2 positions.