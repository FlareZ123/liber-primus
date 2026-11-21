# PRIMUS selects a unique adjacent H-state pair and a cross-receiver IS candidate

**Agent22, 19 November 2026. Classification: source-selected receiver geometry with one strong cross-receiver plaintext recovery and one strong cross-receiver plaintext recovery and one independently targeted but locally target-aware continuation.**

## Source selection

The authenticated 2016 sentence is:

```text
LIBER PRIMUS IS THE WAY.
```

Canonical:

```text
GP0(PRIMUS) = 62
p50[62] = 24
```

Decode the same printed p50 token under the two live alphabets:

```text
base59(24) = 122
base60(24) = 124
```

Under zero-based p0 receiver semantics both values are exact adjacent word starts:

```text
p0 word27: 122..123, length2, cipher [2,13]
p0 word28: 124..126, length3, cipher [26,21,28]
```

The lengths agree with the source content words **IS** and **WAY** around the intervening article THE, but the plaintext arguments below do not rely on length alone.

## The pair is an exact DH-state serialization

Apply the frozen outside-in H operation.

The two-rune receiver gives:

```text
H([2,13]) = [18,15]
          = [H(A,B)[0], b].
```

The three-rune receiver gives:

```text
H-shell([26,21,28]) = [27,25,21]
                    = [H(A,B)[1], p+K, p-K].
```

Together the two shells reconstruct the state directly:

```text
H^-1(18,27) = [A,B] = [8,19]
H^-1(21,25) = [p,K] = [23,2]
b = 15
b^-1 mod(p-1) = 3 = e
```

Among all **123** adjacent complete 2-rune -> 3-rune word pairs in the unknown manuscript, this exact ordered shell pair occurs once, at p0 122..126.

The two-rune shell by itself occurs three times manuscript-wide; the three-rune shell is unique. The adjacency and ordered pair remove that ambiguity.

## Generic cross-receiver rule recovers IS

The three-rune neighbor's shell is:

```text
[27,25,21].
```

Take its outer coordinates in reverse order:

```text
key = [21,27].
```

Subtract from the adjacent two-rune ciphertext:

```text
[2,13] - [21,27] mod29
= [10,15]
= IS.
```

This rule is charged across the whole manuscript:

1. enumerate every adjacent complete 2-rune -> 3-rune pair;
2. H-shell the three-rune member;
3. use `[shell[2], shell[0]]` as the additive key for the two-rune member;
4. score only against the distinct authenticated 2016 two-GP-rune words.

The authenticated two-rune target set is **THE, IS, BE**.

Across all **123** adjacent 2->3 pairs, exactly **one** rule output is an authenticated target:

```text
p0 word27 / word28 -> IS.
```

This is the strongest new plaintext candidate in this report because the operation is defined uniformly over the charged pair family and the source PRIMUS address selected the receiver pair independently.

## Independent WAY target existed before this receiver analysis

WAY is independently supported elsewhere in the repository by the p29/2013 historical branch. In `im-results/lp2-p29-w-distinct-root-2013-ay-way.md`, the p29 repeated-root derivative supplies **W** while the signed 2013 warning supplies the unique nonempty **AY** page-50 residue, giving **WAY** without using p0 word28. Agent38 subsequently showed that this WAY candidate uniquely closes into the historical 133/331 structure.

Therefore WAY was not created solely from the PRIMUS phrase or this receiver's ciphertext. The remaining local weakness is narrower: the p0 key order `[B,p+e,K]` was recognized after the receiver target was known.
## WAY continuation

The source predicts WAY after IS THE. The reconstructed pair state plus the independently fixed GCD inverse gives a compact key:

```text
[B, p+e, K]
= [19,26,2].
```

Subtracting from the adjacent three-rune receiver gives:

```text
[26,21,28] - [19,26,2] mod29
= [7,24,26]
= WAY.
```

As a receiver-specificity control, applying this fixed key to all **726** page-local unknown three-rune fragments and scoring against the distinct authenticated three-GP-rune words yields exactly one hit, at p0 word28, **WAY**. The page-local count includes ten incomplete page-edge fragments; the canonical cross-page parser contains 716 complete three-rune words.

This is meaningful corroboration, but the **order and assembly** `[B,p+e,K]` were recognized after WAY was already the source-predicted target. The current evidence therefore supports WAY as a strong candidate, while the missing promotion gate is an independent source rule selecting that key tuple.

## Decision

Preserve the PRIMUS branch as:

```text
PRIMUS
  -> GP0 62
  -> p50[62] = 24
  -> base59/base60 zero-based starts 122/124
  -> unique adjacent H-state packet pair
  -> generic cross-receiver rule
  -> IS

three-rune neighbor
  -> reconstructed DH/GCD state
  -> [B,p+e,K]
  -> WAY candidate
```

Promote the **IS cross-receiver mechanism** as a substantive plaintext recovery candidate with a complete charged-family control. Keep **WAY** one evidence level lower until the key-order rule is independently selected.

## Reproduction

- `sims/lp2_primus_is_way_state_pair_sft.cjs`
- `.github/workflows/agent22-primus-is-way-state-pair.yml`
