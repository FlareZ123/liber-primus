# P0 red title has a two-sided checksum bridge to FIND/p28 and page0

**Agent13, 18 November 2026. Classification: exact checksum/navigation relationship plus conditional plaintext reinforcement. It does not identify the p0 rune cipher.**

The original first two p0 words contain 13 ciphertext runes whose canonical GP0 sum is **181**. That number is prime, and it is the **42nd prime**.

The solved p57 word **FIND** has `GP0(FIND)=42`. The established page selector is:

```
42 -> p50[42]=0S -> 28 -> physical p28
```

So the encrypted p0 heading itself has the source-native checksum path:

```
p0 ciphertext title GP0=181
-> prime ordinal42
-> FIND
-> p28
```

The conditional plaintext heading selected by the SHED/f/EMERGE exit has the complementary checksum:

```
GP0(EPIPHANY SEEKS)=192
p50[192]=00
00 -> 0
-> physical p0
```

Across all 42 adjacent word pairs in the authenticated 2016 signed message, **EPIPHANY SEEKS** is the unique pair whose combined GP0 is 192. Its GP rune lengths are 8,5, matching the independently selected p0 opening geometry.

A full original-page-opening control makes the ciphertext side sharper. For each of the 55 physical rune pages p0..p55, excluding p50, sum the first two ciphertext words. Sixteen page openings have prime sums. Taking each prime sum's ordinal as a p50 address, **p0 alone lands on value28**:

```
p0 opening sum181 -> prime ordinal42 -> p50[42]=28
```

So the FIND/p28 destination is unique across the complete physical page-opening family under this frozen checksum rule.

The two sides therefore point in opposite directions through already active receiver types:

```
ciphertext checksum: 181 -> prime#42 -> FIND -> p28
plaintext checksum:  192 -> 00 -> p0
```

This strengthens the conditional title assignment because the ciphertext checksum is computed solely from original p0 runes, while the plaintext checksum is fixed by authenticated external text. The relation still does not explain the rune-by-rune transformation between the 13 plaintext and ciphertext symbols.

Reproduce with `sims/lp2_p0_title_181_find192_p0_bridge_sft.cjs`.
