# p0 post-IDEA mirror-walk branch gate

**Agent 29, 18 November 2026. Classification: substantial post-hoc source-geometry selector, not yet authenticated plaintext.**

The conditional p0-p2 bootstrap reaches `IDEA` on source cells `(15,20) -> (16,19) -> (17,18)`. Starting only from that frozen state and the untouched 27x27 rune grid, a mirror-incidence walk reconstructs the next five public-route blocks. The important new result is stronger than a single fitted path: when the local branch choices are deliberately broadened, the already-locked aggregate selects exactly one complete assignment.

## Forced key-node chain

Enumerating every horizontal, vertical, and 45-degree equal-outer three-cell mirror gives **479** source nodes.

At the `IDEA` endpoint `D (17,18)`:

- D is the center of exactly one mirror, `J-D-J`, radius 2.
- Only one of its J outers is itself a mirror center: `J (19,16)`.
- That J centers exactly one mirror, `OE-J-OE`, radius 1.
- Removing those two incidences leaves exactly one further mirror touching the same J: `J-B-J`, radius 4.

The resulting first three key sources are therefore locally fixed:

```
J-D-J  ->  OE-J-OE  ->  J-B-J
```

The existing center-totient/Mobius phase operation gives aligned keys:

```
J-OE-J
OE-OE-I
J-J-T
```

## Local walk grammar

The parser uses source roles rather than English:

1. At the first junction, reflect the unit direction toward the old mirror center across the new mirror axis. Enter the nearest cell of the new mirror.
2. Propagate the ciphertext direction by mirror reflection at the next key axis.
3. When a read reaches a cell with exactly one mirror incidence, enter that mirror and follow center/outer handoffs.
4. At the next pivot center, move one mirror radius perpendicular to that pivot and continue through outer-role handoffs.
5. A terminal ray stops at the physical matrix boundary.

A minimum-radius tie-break happens to recover the published route directly, but the decisive experiment below **does not require it**.

## Broad branch-family enumeration

Keep every locally role-valid alternative in that grammar:

- every stage-11 mirror bounce from the reflected entry cell that crosses to the opposite side;
- every centered-mirror and outer-role handoff after the unique stage-11 endpoint;
- every centered pivot reached by the bounced stage-12 ray;
- both perpendicular radius destinations;
- every mirror center at those destinations;
- every subsequent outer-role handoff to the final boundary ray.

No axis-equality restriction, minimum-radius rule, plaintext score, dictionary, word identity, index sum, or GP sum is used while generating candidates.

The exhaustive family contains:

```
66 complete source-geometry assignments
7 assignments with exactly 12 decrypted runes
1 assignment with 12 runes, index sum 151, and GP-prime sum 553
```

That unique assignment is:

| Stage | Source key | Cipher cells | Decrypted GP runes |
| --- | --- | --- | --- |
| 09 | `J-D-J -> J-OE-J` | `(18,15) (18,16)` | `O F` |
| 10 | `OE-J-OE -> OE-OE-I` | `(19,17) (19,16)` | `TH E` |
| 11 | `J-B-J -> J-J-T` | `(19,23) (20,23) (21,23)` | `E N D` |
| 12 | `H-R-H -> TH-H-H` | `(21,9) (21,10)` | `I S` |
| 13 | `J-B-J -> J-J-T` | `(26,3) (26,2) (26,1)` | `D EA TH` |

Concatenated:

```
O F | TH E | E N D | I S | D EA TH
```

The aggregate is exactly the previously locked post-`THE IDEA` residual:

```
12 runes
index sum 151
GP-prime sum 553
```

The other six 12-rune branch-family assignments miss at least one numerical target.

## What is genuinely new

Earlier local work showed that a single straight 12-rune post-IDEA continuation fails: **0/105** direct-ray candidates hit the locked aggregate. The branch-family experiment instead gives a finite multi-transition family in which **1/66** complete source assignments, and **1/7** length-matched assignments, hits the full target.

This means the post-IDEA public route is no longer merely one arbitrary English-looking continuation inside the tested local mirror family. The source geometry plus the precommitted aggregate selects its exact five ciphertext blocks uniquely within that family.

The exact ending is also structurally clean: `D EA TH` runs from `C (26,3)` left to `E (26,1)`, the physical matrix edge; that terminal E has no mirror incidence.

## Remaining caveat

The walk grammar itself was reverse-engineered after the public route was known. The locked aggregate existed before this parser was formulated, but it ultimately originated from the same external candidate passage, so it is a temporal holdout rather than independent creator authentication.

Accordingly, this result should remain in `im-results/`. The next decisive requirement is either:

- a source-visible instruction that independently selects the reflection/role/perpendicular walk primitives, or
- a genuinely prospective transition where the frozen grammar predicts the exact source cells before the target route is inspected.

A failure there should retire or simplify the grammar rather than add another local exception.

## Reproduction

Run:

```
node sims/lp2_p0_postidea_mirror_incidence_sft.cjs
```

The CommonJS SFT reads only `resources/liber-primus/lp2-corpus.json`. It enumerates all 479 mirrors, reproduces the source-selected stages, then exhausts the broad branch family and asserts the counts `66 -> 7 -> 1` before reporting the unique output.
