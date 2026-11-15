# GP29 Möbius divisor inversion: source-motivated original-cipher gate

**Decision (15 November 2026).** Literal **MOBIUS** appears among the GP-rune-word cells on the original 2014 LP1 p05 Wisdom magic square, on a page expressly naming prime numbers and Euler's totient. Möbius inversion is one mathematically natural consequence of that word, distinct from applying the pointwise function μ to square values. It has not supplied a decoding operation for LP2. Exact original-source whole-book, chapter and page inversions leave the distribution near uniform and yield no coherent opening text. Preserve the clue; retire these six direct original-GP29 inverses unless an independent clue selects a different input register or transform.

## Source-selected premise and controlled assumptions

- The literal printed word **MOBIUS** is in LP1 p05's center row, fifth column. The page's mixed numerical/rune table is reconstructible by GP-prime sums as the 5×5/1033 historical square ([original source reconstruction](2014-magic-square-direction-map.md)). That same original page explicitly says that the totient function is sacred.
- The source **does not** say to perform a divisor-sum transform on LP2, identify a plaintext direction, or select reset boundaries. This is a finite exploratory inverse, not an authenticated creator instruction.
- Two standard Dirichlet incidence directions are tested, with **no fitted keys or phases**: (a) divisor convolution C[n] = sum(P[d] for d dividing n) mod 29, inverted progressively; (b) multiple convolution C[n] = sum(P[m] for m multiple of n) mod 29, inverted from the largest position.
- The GP29 rune indexes are the unchanged canonical original ciphertext values from resources/liber-primus/lp2-corpus.json. Its physical p50 has no runes. Printed rune order is unchanged. No extra literal-F rule is applied because this test defines a distinct complete reversible linear family.
- Three clock choices are fixed before evaluation: one continuous 12,956-rune tape; the nine image-visible chapter lengths [729,1145,1729,1903,1021,1433,1680,3008,308]; and each of the 55 rune-bearing original physical pages. No feedback parameters, key material or arithmetic moduli are tuned.

## Original outcomes

| Frozen reset clock | Divisor-sum inverse GP29 IoC | Multiple-sum inverse GP29 IoC |
| --- | ---: | ---: |
| Whole manuscript | 0.034479208136 | 0.034485869044 |
| Nine visual chapters | 0.034495675712 | 0.034440910893 |
| 55 rune-bearing pages | 0.034489133962 | 0.034470104498 |

Original ciphertext GP29 IoC is **0.034478397865**. The separately clear original p57 PARABLE has **0.062709966405**, confirming what a conventional, nonhomophonic native-GP English register looks like in a short solved control. Every tested inverse retains nearly the original-uniform histogram. Example whole-book divisor inverse starts `S OE O A L H EO Y Y IA O W M J TH G I P AE U TH IA T L EO N TH IA F EO Y` (original GP rune labels). The converse whole-book multiple inverse begins `NG M T F M W X E H C W S F A U X P T I R D NG E EA H L F TH P`. Neither yields a readable GP-native passage in preserved source word order.

The [Windows Node.js 22 single-file CommonJS reproducer](../sims/lp2_mobius_divisor_inversion_original_sft.cjs) computes both exact inverses on the source integer corpus, verifies forward reconstruction of **all 12,956** original symbols for each variant, and **plants and recovers all 95** solved original clear p57 runes through both forward incidence operators. These round trips check implementation and do not independently identify an intended decryption.

## Decision boundary

This excludes a direct unkeyed GP29 Dirichlet divisor or multiple zeta transform **with the three declared reset clocks and source rune order** as a transparent one-step English recovery, to the extent native-GP English frequencies are diagnostic. The result leaves non-English intermediate text, altered numeration, symbolic Möbius-strip walks, other nonlinear uses of the 2014 square, and external keys unresolved. No plaintext, source-selected unknown-page key or historical downstream action emerged. A new original clue that **types index n** or selects a specific second transform would change this decision more than an arbitrary reset/shift sweep.
