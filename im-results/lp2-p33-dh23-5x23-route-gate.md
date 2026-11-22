# P33 M/NG → DH23 → 5×23 consumer gate

**Classification: intermediate negative.** A source-shaped connection between the p33 oversized red markers, the 2013 signed TCP challenge's worked Diffie–Hellman example, and the 115-rune second p33 body produces a consistent state value, but the two simplest direct consumers do not recover plaintext.

## Why this was worth testing

The p33 original image has two oversized red rune markers, M and NG. The canonical GP29 mapping assigns them prime values 71 and 79. The second red title has eight runes, and its black body has 115 runes. The signed 2013 TCP challenge authenticates the BASE29/DH/NEXT protocol and gives a worked DH example with modulus 23 and generator 5.

This suggests a concrete, finite route:

1. Treat the marker prime values as public shares modulo the worked-example modulus.
2. Use the worked-example generator to derive their shared DH value.
3. Check whether the value is independently reflected in p33's visible layout.
4. Use the resulting 23-state orbit against the selected 115-rune body, whose length is exactly 5×23.

This is not a claim that the 2013 example parameters were intended as LP2 keys. The example's p and g are historically authenticated, but their use on p33 is inferred.

## Fixed state derivation

| Quantity | Value | Basis |
|---|---:|---|
| p33 visible marker M | GP index 19 | Original p33 image |
| GP prime value of M | 71 | Canonical GP29 prime table |
| p33 visible marker NG | GP index 21 | Original p33 image |
| GP prime value of NG | 79 | Canonical GP29 prime table |
| DH modulus p | 23 | 2013 signed TCP challenge worked example |
| DH generator g | 5 | 2013 signed TCP challenge worked example |
| M share: 71 mod 23 | 2 | Derived |
| NG share: 79 mod 23 | 10 | Derived |
| log₅(2), log₅(10) mod 23 | 2, 3 | Direct finite calculation |
| DH shared value | **8** (2³ ≡ 10² mod 23) | Derived |
| Second p33 red-title length | **8** | Original transcription / image |
| Second p33 black-body length | **115 = 5×23** | Original transcription / image |

The shared value exactly matches the second red-title length. The body length exactly matches five 23-symbol blocks. These are useful structural correspondences, but neither one by itself specifies a cipher.

The original page's second body is not printed as a regular 5×23 rectangle. Its visible line lengths are \`[11,18,18,22,22,24]\`. The 5×23 reshape below is therefore an inferred receiver arrangement, not a physical grid.

## Consumers tested

The source-fixed 23-symbol orbit is:

\`\`\`
8,17,16,11,9,22,18,21,13,19,3,15,6,7,12,14,1,5,2,10,4,20,0
\`\`\`

It is the 22-element nonzero multiplicative orbit under \`x → 5x mod 23\`, starting at the DH shared value 8, with the omitted zero residue appended. The 23-symbol sequence is repeated five times for the 115-rune body.

### 1. Direct GP29 stream

Use the orbit as an additive/subtractive GP29 key stream. Enumerate both signs. The body contains five literal F runes, at zero-based positions \`[28,54,75,98,103]\`; enumerate all 32 choices of whether each F is literal and non-consuming, following the historical p56 exception model.

- Total candidates: 64
- Best candidate: subtraction, mask 4, with only position 75 treated as literal F
- Best score: **−10.655453**
- Best preview:

\`\`\`
SFITBHHBEXSRRCJMGNSIAULIATNGLIAIWDEEACFFJSRYEOPJUEATULRLHAEIIAATJHHOEWLFUUNGWEAAELROEUTSAEFINCDEONGB
\`\`\`

Every candidate exactly re-encrypts to the original 115-rune body. None approaches the long solved-text calibration.

### 2. DH-orbit 5×23 column route

Fill the 115-rune body row-major into five rows and 23 columns. Read columns top-to-bottom in the fixed orbit order above. Test the opposite traversal by reversing the resulting stream. Both transformations are exactly invertible.

| Readout | GP29 trigram score |
|---|---:|
| Raw body control | −10.775129 |
| Fixed forward DH-orbit column route | **−10.612175** |
| Opposite traversal | −10.723765 |
| Worst long solved-text calibration | **−7.786288** |

The forward output begins \`THEOFUAX...\`, but the apparent four-symbol prefix is not supported by the rest of the text or by the language score. As a descriptive control only, the fixed start 8 ranks 17th among the 22 possible nonzero orbit starts; the best control start is 20. No alternative phase is adopted.

The best transposition score and best stream score are both far below the worst long solved-section score. This is not near-plaintext.

## Decision

Retain the following as an **unverified structural correspondence**:

\`\`\`
p33 M / NG
    → GP primes 71 / 79
    → residues 2 / 10 mod 23
    → DH shared value 8
    → p33 second title length 8
\`\`\`

Reject the tested direct GP29 DH-orbit stream and the 5×23 column-route consumers for p33 body2. Do not broaden this into arbitrary DH phases, recurrences, row resets, or fitted affine routes. The weakest assumptions remain the projection of marker prime values to DH public shares, reuse of the worked-example p/g on LP2, and the inferred 5×23 arrangement.

No unknown plaintext, authentic LP2 key, or general encryption mechanism has been recovered. This belongs in \`im-results/\`, not \`results/\`; \`results/README.md\` remains unchanged.

## Reproduction

\`\`\`
node sims/lp2_p33_dh23_5x23_route_sft.cjs
\`\`\`

Inputs:

- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/liber-primus/lp2-transcription.txt\`
- \`resources/external/relikd-solved-gp29-native-v1.json\`
- Original image: \`resources/liber-primus/50.jpg\` (p33)

The script asserts the p33 section lengths, marker prime values, DH derivation, 23-state orbit, all exact inverse/re-encryption checks, and the fixed solved-text language calibration.
