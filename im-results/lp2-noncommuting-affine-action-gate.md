# Right-composed noncommuting GP29 alphabet action: calibrated original p54–55 inverse

**26 November 2026, Agent9, Director [#2912](https://github.com/FlareZ123/liber-primus/issues/2912).** The fixed vowel/nonvowel translation/dilation family misses the observed repeat deficit on all nine matched literary controls. A broader two-affine-generator family can approach the observed repeat distribution, and its blind key receiver succeeds on both independent plants, but the complete original search produces nonprose and a worse frozen continuation than untouched ciphertext. No unknown plaintext, historical key or creator mechanism recovered.

## Frozen reversible architecture

The native GP29 vowel partition is indices `[1,3,10,12,18,22,24,25,26,27,28]` (U,O,I,EO,E,OE,A,AE,Y,IA,EA); all others use the second class. This is an exploratory phonographic partition, not an authenticated Cicada instruction. Define two invertible affine actions `T_j(x)=a_j*x+b_j mod29`, with nonzero multipliers. The first proposed pair is a nonzero translation for vowels and a nonidentity dilation for nonvowels. Their commutator is nontrivial because a nonidentity dilation and nonzero translation cannot commute in GF29.

For the broadened receiver the alphabet state is an affine bijection `G_i(x)=A_i*x+B_i`. At the first black p54 body rune initialize `G_0=identity`; every rune consumes one step, including F. There are no word/page/line resets. Emit `C_i=G_i(P_i)` and then right-compose `G_(i+1)=G_i∘T_class(P_i)`. Decoder evaluates `P_i=G_i^-1(C_i)` before the same public update; it is single-valued for given key. The full key domain is all 635,796 ordered noncommuting pairs from the 812 affine bijections (commuting iff `a_0*b_1+b_0=a_1*b_0+b_1 mod29`). The frozen partition and initialization apply to both controls and original input. No per-word private state is granted.

Right composition is a consequential choice: `C_i=C_(i+1)` iff `P_i=T_class(P_i)(P_(i+1))`. Thus the exact repeat profile is a sum of two plaintext bigram counts, independent of all earlier states and IV. It also holds within printed groups if the receiver instead resets at group boundaries. For a hypothetical literal-F no-step bypass, the same identity applies on adjacent non-F pairs and every FF pair contributes a repeat; discarding mixed-F edges gives a lower bound only, not a uniquely decodable F-bypass design. Affine maps not fixing zero can create ambiguous F emissions, so no such receiver is asserted.

The new law differs from the stationary additive and affine-plaintext-feedback single-step laws and fixed predecessor rows: a cumulative ordered product of selected affine generators controls each emission; right composition makes the equality invariant simpler than the actual inverse. The continuous four-scalar ciphertext-feedback law is already excluded by [#2162](lp2-floral-continuous-affine-feedback-allsecret-gate.md), and is not rerun.

## Independent repeat-generation gate

Use the exact canonical 12,956-rune / 2,896-group tape and original group carry. Nine deterministic matched-native controls (three each Shakespeare, Gibran, Emerson) preserve every printed group length; seed register and source-calibrated ING/IO encoder follow the existing two-plaintext-lag study. Original: 86 continuous adjacent equalities = 63 within groups + 23 at group seams.

| Control | Translation/dilation min all / min internal | General noncommuting min all / min internal | Closest broad internal / seam |
|---|---:|---:|---:|
| Shakespeare 0 |162 / 70|90 / 36|67 / 23|
| Shakespeare 1 |158 / 83|91 / 29|71 / 24|
| Shakespeare 2 |166 / 75|92 / 26|68 / 29|
| Gibran 0 |204 / 98|88 / 30|61 / 45|
| Gibran 1 |198 / 107|93 / 23|57 / 39|
| Gibran 2 |192 / 99|74 / 32|74 / 24|
| Emerson 0 |179 / 96|93 / 28|65 / 35|
| Emerson 1 |178 / 92|71 / 30|64 / 22|
| Emerson 2 |199 / 104|93 / 30|64 / 36|

Minima in the two columns are separate oracles, not necessarily one key. Narrow family is 756 pairs; even the mixed-F-discard lower bound has identical minima on all nine controls. The broad family passes a deliberately descriptive proximity screen on six controls: within 2 sqrt(63) of 63 internal and 2 sqrt(23) of 23 seam equalities. No pair exactly matches both counts on any of the nine controls; the closest is Emerson1 at 64/22, L1 discrepancy 2. This is an independent literature-based generation check, not a calibrated probability or evidence of a historical partition. The broadened model earns a finite inverse attempt; no further generator partition adjustment.

## Exact blind receiver and original holdout

The receiver computes the entire inverse for each of 635,796 possible noncommuting keys, selects on the first 213 black body runes of p54, and freezes it before decoding the last 10 p54 runes (carry suffix) and all 76 p55 runes. Source alignment: canonical p54 offset9 onward, p55 all 76 runes, total 299; the first p55 rune continues the p54 terminal printed group. No score uses word boundaries. One fixed smoothed GP29 conditional trigram score is trained on Gibran; independent Shakespeare and Emerson plaintext windows are enciphered under hidden chosen generator pairs. The original p54 carry and p55 are never used for ranking.

| Input | Selected generator coefficients (vowel; nonvowel) | Train mean log P | Frozen holdout mean log P | Recovered plant runes |
|---|---|---:|---:|---:|
| Shakespeare, native offset 10000 | (3,5);(7,11) | -2.423784 | -2.469233 |213/213 +86/86|
| Emerson, native offset 20000 | (2,8);(11,3) | -2.389659 | -2.574814 |213/213 +86/86|
| Actual p54–55 | (26,4);(1,16) | -4.872511 | -6.075231 | No plaintext |
| Untouched ciphertext baseline | — | -5.540760 | -5.797916 | — |

Both planted winners recover the exact secret ordered pair and all 299 plaintext runes; their first-vs-second score gaps are 2.523916 and 2.532894 mean log units. Original winner's gap is 0.032011 and its withheld score is worse than unchanged original. The decoded first 30 rune names are `IA P I S F R G EO L H C E P B X T G N E M EO I TH H I C L EA U NG`, and the full output is retained in JSON. Exact forward re-encryption passes on all selected outputs including the original, as required for a valid implementation; it does not authenticate the chosen original key.

## Decision

Retire the explicit vowel/nonvowel translation/dilation right-action family on these matched native controls, and the all-noncommuting affine extension for ordinary consuming, continuous, identity-initialized native-GP p54 black-body plaintext. The broad repeat-generation diagnostic is **not** an exclusion by itself; the original inverse/holdout is the decisive negative for that exact receiver. An unknown initial state, different grouping/reset mechanism, non-affine permutations, non-native plaintext, different partitions and literal-F receivers are not exhausted. None is source-selected by this result. Do not expand the key domain through postselected variants merely to rescue the failed model.

**Reproduction:** [Node22 CommonJS SFT](../sims/lp2_noncommuting_affine_action_sft.cjs), [executed JSON](lp2-noncommuting-affine-action-output.json). The exact study function was executed in the connector's JS runtime with full fetched repository source inputs; the saved Node wrapper uses that same function, but was not separately run. No CI job was needed. The SFT checks canonical transcription against the page corpus and checks original terminal alignment. The authoritative frontier does not change.
