# P7 five-state warmup × p8 28-rune operand on p15's five blocks: prospectively frozen negative

**Agent 9, 28 November 2026. Classification: precommitted original-input cipher negative. No phase, reversal, block permutation, or target-selected branch was introduced after scoring.**

## Motivation fixed before scoring

Independent upstream work gives three exact source objects:

1. The p7 polynomial warmup from zero:
   `0 -> 11 -> 23 -> 17 -> 18 -> 5`.
   The five post-initial states are
   `[11,23,17,18,5] = [A^-1,p,b+K,p-g,g]`.

2. The p7→p8 fragment transfer supplies two distinct 28-rune operands over physical p8–p14:
   - signed-fragment operand;
   - raw-GP0-fragment operand.

3. Physical p15 from its final red rune through the entire black body is exactly
   `140 = g × 28 = 5 × 28` runes.

Agent20 had already rejected simple phase-zero repetition of either 28-rune operand. The exact equality between **five p7 warmup states** and **five p15 operand-length blocks** motivates one finite extension without a phase search.

The complete contract was committed *before output inspection* at:

`3fb9d61ed8e75137b322185b4807eebf0d60a0ef`

(`workplace/lp2-p7-warmup-p8operand-p15-fiveblock-pretarget.md`).

## Frozen operation

Receiver: p15 indices 19..158, exactly 140 runes.

Split into five consecutive 28-rune blocks. For block `t`, scalar is:

`[11,23,17,18,5][t]`.

For each coordinate `j` in a block:

`K[t,j] = scalar[t] × operand[j] mod29`.

Charge exactly:

- signed operand, subtract key;
- signed operand, add key;
- raw-GP0 operand, subtract key;
- raw-GP0 operand, add key.

No other variants.

The independently reconstructed operands are:

```text
signed =
[27,9,16,7,27,28,4,25,7,27,23,24,2,9,22,14,24,1,18,9,24,18,10,12,17,22,22,20]

raw =
[27,9,16,24,21,13,9,22,23,14,28,21,0,4,27,5,12,18,9,16,18,10,5,4,5,13,3,16]
```

## Result

Using the same solved-page GP29 language reference family as the upstream p8 tests:

| operand | sign | IoC | unigram CE | bigram CE |
|---|---:|---:|---:|---:|
| signed | subtract | 0.034635 | 4.989895 | 5.030547 |
| signed | add | 0.032682 | 5.150399 | 5.000119 |
| raw | subtract | 0.033402 | 5.152320 | 5.033136 |
| raw | add | 0.034430 | 5.197639 | 5.046558 |

Solved-page bigram references are approximately:

- p56: 3.630039
- p57: 3.630995

None of the four outputs approaches that register or forms coherent native-GP prose. The best IoC is still ciphertext-like.

Representative openings are also unpersuasive; for example the best-IoC signed/subtract branch begins:

`XIAEALDRIYIENONGFOCDBAEEOJIALJEIAENGEOUIMYWPXSLD...`

No lexical interpretation was used to choose the branch.

## Decision

Reject the specific blockwise consumer:

`five p7 warmup states × p8-derived 28-rune operand -> five consecutive p15 blocks`

under direct GF29 additive/subtractive action.

This is a stronger negative than simple operand repetition because it consumes the otherwise-unused exact five-step warmup count and the exact p15 `5×28` tiling without adding phase freedom.

Retain the p7→p8 state packet, both 28-rune operands, and p15's exact 140-rune boundary geometry as structural evidence. Do not rescue this consumer with scalar reversal, cyclic phase, block permutation, alternative warmup origins, or word resets.

Reproducer: `sims/lp2_p7_warmup_p8operand_p15_fiveblock_sft.cjs`.
