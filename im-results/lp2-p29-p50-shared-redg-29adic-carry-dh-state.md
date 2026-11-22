# Original p29/p50 29-adic carry network: p29 selects p23, whose red factor supplies p28 READ OUT exponents

**Agent27, 22 November 2026. Status: exact original-source arithmetic and a source-sourced repeat of the pre-existing local p28 READ OUT candidate, discovered retrospectively; no independently authenticated unknown-page plaintext, cipher mechanism, key schedule, or destination.**

## Source-driven candidate

Three separate source objects are fixed before reading the carries:

- Physical p39 (56.jpg) prints a red isolated triad `[27,5,15]` in low-first order, giving the factor `G(X)=15X²+5X+27=15(X−24)² mod29`.
- Physical p29 (46.jpg) contains **277 exact GP29 rune indices** in original printed order. Its descending integer-coefficient polynomial is divisible by G over GF29.
- Physical p50 (67.jpg) prints the **256 exact base60-byte cells** in row-major order, with coefficients in its established source codec. Its descending polynomial is also divisible by G modulo29. The signed 2013 BASE29 example supplies an additional quadratic factor `H(X)=24X²+26X+3` for the table.

Both G and H were previously identified as exact source-algebraic factors. Their key use and any higher 29-adic lift were **not** specified by the original manuscript. Nonetheless, retaining the same literal printed integer coefficients modulo29²=841 and dividing by the same factors yields a reproducible *second digit* of the two otherwise-zero polynomial remainders.

## Exact second-digit arithmetic

Keep the high-first original order and normal GP0 ordinal values. For any exact modulus29 divisor, lift the same long division to `Z/841Z`. Since the remainder vanishes modulo29, normalize the two 841-remainder coefficients by 29, producing a pair in `GF29²` as two independent coordinates.

| Original source | Polynomial divisor (high-first) | Remainder mod841 | Remainder/29 |
| --- | --- | --- | --- |
| p29 original 277 GP indices | red p39 G `[15,5,27]` | **[377,551]** | **[13,19]** |
| p50 original 256 source bytes | red p39 G `[15,5,27]` | **[435,58]** | **[15,2]** |
| p50 original 256 source bytes | signed-2013 H `[24,26,3]` | **[232,145]** | **[8,5]** |

The latter two table registers were already reported; the **p29 source integer G-lift pair [13,19]** is the new cross-object observation.

The previously fixed original-p28 outer-shell Hadamard rule is `H2(x,y)=(x−y,x+y) mod29`. Applied to the new p29 raw carry once, without swapping:

`H2([13,19])=[23,3]=[p,e]`.

This matches the independently reconstructed toy Diffie-Hellman tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`. P50 G carry `[15,2]=[b,K]` and p50 H carry `[8,5]=[A,g]` complete the three source-aligned packet assignments:

`p29/G => H2([13,19])=[p,e]; p50/G => [b,K]; p50/H => [A,g]`.

The original p23 R lift adds the ordered [3,27] pair, which also reproduces the earlier p28 READ OUT decoder. This explicitly reproduces known DH and local decoder operands. It yields no *new* source-secret value: those numbers and p28's H operator were already known, and the rule of lifting integer coefficients to base29² was recognized after inspecting original numerical material. The convenient arithmetic expression `[13,19]=[A+g,B]` should be counted as an equivalent identity of the same observation, not as an independent confirmation.

## Distinct p23 red-factor continuation and the exact p28 six-rune readout

The p29 carry's ordered raw pair `[13,19]` is source-fixed. Applying the already defined p28 H map gives `[23,3]`. One **post-observation** interpretation takes the first result `23` as a physical page number, and the second `3` as exponent `e`.

Original **physical p23** contains a separately identified **centered red three-rune group `[23,6,10]`** in low-first order, hence its own quadratic `R(X)=10X²+6X+23`. The original p50 byte polynomial also divides exactly by R over GF29, a published result independent of this p29 carry.

With the **same 29² integer-coefficient lift** used for p29 and p50 G/H, unchanged p50 divided by high-first `R=[10,6,23]` has:

- remainder mod29 `[0,0]`;
- remainder mod841 **`[87,783]`**;
- normalized carry **`[3,27]`**.

This pair is precisely the pre-existing p28 value-changing decoder exponents, fixed by separate earlier p28 DH/cube work: cube on the exact center and reciprocal (power27) on the five-rune page-numbered word. Opening only the already frozen original p28 contiguous offset134..139 object:

```text
original page28 center + word28: [9,28,24,10,1,20]
p23 source factor / p50 carry: [3,27]
mod29 exponents [3,27,27,27,27,27]
output: [4,28,23,3,1,16] = READ OUT
```

This is an **exact reversible reuse of a source-visible six-rune packet** under independently readable number material. It selects the same ordered `(3,27)` parameter pair without the contested p28 shell-depth story, but the assignment of first exponent to the center and second to the whole five-rune word was already known from the earlier READ OUT discovery. It is **retrospective corroboration, not a newly held-out plaintext recovery**.

The complete conditional source graph can now be expressed:

`p28 THE -> signed DIRECTION29 -> original p29 -> p39/G lift -> H([13,19])=[23,3] -> original p23 red R -> p50/R lift=[3,27] -> p28 center/word28 -> READ OUT`.

The strong rival is that the `23` page number and p23 factor were recognized post hoc, while multiple source triads and source-valued operands were available. Source p3's original red quadratic `[2,23,13]` does **not** divide p50 modulo29; p23 R and p39 G do. This is a **narrow finite source relationship**, still without an original instruction selecting the 29²-lift opcode and no demonstrated 150-rune original-body decoder.

## Conditioned source-cipher null

A lexical or uniformly random 277-symbol null would almost always fail exact division by G modulo29, so it would be an invalid comparator. Instead:

1. Extract the original exact 275-symbol p29/G quotient over GF29.
2. Freeze its complete symbol multiset; shuffle coefficient order using xorshift32 seed `0x3301f29`.
3. Multiply the shuffled quotient by unchanged G modulo29, yielding a 277-symbol GP29 register with exact zero remainder by construction.
4. Reinterpret the resulting register's literal digits 0..28 over integers, divide by the same G modulo841, normalize the two carry digits, and compare to original `[13,19]`.
5. Repeat **8,000** times with the source-pinned factor and no post-selection within each trial.

Results: **11/8,000** null registers reproduce exactly `[13,19]`; plus-one empirical frequency **12/8,001 = 0.0014998125**, and all 841 possible carry pairs occur. This estimates how frequently that *specific pair* arises under a narrow quotient-histogram-preserving factor null. Crucially, the exact p29 target pair and its H transformation were interpreted **after they were observed**, amid thousands of previously explored possible numeric relations. The number **0.0015 must not be quoted as a discovery-wide p-value or authorship probability**.

## Causal plaintext decision

The new carries are **exact, key-like short numeric packets** aligned with the p39/p23 factors linking p29, p50 and p28, but it does not identify a complete key stream, reversible original-rune transform, clock/reset, or plaintext receiver. The p29 quotient itself has near-ciphertext GP29 IoC **0.03405441**. Any single fixed GP29 permutation applied uniformly to this quotient preserves that IoC, so the revealed `e=3` GP29 cube operation alone cannot turn the full quotient into native-GP English prose. The separately frozen full 275-rune quotient→outer-H shell inverse also failed native-GP language [under its exact source rule](lp2-p28-p29-gquotient-outerh-prospective-inverse-decision.md).

**Next discriminating requirement:** find an independently legible original instruction specifying what the two red-factor carries actually key and how its state advances through >=150 original encrypted runes. Until then this is intermediate arithmetic evidence, useful for interpreting the table's unusual algebraic structure but insufficient to promote the p28/p29/p50 network to an authenticated decipherment.

## Reproducibility

- [Self-contained read-only Node22/CommonJS SFT](../sims/lp2_p29_p50_redg_29adic_dhcarry_sft.cjs) pins original two polynomials, tests both mod29 and mod841 remainders, checks H mapping and the seeded conditioned null.
- Original source paths: `resources/liber-primus/lp2-corpus.json` physical `pages[29].indices`, `resources/liber-primus/lp2-grid-256.json` `bytes`, and red p39 triad in `resources/liber-primus/lp2-ink-annotations.json`.
- Prior table carry: `sims/lp2_p50_base29_carry_dh_sft.cjs`; cross-source GF29 factor [report](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md).
