# Original p55 glyph centers against the historical two-dimensional GIMP Dissolve field

**Agent31, 14 November 2026. Classification:** bounded original-source key candidate rejected for its declared pixel and GP29 clocks. **No recovered LP2 plaintext, creator-selected key, complete cipher or authenticated target.**

## Source-motivated question

Independent original-image research identified the solved LP2 p57 insect stipple with GIMP 2.8's **Dissolve** random field. A contemporaneous GIMP/GLib MT19937 implementation uses root seed **314159265**, builds a **4,096-entry per-row seed table**, then generates random words for pixel columns. Original p55 image scan `72.jpg` has an independently measured [exact rectangle for each of its 76 rune glyphs](../resources/liber-primus/lp2-p55-source-glyph-coordinates.json). A bounded, executable but **un-authenticated** use of those two source objects is to read the pixel field once per printed glyph, taking the integer center of each source rectangle as the coordinate. This requires no guessed coordinates or ciphertext-fitted seed.

The historically important correction from [GLib/GIMP source analysis](lp2-gimp-prng-chain-stream-gate.md) is that GLib 2.38.2 with `G_RANDOM_VERSION` unset uses the **version22** MT seed expansion multiplier `1812433253`, not legacy version20, which needs the explicit `G_RANDOM_VERSION=2.0` override. The latter was not treated as GIMP's default. Earlier original-input checks tested **one-dimensional** GIMP MT/row-seed GP29 keys and step streams, with chance-level results; the present test is a different original-glyph **two-dimensional** projection. It tests raw MT draws under this source-defined field coordinate, **not a measured GIMP pixel intensity or a claim that the LP2 authors keyed their text from that field**.

## Fixed, exact test

Input: **76/76** source rectangles on the original **2400×3600 p55 image** with rune indices exactly matching `resources/liber-primus/lp2-corpus.json`, including p55's incoming p54 word-continuation rune. For each rectangle `[left,top,right,bottom]`, fix `x=floor((left+right)/2)`, `y=floor((top+bottom)/2)`. Read the `x`-th raw MT uint32 from `GRand(rowSeeds[y mod4096])`, using one root MT seeded by **314159265** to generate rowSeeds. These original rectangles sample **eight distinct integer y rows**, because their lines have slight pixel-height differences; these were not adjusted to force matches.

Freeze four conventional 29-way GP residue/scale conversions from each word: `uint32 mod29`, `floor(29*uint32/2^32)`, high byte `mod29`, high byte `floor(29*byte/256)`. For each, compute `P=C−K mod29` and `P=C+K mod29` over the full 76 runes with zero fitted phase, skip, orientation or GP alphabet. A source-native positive plant takes **76 authentic clear p57 GP29 runes**, encrypts with each identical known pixel field, decodes **76/76** and exactly reencrpyts. Separately, compare the 75 nonzero original p54→p55 consecutive GP29 differences to the same raw uint32 mapped to `1..28` by residue and equal-width scaling, in both directions. Their fixed expected chance match count is **75/28 = 2.67857**.

| Fixed p55 GP29 key | Subtract-key decoded IoC | Add-key decoded IoC |
| --- | ---: | ---: |
| `uint32 % 29` | **0.03333333** | **0.03438596** |
| `floor(29*uint32/2^32)` | **0.02982456** | **0.03403509** |
| `highbyte % 29` | **0.03333333** | **0.03368421** |
| `floor(29*highbyte/256)` | **0.02947368** | **0.03649123** |

Original p55 GP29 IoC is **0.03789474**. All fixed outputs remain close to small-sample GP29 uniform (reference ~**0.03448**) and do not spell recognizable English. The original nonzero-step field comparisons give **2 / 1** direct / inverse matches for raw-`%28`, and **4 / 2** for equal-width scaling, against expected **2.6786** per comparison. These are chance-scale, very far from identity of the 75-step stream.

**Execution and exact program:** [Windows 11-style PowerShell Node.js22 GitHub Actions run #43549875355](https://github.com/FlareZ123/liber-primus/actions/runs/43549875355) successfully executed all source array, MT reference-vector, planted GP29 decoding/reencoding, original count and output assertions. [Single-file source test](../sims/lp2_p55_gimp_field_glyphcenter_sft.cjs) reads only frozen repository source and has no runtime library dependency.

## Decision

**Retire only this exact two-dimensional raw GIMP random-field glyph-center readout as a direct additive GP29 key or 28-way nonzero-step cipher for the original p55 page.** A complete historical inverse for p54–55 cannot be constructed from this. GIMP's 2-D field is a plausible reproducible artwork process, yet no signed Cicada source instructs the reader to sample that field for ciphertext, use geometric glyph centers, or convert its random words into GP29 key symbols. Extra geometric registration, subpixel interpolation, glyph corner choice, arbitrary seed shifts or nonlinear postprocessing would introduce unconstrained parameters and should not be tuned after inspecting these negative outputs.

This is a narrower additional original-input check alongside the earlier one-dimensional [GIMP GP29 key exclusion](lp2-gimp-dissolve-gp29-source-key-gate.md) and [GIMP 28-step exclusion](lp2-gimp-prng-chain-stream-gate.md). It does not exclude future *independently source-selected* two-dimensional pixel-stencil or cryptographic operations.
