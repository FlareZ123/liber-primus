# P57 native-base60 / divmod29 DH-register audit and 2016 cross-source control

**Agent1, 19 November 2026. Director task #1778. Classification: conditional authentication of the serialization at the tested scope.**

## Frozen typed relation

The fixed map is:

```text
word
 -> whole-word GP0
 -> zero-based p50 address
 -> native-base60 token value
 -> Euclidean divmod29 [quotient,remainder]
```

Before opening the controls, four adjacent solved-p57 words were frozen as the training relation:

```text
THE       -> [e,b]   = [3,15]
DIVINITY  -> [K,g]   = [2,5]
WITHIN    -> [q,b+K] = [4,17]
AND       -> [A,p-1] = [8,22]
```

The immediately following solved word was held out:

```text
EMERGE    -> [a,B]   = [6,19].
```

The numerical DH state itself is independently established as:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4.
```

The chronology caveat is important: these typed field labels were recognized historically after p57 had already been inspected. The held-out test below is therefore a reproducible formal holdout, not a blind historical prediction.

## Convention family

Charge every combination of the low-description choices that could reasonably alter the register:

- radix: native base60 or the documented base59 rival obtained by deleting unused lowercase `f`;
- p50 token character order: forward or reversed;
- address origin: zero-based `GP0` or one-based `GP0-1`;
- pair order: `[quotient,remainder]` or swapped.

That is exactly **16 conventions**.

Result:

```text
canonical base60
zero-based GP0
forward token order
quotient first
```

is the **only** convention that matches all four frozen training pairs. It also predicts the held-out pair exactly:

```text
EMERGE -> [6,19] = [a,B].
```

Every other convention scores 0/4 on the typed training relation and fails the held-out pair.

## Exact token-tape permutation controls

The typed result could still be an artifact of inspecting one convenient arrangement of the p50 table. Two complete deterministic null families were therefore charged.

### All cyclic rotations

For every shift `0..255`, rotate the 256-token p50 tape and remap the same five words.

Charged:

```text
256 rotations
```

Training hits:

```text
shift 0 only
```

Full training + held-out hits:

```text
shift 0 only.
```

### All invertible affine address permutations

Charge every:

```text
address -> m*address + b mod256
```

with odd `m`, so the map is invertible.

Charged:

```text
128 * 256 = 32,768 exact permutations.
```

Training hits:

```text
m=1, b=0 only
```

Full training + held-out hits:

```text
m=1, b=0 only.
```

Thus the observed five-word state packet is tied to the authored p50 ordering under these complete low-description permutation classes.

## Leave-section-out source controls

Apply the canonical map to every contiguous five-word window in:

- solved p56 AN END;
- solved p57 PARABLE;
- the authenticated 2016 signed cleartext.

Demand the same four training pairs in order, then test the fifth held-out pair.

| source | words | four-pair training windows | full five-pair windows |
| --- | ---: | ---: | ---: |
| solved p56 | 25 | 0 | 0 |
| solved p57 | 20 | 1, at start15 | 1, at start15 |
| signed 2016 | 43 | 0 | 0 |

The unique matching window is exactly:

```text
THE DIVINITY WITHIN AND EMERGE.
```

## Held-out 2016 signed-source pair inventory

The contiguous-window control above remains negative: the authenticated 2016 source contains no contiguous four-pair training window or five-pair training-plus-holdout window. A distinct, noncontiguous control applies the same frozen five-pair vocabulary to every one of the 43 words in that source, without adding new DH expressions:

| Frozen pair | 2016 source words (zero-based indices) |
| --- | --- |
| [e,b]=[3,15] | THE: 1, 7, 12, 17, 22, 28 |
| [K,g]=[2,5] | no hit |
| [q,b+K]=[4,17] | LUCK: 37 |
| [A,p-1]=[8,22] | MAP: 18; AND: 24, 31; SEEK: 30 |
| [a,B]=[6,19] | NUMBERS: 26 |

This gives **12 exact occurrences across six distinct words**: THE, MAP, AND, NUMBERS, SEEK and LUCK. The matched words form a conspicuous semantic cluster in the signed message, including its explicit "its words are the map" and "their numbers are the direction" instructions. These are individual word hits, not a new contiguous copy of the p57 five-word sequence.

Controls on the fixed pair vocabulary:

- Across all 256 cyclic rotations of the p50 token tape, authored shift 0 is the **unique maximum**, with 12 hits; the next-best rotation has 8.
- After deduplicating repeated source spellings, authored shift 0 remains the unique cyclic maximum: 6 distinct word types.
- Across all 32,768 invertible affine address permutations, the authored mapping has 12 hits; 12 permutations reach at least 12, and the maximum is 14 (five permutations). Thus the canonical map is strongly placed in the upper tail but is **not** the unique affine maximum.

This is useful held-out cross-source support for the canonical p50 register: an independently authenticated source uses several of the same typed DH pairs on semantically relevant words. It is not a blind historical prediction—the field labels were recognized after p57 inspection—and it does not yet specify how a pair is consumed to decrypt an unknown page.

Two direct page-key interpretations were also tested on the 12 pages selected by these hits: repeat [quotient,remainder] as a period-two additive GP29 key, and use it as the affine map C=qP+r (mod 29). Neither yields a readable page or a score approaching the clear p57 control. The register is supported as a word-to-state mapping; it is not thereby established as a simple repeating or affine page key.

Reproducer: sims/lp2_p57_divmod29_register_audit_sft.cjs.

## Interpretation

This audit sharply reduces the post-discovery-relabeling objection at the **serialization** level. The held-out 2016 inventory adds a second-source check of the same fixed typed-pair vocabulary, although it is not a blind historical prediction. The held-out 2016 inventory adds a second-source check of the same fixed typed-pair vocabulary, although it is not a blind historical prediction.

The canonical choices are uniquely selected across:

- all 16 charged radix/order/origin conventions;
- all 256 cyclic tape rotations;
- all 32,768 invertible affine tape permutations;
- every contiguous five-word window in the two solved LP sections and authenticated 2016 source.

The held-out EMERGE pair closes as `[a,B]` without retuning.

The remaining limitation is chronology. The semantic field labels were discovered after the solved p57 material was already available, so this result cannot be treated as a historically blind prediction of the DH state. It is best classified as **conditional authentication**: the native-base60, zero-origin, forward-token, quotient-first divmod29 representation is strongly preferred for p57 state serialization, while p57-derived state labels should not by themselves authenticate an unknown-page plaintext or receiver.

## Decision

For downstream work that already has an independently selected state-bearing source object, prefer:

```text
GP0 -> p50 native base60 -> divmod29 [quotient,remainder].
```

Do not count a future unknown-page match to a flexible DH vocabulary as independent evidence unless the receiver and expected ordered pair are fixed before inspection. The held-out 2016 inventory adds cross-source support for the fixed typed-pair vocabulary, but does not select a DH field as a p50 address or authenticate a page-output type. Direct period-two additive and affine page-key interpretations fail; the separate quotient=Latin-length / remainder=page-displacement hypothesis is rejected in the p33/p40 report. The register is best treated as a word-to-DH-state mapping until an original clue specifies how its pair is consumed.

## Reproduction

```text
node sims/lp2_p57_divmod29_register_audit_sft.cjs
```

Windows Node.js 22 workflow **44454888404** passed.
