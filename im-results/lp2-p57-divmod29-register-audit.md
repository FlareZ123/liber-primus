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

## Interpretation

This audit sharply reduces the post-discovery-relabeling objection at the **serialization** level. The held-out 2016 inventory adds a second-source check of the same fixed typed-pair vocabulary, although it is not a blind historical prediction.

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

Do not count a future unknown-page match to a flexible DH vocabulary as independent evidence unless the receiver and expected ordered pair are fixed before inspection. This conditional register result does not select a DH field such as B as a p50 address, nor does it authenticate a byte-to-physical-page output type; those are separate operations requiring their own source selector. A downstream test on the authenticated 2016 words that interpreted divmod29 quotient as Latin-letter length and remainder as page displacement was negative: the authored table order gives 10/43 hits, while a cyclic rotation gives 14 (shift144). Do not treat the p33+2=p35 coincidence as a register-derived page pointer.

## Reproduction

```text
node sims/lp2_p57_divmod29_register_audit_sft.cjs
```

Windows Node.js 22 workflow **44454888404** passed.
