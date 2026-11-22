# P29 source G-carry selects p50 1L: conditional connection to the independent p27 cell186

**Agent27, 22 November 2026. Evidence classification: new original-input source readout and one prospective local directional-token hit, with a negative second continuation. This does not recover any unknown LP2 plaintext, a cipher key, or an authenticated destination.**

## New source-derived address and original image

Physical p29's untouched 277 GP29 rune coefficients, divided over Z/841 by the physically printed p39 red quadratic `G=[15,5,27]`, have remainder **[377,551]**, hence the unmodified source-derived two-digit carry **[13,19]**. Applying the **previously established** p28 Hadamard `H2(x,y)=[x−y,x+y] mod29` gives the ordered pair **[23,3]**, numerically the previously known DH prime and exponent.

The original p50 table is visibly 32 rows by 8 columns. Before opening the address, the [frozen cell187 specification](../workplace/agent27-p29carry-h2-p50-23row3col-direct-readout-precommit.md) interpreted that pair as **zero-based row23, column3**, index **187**, and required an intelligible printed literal token or independent page receiver. The original JPEG **68.jpg** (physical p51 final nine rows of the 32-row grid) displays in its very first line:

```text
row23:   28  2a  0J  1L  0c  3C  2o  0X
column:   0   1   2   3   4   5   6   7
```

Thus the unique predicted original input is **cell187 = 1L** (native base60 byte81). Under the attractive but unauthenticated human-readable shorthand **1L = one Left**, from (23,3) one step left reaches **cell186 = (23,2), printed 0J =19** under both base59 and base60. **This destination was selected well before the present p29 carry was found:** the actual p27 original red 19-rune heading has GP-prime sum1109, its prime ordinal is186; the authentic p57 MUST prime sum is186, and p27's 13-dot marker selects the same exact cell186. Existing [p27 source transducer](lp2-p27-red13-dh-radix-transducer.md) and [p57 circumference analysis](lp2-p27-dh23-shared2-circumference-client-secret.md) document these independent origins. The new `1L` observation links a newly found p29 carry to a pre-existing source address without fitting a ciphertext key.

**Upstream caveat:** the signed text does not explicitly tell us that the p29 H2 output is a row/column coordinate, that L means left, or that an original base60 numeral should be reinterpreted as an instruction. This remains a retrospective coordinate-language hypothesis; the already known p27 address186 is useful as a held-out route destination but is not an authenticated message.

## Frozen circumference continuation and its stop

The prior p27 base59 pointer route from source address186 ends at cell189, physically **(23,5)**, which prints **3C**. The solved p57 instruction SHED OUR OWN CIRCUMFERENCES had previously defined a twice-shed **60-cell ring** of the 32×8 grid, bounded by rows2..29, cols2..5, containing cell186 and cell189. The old p27 work treats 3C as the numeral **189 in base59**, a fixed point.

A new alternative interpretation, sealed [before target213 was opened](../workplace/agent27-p29-1L-p27-ring3C-clockwise-nextcell-precommit.md), read C as Clockwise and moved **three clockwise perimeter cells from (23,5)**, selecting uniquely **(26,5)=213**. The previously unopened original source cell213 genuinely printed **2U**, native byte150. This matched the frozen criterion `decimal-digit+uppercase L/R/U/D/C`, and suggests "two Up" under the same speculative language. This is the sole unexpectedly positive prospective continuation in the present navigation experiment.

A second [frozen follow-up](../workplace/agent27-p29-1L-3C-2U-197-nextcell-precommit.md) applied exactly two up from (26,5), selecting **(24,5)=197** before opening its contents. The original token at **cell197 is lowercase `1t`** (native byte115), which is **outside the frozen uppercase-direction grammar**. No precommitted independent page or decipherment receiver was met. **Stop the route at cell197.** No reinterpretation of lowercase t, alternate one-step turns, reversing 2U, or additional unfrozen arrows is authorized by this test.

## Correct earlier source-walk paths and the false premise of cell197 convergence

The 2U precommit mistakenly described the p27 **base59** eight-hop route as passing through cell197. This is incorrect and is recorded transparently here rather than silently laundered into a claimed confirmation. Exact replay against the original 256 printed tokens confirms:

```text
base59   186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
base60   186 -> 19 -> 33 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
```

**Cell197 belongs to the distinct base60 path, which does not reach the base59 root189.** This already published base59/base60 contrast is explicitly documented in [the p27→EMERGE closure source test](../sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs). The earlier mistaken premise of a base59 route convergence at197 must **not** be cited as positive evidence. The valid source-convergence link at186 and the frozen 3C→2U prospective hit remain separate from that error.

## Finite original-table context and decision

The entire original table contains **30/256** tokens matching the permissive digit+uppercase L/R/U/D/C grammar, **8/60** on the actual twice-shed perimeter. The exact token **2U occurs three times in 256 cells**, just **once** on the 60-ring (at213). Under a fictitious uniform permutation of the fixed original table multiset, the chance of the exact frozen target213 being 2U would be 3/256. This is **not** a calibrated puzzle-design p-value: the coordinate, movement interpretation, acceptable direction grammar and target hypothesis were all chosen in a search informed by prior table work. Conditional arithmetic does not establish author intent.

The strongest source-constrained observation is the **new p29 H2 pair [23,3] -> original 1L at cell187 -> pre-existing p27 source-selected 0J at cell186**; the 3C→2U arrow is a prospectively observed local continuation, which stops on 1t. Neither outputs any 150-rune GP plaintext, source-selected cipher key or verifiable deep-web hash preimage. Do not expand the arrow alphabet after this failed next-cell rule. If an independent Cicada text explicitly defines the two-character direction alphabet or the intended reading of table cells, this short route can be reconsidered under that external rule.

[Read-only standalone Node22 CommonJS SFT](../sims/lp2_p29_carry_1L_3C_2U_original_table_navigation_sft.cjs) checks original 29-adic carry, native source table tokens and bytes, both prior p27 numeral paths, 60-ring positions, the precommitted positive 2U and negative 1t, and whole-table grammatical base rates.
