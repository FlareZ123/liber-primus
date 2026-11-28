# LP2 physical-ordinal / zero-based source-index reconciliation

## Question

Does the p24–p26 mayfly/Fibonacci pointer conflict with the existing zero-based signed-2016 source/page map?

**No.** The apparent off-by-one came from mixing two different numeric namespaces: a **physical page ordinal** and a **zero-based source/project-page index**. Once those are named explicitly, the routes converge.

This is a route-consistency result, not a new plaintext claim.

## Reproduction

Run:

```text
sims/lp2_p28_fibonacci_onebased_source_bridge_sft.cjs
```

CI run `46126198839` reproduces the arithmetic. The script name is historical; the current output explicitly reports both physical ordinals and zero-based indices.

## Independent mayfly pointer

The original p24–p26 runic counts are:

```text
270, 273, 265
```

Their absolute pairwise differences are `3,5,8`. With the separately source-adjudicated local frame `13`, the consecutive Fibonacci terms sum to:

```text
3 + 5 + 8 + 13 = 29
```

The mayfly result is naturally a **physical-page ordinal**:

```text
29th LP2 page = project p28
```

That conversion is simply:

```text
physical ordinal N -> project index N-1
```

## Signed source remains zero-based

The authenticated 2016 source has:

```text
source[28] = THE
source[29] = DIRECTION
source[34] = BE
```

The existing source/page convention is:

```text
source index i -> project page p_i
```

Therefore the mayfly pointer and the source map meet at exactly the same page:

```text
29th physical page
= project p28
= zero-based source[28]
= THE
```

The immediate source follower then gives:

```text
source[29] = DIRECTION
-> project p29
-> 30th physical LP2 page
```

This is the same relation that can equivalently be described as one-based word 29 `THE` followed by word 30 `DIRECTION`; the one-based wording is only a relabeling of the zero-based source indices.

## Held-out p28/p34 family

The existing +6 source-rise predictor still has exactly the two eligible two-rune hits reproduced by the gate:

- zero-based source index **28 = THE** -> project `p28`, offset 140, predicted ciphertext `[24,25]`;
- zero-based source index **34 = BE** -> project `p34`, offset 4, predicted ciphertext `[12,23]`.

Equivalently these are ordinal source words 29 and 35 on physical pages 29 and 35.

On p28, the preceding fixed exponent split at offsets 134–139 yields `READOUT`, so the local chain remains:

```text
29th physical page / p28
READ OUT
source[28] THE
source[29] DIRECTION
-> p29
```

Canonical word 30 on p29 is `[11,26,11,18]`; its canonical H4 serialization is `[22,15,8,0]`, reproducing the previously reported DIRECTION packet.

## Relationship to the p33 rise route

The p33 body rises are `[1,7,34]`. Under the same zero-based authenticated source convention they are:

```text
source[1], source[7], source[34]
= THE, THE, BE
```

and `34` names project `p34` / the 35th physical page.

Reading those three integers as one-based source ordinals would instead give `HELLO, SEEKS, WILL`; that is a **misapplication of the physical-page ordinal convention to source indices**, not evidence for a competing global origin.

The newer p36–p40 corridor independently strengthens the same zero-based source-index/project-page convention:

```text
source[36..40]
= GOOD LUCK BEWARE FALSE PATHS
-> project p36..p40
```

## Consequence

The useful grammar is now explicit:

```text
physical page ordinal N  -> project page p(N-1)
signed source index i    -> project page p_i
```

Those two conventions are mutually consistent because a physical ordinal is one greater than its zero-based project index.

The mayfly/Fibonacci `29` is therefore **independent convergent evidence for p28**, not an origin conflict with the signed source map. It lands on the same project page already associated with zero-based source index 28 = `THE`, and the next authenticated source index 29 = `DIRECTION` points to p29.

This reconciliation removes an avoidable indexing ambiguity. It does **not** by itself establish that the signed source is the intended register, nor does it promote any retrospective local key grammar to established plaintext.
