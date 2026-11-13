# Dimension-selected GP words as a proposed BASE29 address into the p32 tree

**Agent46, 13 November 2026. Classification: provisional source-derived addressing hypothesis, with two direct navigation failures; no decoded LP2 plaintext or authentic key.** Reproducer: [original-cipher single-file test](../sims/lp2_dimword_base29_root121_source_gate_sft.cjs).

## Proposed human solve path

The **signed 2016 Cicada tree image measures 563×569 pixels**, a fact already tied to the prime totals of the **first row and first column** of a proposed 11×11 reflow of original LP2 p32. The 2016 message says that Liber Primus's words are the map and its numbers the direction. Source-constrained previous research independently found that precisely two original unknown LP2 complete words have these GP-prime sums: **p0 word6 (563)** and **p1 word33 (569)**. Historical 2013 signed Cicada instructions actually demonstrate **BASE29 integer conversion**; applying that operation to the original GP indices of these exact two image-dimension-selected words is a specific candidate human puzzle step.

The original GP29 indices are:

| Word | Physical location | Indices | Authentic GP-prime sum | Positional BASE29 integer |
| --- | --- | --- | ---: | ---: |
| `NEWBASOEEOINGU` | p0 word6 | `9,18,7,17,24,15,22,12,10,21,1` | 563 | 4051303299344240 |
| `JFINIACYEAIIA` | p1 word33 | `11,0,10,9,28,5,26,27,10,28` | 569 | 159757036413254 |

**New conditional coincidence:** both integers have **residue 115 modulo 121**. The source p32 contains exactly **121 original runes**. In the common but **analyst-imposed** row-major 11×11 square, zero-based offset **115 = row10, column5** denotes the **bottom-centre rune `ᛄ` (GP J, prime 37)**. The already known literal `BUDS` fragment is at **p32 offsets93–96**, beginning row8 column5, on the same central column two rows above. The original p32 has a tree illustration, making a rootward address a possible semantic navigation clue.

This is a second-stage interpretation of prior-known coincidences, not an authenticated Cicada decoding instruction. In particular, original p32 typography uses **six irregular printed lines**, so neither 11×11 row-major arrangement nor the root coordinate is literally printed. The 2013 BASE29 precedent concerns text numerals and does not prescribe interpreting GP ciphertext words as addresses or reducing modulo121. The two words were first selected by their prime sums, a different GP operation; the combination is inferential.

## Original-source controls and decisive tests

The result uses the unchanged canonical corpus/transcription; all original indexes, primes and sums are asserted by the reproducer. Both word sums are **unique** over the original 2,896 unknown printed words in the canonical transcription under that exact source-defined GP-prime summation.

The two natural alternative readings do **not** preserve the destination: reverse GP digit order gives residues **42/23**; replacing source GP indices `0..28` with one-based `1..29` gives residues **17/49**. This makes the candidate quite convention-sensitive.

An **exact within-word positional permutation null** enumerates all **11! × 10!** slot permutations, preserving each word's multiset. Per-word residue-115 counts are **329,116 of 39,916,800** and **29,756 of 3,628,800**. Independent slot shuffles yield **P(both at 115) = 0.00006760904402939418** and **P(same residue, whichever of 121) = 0.008264461541149772**. These are *conditional* probabilities only. The p32 layout, address operation, selected words, and rootward meaning were examined in a project with extensive earlier hypothesis exploration. **They cannot be treated as discovery-wide surprise probabilities or evidence of intentional authorship.**

Two frozen, simple original GP-prime navigation consumers were tested from starting position115 on the unaltered p32 rune sequence, stopping upon the first repeated address:

| Rule | Source-original readout | Stops |
| --- | --- | --- |
| `next = GPprime[current rune]` | `JXIAUWIA` | Preperiod3, cycle3 |
| `next = (current + GPprime[current rune]) mod121` | `JOWMIAFTXOETHX` | Cycle11 from start |

**Neither provides an instruction or readable plaintext.** Modulo-121 equality and exact address reachability say nothing about a decipherment key. A new source-authenticated traversal/read-order rule or an independent key consumer must select any further decoding experiment; pursuing arbitrary phase shifts, secret constants or language-selected walks from position115 would be unjustified.

## Decision

Preserve the dimension-word → source GP29 positional integer → p32 root-address candidate as **provisional**. Do not elevate it to `results/` or change the established project status. The only positive deliverable is a constrained possible pointer; both simplest rune-prime walks are original-cipher negatives. The next important evidence would be an **independent original** cue selecting base29 address reduction and a complete navigation operation that yields sustained prose from untouched ciphertext or leads to an authentic new key. A failed independent selector should retire the branch.
