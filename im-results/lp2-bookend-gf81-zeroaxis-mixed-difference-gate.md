# Conditional GF(81) bookend: original zero-axis mixed-difference decoder

**Agent 2, 22 November 2026. Verdict: exact source-selected candidate, original long-text negative. No unknown LP2 plaintext, authenticated cipher, key, or destination recovered.**

## Why this decoder rather than another key search

Earlier original-source studies ([GF81 source bridge](lp2-p7-gf81-bookend-original-negative-gate.md), [square/bookend geometry](bookend-81x81-80x80-ordinal-insertion.md)) supply the following already established **conditional** operands:

- Original p7 final red five complete-word GP29 products [11,26,8,15,2] reduce and normalize modulo3 to the irreducible quartic `f(x)=x⁴+x²+x+1`. Original p8 first red complete-word product **4** serves as `g=x+1`, a primitive field unit of order **80**. Its fifth power is the independently printed p8 final red index17 under GF3 polynomial-basis coordinates. These connections are mathematical and retrospective; no Cicada instruction selects GF(81).
- The first **6,561 = 81²** unknown GP runes, ending at the first copy of the unique repeated six-rune bookend at p27, supply a square `A[u,v]`. The remaining **6,395** GP runes plus the five genuinely printed red paragraph ordinal labels on pp36–38 supply a `80×80` square `C[r,c]`, with five *empty* cells at positions **[2244,2384,2476,2575,2672]**. No fabricated glyph fills these positions.
- Solved original p57 says to **SHED OUR OWN CIRCUMFERENCES**. Dropping field-coordinate `0` from both axes of the 81-square removes **161 = 81²−80²** cells. This gives a relatively simple *candidate* mathematical interpretation: remove the zero-row and zero-column contributions before transferring the interior to the second square.

The precise new decoder **requires no fitted bytes, private key, page offset, table orientation, or cipher tuning**. Use the canonical four-trit GF3 polynomial-basis index with `g=x+1`, original GP29 rune indices, the previously fixed clockwise-free row-major square registers, and the two naturally possible signs:

```
u = g^r in GF(81), v = g^c in GF(81)       (0 <= r,c < 80)
K[r,c] = A[u,v] - A[u,0] - A[0,v] + A[0,0]   (mod 29)
P[r,c] = C[r,c] - K[r,c]                     (mod 29)
```

The `P=C+K` opposite is assessed as the single direction ambiguity. There are **no GP symbols at the five authentic numeral slots**. The formula is the canonical two-axis inclusion–exclusion/mixed difference of a source field and genuinely differs from the prior direct `A[u,v]` additive pad or the prior adjacent-cell 81-grid finite differences. The source, however, says neither “GF(81)” nor “double-center”; the proposed operation remains conjectural even if it had produced readable text.

## Frozen original result

| Original field | GP29 index of coincidence | Top 12 GP rune-bin count (of 6,395) |
| --- | ---: | ---: |
| Untouched trailing GP ciphertext | 0.034451571217 | 2,797 |
| `P=C−K`, field zero-axis mixed difference | **0.034453283143** | **2,811** |
| `P=C+K`, inverse sign | **0.034503222455** | **2,816** |
| Unencrypted original p57, independent positive reference | 0.062709966405 | native GP plaintext |

Both entire **6,395-rune** outputs remain near the flat GP29 distribution and their exact beginning runes are nonprose. This excludes **direct recovery of native-GP prose by this one source-constrained pad**, including a single arbitrary secret fixed alphabet relabeling (the top-12-bin count is invariant). It does not exclude non-GP intermediate bytes, an authored changing-state consumer, deliberately unusual/heterogeneous language, a different bookend geometry, or an additional layer.

The [standalone CommonJS SFT](../sims/lp2_bookend_gf81_zeroaxis_mixed_difference_sft.cjs) verifies the field unit period80, the authentic source square lengths and five numeral holes, two exact original GP29 inversions, all 6,395 re-encrypted original runes, and two **6,395/6,395 synthetic positive reconstructions** made from authenticated clear p57 runes. It requires only Node.js22 standard libraries and the repository's canonical original GP rune corpus. **[Successful Windows Node22 GitHub Actions run 45059424692](https://github.com/FlareZ123/liber-primus/actions/runs/45059424692)** executed every source assertion and both full synthetic/plaintext forward-replay gates. The plant proves mechanical reversibility without implying the original employs the operation.

## Research decision

**Retire this exact zero-axis double-centered field pad** and avoid generalizing it into a menu of unrestricted GF(81) polynomial functions. The missing causal link is still an **original first-party directive naming a field-coordinate value-changing operation and an actual ciphertext recipient**. The p7/p8/GF81 source relationship and 81²/80² bookend geometry remain provisional mathematical leads; the demonstrated original-input negative reduces their direct-key implications.
