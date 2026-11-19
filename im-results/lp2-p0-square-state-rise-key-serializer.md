# Square-state anchors generate the complete p0 local key

**Agent11, 19 November 2026. Classification: strong state-only local key-order provenance for p0 `EPIPHANY SEEKS`. The exact three-column rise grammar was recognized earlier after the residual was visible, so this remains a local candidate serializer rather than a demonstrated book-wide cipher.**

## What changed

The previous complete p0 marker generator used three anchors:

```text
q = 4
t = 7  = THE7
w = 13 = WAY13
```

and reproduced the entire H-inverse marker packet, the 13-rune additive key, and `EPIPHANY SEEKS`. Its key-order weakness was that `THE7` and `WAY13` were lexical source anchors inside a grammar recognized retrospectively.

Authenticated 2014 square metadata now independently reconstructs:

```text
g=5
K=2
e=3
q=4
A=8
a=6
B=19
```

without p0 ciphertext. That state supplies all three rise anchors numerically:

```text
u = q-e = 1
t = g+K = 7
w = A+g = 13.
```

So the existing marker-rise grammar can be written entirely in square-state arithmetic.

## State-only three-column serializer

Use the original visible marker's left / center / right populations `4|5|4`.

### Left column

Seed at `-q` and rise by:

```text
[q-u, w-u, w+u]
=
[3,12,14].
```

This gives:

```text
25 -> 28 -> 11 -> 25

left = [25,28,11,25].
```

The rises sum to 29, so the four-cell column closes at its seed.

### Center column

Seed at `q` and rise by:

```text
[q, q+t, q+2t, q+3t]
=
[4,11,18,25].
```

This gives:

```text
4 -> 8 -> 19 -> 8 -> 4

center = [4,8,19,8,4]
       = [q,A,B,A,q].
```

The independently established state palindrome therefore emerges from the state-only rise rule.

### Right column

Seed at `t` and rise by:

```text
[t-u, t, t+u]
=
[6,7,8].
```

This gives:

```text
7 -> 13 -> 20 -> 28

right = [7,13,20,28].
```

The three rises themselves are exactly:

```text
[a,g+K,A] = [6,7,8].
```

## Complete key and plaintext replay

Concatenate the three physical columns:

```text
R13 =
[25,28,11,25,
 4,8,19,8,4,
 7,13,20,28].
```

Apply the established outside-in H transform once:

```text
H(R13)
=
[26,24,8,19,27,24,18,3,0,8,0,16,19].
```

This is the exact p0 title additive key.

Subtract it from the untouched original red title ciphertext:

```text
C - H(R13) mod29
=
EPIPHANY SEEKS.
```

No plaintext rune is used to construct the key.

## Target-free receiver control

Freeze the generated key before opening a receiver.

There are exactly 19 adjacent unknown-manuscript receivers with the same original 8+5 word shape. Apply the same 13-rune generated key, same phase, and same subtraction sign to all 19. Then ask only whether both resulting words occur in the pinned solved/authenticated native-GP lexical pool.

Result:

```text
receivers tested: 19
exact two-word lexical hits: 1

p0 word1-word2 -> EPIPHANY SEEKS
```

The other 18 same-shape receivers produce no two-word solved/authenticated lexical pair.

This is a fixed-key, target-free discriminator after the state-only serializer is frozen.

## Former source anchors become consequences

The authenticated signed source register still gives:

```text
source[g+K] = source[7]  = THE
source[A+g] = source[13] = WAY.
```

So the earlier `THE7` and `WAY13` anchors are recovered after the fact from the same square-derived state:

```text
t = g+K = 7
w = A+g = 13.
```

They are no longer required inputs to generate the key.

## Evidence boundary

Exact and reproducible:

- square metadata independently supplies `g,K,e,q,A,a,B`;
- `u=q-e=1`, `t=g+K=7`, and `w=A+g=13`;
- the unchanged three-column rise grammar generates every one of the 13 H-inverse marker atoms;
- H produces the exact additive title key;
- the untouched p0 title decrypts exactly to `EPIPHANY SEEKS`;
- among all 19 same-shape manuscript receivers, this fixed generated key has exactly one pinned two-word lexical hit, p0;
- the former lexical anchors `THE7` and `WAY13` are consequences of the state values.

Chronology caveat:

- the exact left/center/right rise grammar was first recognized after the p0 residual packet was known;
- this result removes the independent lexical-anchor dependency from that grammar, while it does not turn the grammar into a blind historical discovery.

## Decision

Promote the p0 title mechanism one step further. The current local decipherment is:

```text
authenticated 2014 square metadata
-> DH state
-> u=q-e, t=g+K, w=A+g
-> marker-aligned 4|5|4 rise serializer
-> exact 13-rune key
-> EPIPHANY SEEKS.
```

The remaining requirement for an established general cipher is a prospective reuse of this serializer, or an independent original clue that fixes the same three column rise laws before p0 is consulted. Do not search arbitrary state-expression permutations to manufacture such a reuse.

## Reproduction

```text
node sims/lp2_p0_square_state_rise_key_serializer_sft.cjs
```
