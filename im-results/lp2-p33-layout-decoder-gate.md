# P33 layout-selected decoder gate

**Agent1, 19 November 2026. Director task #1783. Classification: compact negative.**

## Gate

P33 is now a strongly selected receiver page, especially its second black body at length115. The task asked for no more than three reversible consumers whose clocks or parameters come directly from the p33 layout or from already solved Liber Primus operations, excluding the previously exhausted canonical-state additive family and H-power phase sweep.

The three consumers were fixed as:

1. **physical-line readout permutations**;
2. **one outside-in H/Hinv pass inside each printed body line**;
3. **the solved p56 prime-totient stream, reset at each visible p33 section**, with only the historical ciphertext-F keep/literal ambiguity enumerated.

No arbitrary key search, coordinate-specific tuning, or language-guided parameter expansion was permitted.

## Source layout

Canonical p33 transcription gives two sections:

```text
section1: red title10, black body81
body line lengths: 8,16,18,23,16

section2: red title8, black body115
body line lengths: 11,18,18,22,22,24
```

The decoder uses these exact physical line boundaries. Section reset positions are therefore fixed before the body outputs are scored.

Every candidate has an exact inverse or exact forward reconstruction check against the original ciphertext.

## Consumer 1: physical-line readouts

Charged variants per section:

```text
raw control
reverse line order
reverse every line
reverse both
boustrophedon, even lines reversed
boustrophedon, odd lines reversed
```

All are involutive and round-trip the source exactly.

No non-raw variant yields coherent plaintext. The strongest body2 transposition is reverse-both with solved-GP29 trigram score **-10.60865734217679**; its opening is:

```text
BDOEGAAERARHTHFMYARFXNIAUGLJNGSDTHWIASDDWSPEUEAFEAIABIEO...
```

Body1 variants are similarly nonlinguistic.

## Consumer 2: one H/Hinv pass per printed line

For every body line, pair outer runes inward. Charge exactly one pass of:

```text
H(x,y)    = (x-y, x+y) mod29
Hinv(d,s) = ((d+s)/2, (s-d)/2) mod29
```

with the paired outputs written back into the same left/right positions. H and Hinv exactly undo one another.

Best candidate across both sections is body1 H-per-line:

```text
score = -10.528261069958486
IoC   = 0.030246913580246913
```

opening:

```text
BDWIACOENGWUAENGMNJEANGFCWERLCANGYERSOURALBSMTRXHAEOEOBMY...
```

Body2 H/Hinv candidates score still lower. No contiguous plaintext appears.

## Consumer 3: solved p56 totient stream with section reset

Positive control first.

The exact solved p56 mechanism is implemented as:

```text
key_n = prime_n - 1 mod29
P = C - key_n mod29
```

A ciphertext F may instead be a literal F that consumes no prime. P56 has five F positions, so the complete historical ambiguity is only 32 masks.

The finite family contains the **exact published p56 plaintext** with the known literal-F choice:

```text
literal F position = 56
candidate rank by the fixed held-out trigram scorer = 2 of 32
score = -8.527274961397591
```

Thus the implementation has a genuine original-source positive control, independent of its ranking heuristic.

Apply the same mechanism to each p33 body with the prime stream reset at the visible section boundary.

### P33 body81

Only 2 ciphertext F positions, hence 4 exact masks.

Best:

```text
literal F = [38]
score = -10.619080484454244
IoC = 0.03580246913580247
```

opening:

```text
JLAEIHIEOGCTCMBAEXTHRUMWOEDAAEXRUXNSIAJTHCETHYIAFGOEIAID...
```

### P33 body115

Five ciphertext F positions, hence 32 exact masks.

Best:

```text
literal F = [28,75]
score = -10.642540511629065
IoC = 0.03508771929824561
```

opening:

```text
OESOENGTEILNCBEOEAEAGIWEONAELLODFDDFFLXTHIEOOEXBCDNGLNCT...
```

No mask produces contiguous plaintext.

## Language control

The fixed GP29 trigram scorer is trained on published solved plaintext while excluding p56, so p56 remains a held-out cipher positive control. Long solved sections define the acceptance range.

The strongest p33 candidate among all three consumer families is **-10.528261069958486**, and the SFT asserts that this remains below the worst long solved-section score. The gate therefore does not depend on visual inspection alone.


## Follow-up: source-derived prime offsets for the 81-rune first body (Agent48, 20 November 2026; Director Issue #1976)

The p32→p33 route supplies a receiver hypothesis: p33's oversized M has prime value 71, the frozen p50 route advances it by \(q=4\) to depth 81, and the first p33 unit has a 10-rune red title followed by an 81-rune black body. This selects a candidate body, but it does not by itself specify the start of a prime clock. To test the strongest two source-derived readings without searching arbitrary offsets, the p56 prime/totient inverse was frozen as \(P_i=C_i-(p_i-1)\pmod{29}\), retaining the historical transparent-F ambiguity.

1. **Literal prime value:** start the body at prime 71, then use the next 80 primes.
2. **Prime-index plus title length:** interpret 71 as the one-based prime-stream index at the title start, consume the ten visible title positions, and start the body at the 81st prime, 419.

The original p33 body is rune offsets [7970,8051), exactly 81 runes. Its ciphertext F positions are 2 and 38, so all four possible literal-F masks were tested for each fixed start. Every candidate was exactly re-encryptable. None yields coherent GP-native plaintext:

| Fixed start | Literal-F mask | Prime range used | Output opening |
|---|---:|---:|---|
| prime value 71 | none | 71–541 | FHNNGBPSNHDITXENOEEANGIIA |
| prime value 71 | position 2 | 71–523 | FHFAEDNGMJEOAEXUEAJOUIATTH |
| prime value 71 | position 38 | 71–523 | FHNNGBPSNHDITXENOEEANGIIA |
| prime value 71 | positions 2, 38 | 71–521 | FHFAEDNGMJEOAEXUEAJOUIATTH |
| 81st prime (419) | none | 419–947 | FHCMSSSOTHBREOGEOYTECIAU |
| 81st prime (419) | position 2 | 419–941 | FHFNGNGMNGJGMHAXTCLABFM |
| 81st prime (419) | position 38 | 419–941 | FHCMSSSOTHBREOGEOYTECIAU |
| 81st prime (419) | positions 2, 38 | 419–937 | FHFNGNGMNGJGMHAXTCLABFM |

The complete 81-rune outputs and IoCs are emitted by [the reproducer](../sims/lp2_p33_prime_offset71_sft.cjs). The p56 implementation's authentic positive control is already established in this report's original section-reset test. The p33 body itself fails both source-derived offsets, so no p40–p55 holdout was run.

This does not refute the p32/p50 receiver navigation. It separates receiver selection from cipher selection: the M=71→depth81 relation does not authenticate a prime-stream start. Together with the already-negative p32-inner9 additive transfer and direct red-heading self-key Vigenère, there is no remaining source-selected value-changing inverse for this first body. Do not widen to arbitrary prime offsets, affine shifts, key transformations, or fitted resets.

## Decision

These three layout-selected families are retired for p33:

- physical-line reordering / boustrophedon;
- one line-local H/Hinv pass;
- section-reset p56 totient with all historical F-interrupter choices.

They do not recover p33 body plaintext and should not be widened with tuned line-specific choices or arbitrary prime offsets.

The p33 state map remains valuable. In particular, body115 is still multiply selected by the title133 factor packet and the factor43 ROAD route. The next decoder must be supplied by a genuinely different source clue or reversible operation. The source-derived prime-offset extension in the follow-up section also fails; do not broaden this family with arbitrary prime starts.

## Reproduction

```text
node sims/lp2_p33_layout_decoder_gate_sft.cjs
```

Windows Node.js 22 workflow **44454003051** passed.
