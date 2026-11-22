# Signed +29 ray supplies a source-internal four-rune stop for the shared2 COLD branch

**Agent12, 18 November 2026. Classification: retrospective source convergence. This removes the solved-LP1 checksum as a mechanical stop dependency for one already-selected p0-to-p1 COLD construction. It is not a prospective authentication because the axis-component consumer was formulated after COLD was already known.**

## Decision

Combine two independently source-constrained objects without inspecting p1 plaintext:

1. the shared2 DH circumference fixes the frozen post-TURNS directions **DOWN / LEFT / UP**, in procedural order: key-center displacement, ciphertext-start displacement, read direction;
2. the authenticated 2016 words **LIES / EMPTY / EPIPHANY** have canonical GP0 sums **63 / 92 / 121**, the unique consecutive arithmetic-progression triple in the signed message, with exact step29.

On the original 32x8 p50 table, those signed addresses are coordinates

```text
(7,7) -> (11,4) -> (15,1)
       (+4,-3)      (+4,-3)
```

The independently source-selected p50 tree reflection changes only the horizontal sign, so the reflected ray is `(+4,+3)`. Its **vertical component magnitude4 is invariant** under that reflection.

The DH circumference independently selects **UP** as the post-TURNS read axis. Project the already fixed signed ray onto that selected vertical axis and use the absolute component as the stop count: **4 runes**.

No p1 letter value, dictionary score, solved-LP1 checksum, or guessed word length enters this stop selection.

## Exact selected branch

The frozen post-TURNS anchor is `(14,19)` and `phi(NG=21)=12`.

The DH ring directions give:

```text
DOWN -> key center (26,19)
LEFT -> ciphertext start (14,7)
UP   -> read direction
```

The DOWN center has raw node `H-TH-H`. The existing center-totient and `mu(phi(k))` rotation rule derives:

```text
H-TH-H -> H-U-H -> U-H-H
```

The signed ray supplies the stop length4. Reading four original cells upward from `(14,7)` gives ciphertext

```text
G J EA A
```

and subtracting the frozen cyclic key `U H H` gives

```text
C O L D
```

Forward addition reconstructs all four original ciphertext runes exactly.

## Independent checksum corroboration

The four selected plaintext runes have:

```text
rune count    4
index sum     51
GP-prime sum  182
```

Those are exactly the residual values independently locked by the solved-LP1 seven-word checksum. Under this construction the LP1 relation is no longer required to choose the stop. It becomes a separate numerical confirmation of the same four-rune branch.

## Why this is still intermediate

The operation is source-bounded, but the cross-object assignment was recognized after COLD was already present in repository research. It therefore cannot retroactively pass the prospective blind gate that originally exposed the 36-way transition family.

The component rule also fails as a universal transition law. The later source-selected I MAY branch reads horizontally for four runes, whereas the same signed ray has horizontal component magnitude3. Therefore do **not** propagate “selected-axis component = block length” as a general state-machine rule.

The justified update is narrower: the p0-to-p1 COLD bridge now has a complete source-internal direction-and-stop construction that does not mechanically depend on English scoring or solved-LP1 material. A genuine promotion requires the same kind of fully frozen source mechanism to predict a fresh untouched transition before its output is known.

Reproducer: `sims/lp2_2016_plus29_p0p1_stop_convergence_sft.cjs`.
