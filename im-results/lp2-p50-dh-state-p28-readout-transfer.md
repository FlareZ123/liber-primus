# P50-derived DH state independently supplies the p28 READ OUT transform parameters

**Agent13, 28 November 2026. Classification: post-discovery cross-object state transfer that removes a local p28 dependency. It strengthens the p28 READ OUT candidate but does not establish unknown-page plaintext or a reusable cipher.**

## Decision

The newly source-constrained p50 route reconstructs the complete historical DH state

`(p,g,a,b,A,B,K,e)=(23,5,6,15,8,19,2,3)`

without reading p28's literal `DH` line. In particular it independently supplies **`e=3`** and **`K=2`**.

The leading p28 local transform uses the exact exponent pair **`(3,27)`** on its uniquely selected center-plus-word28 object. That pair can now be obtained outside p28:

- first exponent: `e=3`;
- second visible-layer exponent: `e^3 mod28 = 27`;
- independent numeric identity: `27 = -K mod29`.

Applying those p50-derived parameters to the already-established p28 source object gives the exact reversible output **READ OUT**. Thus p28 no longer needs to reconstruct its own DH tuple in order to obtain the cube direction parameter.

This is post-discovery corroboration: READ OUT and the p28 transform were known before this p50 closure. It is not a prospective plaintext discovery and must not be assigned a discovery-wide p-value.

## Upstream p50 state, independent of p28 runes

The p50 path uses a different manuscript channel from the p28 literal-DH reconstruction:

1. lowercase `f` is the sole unused character in the 60-character numeral alphabet, selecting the drop-`f` base59 rival;
2. the existing value-as-next-address map has one fixed sink, cell189, attracting all256 cells;
3. the sink's printed coordinates in the 32×8 panel are `(23,5)`, giving `p=23,g=5`, with width `A=8`;
4. the source-selected horizontal reflection maps column5 to2, giving `K=2` and cell186;
5. cell186 is untouched token `0J=19`, giving `B=19`;
6. exact DH algebra gives `a=6,b=15`, and `15^-1 mod22=3=e`.

No p28 rune, line number, fragment boundary, H output, center rune, word28 value, or READ OUT output enters this derivation.

## Transfer to the fixed p28 source object

The established p28 geometry is independently source-visible:

- p28 has269 runes, exact center offset134;
- one-based word28 begins immediately afterward at offset135;
- word28 has five runes;
- source object is `[9,28,24,10,1,20]`.

The visible-layer action-count convention gives one action for the center and three nested actions for the five-rune word. With the externally supplied `e=3`:

`(3^1,3^3) mod28 = (3,27)`.

Apply those exponents modulo29:

`[9^3,28^27,24^27,10^27,1^27,20^27] mod29`

`= [4,28,23,3,1,16]`

`= READOUT`.

The map is exactly reversible with exponents `(19,27)`.

The explicit zero-index layer rival remains charged. It uses `(1,9)`, gives `[9,28,25,18,1,23]`, and does not produce READ OUT. P50 supplies the direction parameter but does not by itself prove that p28 intends action counts rather than zero-indexed layer depths. The separate p28 receiver-family and p39 selector work remains responsible for that convention discrimination.

### Matched center→next-word source gate

A small manuscript-wide transfer gives a bounded check on that remaining convention. Freeze `e=3` from p50 and enumerate every unknown p0–p55 page (excluding rune-free p50) whose rune count is odd and whose exact center is immediately followed by a complete printed word. There are exactly four source objects, the same physical family identified by the existing p28 image/geometry audit:

- p3 center → word21, length4;
- p17 center → word37, length4;
- p25 center → word28, length4;
- p28 center → word28, length5.

For each object charge only the two already stated layer conventions. Action counts use center exponent `e` and word exponent `e^ceil(L/2) mod28`; zero indexing uses center exponent1 and word exponent `e^(ceil(L/2)-1) mod28`. The complete eight outputs are:

| page | convention | exponents | transliteration | pre-existing lexicon parse |
|---:|---|---|---|---|
| 3 | action | (3,9) | BTHEAN | none |
| 3 | zero | (1,3) | EOYXWC | none |
| 17 | action | (3,9) | EAEOMNGO | none |
| 17 | zero | (1,3) | EABHIAE | none |
| 25 | action | (3,9) | RYAEON | none |
| 25 | zero | (1,3) | NJLEC | none |
| 28 | action | (3,27) | **READOUT** | **READ / OUT** |
| 28 | zero | (1,9) | NEAAEEUD | none |

The lexical check is exactly the pre-existing control register used by the p28 familywise audit: TextBlob word-frequency material plus Gibran, Shakespeare, Emerson, and the solved LP1 reference, minimum word length3. **READ / OUT is the sole one- or two-word parse among all eight fixed outputs.**

This is a matched source-wide cross-check, not a blind plaintext probability: the p28 rule and READ OUT were known before this external p50 state was found, and the family has only four physical objects. Its value is causal rather than statistical. Once p50 supplies `e=3`, the action-count convention is the only one of the two charged depth conventions that produces a finite-register phrase anywhere in the complete matched center→next-word family. The independent p39 numeric selector remains the stronger non-language discriminator.

## Independence boundary

The two DH reconstructions are meaningfully source-distinct but not statistically independent experiments:

- p28's route uses the unique literal `DH` line, printed fragments, outer-H, line/fragment counts, and standard DH equations;
- p50's route uses the numeral alphabet omission, directed self-map, panel coordinates, mirror artwork, and standard DH equations.

Both are interpreted against the same historical 2013 worked DH example, and the p50→READ OUT composition was noticed after the target output was known. Do not multiply their conditional rates or present the conjunction as a blind probability.

The useful causal change is narrower: **the exact p28 exponent direction can now arrive from outside p28**, and the same full DH state is reconstructed from two physically different manuscript objects.

## Reproduction

Run:

`node sims/lp2_p50_dh_state_p28_readout_transfer_sft.cjs`

The SFT reconstructs the p50 state without reading p28, parses the original p28 source object independently, applies the p50-derived exponent under both layer conventions, verifies READ OUT only under action counts, and performs the exact inverse replay.

Related evidence:

- `im-results/lp2-p50-base59-pointer-sink-reflection.md` — p50 source-mirror DH closure.
- `im-results/lp2-p28-dh-line6-source-reconstruction.md` — independent p28 literal-DH state reconstruction.
- `im-results/lp2-p28-dh-inverse-readout-direction.md` — original p28-local DH inversion route.
- `im-results/lp2-p28-readout-familywise-audit.md` — transform family and remaining layer-convention caveat.
