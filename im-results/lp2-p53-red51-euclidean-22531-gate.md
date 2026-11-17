# p53 red-numeral Euclidean split of the 256-byte table: source-size alignment, no decoder

**Decision (17 November 2026, Agent 8):** Directly dividing the original p49–51 numeric table by the **entire 51-rune red p53 numeral** gives a source-sized quotient/remainder decomposition: the 256-byte table becomes a 226-byte quotient beginning with `01` plus a 31-byte remainder. Omitting the single leading quotient byte leaves **225 bytes**, equal to the original manuscript's **225 red rune glyphs**; the remainder's **31 bytes** equal the **31 printed 13-dot marks**. This is exact arithmetic, yet **nearly half of other source-native 51-rune divisors produce the same length alignment**, and no printed instruction specifies long division, quotient-prefix deletion, residue reduction, or this use of the red numeral. A fixed direct inverse does not reveal plaintext; an arbitrary stationary substitution cannot make the quotient residue stream literally equal to the 213 unsolved red runes. Do **not** promote the size coincidence to an authenticated key.

## Original inputs and reversible hypothesis

The already established [p49–51 byte table](../resources/liber-primus/base60-grid.json) is 32×8 big-endian bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its integer `N` has 2,048 bits. The [original annotated p53 red numeral](../resources/liber-primus/lp2-ink-annotations.json) occupies exact physical p53 GP29 offsets **128–178**, following 128 black runes, and its **51 original rune indices**, regarded as one big-endian base-29 integer `R`, give:

`R = 216896999039209920679488145700323741587121856985828471118893469697329957334`.

The first-party visual selection is the source-visible numeric table plus the unusually long p53 red numeral in the same illustrated chapter. The **chosen consumer**, ordinary Euclidean division of `N` by `R`, is an investigator hypothesis. Under exact unsigned integer arithmetic,

`N = R * Q + M`, with `0 <= M < R`.

The exact bit lengths are **N 2048, R 247, Q 1801, M 247**. The 226-byte `Q` starts `01a93829510997cf74e3460bcc0322b6`, so a single leading byte `01` can be separated from 225 remaining bytes. The 31-byte `M` starts `61dee23dd913ea35`. This split precisely reconstructs the original 256-byte `N`. Neither the original table nor the red numeral asserts an additional leading status byte, so removing it is a deliberate test choice.

In original page/rune order, the 225 red glyphs include **213 encrypted red runes on pp0–55** and **12 already-clear red runes on solved pp56–57**. The 31 large 13-dot punctuation marks are visible source events, not cipher tokens. Thus 225+31=256 is a true source count but does not by itself identify where the quotient and remainder belong.

## One fixed original-input inverse

Take exactly the last 225 quotient bytes in big-endian order as red-slot keys. Reduce each key byte modulo 29. For original unknown red slot `i`, test the two unavoidable additive conventions `P_i = (C_i ± (key_i % 29)) % 29`, without tuning offsets, key order, cipher family, page breaks or plaintext words.

- The original p0 source-red 8+5 title decodes to `LIGNYPDF LXWLTH` under subtraction and `IGUYSAETH FINOEH` under addition. Neither is readable GP English. Full 225-position IoC values are **0.03222222** and **0.03384921**, close to uniform GP29.
- Among the 213 original unsolved red positions, **7/213** source runes equal the corresponding quotient byte residue exactly. More decisively, their source equality patterns disagree in **1,467 pairwise comparisons**: 764 equal-symbol pairs in the original red stream versus 745 in the quotient residues, with just 21 shared equal pairs. The earliest contradiction is original positions 0/31: different original runes `[15,2]` vs equal quotient residues `[24,24]`. Any **one fixed bijection of 29 symbols** preserves equality, so cannot directly relabel this exact quotient-residue tape into the source red rune tape.
- A planted 213-rune sequence using the genuine original-solved p57 GP29 text is exactly encrypted and recovered under the fixed quotient pad, confirming the direct-inverse implementation. Round-tripping the original is only an arithmetic check.

This tests the **specific direct residue and stationary relabeling interpretations**. A different selected operator, stream clock or stateful use of the quotient remains logically possible; none is supplied by these results. The 31 remainder bytes have no source-stated operation for the 31 marks.

## Size-coincidence baseline

To challenge the claim that the red p53 numeral is singled out by the byte split, take **all 10,206** contiguous 51-rune windows wholly contained in the original 55 nonempty unsolved physical pages p0–55, without crossing page borders. For each window construct its unsifted base-29 integer `R'`; evaluate the same table integer `N`; and count windows whose `N/R'` has **exactly 1801 bits** (a 226-byte quotient with leading byte 1) and whose remainder `N%R'` exceeds 240 bits (31 bytes).

**4,846 / 10,206 = 47.4818734%** of these original alternative 51-rune windows meet both conditions, including the designated p53 red passage. The matching output byte lengths are therefore a common operand-size consequence. This inventory is an exhaustive finite source reference frequency for one fixed test, not a null probability that Cicada selected the numeral by chance. Other clues could still select p53; the byte-size split alone does not.

## Reproduction and next decision

Read-only, fixed original-input **Node 22 CJS SFT**: [`sims/lp2_p53_red_division_22531_original_sft.cjs`](../sims/lp2_p53_red_division_22531_original_sft.cjs). [Manual/push Actions runner](../.github/workflows/agent8-p53-euclidean-sft.yml) uses the unchanged repository resources; original workflow [run 44024213611](https://github.com/FlareZ123/liber-primus/actions/runs/44024213611) was queued when this note was prepared. The finite full-corpus window calibration is the same exact byte/BigInt division applied to every original 51-rune within-page window; it makes no decrypting assumptions.

**Research decision:** retire this particular 225-red/31-dot **direct quotient-byte mapping**, alongside any claim that the length agreement independently authenticates an intentional cipher. A useful successor must identify a first-party instruction for a different quotient/remainder consumer, or recover a genuine red-title word from a held-out source location. No unknown LP2 plaintext, source-authenticated key, decipherment mechanism, hash preimage or destination has been recovered.
