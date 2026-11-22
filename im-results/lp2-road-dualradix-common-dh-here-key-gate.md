# ROAD dual-radix common DH/HERE key grammar fails its frozen transfer

**Agent38, 19 November 2026. Director #1740. Classification: bounded negative key-assembly gate. The prospective ROAD dual-radix navigation remains intact. The AND/THEIR letters remain strong candidates, while this compact common key grammar is rejected as the missing reusable inverse because its precommitted holdout fails.**

## Upstream result preserved

The sealed ROAD navigation remains:

```text
ROAD base29 numeral mod256 = 190
one-based p50 cell189 = 3C

drop-f base59(3C) = 189 -> p0 word42, length3
base60(3C)        = 192 -> p0 word43, length4

next authenticated words = AND THEIR
GP lengths               = 3   4
```

Across the complete 164-configuration navigation family, this is the only adjacent dual-radix landing whose two receiver lengths match the next two authenticated source words.

The opened ciphertexts and exact post-target inverse keys are already published:

```text
p0 189..191 [0,6,9]
- [5,26,15]
= AND [24,9,23]

p0 192..195 [19,12,20,9]
- [17,23,10,5]
= THEIR [2,18,10,4]
```

## Common rule precommitted before the holdout

The exact grammar was sealed in:

`workplace/agent38-road-dualradix-common-key-precommit.md`

at commit `4b41cf0c1f14e10a4e752f550982167fd39058c6`, before opening the selected holdout receiver.

Fixed p28 state:

```text
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

For radix `r` in {59,60}:

1. select the private scalar whose parity matches the radix:
   - 59 odd -> b=15
   - 60 even -> a=6
2. serialize the standard DH prefix `[g,p,private,K]`;
3. truncate to the receiver length, with maximum length4;
4. apply one complementary HERE lookup rule around the distinguished modulus field `p`:
   - odd radix: only `p` is looked up through the fixed HERE line;
   - even radix: `p` stays direct and every non-`p` field is looked up through HERE;
5. subtract modulo29.

This gives one formula for the two already observed keys:

```text
r59 L3:
[g,p,b] -> [g,HERE(p),b]
          = [5,26,15]

r60 L4:
[g,p,a,K] -> [HERE(g),p,HERE(a),HERE(K)]
            = [17,23,10,5]
```

The rule is compact and coordinate-free after choosing the radix. Its chronology remains target-aware because it was recognized from the published keys.

## Complete structural control

Reconstruct all 14 cases where the frozen signed-word base29-number operation, charged address origins, both live radices, and charged receiver origins make base59/base60 land on adjacent p0 word starts.

Apply the same common key grammar to every eligible branch. Compare:

- the base59 output to the immediately following authenticated signed word;
- the base60 output to the second following authenticated signed word.

Across the whole structural family, the only exact successor hits are the two ROAD branches already used to formulate the grammar:

```text
ROAD / r59 / start189 -> AND
ROAD / r60 / start192 -> THEIR
```

No independent structural case transfers the rule.

## Frozen first-source-order holdout

The precommit selected the earliest non-ROAD structural case whose r59 receiver length equals its immediate successor's GP length, using geometry and source lengths only:

```text
signed index1: THE
p50 token: 2v
r59 receiver: p0 start173, length3
target fixed by source order: PATH
fixed key: [g,HERE(p),b] = [5,26,15]
```

Only after the precommit was pushed, the receiver was consumed:

```text
ciphertext = [22,8,20]
key        = [5,26,15]
plaintext  = [17,11,5] = BJC
target     = PATH
```

The holdout is an exact miss.

## Fixed ROAD continuation also fails structurally

Applying the ROAD number-direction operation itself to candidate THEIR gives:

```text
THEIR GP = [2,18,10,4]
base29 numeral = 64210
mod256 = 210
one-based p50 cell209 = 2t
base59 = 172
base60 = 175
```

Neither 172 nor175 is a p0 word start, so the same ROAD dual-radix start-pair grammar does not select the next authenticated phrase `NUMBERS ARE`. This retains the previously required downstream stop under the stronger number-as-base29 reading.

## Decision

The compact parity/DH/HERE rule is **rejected as a reusable key generator**. Its exact fit to AND/THEIR is a useful compression of the two target-known keys, but the precommitted PATH transfer fails and the full matched structural family gives no independent successor hit.

Do not repair the grammar with:

- a sign flip;
- radix-role swap;
- field reordering;
- another HERE/DH mask;
- another holdout;
- target-specific truncation beyond the receiver length.

The durable positive result from #1740 remains the receiver selection:

```text
ROAD number -> p50 3C -> dual radix -> adjacent p0 [3,4] words
           -> uniquely matches source successor shape AND THEIR
```

The plaintext letters still require a source-selected inverse that exists before target feedback.

## Reproduction

SFT:

`sims/lp2_road_dualradix_common_dh_here_key_sft.cjs`

Windows Node run:

`44441809460` — PASS, with `decision = HOLDOUT_MISS`.

Precommit:

`workplace/agent38-road-dualradix-common-key-precommit.md`
