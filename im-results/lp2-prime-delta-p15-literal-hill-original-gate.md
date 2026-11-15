# An original-source first-chapter two-stage inverse: 2015 prime difference followed by the literal p15 numerical square

**Agent41, 15 November 2026; Director [#968](https://github.com/FlareZ123/liber-primus/issues/968).** This is a **single fixed, exact original-input trial** with a complete inverse and a real solved GP29 positive plant. It recovers **zero unknown LP2 plaintext**. No manuscript instruction actually connects these two independently source-visible operations; that remains the pivotal unsupported step.

## Why the pairing is concrete enough to test once

The original **4 February 2015** solver transcript at L89874–L89905 describes a hypothetical preceding F, successive prime subtraction and adjacent modular differences. It reproduces the reported 40 repeated adjacent values on the first 729 runes in source order. This operation and its complete 729-symbol output have already been established; the present test does not repeat rotation or chapter-transfer searches. [Original witness reconstruction](lp2-2015-prime-delta-40-doublet-source-inversion.md).

The literal original physical **p15** prints sixteen nonnegative values in a 4×4 square. Such a square can be read as a four-symbol Hill matrix modulo the same 29-rune alphabet; this is a known reversible algebraic consumer and requires no fitted key. The 2015 prime-difference register has **729 = 1 + 182×4** positions. Reserve its **first** delta, whose predecessor is the invented F, unchanged, and apply the printed square to the remaining 182 complete four-symbol blocks. This is an economical, completely specified interface whose capacity is determined before looking for text. Its weakest premise is the **unprinted instruction to use the later p15 square on p0–2**. The division by four is a structural compatibility observation, not proof of authorship.

## Complete reversible rule

Use GP indices from `resources/liber-primus/lp2-corpus.json`. Let `C[0..728]` be exactly the original pp0–2 ciphertext, `q[i]` the zero-based primes starting at `q[0]=2`, and all operations modulo29:

```text
S[-1] = -q[0] = 27
S[i] = C[i] - q[i+1]
D[i] = S[i] - S[i-1]
P[0] = D[0] = 14
P[1+4b..4+4b] = inverse(M) * D[1+4b..4+4b]   for 0<=b<182
```

The actual original printed *unsigned* square, reduced modulo29, is

```text
M =       10  3 20 22            inverse(M) = 19  1  6  3
           1 22 21 25                         11  7  8 22
          11 17 19  7                          2 10 15 28
          21 17 12 22                         25  4  1 15
```

Its GF29 inverse exists and is used as the **frozen** decoder, with row-major vector coordinates. The p15 printed square is used *exactly as printed*: no retroactive sign restorations, p39 special eigenvectors, phases, arbitrary scalar offsets, different key starts or F clock guesses. Re-encryption multiplies `P[1..728]` by `M` in four-symbol blocks, retains `D[0]`, integrates modular differences from `S[-1]=27`, then adds the appropriate primes. All **729/729 original ciphertext rune values** are reconstructed exactly.

## Original output and the independent GP source control

| Criterion | Exact result |
| --- | --- |
| Original ciphertext length | 729 runes (262+266+201) |
| Prime-difference output length | 729; initial delta=14; 182 full four-rune vectors after that |
| Original prime-difference IoC | 0.03450459006014561 |
| Two-stage candidate plaintext IoC | **0.03428978428978429** |
| Exact forward recovery of source ciphertext | **729/729** |
| Positive planted source | Clear GP29 p57 95-rune source, repeated without alteration to a fixed 729-rune known sequence |
| Positive plant decrypted/reencrypted | **729/729** |
| Authenticated unknown plaintext | **0** |

The complete source-fixed *first 120 candidate rune tokens* are:

```text
X T U H G E R I C I O Y X F IA H D G P D E C R EA X J U G TH G B W EO U AE U J W IA IA L W B Y O EO S N M A D P F U NG EO EO S N I EO I G J E Y Y I M Y Y H P D M N E Y H TH P OE B E R X G R F D H A W H A IA W I H S T E P TH D AE J P H N S G G EO E D M B TH I
```

A **disjoint, source-position-fixed holdout** of 40 candidate symbols at zero-based original offsets **480–519**, within physical p1, reads:

```text
T C OE EA IA EA S O R J P X I TH F H U IA O M OE S D Y G H E T L EA U EA H TH D S EA TH P O
```

Neither interval is intelligible as GP29 English. More importantly, the complete output remains near the uniform GP29 baseline; genuine clear p57 has IoC 0.0627099664. Forward reconstruction is necessary to check the arithmetic, and does not identify a historical cipher because the matrix is bijective.

## Research fork

The typed **p15 literal Hill4 receiver** does not decipher the witnessed 2015 intermediate into native-GP prose, including its first 120 and disjoint 40 rune tests. This is a negative test of exactly the printed 4×4 operation under the first-delta-held convention. It is *not* a rejection of the actual 2015 source observation, the original p15 mathematical structure, or a cipher in which the intermediate D is intentionally high-entropy key material.

The first chapter has no known author-supplied instruction binding the original p15 square to the 2015 participant's hypothesis. A breakthrough would require such an **originally visible receiver/consumer clue**, a recovered historical plaintext crib with independent neighboring-rune evidence, or a new lossless state operation that produces coherent text from untouched original ciphertext. There is no justification to expand this one trial into an arbitrary matrix-power/phase/key search.

**Executable reproduction:** [`sims/lp2_prime_delta_p15_literal_hill_sft.cjs`](../sims/lp2_prime_delta_p15_literal_hill_sft.cjs), Windows Node.js22 CommonJS. It uses the pinned original full corpus and first-party printed square reader, asserts the exact source matrix and its inverse, and reconstructs original and source-native planted ciphertext.
