# LP2 p0 red13 BASE29 order: conditional modular test and dependence

**17 November 2026, Agent22. Evidence class: conditional original-title arithmetic; not authenticated cipher key, unknown plaintext or final destination.** This is a mathematically bounded follow-up to Agent28's [20:04 source observation](../communications/broadcast/20261117T2004Z_agent28_red13-base29-year-html-title133.md) and the earlier [p0 opening HTML/prime-sum relationship](lp2-stage11-html-p0-red-title-331-16-link.md). The distinct claim here is the **dependence between the proposed congruences** and the exact number of consistent original-title orders when the established title features are fixed.

## Original inputs and exact arithmetic

The physically verified 13 red p0 runes consist of two words of lengths 8|5, before the large 13-dot marker. Their zero-based GP29 indices in printed order are

`15,8,18,3,6,19,27,0 | 15,26,18,21,5`.

Their published prime-value sums are **347|315**, symmetrically **331±16**. The original-era 2014 Stage11 distribution index has `<title>133</title>` and `<div id="331">`. Writing the 13 rune indices as a big-endian base29 numeral yields **N=5,412,445,423,142,629,857**. Exact arithmetic gives N mod 2014=133, N mod 133=76, and N mod 256=225. The proposed 76 is the original physical p55 rune count, and 225 is the independently inventoried LP2 red-rune count. **Neither the dated index HTML nor the manuscript tells the reader to take these three moduli.**

## One congruence is redundant

For **every permutation of the identical original thirteen indices**, `29≡1 (mod7)`, so N mod7 always equals their index sum, `181 mod7 = 6`. If such a permutation satisfies `N mod2014=133`, then `N mod19=0` because 2014=2×19×53 and 133=7×19. These two residues uniquely imply `N mod(7×19)=76`. Therefore **N mod133=76 is a mathematical consequence of N mod2014=133 plus the fixed rune multiset**, and is not a second independent alignment with p55.

The 2014 and 256 moduli remain different candidate constraints; their targets were noticed post hoc. Their simultaneous satisfaction does not establish that either modulus was authored.

## Exhaustive test conditional on established source features

The [read-only Node22 CommonJS single-file test](../sims/lp2_red13_base29_congruence_order_sft.cjs) ([Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44170924537)) fixes the original *13-rune multiset*, both word-initial S runes, the 8|5 boundary and both 347|315 GP prime sums. It enumerates all distinct arrangements of the remaining eleven runes with the exact published rune identities, including duplicate E values, and evaluates the proposed residues on the resulting big-endian integer.

| Fixed-source conditional universe | Count |
| --- | ---: |
| Distinct admissible seven-rune allocations after first S | **2** |
| Distinct total admissible 8|5 orders | **241,920** |
| Orders satisfying N mod2014=133 | **255** |
| Of those, orders satisfying N mod256=225 | **3** |
| Exact conditional frequency for both | **3/241,920** |

The three surviving index sequences, with the 8|5 word boundary retained, are:

1. `15,0,5,3,21,26,8,18 | 15,19,6,27,18` → 5,309,379,764,496,786,145
2. **Printed original** `15,8,18,3,6,19,27,0 | 15,26,18,21,5` → 5,412,445,423,142,629,857
3. `15,21,5,3,18,26,8,0 | 15,18,27,19,6` → 5,565,588,968,468,162,017

The exact conditional frequency is **0.00001240079365** for these **particular, already-selected** target congruences. It is not a discovery-adjusted p-value or an authorship probability, because the researcher selected the moduli and target numbers after exploring many source quantities. The prime-sum relation was also detected after looking at the heading. The small count cannot independently authenticate the key hypothesis.

## Research decision

Keep the reproducible numeric constraints available if a *separate first-party decoding instruction* ever assigns a BASE29 integer, modulus2014 or the 256-cell table to the title. Otherwise the next meaningful decision is which original-cipher inverse can derive a genuine key and independently readable unknown LP2 plaintext. Do not treat three linked residues as three clues or commission more modulus sweeps. No text or key was recovered here.
