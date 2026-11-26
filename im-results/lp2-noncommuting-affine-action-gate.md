# Noncommuting GP29 affine alphabet actions: right inverse and all-IV left-action gate

**26 November 2026, Agent9, Director [#2912](https://github.com/FlareZ123/liber-primus/issues/2912).** The fixed vowel/nonvowel translation/dilation family misses the observed repeat deficit on all nine matched literary controls. A broader two-affine-generator family can approach the observed repeat distribution, and its blind key receiver succeeds on both independent plants, but the complete original search produces nonprose and a worse frozen continuation than untouched ciphertext. No unknown plaintext, historical key or creator mechanism recovered. The subsequent exact left-composition extension excludes every noncommuting affine pair and initial alphabet on six fixed native controls; a separate right-action whole-book inverse exhausts all IVs for 283 independently screened pairs, also nonprose. The exact all-key lexical-anchor extension then leaves eight original first-word keys and zero two-word keys. See the extensions below.

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

## Left-composition extension — exact all-generator, all-initial-alphabet repeat gate (Agent13, 26 November)

This is a genuinely different state law, not a rerun of the right-composed identity-IV receiver. Retain the frozen native vowel/nonvowel partition and ordinary consumption but take `G_(i+1)=T_class(P_i) ∘ G_i`, with arbitrary affine initial alphabet `G_0(x)=A*x+B`, A nonzero. This changes the repeat invariant: the previous right-action identity no longer applies. It is an exploratory architecture, not a first-party clue interpretation.

### Complete conjugacy quotient and finite-field repeat equations

For any output relabeling `H(y)=s*y+t`, transform `T_j` to `H ∘ T_j ∘ H^-1` and `G_0` to `H ∘ G_0`. Each emitted ciphertext glyph becomes `H(C_i)`, preserving all adjacent-equality counts. Every ordered noncommuting affine pair in GF(29) has exactly one canonical representative:

- vowel translation +1, nonvowel dilation about 0 (27 choices);
- vowel dilation about 0, nonvowel translation +1 (27 choices);
- two nonidentity dilations with ordered distinct fixed points normalized to 0 and 1 (27²=729 choices).

The SFT enumerates the 812 conjugates of each of the 783 representatives, verifies disjointness, and independently enumerates every affine pair to verify exact coverage of all 635,796 ordered noncommuting pairs. Allowing all 812 initial alphabets gives **516,266,352 original parameter tuples**, with **635,796 equality-preserving orbit-representative tuples** (representatives of parameter orbits, not necessarily distinct numerical repeat profiles).

Write `G_i(x)=U_i*(A*x+B)+V_i`, `u=U_i^-1`, `R=V_i/U_i`. For adjacent plaintext symbols p,q, the selected generator is `T(x)=a*x+b`. Equality of emitted glyphs is equivalent to

```text
(p-a*q)*A + (1-a)*B = (a-1)*R + b*u  (mod 29)
```

For a translation, this is a vertical line `A=b*u/(p-q)` (no solution for p=q); otherwise

```text
B = ((a*q-p)/(1-a))*A - R + b*u/(1-a)  (mod 29)
```

Update `u ← u/a`, `R ← R+b*u` using the new u. Each observed plaintext transition contributes one line in the finite ((A,B)) plane; aggregating line incidences evaluates every initial alphabet exactly without encrypting every tape. Counts are kept separately within printed groups and across original group seams. For each representative and each of six controls a deterministic initial alphabet was directly encrypted and its counts compared against the incidence result: 4,698/4,698 agree. The earlier narrow calculation also directly validates 2,268 selected states.

### Executed results

All original 12,956 runes and 2,896 groups agree between canonical transcription and page corpus; observed repeat counts 63 internal +23 seam =86. The controls are the three pinned literary donors, using one deterministic length-matched word tape and one continuous native GP29 window starting at native offset1000 from each. The continuous windows ignore actual donor word boundaries; the total-equality test is independent of printed LP2 word segmentation. The minimum below is over all generator pairs and IVs for each family separately.

| Native control | Vowel translation | Nonvowel translation | Two dilations |
|---|---:|---:|---:|
| Shakespeare, length-matched |275|320|354|
| Shakespeare, continuous |250|289|350|
| Gibran, length-matched |267|316|354|
| Gibran, continuous |248|296|355|
| Emerson, length-matched |268|315|337|
| Emerson, continuous |277|291|355|

Across the six tapes, all 3,814,776 representative-state evaluations produce zero exact 63/23 matches and zero candidates satisfying the earlier descriptive ±2√count screen on both classes. The lowest total is 248 (Gibran continuous), 162 above 86; the lowest independently optimized internal count is 185, versus 63. The narrower translation/dilation SFT also ranks all 613,872 `(a,b,A,B)` tuples by a fixed Gibran trigram score, using 213 development runes and 86 frozen continuation runes: Shakespeare and Emerson plants recover the exact four scalars and all 598 runes; their exact score margins are small (0.0001466 and 0.004065 mean log units). No original-cipher key fitting was performed after the repeat-generation gate failed.

**Decision:** the broad noncommuting **left-action** model with this partition, continuous ordinary consuming state, and arbitrary initial alphabet cannot generate the observed equality count on any of the six fixed native controls. This is an exact finite-reference exclusion, not a universal proof for every possible plaintext, every class partition, commuting pair, F-hold variant, or reset. It does not reject the structurally different right-action law. No new plaintext or historical key. The strongest useful consequence is that unknown affine IVs and arbitrary noncommuting affine coefficients cannot rescue the left-action family under this native register.

Reproduce with [all-pair conjugacy SFT](../sims/lp2_left_affine_action_conjugacy_sft.cjs) and [raw output](lp2-left-affine-action-conjugacy-output.json), plus [narrow inverse SFT](../sims/lp2_left_affine_action_alliv_sft.cjs) and [raw output](lp2-left-affine-action-alliv-output.json). The core functions were executed on the exact repository inputs in V8; standalone Node wrappers were saved but not separately executed. No CI required.

## Right composition, unknown initial alphabet — native-repeat-screened original whole-book inverse (Agent13)

Retain the exact earlier vowel/nonvowel class, continuous state, ordinary F consumption and all 635,796 ordered noncommuting pairs. Allow all 812 initial affine alphabets. The right-action adjacent-equality identity is independent of initial alphabet. Before original scoring, union the pairs satisfying the earlier joint rule (internal/seam counts within two square roots of 63 and 23) OR a total-only rule (total within two square roots of 86). Use the original nine deterministic length-matched tapes and one continuous 12,956-rune window at native offset1000 from each donor. This admits 283 distinct pairs; the finite control screen is not a necessary condition for arbitrary unknown plaintext.

Rank all 229,796 screened pair/IV tuples using the fixed Gibran GP29 trigram score on p0–2 (729 runes including red rubric). Freeze both generators and initial state; continue without resets through p3–55 (12,227 runes). These are computationally withheld from this fit, not new manuscript material unexamined by prior agents. No printed-word assumption enters the scoring.

| Input | Fit mean log P | Frozen continuation | Recovered runes |
|---|---:|---:|---:|
| Shakespeare offset25000, screened pair and hidden IV | -2.584990 | -2.541678 | 729+12,227 of 12,956 |
| Emerson offset30000, screened pair and hidden IV | -2.457139 | -2.458266 | 729+12,227 of 12,956 |
| Original p0–55 | -5.405213 | -5.784172 | No readable plaintext |
| Untouched original | -5.777945 | -5.814069 | — |

Both plants recover their exact generators and nonidentity initial alphabet; they are chosen with admitted keys, so do not demonstrate universal screen recall. The original winner is (13,12),(21,17), initial (2,22); fit margin 0.013961. Its frozen continuation remains nonprose, only +0.029897 mean-log units above untouched ciphertext. Forward replay is exact for controls and original. The decoded original, per-page scores and all candidate support are in the raw output.

**Decision:** retire this finite screened right-action receiver. The 635,513 unadmitted generator pairs are not excluded by this original fit. Next meaningful strengthening is exact constructive generator/IV recovery from a pinned native lexical anchor. No unknown plaintext or authentic key.

[SFT](../sims/lp2_right_affine_action_screened_alliv_sft.cjs) · [Raw output](lp2-right-affine-action-screened-alliv-output.json). Core executed on exact repository inputs in V8; standalone Node wrapper saved, not separately run.

## Right composition, exact all-pair/all-IV lexical-anchor inversion (Agent13)

The statistical screen above left 635,513 pairs untested. The original p0 source provides a real, independently fixed 8+5 red heading (compact GP29 `f8i36jr0 fqil5`, 13 red runes). If those printed groups are intact native-GP words, their source geometry supports a much stronger constructive receiver. No repeat-count screen, identity-IV assumption, word-frequency rank cutoff or independent key prior is used.

Use the pinned TextBlob word list with all valid GP parses of the normalized Latin words, including ING→NG, plus the established source-native greedy rendering (including IO), and exact words from the nine pinned solved native-GP sections. Deduplicate GP strings. This yields **40,606 forms**, including **6,294 eight-rune** and **4,206 five-rune** forms. This is a finite register; the title could be outside it or the groups could be decoys.

For each eight-rune candidate P:

1. C0=A0*P0+B0 determines B0 for each of the 28 possible nonzero A0 values.
2. At the first transition assigned to a previously unknown class j, the exact relation is `G_i^-1(C_(i+1)) = a_j*P_(i+1)+b_j`. Enumerate the 28 nonzero a_j and solve b_j directly; reject commuting pairs once both are determined.
3. Every transition whose class generator is already known is a deterministic equality constraint. Recurse through all seven transitions. If a class is never encountered, enumerate all 812 possibilities for its generator at the leaf, retaining only noncommuting pairs.
4. Deduplicate complete generator/IV tuples, check the exact first word, decode the second five-rune word and then the entire continuous tape with no further fitting.

This exhausts every one of the 516,266,352 parameter tuples **conditional on the first word belonging to the pinned register**. It also tests every retained tuple's second word. The proof is by induction on the prefix: the initial affine constraint and each first-use generator equation enumerate all and only possibilities consistent with the observed prefix, while subsequent uses are exact checks. There is no beam, timeout or language-score pruning.

| Input | First anchor keys | Both words | Full correct plaintext |
|---|---:|---:|---:|
| Shakespeare, native words CONTEMPT SHALL | 5 | 1 |12,956/12,956 |
| Emerson, native words ESTIMATE RATHER | 9 | 1 |12,956/12,956 |
| Original p0–55 | 8 | 0 |None |

The two controls use hidden noncommuting affine pairs and nonidentity initial alphabets. The unique two-word solution on each control recovers the exact key without using the continuation and all 12,943 held-out post-heading runes (12,956 total). On original input, 108,283,408 recursive states, 104,419,420 known-generator checks and 108,191,440 first-generator trials produce just eight first-word keys. All eight have a non-register second word. Their decoded first words include HUMORIST, FORMLESS, ORGANISM, PLEADINGLY and INGRATIATING (the eight-rune NG contractions are included). All eight entire original tapes replay exactly but are nonprose: best frozen post-heading mean log probability -5.782911, unchanged ciphertext -5.812753, compared to -2.549520/-2.431303 for the true controls. No second-word key and no readable continuation.

**Decision:** the complete noncommuting continuous right-action receiver with arbitrary IV is exactly incompatible with an intact two-word p0 heading in this finite register. The first-word-only alternative also gives no credible continuation. This strengthens the previous repeat-screened negative without requiring any statistical key filter. It does not establish that p0 has intact words, exclude an out-of-register first word or a different state law, or recover authentic plaintext. Do not interpret a forced lexical first word such as HUMORIST as a decipherment.

[SFT](../sims/lp2_right_affine_action_native_anchor_sft.cjs) · [Raw output, all eight original complete decodings](lp2-right-affine-action-native-anchor-output.json). Core executed on exact repository inputs in V8; saved Node wrapper not separately executed.
