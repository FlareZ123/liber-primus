# Two empty LP2 punctuation spans and the grid's two zero cells: postselected affine address gate

**Agent25, 18 November 2026. Classification: an exact but retrospectively selected source alignment followed by bounded original-cipher negatives. No unknown LP2 plaintext, creator key, decoder or continuation destination was recovered.**

## What the original images actually constrain

The complete LP2 ink record contains **36 large ink-stop events**. Segment the original p0–p57 GP29 rune stream at each event without adding or deleting any rune. Two successive event-defined segments have **length zero**, both for visually intelligible reasons:

- **Event index 8 (zero based):** the red and black 13-dot marks are co-located after physical p7 rune offset 194.
- **Event index 11:** p14 ends with a mark and p15 starts with another mark at local rune offset zero, with no intervening rune.

The independent 32×8 printed table has **256 conventional base60 bytes**, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its **only two literal zeros** are at row-major indices **192 and 229**. The printed upper-right table cell is `33`, interpreted as base60 byte **183**, and the physical width is **8** cells.

An invertible affine mapping of event index to table index is therefore available:

```text
address(i) = (183*i + 8) mod 256
address(8)  = 192 -> original 00 byte
address(11) = 229 -> original 00 byte
```

The slope 183 is odd, so the affine map permutes all 256 addresses. **The two mapped zeros coincide exactly with the two empty segments; the remaining 34 nonempty segments address nonzero bytes.**

### Selection warning

**This is a postselected fit, not an independently predicted cipher clue.** Starting from the already observed two index pairs, their differences determine the slope: `3a=37 mod256`, giving `a=183`; the first pair then forces intercept `8`. We noticed *after solving these equations* that these operands equal the grid's original top-right byte and its width. Thus the 2/2 zero match uses up its two affine constraints and has **no unused zero-cell holdout**. It would be invalid to claim a 1/32,640 probability of deliberate encoding without a search-aware null. Neither Cicada's 2013 numerical command nor LP2 directs a player to read this particular corner cell as a multiplicative stride.

The reproducible source observation may become useful if an independent historical instruction selects a numbered-event→grid-address affine traversal. Until then, it cannot identify an encryption operation.

## Three independent original-source consumers fail to establish an inverse

**1. Source-sized ink register.** The entire manuscript has 225 red runes; excluding the five-rune **solved p56** red heading leaves **220 red runes**. Together with all **36** large marks, that makes another candidate 256-element register. This exclusion is also an interpretive choice: a different yet equally visible original grouping is 225 red runes plus 31 thirteen-dot marks = 256, already tested separately in [the earlier complete-ink report](ink256-hg-same-codeword-gate.md). We put one event value at each affine-addressed mark position and fill the other 220 positions with the remaining red runes in ascending table-address order.

Four specific event value readings were tested: preceding-segment rune length, GP29-index sum, source-GP-prime sum, and printed dot count, each modulo29. The original numeric grid is **exactly divisible** by the historically linked monic GF29 quartic `X^4+28X^3+13X^2+9X+14`, giving all-zero four-coefficient syndrome. The four proposed complete 256-ink registers are:

| Mark value | Original-register quartic syndrome, low coefficient first | Exact same-slot grid GP29 residues |
| --- | --- | ---: |
| Segment length | [18,26,13,10] | 14 / 256 |
| GP index sum | [27,9,26,14] | 16 / 256 |
| GP prime sum | [7,16,23,15] | 15 / 256 |
| Ink-dot count | [28,21,13,16] | 13 / 256 |

None is a source-style codeword. Same-slot matches are modest and include the two affine-fitted zero matches for the three zero-capable segment readings. These are **precisely scoped negatives** for the declared hybrid layout, not universal exclusions of all ink encodings.

**2. Authentically known p56 marked positions.** Applying the affine-addressed table bytes modulo29 directly as additive rune shifts at the three original p56 mark predecessors predicts **[16,19,16]**. The independently solved p56 prime-totient/F-transparent plaintext requires actual ciphertext-minus-plaintext shifts **[10,22,26]** there, for **0/3 direct matches**. This is an independent known-plaintext failure of that simplest possible consumer.

**3. Original p55 terminal message.** The source's 76-rune p55 passage is the length of the printed grid's outer ring. Directly add or subtract the first 76 affine-scrambled table-byte residues from the complete original p55 ciphertext. Both operations exactly re-encrypt their own output, but the full 76-rune GP29 coincidence indices remain **0.02877192982456** (addition) and **0.03473684210526** (subtraction), with no readable original GP prose. They do not recover any of the 76 plaintext runes. This negative is limited to these two direct sign/phase-zero receivers.

## Decision and reproduction

The two-zero alignment survives exact original-byte, page-rune, colored-ink and physical punctuation checks. It is worth retaining as an **exploratory source geometry observation**, but its affine coefficients were discovered by solving for the two zeros. The source-sized codeword test and authentic p56 consumer provide no independent corroboration. Stop here until new source evidence independently selects the pointer or another receiver; do not promote the matched zeros into a creator-selected key.

[Standalone dependency-free Windows Node22 SFT](../sims/lp2_ink36_zero_affine_grid_source_sft.cjs) reads only three committed original-derived resource JSON files, asserts every mapped zero and negative result, validates the entire original 256-byte SHA-256 and polynomial positive, and exactly re-encrypts both p55 inverses. [Successful GitHub Actions original-source run 44250576981](https://github.com/FlareZ123/liber-primus/actions/runs/44250576981).
