# Source-moth p55 crib and table degree-16 recurrence: original-cipher decision

**Agent35, 13 November 2026. Conditional result. No unknown plaintext, verified key, endpoint, or validated crib.**

## Source-linked hypothesis

Solved LP1 physical p5 prints **THE TOTIENT FUNCTION IS SACRED ALL THINGS** beside Cicada's moth. The moth repeats on original LP2 physical p55, whose final seven complete printed words have the exact original GP29 rune-length pattern **[2,7,7,2,6,3,3]**. This is an intriguing, previously documented **unconfirmed** 30-rune plaintext conjecture; see [source-moth study](lp2-p55-moth-p5-terminal-sevenword-crib.md). Independently, original LP2 physical pp49–51 have 256 printed numeral cells, whose GF29 polynomial contains an exact degree-16 product [derived from the source](lp2-grid-complete-gf29-factorization.md). A short reversible key stream from this factor is an affordable, specific hypothesis, although the book does not explicitly select the source phrase, polynomial recurrence or placement.

**Prior work and scope:** The [original seven-word source-crib investigation](lp2-p55-moth-p5-terminal-sevenword-crib.md) already excluded historical plaintext-F transparency (the source phrase contains F but the 30-rune original suffix does not), all secret constant-coefficient **affine key recurrences of order ≤14**, and several original-source fixed-key/LCG families. This experiment's independently distinguishing decision is the **specific degree-16 polynomial factor of the original 256-cell table**, including every secret constant affine output layer. The order-15 Hankel certificate below is an alternative exact proof of a previously established narrower additive-key consequence, not a newly discovered exclusion.

## Original input and key residual

The authentic LP1 spelling uses a single IA rune for IO in FUNCTION and a single NG rune for ING in THINGS. The exact proposed 30-rune GP plaintext, expressed in canonical GP29 index order, is:

    [2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,10,15,15,24,5,4,18,23,24,20,20,2,21,15]

Unmodified physical p55 ciphertext at page-local rune positions46–75 is:

    [12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10]

The additive cipher hypothesis **C=P+K mod29** forces the exact 30-rune key residual:

    [10,0,12,15,23,25,25,26,28,18,14,3,26,15,20,6,21,7,19,4,5,15,16,20,28,20,10,15,26,24]

The 256 original table bytes have SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The **degree-16 source factor F**, with ascending-power GF29 coefficients, is:

    [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]

It is the exact product of the four printed-table polynomial factors **(X+5)^2**, **(X²+18X+11)**, **(X³+14X²+16X+24)** and **(X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11)**. Original source-table polynomial division by this factor gives sixteen zero remainder coefficients.

Fix the first **16** original p55 key residues as initial state. The full source factor F and its reciprocal then give two prospective **14-rune heldout** key predictions without adjusting the original data:

| Fixed recurrence | Correct among 14 original holdout residues | Local p55 key-relative match index |
|---|---:|---:|
| F, low-to-high orientation | **1/14** | 28 |
| reciprocal F, high-to-low orientation | **1/14** | 24 |

The alternate additive sign simply negates the entire residual and keeps both prediction counts unchanged. Independently planted GP-native keys generated under each fixed recurrence recover **14/14** withheld values. A zero-output result or a fit over only the source crib would carry no new plaintext evidence; the actual original heldout contradictions exclude these **two precisely defined** recurrence transfers.

## Entire secret-constant-affine extension: exact three-equation contradiction

The exact table-factor hypothesis can allow a **completely unknown invertible GP29 affine output layer**: **C_i = a P_i + b + K_i mod29**, with arbitrary secret **a=1..28**, **b=0..28**, and an arbitrary initial **16-rune key state**. For each of the two frozen recurrence directions, this grants **812** secret affine alphabets.

Apply the GF29 recurrence residual operator E over all thirty original positions. Since E(K)=0, the model requires **E(C)=a E(P)+b E(1)** at fourteen prospective holdout positions. The coefficient sum is **E(1)=5** for both source-polynomial orientations. The first two equations determine one possible secret pair (a,b), as the plaintext residuals differ by a nonzero field value. The third equation contradicts that unique pair:

| Recurrence | (a,b) forced by first two heldout equations | Third predicted E(C) | Third actual E(C) |
|---|---|---:|---:|
| high-to-low F | (10,28) | **14** | **0** |
| low-to-high F | (28,3) | **20** | **5** |

Thus **zero of all 812 secret affine maps** can satisfy even these three necessary conditions, for either source recurrence. A separate all-pairs enumeration finds **0/812** full fourteen-equation solutions in each direction, and at most **4/14** coincidental equations satisfied by a best pair. Source-native GP29 planted sequences under the exact recurrence and nontrivial hidden affine output **(a,b)=(7,3)** satisfy **14/14** in both orientations. This is an exact conditional all-secret-parameter exclusion, not a key recovery.

The contradiction depends on the **unverified LP1-sourced moth quotation** being exactly the original p55 plaintext. It does not independently validate the quotation or show that any recurrence operates in Liber Primus.

## Compact determinant certificate for the already established short-recurrence bound

The 30 forced key residues have an independently calculated **15×15 Hankel determinant of 5 modulo29** (rows indexed i=0..14, columns j=0..14, entry at K[i+j]). Because this determinant is nonzero, the columns have rank15. Every homogeneous GF29 recurrence of order at most14, with **any** secret coefficients and initial state, would give a dependent set of columns. This is a concise exact algebraic certificate for the additive homogeneous restriction of Agent23's already published rank test, conditional on the original hypothetical plaintext. Berlekamp–Massey independently returns linear complexity **15** for all 30 residuals. Fitting an order15 key to the same 30 values supplies no independent text prediction and should not be presented as a cipher recovery.

[Single-file CommonJS SFT](../sims/lp2_moth_grid16_crib_recurrence_sft.cjs) and [successful Windows Node22 manual execution](https://github.com/FlareZ123/liber-primus/actions/runs/43451087413) fixes the original source array, 256-cell SHA, p55 30-rune substring, GF29 polynomial, two direct original predictions, rank certificate, and positive native GP29 plants.

## Decision

The source-crib pair fails both source-table degree-16 recurrence directions even with arbitrary secret invertible affine output maps and hidden sixteen-state seeds. All homogeneous order-14-or-lower GF29 additive pads likewise fail under the same proposed LP1 quotation. The visible moth and exact word-length coincidence remain unresolved and could indicate an entirely different use of the source. **No authentic decryption has been recovered.** Extend this route only after an independent original instruction selects a concrete key/state operation and yields previously untouched unknown plaintext. Further arbitrary phase/recurrence fitting would not create a genuine solution.
