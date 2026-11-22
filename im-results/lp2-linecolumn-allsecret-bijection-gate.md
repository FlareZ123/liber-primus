# Physical-line all-secret column substitution gate

**Agent1, 18 November 2026, Director #1526. Exact key-independent exclusion within the established native-GP reference register. No unknown LP2 plaintext, creator key or destination is recovered.**

## Exact family and invariant

The source-selected clock is the manuscript's original physical printed line layout: **594 rune-bearing lines**, **12,956 unknown runes**, maximum line length **26**. Test the entire family

```
C[line,j] = pi_j(P[line,j])
```

where each line-local column `j` has one arbitrary secret bijection `pi_j : GP29 -> GP29` shared by every physical line. Short lines use only the prefix. No page/chapter-dependent tables, alternating directions, transposition or feedback are allowed.

For any fixed column `j`, a bijection preserves equality exactly:

```
C[a,j] = C[b,j]  iff  P[a,j] = P[b,j].
```

Therefore the complete same-column equality graph is independent of all **26 unknown 29! alphabets**. A necessary scalar consequence is the total number of equal unordered pairs across every line column.

## Original source result

Across all physical-line columns there are **3,638,562** eligible unordered pairs. Original LP2 has exactly **126,508** same-column equal pairs, normalized collision rate **0.03476868059414681**.

For comparison, distributing each column as evenly as mathematically possible over 29 symbols gives the absolute 29-symbol lower bound **119,276** pairs. The original is only **7,232** pairs, or 6.06%, above that maximally balanced floor. The ciphertext line columns are therefore extremely close to uniform in the invariant that no secret column substitution can alter.

## Complete native-GP reference bound

The repository's established GP-native control `resources/control/gibran_prophet_58585.txt` contains **62,492** runes. Every one of its **49,537** contiguous 12,956-rune windows was segmented with the exact original 594-line length template, without requiring punctuation or word boundaries to match. This is deliberately permissive: a candidate need only look like a contiguous native-GP stream after the source line breaks are imposed.

Exact collision-count distribution:

| Native register statistic | equal same-column pairs |
| --- | ---: |
| minimum | **214,074** |
| 0.1 percentile | 214,702 |
| 1 percentile | 215,370 |
| 5 percentile | 216,116 |
| median | 218,610 |
| 95 percentile | 222,094 |
| maximum | 225,346 |

The original is therefore **87,566 pairs below the minimum of every native reference window**. The minimum occurs at native offset 16,848. No key search is needed because arbitrary per-column bijections cannot change the equality graph or this collision count.

## Positive control

A source-shaped 12,956-rune native plant was segmented into the exact 594 physical-line lengths and encrypted under **26 independently random arbitrary GP29 permutations**, one per line column. The SFT inverted all 12,956 runes exactly and verified that the plant/cipher same-column collision count is identical. The plant count is **217,511**, inside the native register and far above original.

This demonstrates that the invariant does not reject the declared family when the plaintext actually is native GP.

## Decision

Within the established native-GP English register, reject the entire shared physical-line-column arbitrary-substitution family. This is much stronger than rejecting a fitted additive line pad: the additive model `C=P+k[j] mod29` is a strict subset with `pi_j(x)=x+k[j]`, so the same key-independent obstruction closes Director #1522 without optimization.

The result does **not** exclude per-line alphabets, line-dependent IVs, transpositions, nonlinear state/feedback, compressed/nonlinguistic plaintext, altered line placement, or a different language outside the declared native register. Those require independent source support.

Reproduction: `node sims/lp2_linecolumn_allsecret_bijection_sft.cjs`
Successful exact full-register run: GitHub Actions `44390781747`.
