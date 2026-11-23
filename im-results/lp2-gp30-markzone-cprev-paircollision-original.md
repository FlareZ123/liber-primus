# LP2 29 original mark-interval GP30 predecessor cipher: exact whole-book equality obstruction

**Decision, 23 November 2026; Agent4 issue #2278.** This original-cipher theorem closes a genuinely word-space-changing, source-mark-private **first-order substitution** architecture under independently sampled native-GP prose. The exact original source obeys the theorem; all 640 native plaintext controls are incompatible with every possible secret alphabet of this family. It does **not** decode the original, identify an authored key, or exclude non-native text and nonlinear evolving state.

## Independent source, scope and reason to test

The 55 rune-bearing unknown LP2 pages p0–55 contain precisely **12,956 original GP29 runes and 2,896 complete printed-word separators**. When space is represented as an independently movable thirtieth cipher symbol, the source has **15,852 contiguous GP30 tokens** including all 32 originally cross-page complete words. The original artifact independently supplies **31 large 10-/13-dot marks**, at **29 distinct source GP30 cuts** (28 internal, plus the book endpoint); the p14 terminal/p15 initial marks share one position.

Earlier GP30 capacity work allowed **29 independently keyed tables**, one per visible mark interval, with a maximum **4,708** occurrences of output SPACE plus any one rune. This bound is above the lowest native control (~4,364) and therefore did not exclude the family. A single shared table with only source-mark cyclic rotations has since been independently excluded even when moving spaces (best maximum4,287). The present test attacks the stronger original **29 completely unrelated mark-zone secret tables**, demanding no printed-space preservation and no key-generation assumption.

Let the source-mark intervals be numbered z=0..28, and the original GP30 ciphertext at position i be C_i. Within each interval, grant the decoder **30 arbitrary unrelated 30! substitution alphabets**, one for every possible previous ciphertext token, including previous SPACE. The first token per interval is granted a free initial-state output; the remaining positions obey

\`\`\`text
P_i = F[z][C_(i−1)][C_i] ;  each F[z][state] is an arbitrary 30-symbol permutation.
\`\`\`

Every row of every zone table is independently secret; **29×30 = 870 wholly private full 30! symbol permutations** are allowed. Source original marks provide the interval boundaries, regardless of hidden output-word boundaries. Decoding can move, create or erase printed word spaces without a sidecar. The cipher is genuinely complete, fixed-width and exactly reversible: given zone z, previous recovered ciphertext token and current plaintext token, invert the appropriate permutation to recover C_i.

## Exact all-secret invariant

For every two positions i and j in one fixed original mark zone with the same observed source ciphertext predecessor \`C_(i−1) = C_(j−1)\`, bijectivity forces

\`\`\`text
[P_i = P_j]  if and only if  [C_i = C_j].
\`\`\`

The observable source-predecessor group membership is **known before any key is guessed**. For each group (z, previous C), count its identical successor pairs; their sum Q must equal the identical plaintext symbol pairs in those same groups under **every one of the 870 secret alphabets**. For a group with N members, the total eligible pairs is \`N*(N−1)/2\`.

On the complete original 15,852-token GP30 transcript, omitting only first positions per independent mark zone:

| Source-original quantity | Exact count |
|---|---:|
| Source-visible mark intervals | **29** |
| Available per-zone predecessor states | **870** |
| Eligible within-state successor pairs | **759,325** |
| Equal-follower pairs Q over every original key | **37,484** |
| Conditional equality rate Q / eligible | **0.04936489645408751** |

This count is an exact all-key equality obstruction, **stronger than the previous two-symbol monogram upper bound**, and unaffected by moving every printed space.

## Original-length native GP29 language tests

The read-only SFT compares the necessary *same original positions* against independently prepared native GP30 plaintext donors at precisely the entire original tape length. A positive under this test would have the **same fixed 15,852-token output length** and could place spaces anywhere. Each native text is spelled using the repository GP29 orthography (including NG and IA conversions), with separated words represented by GP30 SPACE. The converter exactly reproduces the genuine solved LP2 p57 original rune sequence, which independently authenticates the rune register.

For each separate Gibran, Shakespeare, Emerson donor, **128 fixed seeded original-length contiguous windows** were scored. The controls can place natural word spaces anywhere and need not match the printed ciphertext word breaks. Additional **256 exact original-wordlength-matched creator-authentic GP29 bootstrap controls**, sourced independently from already-solved Cicada LP1 GP rune texts and with rare unavailable word lengths filled uniformly, test the author-authentic alternative while preserving each source word's length.

| Native plaintext source | Controls | Lowest possible plaintext Q over the 640 sampled controls | Median Q | Controls at or below original Q=37,484 |
|---|---:|---:|---:|---:|
| Gibran continuous GP30 | 128 | **54,569** | 61,009 | 0 |
| Shakespeare continuous GP30 | 128 | **56,597** | 60,588 | 0 |
| Emerson continuous GP30 | 128 | **56,025** | 59,538 | 0 |
| Cicada solved-GP training/length matched | 128 | **56,684** | 58,566 | 0 |
| Cicada solved-GP holdout/length matched | 128 | **60,602** | 62,054 | 0 |

**Every one of 640/640 complete-original-length native-GP plaintext controls exceeds the exact invariant Q**, with closest continuous witness exceeding original by **17,085** equal pairs. This is a finite, reproducible, style-conditioned rejection of ordinary GP-native prose under any possible secret keys in the fixed source-mark-zone predecessor-table model. Original LP2 could in principle be a constrained or intentionally atypical low-repeat message, so this is no unconditional impossibility of English text.

## Independent complete-cipher positives

The SFT constructs 870 distinct private full 30-symbol permutations and exact inverses. One test encrypts an independently GP-encoded Gibran donor of 15,852 symbols using these genuine zone/private-predecessor row keys, decrypts every symbol and verifies the conditional collision identity holds for its generated ciphertext under its own observed predecessor groupings. The cipher moves **3,582 SPACE/rune statuses** relative to this native plaintext. This proves the necessary equality bound does not falsely exclude actual encryption from the tested model when the source is native text.

A separate stronger *source-shaped* positive starts from the **actual original C** and all source-authentic printed mark locations, decodes it under the fully private tables, and then exactly reconstructs **the complete original C symbol by symbol** from the result while preserving the original placement of all large marks. It checks the exact original pair count and independently proves that the arbitrary-key decoder can move printed spaces in situ. The resulting artificial P is **not** asserted to be LP2 plaintext or original author key.

## Operational decision

The source-visible major marks may still carry instructions, distinguish cipher modes, delimit key derivation or supply missing side information. They cannot rescue a **stationary previous-*ciphertext*-indexed 30-symbol substitution map repeated within each source mark interval** into *any of the tested native-GP plaintext passages*, even granting all 870 private alphabets, arbitrary output resegmentation and fresh first-token states.

This is the strongest currently tested finite-control restriction for the original \`29 mark-zone independent keys\` alternative that previously escaped the source-frequency bound. **Stop treating unrelated full private 30! tables at each mark as an executable route to prose** without a source-authenticated genuinely *changing* state/mapping rule or external key. Evolving keys between individual rune positions, feedback from previously reconstructed plaintext, higher memory, variable-length codes, transpositions, a different plaintext register and unusually constrained prose remain distinct.

[Read-only Windows Node22 CommonJS SFT](../sims/lp2_gp30_markzone_cprev_paircollision_allkey_sft.cjs) · [full Windows original-source PASS, run 45118496812](https://github.com/FlareZ123/liber-primus/actions/runs/45118496812) · [source-shaped positive rerun 45118619783](https://github.com/FlareZ123/liber-primus/actions/runs/45118619783) · [Director research task #2278](https://github.com/FlareZ123/liber-primus/issues/2278).
