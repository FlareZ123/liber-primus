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

## The original glyph exposes every serializer anchor

Agent17's independent original-image/receiver audit was completed after the state-only serializer above was frozen. The standard 13-dot glyph visibly alternates row populations:

```text
1,2,1,2,1,2,1,2,1
```

and has column populations:

```text
4 | 5 | 4
```

with thirteen dots total. These counts expose exactly the numeric anchors used by the serializer:

```text
u = 1      singleton-row population
K = 2      paired-row population
q = 4      either side-column population
g = 5      center-column population
w = 13     total marker population
t = g+K = 7.
```

Thus the rise generator no longer requires the signed source words THE7 or WAY13, and it does not require opening the 2014 squares merely to obtain its numerical inputs. The authenticated square-derived DH state independently validates the same labels and supplies the cryptographic interpretation.

The unresolved step is correspondingly narrower: why the marker should use the exact three vertical rise laws below. Those laws were recognized retrospectively after the p0 residual was visible.
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

## Marker geometry fixes the 8+5 key split

The original title has adjacent word lengths:

```text
8 | 5.
```

The adjacent red marker has physical column populations:

```text
4 | 5 | 4.
```

There is only one way to group those complete columns into the title's two lengths:

```text
first word:  left4 + right4 = 8
second word: center5             = 5.
```

This is also exactly how the fixed outside-in H transform acts on the concatenated marker packet. With

```text
R13 = L4 || C5 || R4,
```

the first four outside pairs are the left column against the reversed right column, producing eight outputs. The remaining five positions are the center column itself. Therefore:

```text
H(R13) = H(L4 || R4) || H(C5).
```

Numerically:

```text
H(L4 || R4) = [26,24,8,19,27,24,18,3]
H(C5)       = [0,8,0,16,19].
```

So the original marker geometry selects the same 8+5 boundary as the title before any plaintext is read. This gives a source-visible reason for treating the flanks and center as separate key carriers.
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

## Right-column RISE continues the title

The original-image SFT fixes the marker as five center dots alternating with four left/right rows. The state-only serializer was already frozen before inspecting the lexical meaning of its vertical increments.

The right physical column has exactly three rises:

```text
[t-u, t, t+u]
=
[6,7,8]
=
[a,g+K,A].
```

Under the complete independently reconstructed source register these are:

```text
6 SEEKS
7 THE
8 DEVOTED.
```

The recovered title itself is the adjacent state pair:

```text
g,a = [5,6] = EPIPHANY SEEKS.
```

Therefore the title followed by the marker's literal right-column RISE gives one continuous authenticated source span with an intentional one-word overlap:

```text
EPIPHANY SEEKS | SEEKS THE DEVOTED
             => EPIPHANY SEEKS THE DEVOTED.
```

This does not derive the entire three-column rise grammar. It does give the right-column law a direct human-facing consequence in the exact source phrase immediately after the title candidate, using the marker's physical vertical direction and the independently reconstructed state register.
## Post-freeze original-marker row holdout

The serializer above was already frozen and committed before inspecting a second consequence of the original staggered dot geometry.

The marker has four physical horizontal flank pairs. Apply H to each same-height `[left,right]` pair. The physical difference channel is:

```text
[18,15,20,26].
```

The sum channel is `[3,12,2,24]`; swapping left/right changes the difference channel to `[11,14,9,3]`.

The independently established central signed-source instruction occupies zero-based indices14..29. Count how many of the four values in each natural H channel land in that fixed interval:

```text
left-right difference   4 / 4
sum                     1 / 4
right-left difference   1 / 4.
```

So the physical left-minus-right direction is uniquely selected by the pre-existing source interval. Apply the already recovered **RISE** instruction literally by increasing the four values:

```text
[18,15,20,26]
  -> RISE
[15,18,20,26]
  -> source register
WORDS  MAP  MEANING  NUMBERS.
```

These are the four structural-noun indices inside the authenticated central instruction. Because the state-only serializer was committed before this same-row readout was examined, this is a genuine post-freeze consequence of the generated marker values rather than a term used to fit them.

It still does not by itself derive the three vertical rise laws. It supplies new held-out evidence that the generated dot values interact with the original two-dimensional marker geometry and the authenticated source register in the expected puzzle vocabulary.
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

The original marker geometry now independently fixes how the generated packet maps onto the title word boundary: the two flanks carry the first eight key atoms under H, and the five-dot center carries the final five. The unchanged 13-atom key has been tested against all 44 natural red13-adjacent windows (24 pre-marker and 20 post-marker); the only exact source-phrase hit is the p0 pre-marker title, while every post-marker window is negative. Direct reuse of this key at other red13 marks is therefore rejected. A different page-specific state update is not excluded, but it would require its own source-selected rule. The remaining open question is whether an independent clue fixes the same three vertical rise laws before p0 is consulted. Do not repeat the fixed-key transfer or search arbitrary state-expression permutations. See [the marker-transfer result](lp2-p0-red13-state-key-marker-transfer.md) and [its SFT](../sims/lp2_p0_red13_state_key_marker_transfer_sft.cjs).

## Issue #1975 — source-first body-instruction gate (21 November 2026; negative)

The original p0 marker and its local title result remain reproducible, but the four-word readout does **not** select a reversible operation on the black body.

The fixed horizontal channel is
```text
left-right H difference = [18,15,20,26]
RISE order               = [15,18,20,26]
signed 2016 word register = WORDS MAP MEANING NUMBERS
```
The register positions are zero-based in the 43-word signed-message list. The phrase is a genuine readout of the four marker values, but it is not an executable cipher specification. The signed message says that words are the map and their meaning and numbers provide road/direction; it does not define a function from an LP2 body word to a number or specify how that number controls a reversible transform.

A bounded literal test treated the four source-register indices as word addresses into p0's black body. The unchanged original transcription has 262 p0 runes, a red 8+5 title, and a 249-rune body in 57 printed words. The direct index interpretation is not source-selected: zero-based body positions `[15,18,20,26]` return `NGAETH THAMINGIIAY THAEIA YNGEA`; one-based positions return `GOP YFNGCJ HEO THP`. These are still original ciphertext words, not a plaintext readout. The different outputs expose the missing origin convention rather than resolving it.

The four signed words themselves also admit several natural numberizations—GP0 sums `[52,56,87,83]`, GP-prime sums `[179,211,319,295]`, or rune lengths `[5,3,5,7]`—and no first-party instruction selects one. Nor does the four-word phrase supply a body receiver, key, direction/sign, phase, reset, or rune/word clock. The original-image adjudication classifies the recurring red13 glyph as layout punctuation, not a generic cipher initial state; the marker occurs in internal, terminal, and page-start positions. The existing marker-local control finds no post-marker lexical reuse, and the separate fixed-period-13 title-key continuation is contradicted by original p0 ciphertext under the exhaustive transparent-F affine/autokey audit.

**Decision:** close Issue #1975 at the missing-operation gate. No 150-rune native-GP plaintext, reversible body decoder, or blind body holdout exists because the source has not selected the required map/operation. Preserve `EPIPHANY SEEKS` as a strong local title candidate and the four-word readout as structural evidence; do not launch arithmetic or cipher-family tuning to fill the missing selector.

Supporting source gates: [original p0 image adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md), [title-key continuation audit](lp2-p0-epiphany-seeks-signed2016-crib-fclock.md), and [marker/title selector](lp2-p0-square-marker-plaintext-selector.md). The existing SFT now also reproduces the bounded body-index control.

## Reproduction

```text
node sims/lp2_p0_square_state_rise_key_serializer_sft.cjs
```
