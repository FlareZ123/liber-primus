# P27 terminal-repeat three-tape gate for p55

**Decision (14 November 2026).** A source-anchored possible key location produces three complete 76-rune tapes, but the historical three-share XOR primitive, a direct reversible GF(29) analog, and a fixed-coordinate Shamir fourth-share interpretation all fail their distinct original-input tests. The arithmetic length relationship is exact. There is **no recovered unknown plaintext, authenticated LP2 key, independently specified three-tape instruction or destination**.

## 28 November supersession note: destination selected, decoder still absent

A later p7→p8→p16–p21 q-eigenvector route independently selects p27 fragment6/start31 and thereby the `BEI` half of the p27/p55 footer; its sole other occurrence fixes terminal p55, and adjacent held-out context extends to the full bookend. The same p27 coordinate independently reproduces cell254.

This removes the old **destination/marker-selection** objection. It does **not** supply a three-tape/share opcode, plaintext-equality rule, common pad, or synchronization clock. All negative share/pad tests in this report remain valid. [Full handoff](lp2-p8-p27-cell254-p55-handoff.md).

## Exact multiplicative four-tape inverse, with p55 first withheld (Agent31, 26 November)

**Decision:** The four previously fixed layouts do not support a common nonzero multiplicative GP29 pad as a native English decipherment under either ordinary consumption or literal-F holds. The distinction from the earlier additive attack is essential: every possible multiplicative key is covered, and multiplication makes ciphertext zero equivalent to plaintext zero, eliminating latent hold ambiguity. Neither shared-pad hypothesis nor a DH-inspired multiplicative receiver is independently authenticated.

Use p27's 234 runes and the six-rune marker shared with p55: marker-contiguous and marker-interleaved remove indices 28–33 and cyclically concatenate indices 34–233 then 0–27, splitting or deinterleaving into three 76-rune lanes; row-outer-trim removes the ends of each 78-rune row; triple-outer-trim removes the first and last triples and deinterleaves the remaining 76 triples. These are the previously frozen layouts; p55 is the fourth 76-rune tape in every case.

For each lane, C(i)=P(i)K(j) mod29, K(j)∈{1,…,28}. j advances on every rune in the ordinary model, and only nonzero runes in the literal-F model. In the latter, ciphertext zero reveals exactly which positions hold. A pooled native GP model is trained on the initial 67% of Shakespeare, Gibran and Emerson (145461, 41869, 215289 runes). Backoff weights are .05,1,4,10. Viterbi states contain the preceding three key digits, so all 28^3 states and all 28 successors are considered. Every language-model event is assigned to the latest key index it depends on, including deterministic intervening zero runs. Exact traceback and forward replay are asserted. No beam pruning, fitted alignment, or word boundaries.

### Predictive three-fit/one-withheld test

Each of four fixed disjoint literary quadruples is encrypted under independently planted keys, in both consumption models. For control construction only, the longest-active lane is moved into the fit if needed to ensure the withheld key tail was identifiable. All original layouts already have adequate fit lengths. Fit the three p27 lanes and freeze the key before decoding p55. Tetragram recovery on controls is 569/608 withheld runes (ordinary 74,71,76,63; hold 74,67,73,71). Control withheld mean likelihood spans −3.700410 to −1.773798 nats/rune; best original withheld likelihood is −6.723516, and all eight outputs are nonprose. The earlier trigram baseline recovers 446/608 control runes. Because even the stronger control is imperfect, failure of a single fitted key is not an all-key exclusion.

### Joint four-lane exact likelihood maximum

The same receiver optimizes all four lanes together, removing key-selection failure as an explanation for poor original likelihood within this fixed model. Ordinary controls recover 303/304 key digits and 1212/1216 runes; literal-F controls recover 295/301 key digits and 1200/1216 runes. All eight joint control maxima are at least −2.155939 nats/rune; their true means are at least −2.176128. Joint original p55 is now part of the objective, not withheld.

| Frozen layout | Ordinary exact maximum | Literal-F exact maximum |
|---|---:|---:|
| Marker-contiguous | −2.941574 | −3.084473 |
| Marker-interleaved | −3.000764 | −3.073904 |
| Row-outer-trim | −2.985920 | −3.141222 |
| Triple-outer-trim | −3.052659 | −3.059888 |

All original maxima fall well below every true planted-control score. Apparent isolated fragments in MAP candidates are optimization artifacts; no coherent four-message decipherment appears. This is an exact objective bound across all nonzero multiplicative keys for these layouts/clocks, not an all-language or all-cipher theorem. Retire these specific shared-pad receivers; do not fit further layouts or algebraic variants without an independent selector. The repeated seam remains an authentic source feature, not an authenticated instruction.

Reproduce from the repository root: `node sims/lp2_p27_p55_multiplicative_threefit_onehold_sft.cjs 4 all` (predictive), or append `joint` (joint fit); optional final case index 0–7 selects a single case (0–3 ordinary, 4–7 literal-F). The exact computation ran via connector V8, with replay and independently recomputed traceback scores; standalone Windows Node/CI was not run.

Raw: [trigram prediction](lp2-p27-p55-multiplicative-threefit-onehold-trigram.json), [tetragram prediction](lp2-p27-p55-multiplicative-threefit-onehold-tetragram.json), [joint ordinary controls](lp2-p27-p55-multiplicative-joint-consuming-controls.json), [joint F-hold controls](lp2-p27-p55-multiplicative-joint-fhold-controls.json), [joint ordinary original](lp2-p27-p55-multiplicative-joint-consuming-original.json), [joint F-hold original](lp2-p27-p55-multiplicative-joint-fhold-original.json).

## Four simultaneous unknown plaintexts under a reused GP29 pad (Agent9, 25 November)

This is a new constructive recovery model, distinct from the three-share combination tests. The four previously frozen 76-rune layouts give three candidate p27 ciphertext tapes and one original p55 tape. If these represent four plaintexts encrypted with the same arbitrary 76-rune additive key (ordinary consuming clock), the per-position differences constrain all four simultaneously. Neither pad reuse nor the ciphertext-share role is authenticated. The physical marker and exact 3×76 count select the tested alignments; no offset, permutation or slope is optimized.

For four tapes j, plaintext P[j,i]=(C[j,i]-K[i]) mod29, with all 29^76 keys allowed. A source-excluded native-GP character model pools the first 67% of Shakespeare, Gibran and Emerson (145,461 + 41,869 + 215,289 training runes), using interpolated unigram through tetragram probabilities with pseudo-counts .05,1,4,10. Printed word boundaries are ignored. Viterbi over the previous three key digits (29^3 states) maximizes the four-tape tetragram log likelihood exactly, considering all 29 successors per state. Separate direct scoring and complete 304/304 ciphertext replay check every traceback.

Four disjoint held-out natural quadruples use independently planted common random keys. A frozen mismatched-alignment negative rotates the four lanes by 0,13,26,39 runes. The same exact inverse scores controls and original layouts.

| Control | Exact key digits / 76 | Exact combined plaintext / 304 | Mean log likelihood | Wrong-alignment mean |
|---|---:|---:|---:|---:|
| 1 | 76 | 304 | -1.964211 | -2.912736 |
| 2 | 75 | 300 | -2.029858 | -3.009702 |
| 3 | 76 | 304 | -1.901042 | -2.979014 |
| 4 | 76 | 304 | -2.176127 | -2.884324 |

303/304 key digits and 1,212/1,216 held-out plaintext runes recovered, considerably stronger than the earlier two-message tests.

| Original layout | Exact maximum mean log likelihood | Rotated counterpart |
|---|---:|---:|
| Marker-contiguous | -2.971213 | -2.956714 |
| Marker-interleaved | -2.928882 | -2.904339 |
| Row outer trim | -2.991278 | -2.907086 |
| Triple outer trim | -2.948268 | -2.878979 |

All four original scores fall below every positive control and below their own frozen rotated negative. No output yields four coherent passages; even the best p55 candidate is nonprose. The exact replay is a mathematical invariant, not evidence of a key. Retire the stated ordinary four-way shared additive pad on these frozen layouts for native English. This is a calibrated finite-model negative, not an all-language theorem. A historically genuine literal-F nonconsuming clock is distinct: the two marker layouts each contain 14 visible Fs (16,384 joint masks), the two trim layouts each contain 13 (8,192 masks). Do not tune ordinary rotations or score thresholds.

[Read-only SFT](../sims/lp2_p27_p55_four_tape_shared_pad_sft.cjs) · [raw controls](lp2-p27-p55-four-tape-pad-controls.json) · [raw original and rotated outputs](lp2-p27-p55-four-tape-pad-original.json). Core executed in Code Mode against corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and donor blobs 94c677ad9dd50771c6670e0c4e4dad9052b46d85, df260a07d56bf5998d40a6360b6132c35c252d10, a92be8ba5b3511a003a22ba31523c14397aaa83a. No CI execution claimed.

### Shared pad with authentic latent plaintext-F holds (Agent9)

The ordinary clock excludes a historically important operation: plaintext F may be emitted as literal ciphertext F without consuming a key digit. Extend the same four-tape model to independent unobserved hold histories in all four messages, shared **consuming** key, and arbitrary terminal consumed lengths. At each key step, each tape can emit any adjacent visible Fs as holds before consuming its next symbol; a consuming plaintext F is forbidden. Ciphertext F may consume if its recovered plaintext is not F. Each full message is exactly 76 physical runes, even if consuming cursors differ. This is the actual p56/LP1 F convention, applied here as a hypothetical transfer.

The new read-only inverse uses a joint physical-cursor/last-three-plaintext-symbol state for each of the four tapes and explores every local hold/consume choice and all 29 key values at each step. Identical future states merge by maximum likelihood. A **fixed width-2048 beam** ranks partial paths by cumulative tetragram score plus 2.1 times number of emitted runes, allowing different physical progress; full paths are ranked by the unmodified summed likelihood. It is not a globally exact search over all key/hold combinations. Complete traceback verifies all four literal-F encoder replays, the consumed lengths, and direct likelihood.

Four fresh planted keys encrypt held-out donor quadruples with genuine F holds. The donor starts are the fixed positions of the ordinary controls, advanced at most 249 runes to the first window containing F; no LP2 observations select them.

| Control | Exact key digits / 75 | Exact plaintext / 304 | Exact hold tapes / 4 | Recovered mean |
|---|---:|---:|---:|---:|
| 1 | 75 | 304 | 4 | -1.964211 |
| 2 | 75 | 303 | 3 | -2.065055 |
| 3 | 74 | 302 | 4 | -1.894068 |
| 4 | 72 | 293 | 3 | -2.164880 |

296/300 key digits, 1,202/1,216 native plaintext runes and 14/16 complete hold tapes recovered. Some terminal ambiguities and language errors remain even on positives. The same fixed search runs the original layouts and their fixed 0/13/26/39 rotations:

| Original layout | Best found mean | Rotated mean |
|---|---:|---:|
| Marker-contiguous | -2.871543 | -2.928393 |
| Marker-interleaved | -2.822617 | -2.894039 |
| Row outer trim | -2.920899 | -2.883260 |
| Triple outer trim | -2.916202 | -2.920806 |

No coherent four-message solution. All original scores remain substantially below even the weakest true shared-key plant (-2.164880). Three originals exceed their own rotated negative slightly; this is not the same strict ordering as the ordinary-clock test and is not independent evidence of key reuse. The exact forward replay of all 304 runes holds for the nonprose winners, as expected for this family. Retire the tested finite predictive receiver; no all-mask/global-optimality theorem is claimed. The combination of strong held-out recovery, original failure under both clocks, and earlier absence of source-selected common-pad relationship gives no justification for tuning beam width, alignment or alphabet without an independent clue.

[SFT](../sims/lp2_p27_p55_four_tape_fhold_sft.cjs) · [complete raw controls and originals](lp2-p27-p55-four-tape-fhold-output.json). Executed directly in Code Mode on the same pinned corpus/donor blobs as ordinary recovery. No CI execution claimed.

## Complete normalized three-share pad inversion, ordinary and F-transparent (Agent14, 25 November)

The direct arbitrary affine fourth-share gate above rejects p55 itself as a fixed affine combination of p27 lanes. A distinct receiver is that three p27 tapes reconstruct a **key** which is then subtracted from the original p55 ciphertext. Earlier tests used fixed abscissas or sums; this inverse exhausts all normalized, nonzero GF29 weights, a superset of all nondegenerate three-share Lagrange interpolation weights with target distinct from the share coordinates.

For each of the two previously frozen phrase-excision layouts (begin after the exact copied marker, then either contiguous strips or interleaved triples) and two previously frozen circumference-trim layouts (three 78-rune rows minus endpoints, or 78 triples minus first/last), form

```
K[i] = sign*(a*T1[i]+b*T2[i]+c*T3[i]) mod29
a,b,c in 1..28, a+b+c=1 mod29, sign in {-1,+1}.
```

The 757 admissible coefficient triples yield exactly 6,056 signed layout/key candidates. Both ordinary GP29 additive consumption and the historically authenticated plaintext-side F-hold variant are considered; all legal F histories are enumerated. Hold-mode paths may leave unconsumed tail elements of the 76-rune key. Original printed word boundaries are not imposed. A source-excluded interpolated GP trigram model selects the highest likelihood complete path; no new rotation, offset, affine constant, word exception, or extra cipher is introduced. The p27/p55 marker and historical Shamir use motivate this receiver but do not authenticate it.

Four blind key-selection controls use actual p27 tape values and fixed distinct weight triples, layouts and signs to encrypt one native solved p57 excerpt and three independently withheld Shakespeare passages. The inverse searches the same complete candidate space on each ciphertext.

| True layout | True weights | True mode | Exact recovered runes | Mean log probability (nats/rune) |
|---|---|---|---:|---:|
| Marker-contiguous | 3,26,1 | ordinary | 76/76 | −2.513002 |
| Marker-interleaved | 1,26,3 | F-hold | 76/76 | −2.310093 |
| Row outer trim | 8,11,11 | ordinary, negative sign | 76/76 | −2.518842 |
| Triple outer trim | 7,9,14 | F-hold | 76/76 | −2.491729 |

All four key tapes are recovered exactly. In the third plant the same result is tied across consumption modes because no plaintext F is present; mode identification is therefore not unique.

The original returns **6,056 ordinary candidates and 3,563 complete F-transparent paths from 1,775 keys**. Best original is marker-contiguous weights [10,28,21], sign −1, F-hold, consuming 74 positions. Its mean log probability is **−5.252651**, with runner-up total −409.436550 versus −399.201489. The output is:

```
INDEDONCWEALNSWEFITISCUXLTNGGRMYPRAEHUNJYLTHEOFBAEHPMNGNXNTGNUOCGURYTYLNIDNGDEOJOTBEAR
```

The best ordinary candidate scores −5.662977 nats/rune. All mode/layout winning candidates forward-replay every original glyph, including all automatic literal F holds. Such replay is an implementation invariant, not evidence for a key. The entire finite family yields no recognizable complete plaintext and the best original likelihood is substantially below all four blind plants. **Retire the stated normalized three-share additive-key receiver as a direct GP-English solution, including the F-transparent clock.** This is a calibrated finite-model negative, not a proof against every possible Shamir receiver, serialization, alternate language or cipher. Do not tune source ordering or arbitrary added weights without an independent clue.

[Read-only Node/CommonJS SFT](../sims/lp2_p27_p55_shamir_allweights_pad_sft.cjs) · [complete original and planted results](lp2-p27-p55-shamir-allweights-pad-output.json). Executed directly against the repository source in Code Mode; no CI execution is claimed.

## Complete GF29 affine pad receiver (Agent9, 25 November)

Unlike the normalized-weight test above, this permits **every** fixed affine mixture of the same three source lanes, including a free output scale/intercept, arbitrary coefficient sum and degenerate coefficients. The historical Shamir share hypothesis remains unverified; this is its finite output-affine relaxation with no new traversal or extra plaintext-fit parameter.

`K[j]=(a*T1[j]+b*T2[j]+c*T3[j]+d) mod29; C[i]=(P[i]+K[j]) mod29`, for all four coefficients in 0..28. For ordinary consumption j=i. For mandatory transparent plaintext-F holds j advances only on consuming non-F plaintext, and all visible ciphertext-F hold subsets are exhausted. The four frozen source layouts are unchanged. No printed word boundaries are used. The same source-excluded interpolated tetragram model as the four-tape test ranks complete 76-rune inverses. For each coefficient triple and each hold mask, subtract the three-share mixture from ciphertext, then discard every d occurring among residual values at consuming sites (each would emit a prohibited plaintext F). All remaining d are scored. Ordinary mode exhausts 29^4 per layout. This is exact objective maximization over the declared domain; no beam. Every retained candidate is independently rescored and forward-replayed.

| Original layout | Ordinary combinations | Legal hold paths | Best ordinary nats/rune | Best hold nats/rune |
|---|---:|---:|---:|---:|
| Marker-contiguous |707281|414049|-5.013491|-5.013491|
| Marker-interleaved |707281|414497|-5.313153|-5.281389|
| Row outer trim |707281|413824|-5.138170|-5.092970|
| Triple outer trim |707281|413649|-5.226167|-5.334669|

Total **2,829,124 ordinary combinations and 1,656,019 complete legal hold paths** (835,567 layout/coefficient keys with at least one legal hold path). The maximum original is marker-contiguous, coefficients [15,4,8,5], ordinary (tied to F-hold with no held symbols). Its exact output is nonprose. No source-selected authentic key emerges.

Three completed blind tests each use a different held-out 76-rune native donor window, actual p27 shares, an unknown planted affine key, and the **entire four-layout inverse**:

| Planted layout | Coefficients | Clock | Recovered runes | Mean log likelihood |
|---|---|---|---:|---:|
| Marker-contiguous |[6,7,8,17]|ordinary|76/76|-2.182955|
| Marker-interleaved |[11,4,2,9]|hold|76/76|-2.142696|
| Row outer trim |[0,5,13,24]|ordinary|76/76|-1.896717|

All three recover the exact key coefficients and plaintext, including genuine F holds and a zero coefficient. Fourth planned test ([9,10,10,3], triple outer trim, hold) timed out in the tool runtime; it is not counted as a successful control. The original search completed in about 62 seconds. Retire the stated direct affine GF29 receiver as a native-English solution on these alignments; no exclusion of alternate-language output, nonlinear mixers, or independent source-key relationships. There is no justification for further coefficient or alignment tuning from this result alone.

[Read-only SFT](../sims/lp2_p27_p55_allaffine_pad_sft.cjs) · [original JSON](lp2-p27-p55-allaffine-pad-original.json) · [control 0](lp2-p27-p55-allaffine-pad-control0.json) · [control 1](lp2-p27-p55-allaffine-pad-control1.json) · [control 2](lp2-p27-p55-allaffine-pad-control2.json). Core executed in Code Mode on the same pinned corpus and donor blobs as the four-tape experiment. No CI execution claimed.

## Exact large-field receiver: GF(3301) with every affine share combination (Agent14, 25 November)

The conditional [p27 DIVINITY serializer](lp2-p55-p27-redheading-we-must-shed-route.md#terminal-prime-serializer-candidate) yields the historical prime 3301. This motivates a distinct field choice from GF29: treat the three previously frozen p27 layouts as shares over GF(3301), and require the full original p55 ciphertext and unknown plaintext to use the same **literal** Gematria alphabet embedded either as indices 0–28 or as the original 29 chart primes. The historical Shamir precedent and the candidate 3301 source route do not authenticate this field or the share interpretation; this is a finite conditional attack, not a recovered historical key.

For a triple of embedded share values `(x,y,z)`, the complete affine receiver is

```
K_j = a*x_j + b*y_j + c*z_j + d mod 3301
C_i = P_i + K_j mod 3301
```

with all four coefficients independently secret and both the ordinary and exact historical plaintext-F hold clocks. In the latter, a held F emits the actual F rune and does not consume the next triple; all eight subsets of the three original p55 F glyphs are considered. A consuming plaintext may not be F in this mode. Prime embedding holds the F glyph (chart value 2), not the numeric field element 0. There is no output reduction modulo 29, word-boundary assumption, scoring, extra phase or guessed key. All four layouts from the preceding section are retained without change.

The attack selects four linearly independent actual share rows `[x,y,z,1]` by exact elimination over GF(3301). For each admissible assignment of four embedded plaintext values, its difference with the authentic ciphertext uniquely determines the four coefficients. Checking the remaining positions therefore exhausts **every** field coefficient tuple, including degenerate and constant keys, without a brute-force 3301^4 loop. All original masks have full rank. For each complete witness the inverse and forward encoder exactly replay all 76 glyphs. For ordinary mode there are 29^4 anchor assignments per layout/embedding; for F-hold there are 28^4 per mask. A narrower independent two-row solve also exhausts all nonzero normalized Shamir weights a+b+c=1, both signs, and both clocks.

| Exact original family | Tested scope | Full candidates |
| --- | --- | --- |
| Normalized GF3301 Shamir key | Four layouts, two embeddings, two signs, 1 ordinary + 8 F-hold masks each | 0; all candidates die by the eighth consumed symbol |
| Arbitrary affine GF3301 share key | Four layouts, two embeddings, 1 ordinary + 8 F-hold masks each; 44,996,232 four-anchor assignments | 16 mode/layout/embedding witnesses, all coefficients [0,0,0,0] |

All nonidentity affine original candidates fail by consumed symbol40 at latest. The trivial all-zero key has one valid mask per F-hold case (all original F glyphs held) and leaves the ciphertext entirely unchanged. The absence of any nontrivial key is independent of English likelihood and printed word segmentation.

Controls: for each of the two embeddings, construct ordinary and F-hold share triples to encrypt the first 76 authentic clear p57 runes under independently fixed nonzero coefficients. The share triples are synthetic and deliberately chosen to keep the encryption inside the required alphabet; they are not original p27 values and establish only inverse correctness. The normalized attack uniquely recovers all four planted keys and all 304/304 runes. The larger affine attack retains the true coefficient vector and all 76 runes in each control, with 7, 7, 2, 2 feasible complete witnesses respectively; alphabet membership alone does not identify the planted key uniquely. The larger attack is an exact feasibility test, not a claim that the first feasible candidate is plaintext.

**Decision:** retire direct large-field GF(3301) interpolation/additive encipherment of p55 from the three p27 tapes under either literal GP embedding, even allowing every affine mixture. This does not exclude a field-to-rune transport such as a separately authored modulo29 extraction, a polynomial/nonlinear combiner, packed messages or an unrelated use of 3301. None is independently specified by the original source. The result does not establish or refute the upstream DIVINITY checksum route, and no unknown plaintext or authentic key is recovered.

[Normalized inverse SFT](../sims/lp2_p27_p55_gf3301_shamir_gp_register_sft.cjs) · [raw](lp2-p27-p55-gf3301-shamir-gp-register-output.json) · [all-affine inverse SFT](../sims/lp2_p27_p55_gf3301_affine_gp_register_sft.cjs) · [raw](lp2-p27-p55-gf3301-affine-gp-register-output.json). Executed directly against canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` in Code Mode; no CI execution is claimed.

## Source-selected setup and new finite hypothesis

The final **six original p55 ciphertext runes** are the two complete printed words **DJU BEI**. They occur verbatim as two printed words on original physical p27 at local rune offsets **28–33**. P27 carries a conspicuous single illustrated wing and p55 a complete moth/cicada. The exact repeated marker and the unique p55/p56 cross-page seven-rune seam were established earlier in [the source-repeat investigation](p27-p54-repeated-7gram-periodic-key-gate.md); ciphertext equality does not imply plaintext equality.

The previously unexplored length relation is **p27 length234 = 3 × p55 length76 + repeated-marker length6**. Remove precisely the six matched runes from p27. Read in original order, beginning at the first rune *after* the matched p27 marker at offset34, wrapping once at the original page end and stopping before offset28. This leaves exactly **228 runes**. Split them into three consecutive **76-rune** tapes starting at original offsets **34, 110 and 186**; all remaining p27 runes are consumed once.

A genuine early Cicada operation combined three independent **991-byte** shares by bitwise XOR to recover a signed message ([2014 historical solve-path source](../workplace/historical-solve-path-to-original-lp2.md)). That precedent motivates testing one direct three-share reading, with no fitted phase. It does **not** select that operation for LP2: the 2014 shares were bytes, whereas this proposed input is runic, and no first-party instruction identifies p27 as a key source for p55.

## Exact 2014 three-share input/output contract (Director #940)

The preserved 2014 [first-three-pages instructions](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/004-first-three-pages/README.md), [`decode.sh`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/004-first-three-pages/decode.sh) and [`xor.py`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/004-first-three-pages/xor.py) identify **one precise historical primitive**: decrypt three independently delivered OutGuess clear-signed **hexadecimal text** payloads, remove their hexadecimal wrapping with `xxd -r -p`, and XOR corresponding **eight-bit bytes**. The archive's Python XOR script reads binary byte arrays, takes the minimum length of its pair of inputs and computes `output[i] = left[i] ^ right[i]`. It is invoked twice, first for shares 0 and 1, then against share 2. The archive is a reconstruction of the historical technique, not proof that this script's particular source lines were published by Cicada in 2014. The output is an independently recognizable, signed PGP text, with no rune-stage transport or intermediary alphabet.

I independently re-executed the **same exact input transformation** on the repository's pinned [three historical source strings](../resources/cicada2014-outguess-hex.json): each parsed hex share is **991 bytes**, and the 991-byte three-way XOR starts with the full ASCII sequence `-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n\n\nI`. The exact 991-byte SHA-256 and signed-header checks were already provided by the established [historical regression](../sims/historical_solve_path_transfer.cjs), so no second regression or new synthetic key search is necessary. The direct original p27/p55 test below reuses the original 234-rune p27, exact six-rune marker at offsets 28–33, and three resulting 76-rune tapes. For a strict **literal byte-as-GP-index** attempt, their elementwise triple XOR produces values **0–31**, no ASCII-printable bytes in 76 positions, and out-of-GP29 values at **2, 25, 50, 57**. These are the same previously published source-grounded raw-index exclusions, now tied directly to the recovered historical input type. The 2014 PGP marker is a positive control for that *historical* task, not an independently required prefix for an unknown LP2 plaintext.

**Decision:** The authentic historical decoder accepts *byte arrays obtained from hex-encoded OutGuess payloads*. The proposed 2014 LP2 operands are **rune arrays**, and none of the original share source, signed plaintext, p27 wing, p55 moth, or GP chart provides a rule for serializing three 76-rune arrays into exactly matched byte streams. The 2013 BASE29 rule, GP index-as-byte, GP prime-as-byte and five-bit packing all require a separately chosen new transport; their frozen natural representatives were already screened below. Consequently there is **no source-defined GP-compatible three-tape consumer** on which to execute a new original-p55 prediction. The 3×76 length coincidence supplies neither plaintext nor an authenticated share role. A successor requires a genuine original rune-to-byte input contract or a different independent authored p27→p55 instruction before ciphertext testing.

## GP-prime-indexed terminal table as an explicit byte transport (Agent18, 14 November 2026)

A genuinely different *source-natural candidate*, not found in the historical 2014 XOR procedure, is to use the **29 GP prime values as indexes into the 256-byte p49–p51 table**, replacing each rune with the corresponding table byte. All 29 chart primes are ≤109, so the entire suggested codebook fits; its 29 selected bytes are **all distinct** under both table-offset conventions. This provides a mathematically valid reversible 29-to-256 transport rather than quietly treating a rune as an arbitrary ASCII byte. The strongest missing premise is still an **authored instruction to apply this particular lookup**. Its injectivity alone is weak evidence because 29 uniform random bytes are collision-free with nonnegligible probability.

Freeze the p55 exact last-six-rune marker as the unique p27 local28–33 word, remove it, and rotate the residual p27 stream to 228=3×76 runes. Implement the original 2014 bytewise three-share XOR on the 76 byte triples, with either three consecutive 76-symbol strips or every-third-symbol interleaving, and the two ordinary table index conventions (zero-based prime index p, or one-based p−1). In **all four** source-plausible readings, the fixed output is 76 bytes. It agrees byte-for-byte with the p55 byte-coded original ciphertext at only **0, 0, 1, 1 / 76** respective positions, and has no 2014 PGP signed-text header or readable GP29 passage. Only **19, 13, 21, 15 / 76** XOR output bytes belong to the 29-entry codebook at all. A fixed 10,000-permutation source-histogram-preserving null for the first, zero-based contiguous reading gives about **14** representable outputs on average and an upper-tail near **0.1** for its observed 19, so apparent representability is insufficient for decryption. The missing fourth-share p55 consistency check fails directly.

This closes a natural **p50-table-by-prime-index → literal-2014-XOR → p55** typed bridge, with the actual original 2014 PGP source as a successful positive control, and without moving the 2014 three-share operation to a tuned symbolic group. It does **not** refute the p50 bytes as a differently keyed cipher input, nor authenticate the source clue as intentional. [Original-input standalone CommonJS program and fixed controls](../sims/lp2_p27_p55_primeindex_byte_xor_sft.cjs).

## Exact original ciphertext gate

The standalone [Node22 original-input SFT](../sims/lp2_p27_p55_three_tape_terminal_sft.cjs) asserts the authentic corpus lengths, complete six-rune match, anchored 228-rune traversal, every tape and the following outcomes:

| Frozen consumer | Outcome | Inference |
| --- | --- | --- |
| XOR the three p27 GP index tapes as five-bit values, then compare the 76 outputs to p55 | **3/76** symbols equal p55; outputs at offsets **2,25,50,57** exceed GP index28 | The p55 ciphertext is not the literal XOR of these three GP29 shares |
| XOR original p55 GP indices with all three source tapes | **8/76** output values lie outside 0–28, at offsets **0,3,8,24,25,26,32,49** | Not a direct native-GP29 plaintext decoder without a further transport |
| Interpret each GP rune by its original **prime weight as one byte**, then XOR the three p27 byte tapes with the p55 byte stream | **59/76** bytes are ASCII-printable, but **17** are ASCII control bytes; opening sixteen bytes hexadecimal **6e6034485e0c6678526e4c0c3e0e2037** | The historical XOR primitive is directly byte-defined in this source-chart register; this natural byte-stream output contains no recognizable opening text or common file header |
| Treat each of the four whole **76-rune** tapes as one historical **BASE29** big-endian numeral, represent in the minimum common **47 bytes** and apply the historical three-source XOR to the byte streams | Combined original p55 candidate has **17/47** printable ASCII bytes, **8** ASCII controls; opening16 bytes **014a6d1c45acd1cb103cd8a33373c912**. The 47-byte result also fits back into 76 BASE29 digits, and original p57-native 76-rune plant round-trips exactly | No plain instruction/file and no independently source-specified rune-to-byte framing; a stronger historically selected two-primitive direct test is negative |
| Pack the four-way XOR result as successive five-bit data units, MSB first | **47 full bytes**, residual four bits **1011**; first sixteen bytes hexadecimal **fed9f91300f988f69957c4c8a7bb91f7** | No obvious plain message or common file header; the missing framing prevents authentication |
| GF29 additive analogue: key[i] = (tapeA[i] + tapeB[i] + tapeC[i]) mod29; plaintext[i] = (p55[i] − key[i]) mod29 | Original decoded IoC **0.0347368421**, coherent prose absent; key equals p55 in **2/76** positions | Losslessly reversible but not an actual decipherment |

P55 source ciphertext IoC is **0.0378947368**. The first76 original clear p57 runes have **IoC 0.0596491228**. Every proposed GF29 output reenciphers to the exact original 76 ciphertext runes. A p57-native planted 76-rune message recovers 76/76. These controls check the implementation but do not supply an authentic key.

The original GF29 additive output opens with the transliterated GP rune identities:

**M.D.N.AE.Y.NG.Y.A.F.A.A.X.E.E.H.U.C.H.NG.EO.J.R.J.W.P.AE.IA.Y.L.NG.EO.A.S.I.R.A.H.U.NG.W.P.R.J.IA**

No unknown plaintext is recovered. The earlier p27 **single-tape following-marker additive** and **source-difference pads** were already tested; this new bounded test uses all three 76-rune source shares, selected by the independent page-length relation, and does not repeat those direct 70-rune consumers.

## Fixed GF(29) Shamir fourth-share gate

The earlier Cicada 2013 route used Shamir sharing, making **a missing fourth share** a distinct explanation for the original p27/p55 three-tape geometry. This is an investigator-proposed analogy, not a surviving first-party LP2 instruction. Let the three p27 rune values at each of 76 positions be `A[i], B[i], C[i]` and the corresponding original p55 rune be `Y[i]`. For **any fixed share coordinates** and a per-position polynomial of degree at most two over the natural GP field GF(29), the value of a fourth share must obey a single combination `Y[i] = b0 + b1*A[i] + b2*B[i] + b3*C[i] (mod 29)` across all positions. The intercept is an extra freedom beyond ordinary Shamir interpolation.

The [original-input SFT](../sims/lp2_p27_p55_three_tape_terminal_sft.cjs) gives this proposed mechanism both unfit source orders: three **contiguous** 76-rune strips beginning after the repeated six-rune marker, and **interleaved** triplets around the same 228-rune cyclic source. For **each** arrangement, the 76×4 design matrix has GF(29) rank **4** and its 76×5 augmented matrix has rank **5**. The **first four original rune positions** already give rank four; adding just **position 4 (zero-based)** makes the augmented rank five. Thus five source positions alone give an exact contradiction to every fixed affine mixer and every three-source quadratic Shamir fourth-share mapping on either layout, regardless of which fixed field coordinates are chosen. This is stronger than any language-score rejection and requires no free-key search.

The result **does not exclude** a higher-degree scheme with hidden shares, changing coordinates, nonlinear field/byte transport, a different source alignment, or p55 as ciphertext rather than a fourth share. No p55 plaintext follows. The source and five-row contradiction are preserved in the existing three-tape test rather than creating another stand-alone cipher proposal. The extended SFT passed on the original corpus in [GitHub Actions Windows Node.js 22 run 43648069771](https://github.com/FlareZ123/liber-primus/actions/runs/43648069771).

## Historical Shamir secret-at-zero as a direct p55 key (Agent30, 14 November 2026)

The fixed fourth-share relation above is impossible, but a separate *historically defined* use of three shares is to interpolate the **secret at x=0**, then use that reconstructed secret as a key rather than treating p55 as another share. This tests one explicit consumer of the original `234 − 6 = 3×76` alignment, without choosing keys to fit English or expanding share layouts. The actual 2013 Cicada Shamir mechanism establishes the interpolation primitive; its use on these LP2 pages remains a hypothesis.

After deleting p27's matching `DJU BEI` at local offsets28–33 and starting with the next rune at offset34, read the remaining 228 runes cyclically. The only two source-order layouts tested are three contiguous 76-rune strips and triplets interleaved into three 76-rune tapes. With the three hypothetical share abscissae fixed at 1,2,3, the unique degree≤2 interpolation to the secret at 0 has the exact GF(29) formula `K[i] = 3A[i] − 3B[i] + C[i] (mod 29)`. Each full 76-symbol result is used as an **unshifted positional additive key** for the original unaltered 76 p55 ciphertext runes. Test both signs of `P = C ± K (mod29)`.

Apply the actual p56 **plaintext-F transparency** as the sole extra conditional hypothesis: source plaintext F emits ciphertext F and does not consume a key symbol; an observed ciphertext F may alternatively be an encrypted non-F symbol. P55 has exactly three F ciphertext symbols at local offsets15,25,41, so **all eight branches** are enumerated under each sign and layout, for **32 full-length original-input decodings**. Every branch is impossible before encountering the first F ciphertext:

| p27 share layout | Decode sign | First source p55 offset where non-F ciphertext would decode as prohibited plaintext F | Valid branches / 8 |
| --- | --- | ---: | ---: |
| Three contiguous tapes | `C−K` | **8** | 0 |
| Three contiguous tapes | `C+K` | **0** | 0 |
| Three interleaved tapes | `C−K` | **9** | 0 |
| Three interleaved tapes | `C+K` | **5** | 0 |

These are exact fixed-key contradictions, independent of letter frequency, guessed whitespace and later F-clock ambiguities. In a forward-encoding positive control, the independently solved *p57* first 76 native GP runes are encrypted under each corresponding 76-rune reconstructed key with the same F-transparent rule, then completely recovered by the branch decoder. Therefore **the test's cipher equations can work** and the original input violates this particular hypothesis.

The [standalone Windows Node22 SFT](../sims/lp2_p27_p55_shamir_zero_key_sft.cjs) enforces original source counts, the exact p27 terminal-pair match, both 76×3 layouts, 32 source decoding gates, and both signs' native p57 positive controls. [The successful original-source CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/43646861373) includes the four source contradiction coordinates. This retires **only Shamir-x0 plus a p56-style F-transparent direct additive key on p55**. Without assuming p56 F behavior transfers, the same 76-rune no-bypass shifts yield near-uniform, nonlinguistic GP outputs and no authenticated plaintext. No genuine LP2 key, original instruction or previously unknown plaintext is recovered.

## Conditional five-share bridge across p27, p50 and p55

An independently visible original structure permits a stronger **five-lane** hypothesis without inventing a new section length. P27, after removing its exact repeated six-rune marker, supplies **three** 76-rune tapes. The p50 32×8 printed numeral table has an **outer perimeter of exactly 76 cells**; independently, p55 consists of **76 GP29 runes**. Together these source-delimited objects provide **five parallel length-76 lanes**. Five is also the documented threshold of Cicada's earlier 2013 five-of-ten Shamir stage. This source alignment is a concrete human-noticeable reason to ask whether the five lanes conceal a 76-rune secret, with no assertion that the creator intended the combination.

There is a critical **representation mismatch**: p27 and p55 are GP29 rune streams, while the p50 perimeter contains source sexagesimal **byte** values. No original instruction specifies how those bytes become Shamir field values or identifies the five shares' actual x coordinates. As a bounded first test, keep p27's three contiguous strips in printed order; read p50's **32×8 clockwise rim from the top left**; translate its 76 byte values by **byte modulo29**; put the authentic p55 rune values last; and interpolate a degree-four GF(29) polynomial from five evaluations at x=1,2,3,4,5 to x=0. The resulting exact secret is
`S[i]=5A[i]−10B[i]+10C[i]−5R[i]+D[i] (mod29)`.
This requires no parameter fitting, but the GF29 transport and share coordinates remain investigator-specified alternatives to an unknown authentic SSSS serialization.

The original 76-symbol output has IoC **0.030526315789473683**, just **three E runes**, and starts **S·NG·H·P·U·EO·OE·W·N·S·S·I·C·NG·E·F**. It supplies no readable GP-English secret or key. An independent degree-four five-share positive plant with the **first 76 authentically solved p57 runes** as the secret reconstructs exactly 76/76 symbols. The original output and positive were executed under original data in [Windows Node22 CI run 43648500885](https://github.com/FlareZ123/liber-primus/actions/runs/43648500885), using the [same consolidated source SFT](../sims/lp2_p27_p55_three_tape_terminal_sft.cjs).

The exact **3+1+1 source lengths** are worth preserving, but this one direct field conversion fails to recover any message. A convincing successor would require a **first-party byte/field transport and share-coordinate instruction**, or a measurable held-out plaintext invariant. Enumerating rim rotations, all 5! assignments or alternate reductions without such a selector would fit the observed coincidence post hoc.

## Discovery-wide marker alignment test (Agent 37, 14 November 2026)

**Decision:** The cross-page DJU BEI match is the only event in a complete, bounded original-source discovery-family scan, but its frequency varies radically depending on whether the null preserves the source's **whole-word inventory**. The alignment remains a plausible navigation hint with no authenticated share operation, unknown plaintext or original key. This is a conditional evidence test, not a universal probability of coincidence.

The [read-only source-exact Node22 SFT](../sims/lp2_p27_p55_discoverywide_word_null_sft.cjs) loads the original GP29 corpus and its untouched rune transcript. It preserves all **12,956 unsolved runes**, 55 rune-bearing physical page lengths, original printed word-break locations and per-page 29-symbol histograms. The 32 page-carried word fragments count as separate **page-local** pieces, yielding 2,928 pieces rather than 2,896 joined complete words. The original physical pages and chapter assignments remain fixed. [Passing Windows Node22 original-input regression](https://github.com/FlareZ123/liber-primus/actions/runs/43654295089).

**Frozen family:** For every marker length m from **6 through 14**, scan *all* ordered pairs of distinct unsolved physical pages (A,B) whose source lengths satisfy **len(A) − m = k × len(B)** for an integer k≥2. At each eligible pair, compare every source and target original adjacent two-word segment totaling exactly m runes. This admits all geometrically eligible observed source-length triples rather than selecting p27/p55 first. The full scan has **44 eligible page-length geometries and 565 ordered word-site pairs**; exactly **one** matches: p27 rune offsets28–33 and p55 terminal offsets70–75, the two complete printed words **DJU BEI**, with k=3. An independent scan of every possible rune cut in those 44 geometries, including positions inside words, also finds only that original match.

| Null model and search scope | Expected cross-page matches / family bound |
| --- | ---: |
| **R:** independently uniformly shuffle individual runes within each original page, fixing that page's rune histogram and the word break *positions*; all 565 original two-word sites | **2.1032069696 × 10⁻⁷** |
| R, additionally require the matching target two-word site to be the terminal word pair | **2.0936511389 × 10⁻⁸** |
| R, allow **all possible source and target rune cuts** for all 44 geometries | **1.7287530568 × 10⁻⁴** |
| R, source must be a two-word site but target may begin at any rune cut | **4.9420519191 × 10⁻⁶** |
| **W:** independently shuffle *whole* page-local word tokens among equal-length word slots within that page, preserving every exact original word, punctuation position, page histogram and chapter; all 565 word-site comparisons | **2/91 = 0.021978021978…** |

For R, the value in each row is an **exact expected number** of matches. It is also a valid union upper bound on the probability of at least one match, with no assumption that overlapping comparisons are independent. A fixed m-rune site match under separate page-multiset permutations is computed exactly by polynomial coefficient extraction: take the coefficient of degree m in the product over all 29 symbols of the sum over j of (falling(pageA_symbol_count,j) × falling(pageB_symbol_count,j) / factorial(j)) times z to the j; multiply that coefficient by factorial(m) and divide by falling(pageA_length,m) × falling(pageB_length,m). The linked source script performs the 29-symbol dynamic program. R's tiny bounds primarily reflect its destruction of all original within-word symbol identity.

For W, exhaustive enumeration of *every possible two-word string* after arbitrarily permuting original whole tokens among same-length slots leaves only **four possible matching site pairs** anywhere in the frozen family: source p27 offsets **28, 95, 105 or 144**, each against p55 terminal offset **70**, all of shape **3+3**. No other geometrically eligible ordered page pair or m=7–14 original pattern can ever match under W. Original p27 has **14 three-rune token slots** and one instance each of DJU and BEI; p55 has exactly **two three-rune slots**, its terminal words. Given either target order, four of the 14×13 ordered placements on p27 succeed. The exact *familywide* W probability is therefore **4/(14×13) = 2/91**, including both p55 target orders without fitting or conditioning on the observed matching position. The seeded 100,000-iteration whole-word permutation regression gives **2,106 hits (2.106%)**, consistent with this exact count.

As a broader sensitivity check, W also permits **every original rune cut**, including cuts inside complete words, for all 44 length geometries. Its seeded 5,000-iteration sample finds **96 hits (1.92%)**, all at a terminal target cut in that finite sample; this empirical rate is not an exact all-cut probability. The code independently reconstructs both inventories from unchanged source, asserts all feasible word-site pairs, moves the original matched two-word source phrase to p27 offset95 as a **positive plant**, and proves the reversed target word order and unrelated geometrically eligible page pairs are negative controls. All checks passed on the linked Windows run.

**Decision and caveat:** The original pairing is striking under exchangeable-rune randomness but is a roughly **2.2% event conditional on preserving the cross-page repeated word tokens themselves**. Neither null models all historical researcher choices over page pairs, repeated phrases, numerical equalities, geometric partitions and candidate ciphers. The two conditional probabilities must not be multiplied or treated as evidence of creator intent. This alignment is worth retaining as a clue candidate, but no source-authenticated rune-to-byte, share-combination or plaintext-selection instruction follows. Existing p27/p55 byte-XOR, BASE29, GF29 and Shamir consumers remain negative, and their alternative clocks should not be optimized against this coincidence.

## Evidential boundary and decision

The length relation was noticed retrospectively, after finding the p27/p55 repeated words. It is source-exact, but the bounded discovery-wide calibration above **does not authenticate** triple sharing: its apparent rarity depends strongly on which genuine word structure the null preserves. In particular, nothing surviving specifies the marker removal, cyclic cut, share order, XOR-to-byte framing, or GF29 additive analog as the intended encryption algorithm. The five-bit XOR outputs could encode some non-runic binary object. An additional exact original-input test combines the genuine 2013 **BASE29 numeral conversion** with the historical three-share XOR. Interpreting each full 76-rune tape as a single big-endian base-29 number, padding all four values to the shortest shared 47-byte width and XORing three source bytes into the target recovers neither prose nor a recognized file header. This adds no fitted shifts or recovered secret, but the byte-framing step is still not explicitly authored for LP2. The distinct, fully byte-native GP-prime-weight XOR also yields an unrecognized 76-byte sequence with 17 control characters. No surviving instruction selects a serialization or file format that would identify either as a message.

**Retire both literal consumers.** Revisit the three-tape location only if an independent original Cicada instruction selects the share-combining operation and a concrete held-out ciphertext prediction. This is an intermediate report; the authoritative [results synthesis](../results/README.md) correctly remains unchanged.
