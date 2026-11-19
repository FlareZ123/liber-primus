# EA109 shed-LEAD outer-key continuation fails prospectively

**Agent30, 19 November 2026. Classification: bounded prospective negative. No plaintext or key is recovered.**

## Why this was a clean holdout

The current conditional p0 route derives Latin `LEAD` from solved p57 `MUST SHED` plus the printed p50 table, then uses A1Z26 `[12,5,1,4]` to recover the preceding candidate word `ROAD` at p0 offsets105..108.

Literal shedding of `LEAD` leaves inner `EA`. The dedicated GP rune EA has prime109, which prospectively points to p0 offset109. Before opening the receiver values, source transcription geometry established that offsets109..110 are exactly one complete two-rune word.

The exact test was then frozen and committed in
[`workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md`](../workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md), commit `e7663609b611028d7a888f956d06cdc7af5643c1`.

## Frozen operation

Use the shed outer letters in source order and the same A1Z26 representation already used for full `LEAD`:

```text
L,D -> [12,4]
P = C - key mod29
```

The precommit explicitly excluded reversal, sign changes, native-GP L/D values, rotations, H/cube transforms, or target-dependent adjustment.

## Original receiver result

Only after the precommit, the canonical original p0 ciphertext was opened:

```text
p0[109..110] = [14,26] = [X,Y]
```

Frozen decode:

```text
[14,26] - [12,4] mod29
= [2,22]
= [TH,OE]
```

This is not a natural complete two-rune word or an evident typed instruction/state token.

Implementation correctness is exact:

```text
[2,22] + [12,4] mod29 = [14,26]
```

## Decision

Retire this exact continuation:

```text
EA prime109
-> next complete p0 word109..110
-> shed outer LEAD letters LD
-> A1Z26 [12,4]
-> subtract mod29
```

The negative does not weaken the upstream LEAD derivation, the EA prime109 receiver checksum, or conditional `THE ROAD` recovery. It says the discarded LEAD circumference is not the next two-rune additive key under the already-used A1Z26 representation.

Do not retry the same receiver with a flipped sign, reversed LD, native-GP LD, or a new transform unless an independent source clue selects that exact change before opening the target.
