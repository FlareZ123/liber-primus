# P0 post-DEATH held-out YOU and cube gate: conditional selection of SEE YOU SOON

**Agent7, 18 November 2026. Classification:** strong conditional route-selection evidence. This does not promote downstream plaintext to an established result because its numerical predictor was originally noticed on the external proposed route. Its useful property is temporal holdout: the predictor predates the repository's current independent source-bounded bootstrap.

## Locked prediction before inspecting the next route

The pre-existing route records these GP prime-value totals:

| Block | GP |
| --- | ---: |
| `AS I GO THE WEATHER TURNS COLD` | 825 |
| `I MAY CRY NOW` | 484 |
| `THE IDEA OF THE END IS DEATH` | 854 |

Their sum is:

```text
825 + 484 + 854 = 2163 = 103 * 7 * 3
```

In the 29-rune GP prime mapping, `103 = Y`, `7 = O`, and `3 = U`. The locked numerical prediction for a following word is therefore **YOU**.

The same pre-existing numerical report gives another downstream invariant. The second seven-word block has 17 runes and index sum 232. The next three-word block was observed to complete two cubes:

```text
17 + 10 = 27 = 3^3
232 + 111 = 343 = 7^3
```

For this gate, the following three-word block is therefore frozen at **10 runes and index sum 111**. Its GP total is deliberately excluded from the selector.

## Broad source-only two-transition family from DEATH

Start from the recorded DEATH ciphertext endpoint `E (26,1)`. Build a broad family without supplying SEE or YOU geometry:

1. Move one 8-neighbor step to every in-bounds cell that is an outer endpoint of an actual equal-outer three-rune mirror.
2. Derive that mirror's key by center totient plus the established `sum(mu(phi(k))) mod 3` rotation.
3. Move by `phi(center) + phi^2(center)` along every 8-direction ray.
4. Read every 2-, 3-, or 4-rune 8-direction segment.
5. From each resulting endpoint, move by `phi^2(phi(previous center))` in every 8-direction direction to every outer-endpoint mirror; derive its key; move by `phi(new center)`; read exactly three runes in every 8-direction.
6. Retain the second transition only when it decrypts the precommitted runes **Y O U**.

The family contains **522** first-transition candidates and **27** exact YOU hits.

## Cube constraint selects SEE and the published YOU geometry

Require the first transition to be an exact source-native TextBlob word with frequency at least 100. Apply only the locked three-word totals of 10 runes and index sum 111.

Across all 27 predicted-YOU hits, exactly **one** candidate survives:

```text
first word      SEE
first key       EA-I-EA
first start     X (25,16)
first endpoint  B (27,14)

predicted word  YOU
YOU key         TH-P-P
YOU start       EA (27,18)
YOU endpoint    X (25,16)
```

The remaining third-word signature is **4 runes, index sum 30**. The source-native common-word lexicon has two candidates with that signature: **SOON** and **TURN**.

This result uses no GP value for the three-word block.

## Endpoint-coordinate state gate resolves SOON

At the selected YOU endpoint `X (25,16)`, apply Euler totients to the coordinates:

```text
phi(25)     = 20 = L
phi(16)     =  8 = H
phi^2(16)   =  4 = R
```

Search cardinally from the endpoint for the first `H` in each direction. The nearest cardinal H is unique:

```text
UP     -> H at distance 13
RIGHT  -> H at distance 3
```

So the shortest endpoint-derived ray is:

```text
X (25,16) -> D (25,17) -> W (25,18) -> H (25,19)
```

For the key, do not preselect EA. The already selected SEE/YOU transitions expose exactly seven distinct local state runes across their ciphertext and key material:

```text
B, EA, I, P, T, TH, X
```

For each carried state rune, combine it with the coordinate-derived `L` and `R`, test **all six permutations**, decrypt the shortest-H four-rune ray, and retain only the locked residual index sum 30.

This tests **42** keys. Exactly one survives:

```text
carried rune   EA
key            EA-L-R
ciphertext     X-D-W-H
plaintext      S-O-O-N
index sum      30
```

Thus the previously ambiguous final-word metric is resolved as **SOON** inside this widened source-state key family.

## Conditional SOON → THEN source-state completion

A source-state completion can be tested from the already selected SOON state without supplying the expected next plaintext.

Freeze the selected SOON block exactly as above:

```text
key         EA-L-R
ciphertext  X(25,16) D(25,17) W(25,18) H(25,19)
plaintext   S O O N
endpoint    H(25,19)
read ray    RIGHT
```

The endpoint coordinates provide two retained second-totient distances:

```text
phi^2(25) = 8
phi^2(19) = 6
```

Continue on the carried rightward ray. Those two source distances delimit the three-cell segment from distance6 through distance8 inclusive:

```text
L(25,25) -> T(25,26) -> W(25,27)
```

The nearer distance6 has an exact midpoint at distance3, `IA(25,22)`. That midpoint touches two equal-outer mirrors:

```text
IA-H-IA    diagonal radius1
IA-IA-IA  vertical radius1
```

Only the vertical mirror is perpendicular to the carried horizontal read ray, so source geometry resolves the tie before decryption. Its standard center-totient/Mobius derivation is:

```text
raw      IA-IA-IA
derived  IA-E-IA
phase    1
key      E-IA-IA
```

Decrypting the already fixed `L-T-W` segment then gives:

```text
TH-E-N
```

The exact inverse reconstructs `L-T-W`.

This is a deterministic conditional continuation once the SOON state and the **midpoint/perpendicular-mirror continuation rule** are granted. It does not independently authenticate `THEN`: the rule was reconstructed after the public 27x27 route was already known, so it remains a post-hoc state-machine hypothesis. Its value is narrower: no dictionary or target rune is needed after the rule is frozen, and the midpoint ambiguity is resolved geometrically rather than linguistically.

Reproducer: [`sims/lp2_p0_soon_to_then_source_state_sft.cjs`](../sims/lp2_p0_soon_to_then_source_state_sft.cjs).

## Result and limitation

Conditional on the held-out post-DEATH numerical prediction, the original square plus the cube and endpoint-coordinate constraints select `SEE YOU SOON`. A further source-state continuation from the selected SOON endpoint conditionally fixes `THEN` before decryption, provided the midpoint/perpendicular-mirror rule is granted.

The strongest part is the layered discrimination: 522 first transitions become 27 predicted-YOU hits, the GP-free cube constraint leaves one SEE/YOU geometry, and a 42-key source-state permutation family leaves one final four-rune completion, SOON.

The remaining weakness is upstream. The YOU factorization and cube totals were first noticed on the external proposed route, so they are not author-authenticated clues. They are held out relative to this repository's newer independent bootstrap, making this a serious prospective consistency test rather than a complete independent derivation.

## Reproduction

```text
node sims/lp2_p0_postdeath_you_cube_gate_sft.cjs
```
