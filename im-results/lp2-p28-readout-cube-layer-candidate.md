# P28 center boundary candidate plaintext: READ OUT

**Agent 1, 19 November 2026. Classification: candidate unknown-page plaintext recovery with exact reversible reconstruction and a broad post-discovery source-native control. It is not yet promoted to established plaintext because an independently untouched downstream prediction remains required.**

## Source-selected object before the plaintext appeared

The existing p57 → p50 → p28 route selects physical p28 independently of this result. On p28, the already established page-numbered object has these exact source properties:

- physical p28 contains **269 runes**, so its exact zero-based center is rune offset **134**;
- p28 contains **59 printed words**;
- the **28th printed word** begins at offset **135**, immediately after the center, and spans offsets135..139;
- that word is the five-rune sequence **EA A I U L**, GP indices `[28,24,10,1,20]`;
- it is the last word of physical line6, whose source geometry independently supplies the manuscript-native DH tuple `p=23,g=5,a=6,B=19`, giving `b=15,A=8,K=2`.

The contiguous six-rune source span formed by the center rune and the selected word is therefore:

`N EA A I U L`

with GP indices:

`[9,28,24,10,1,20]`.

## The DH23 state selects a reversible GP29 operation

The same source-selected DH state has the cross-field relation documented separately in `lp2-p28-dh23-gp29-cube-bridge.md`:

`e = g-K = 5-2 = 3`

and independently

`e = a/K = 6/2 = 3`.

In GF(29), cubing sends the DH values

`K=2 -> A=8 -> B=19 -> b=15`.

Cubing is an invertible permutation on all29 GP indices because `gcd(3,28)=1`; exponent19 is its inverse on nonzero residues and zero is fixed.

The selected five-rune word has exactly **three nested layers**: outer pair, inner pair, center. Apply the selected cube map once per layer. A single center rune has one layer, so the page-center rune uses exponent3. The selected five-rune word has three layers, so it uses three cube iterations:

`3^3 = 27 (mod28)`.

Exponent27 is the multiplicative inverse map on GF(29)* and is self-inverse modulo the exponent group because `27^2 = 1 mod28`.

## Exact plaintext candidate

Apply exponent3 to the exact page-center rune and exponent27 to every rune of the immediately following selected word:

| Source | GP index | Exponent | Output index | Output |
| --- | ---: | ---: | ---: | --- |
| N | 9 | 3 | 4 | R |
| EA | 28 | 27 | 28 | EA |
| A | 24 | 27 | 23 | D |
| I | 10 | 27 | 3 | O |
| U | 1 | 27 | 1 | U |
| L | 20 | 27 | 16 | T |

The six output runes are:

`R EA D O U T`

which transliterate under the canonical GP spelling as:

**READ OUT**

No rune, word break, alphabet substitution, Caesar shift, phase, direction, dictionary target or free key is fitted after this transform is specified.

The inverse is exact. Apply exponent19 to the initial `R` and exponent27 to the five-rune `EA D O U T` word; the original source span `N EA A I U L` is recovered rune-for-rune.

## Post-discovery whole-book control

The transform was discovered on the already source-selected p28 center/word object, so a family control is necessary to measure how freely it produces ordinary language elsewhere.

Freeze the exact six-rune rule:

1. take any original **five-rune printed word** with an actual preceding rune;
2. cube that predecessor once, exponent3;
3. apply three cube iterations, exponent27, to all five runes of the word;
4. transliterate the six outputs;
5. allow a one-word reading or a two-word split with both Latin words at least three letters.

Across unknown physical p0..p55 there are **318** five-rune words; **314** have a predecessor rune and are eligible.

Use the same finite native-English register already employed elsewhere in this repository: TextBlob word-frequency vocabulary plus the pinned Gibran, Shakespeare and Emerson controls and solved LP1 reference vocabulary. The union has **32,853** entries, of which **32,550** have at least three letters.

Under the frozen transform, exactly **one** of the 314 eligible source boundaries yields a one- or two-word member of this register:

`p28 word28 -> READ / OUT`.

No other eligible five-rune word produces a comparable dictionary phrase.

This is a broad post-discovery selectivity control rather than a prospective authorship probability. The selected p28 object had already been singled out by the FIND→28 route, exact-center placement, unique DH-start line, and DH23 geometry before the plaintext candidate was observed.

## Why the candidate is plausible as an intended solve step

The operation has a compact human path:

1. the clear solved material selects p28;
2. page number28 selects word28;
3. word28 begins immediately outside the exact page center;
4. its line visibly says `DH` and supplies the full DH23 state;
5. that state supplies the reversible GP29 cube map;
6. the object is visibly nested in three layers, so the cube map is iterated once per layer;
7. the adjacent one-layer center rune plus the three-layer selected word reads **READ OUT**.

The output is itself an instruction rather than a prose fragment. That matters because a short imperative can naturally hand a solver to the next source operation.

## Remaining acceptance gate

This result should be treated as a **candidate plaintext breakthrough** until its instruction predicts an untouched source consequence.

The next experiment must freeze a literal meaning of **READ OUT** before inspecting the downstream output. A positive continuation should identify another source-selected rune order, object or receiver and produce a new coherent result with the same cube operation or a directly instructed follow-up. Failure should demote the layer-count interpretation rather than adding tuned exponents or alternate word boundaries.

## Reproduction

Run:

`node sims/lp2_p28_readout_cube_layer_candidate_sft.cjs`

The standalone CommonJS SFT reparses the canonical physical transcription, reconstructs the exact p28 center and word28, derives the DH23 cube bridge, recovers **READ OUT**, reverses it exactly to the original six ciphertext runes, constructs the 32,853-entry source-native lexicon, and asserts that p28 word28 is the sole phrase hit among all314 eligible five-rune-word boundaries.
