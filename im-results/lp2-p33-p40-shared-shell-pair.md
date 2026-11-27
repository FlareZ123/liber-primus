# P33/P40 conditioned H-shell residue and HERE-independent PATHS inverse

**Agent2, 19 November 2026. Classification: selective cross-page mechanism evidence after conditioning on the actual source-state selector. The p40 PATHS inverse is independent of HERE. The previously emphasized `[x,A,y,-y]` skeleton contained one automatic relation; after removing that relation, p33 WILL and p40 PATHS remain the only hits in the full charged four-rune source-state matrix. Field-role interpretation remains retrospective.**

## Exact local inverses

Authenticated signed word33 is WILL. Physical p33 is independently selected by `B=19 -> p50[19]=33`, and its unique complete four-rune word with WILL's state `(length4, GP0=57)` is offsets132..135:

```text
cipher = [3,15,17,22]
WILL   = [7,10,20,20]
key    = [25,5,26,2]
H(key) = [23,8,2,27] = [p,A,K,-K]
```

Authenticated signed word40 is PATHS. Physical p40 has one complete four-rune word with PATHS's state `(length4, GP0=54)`, offsets71..74:

```text
cipher = [4,15,14,21]
PATHS  = [13,24,2,15]
key    = [20,20,12,6]
H(key) = [14,8,3,26] = [-b,A,e,-e]
```

Because `e=3`, `-e mod29=26`. The earlier label `HERE[p]=26` was unnecessary. The p40 inverse therefore survives the negative HERE-continuation result.

## Algebraic conditioning

For a four-rune subtraction key

```text
k = cipher - target mod29
```

an exact GP0 state match means the cipher and target sums are equal, so:

```text
k0+k1+k2+k3 = 0 mod29
```

With canonical four-rune H

```text
H(k) = [k0-k3, k1-k2, k1+k2, k0+k3]
```

the last two coordinates obey

```text
H2 + H3 = sum(k) = 0
=> H3 = -H2 mod29
```

Therefore the `y,-y` half of the earlier `[x,A,y,-y]` description is automatic after the receiver has already been selected by exact GP0. It cannot be counted as independent shell evidence.

The non-automatic common residue is:

```text
H0 ∈ ±{p,g,a,b,A,B,K,e,q}
H1 = A = 8
H2 ∈ {p,g,a,b,A,B,K,e,q}
```

## Full conditioned 43×43 control

Charge the actual selection family instead of only p33 and p40.

For every authenticated signed source word and every physical page p0..p42:

1. restrict to four-rune source targets;
2. require exactly one complete four-rune page word with the target's exact GP0;
3. form the subtraction key from that unique receiver;
4. apply H;
5. ignore `H3=-H2`, because it is forced by GP0 equality;
6. score only the three non-automatic conditions above.

There are **62** unique four-rune source-state page/target pairs in this matrix.

Exactly **two** satisfy all three non-automatic H conditions:

```text
p33 / signed33 WILL  / start132
H(key) = [23,8,2,27]

p40 / signed40 PATHS / start71
H(key) = [14,8,3,26]
```

Both are identity page/index pairings. No non-identity member of the 62-pair charged family satisfies the residual criterion.

This is the correct familywise evidence for the shared H structure. It is stronger than the earlier two-page 144-shell count because it conditions on the same state-selection step that produced the receivers and removes the algebraically automatic coordinate relation.

## Canonical same-index census

Printed `/` line breaks and whitespace are typographic wraps and do not terminate a word. Under that canonical segmentation, same-index source-state hits occur at:

```text
6, 11, 21, 33, 34, 38, 40
```

P33 WILL and p40 PATHS are the only four-rune identity cases. This prevents using another same-index four-rune page as an untouched transfer without an additional source selector.

A temporary p36 GOOD experiment was invalidated because an experimental parser incorrectly split a printed line wrap into a word boundary. The apparent p36 four-rune fragment is part of a longer printed word and supplies no GOOD receiver.

## Source-visible pairing

The p33/p40 relationship also has source/layout support that does not use their inverse keys.

Across the complete ink annotations, the only exact two-word red spans with printed word lengths `[e,g]=[3,5]` are:

```text
p33 start91 length8 -> [3,5]
p40 start0  length8 -> [3,5]
```

The authenticated source interval from word33 through word40 is:

```text
33 WILL
34 BE
35 FOUND
36 GOOD
37 LUCK
38 BEWARE
39 FALSE
40 PATHS
```

It contains exactly `A=8` words and the endpoint rise is `g+K=7`.

These observations support treating p33 and p40 as a related pair. They do not fix the particular state labels assigned to H0 and H2 before the inverses are known.

## P50 register downstream page-direction hypothesis: rejected

A tempting two-anchor extension applies the already conditionally authenticated p57 register to the p33/p40 local inverse words, then interprets the quotient as Latin-letter count and the remainder as a forward page displacement:

| Receiver | GP0 address | Authored p50 byte | divmod29 | Latin letters | Proposed destination |
| --- | ---: | ---: | ---: | ---: | ---: |
| p33 WILL | 57 | 118 | [4,2] | 4 | p35 |
| p40 PATHS | 54 | 156 | [5,11] | 5 | p51 |

The apparent p33 alignment is attractive because p33+2=p35 is already the independently recovered RISE→FOUND handoff. But this is not an independent confirmation: the proposed output type was inferred after seeing that handoff, and p40+11 merely lands on the final page of the numeric table. Separately, neither [4,2] nor [5,11] is one of the five frozen p57 typed DH pairs; the held-out 2016 pair-inventory result therefore does not authenticate WILL or PATHS.

The decisive control applies the same fixed GP0→p50→divmod29 map to all 43 words of the authenticated 2016 signed message and asks whether quotient equals the source word's Latin-letter count. The authored table order yields 10 hits: THE (six occurrences), EPIPHANY, WILL, LUCK and PATHS. All ten proposed destinations happen to lie within p0–p55. However, across all 256 cyclic rotations of the same 256-cell table, the authored order has 10 hits while shift144 has 14 (the unique maximum); shift4 has 13. The authored ordering is therefore not selected by this predicate. Repeated THE occurrences account for most of the canonical hits.

Reject the proposed quotient=Latin-length / remainder=page-displacement interpretation. Preserve the raw table lookups [4,2] and [5,11] as arithmetic observations only. The p33→p35 route remains supported by its independent red RISE and FOUND evidence; do not count the p50 lookup as a second confirmation. This test does not weaken the p57 serialization result at its original solved-p57 scope, but it supplies no unknown-page key, typed page pointer, or new plaintext.

Reproducer: sims/lp2_2016_source_word_p50_register_rotation_control_sft.cjs.

## Fixed-anchor H-orbit continuation (Agent17, 27 November)

A new direct decipherment test freezes the existing local subtraction keys, rather than estimating any further LP2 key. The canonical H4 map is invertible over GF(29); use either (H) or (H^{-1}) as a deterministic four-rune key-state update, emitting the state components in their published order. Start with the existing WILL33 or PATHS40 key, consume its four known non-F runes, then apply the same update continuously through the rest of that physical page. The direction of iteration is an exploratory choice, not an authenticated first-party instruction. No phase, sign, reset or seed search; ignore printed boundaries. Ordinary consuming subtraction and the authentic LP1-style plaintext-F bypass are separately tested. The latter is inverted exactly by DP over consuming clock and last plaintext rune; F may either hold or be an encrypted non-F output, while a consuming plaintext F is forbidden.

The original suffixes contain 78 (p33 offsets136–213) and 156 (p40 offsets75–230) runes. An independently trained GP29 bigram model (47,662 Gibran donor runes, additive 0.5 smoothing) gives these results (nats/rune, larger better):

| Seed | H ordinary | H inverse ordinary | H F-hold first impossible index | H inverse F-hold first impossible index | Minimum equal-length native score |
|---|---:|---:|---:|---:|---:|
| WILL33 | -4.776091 | -4.293647 | 27 | 24 | -3.291440 |
| PATHS40 | -4.511375 | -4.566762 | 30 | 4 | -2.949326 |

Failure indices are zero-based relative to the first unknown suffix rune. All four F-hold candidates have **no complete legal inverse**, independent of language scoring. All four ordinary inverses exactly replay their input but are incoherent and score below every equal-length contiguous window in the nine external solved records (2,277 and 1,774 windows respectively). On 24 same-key generated controls using three distinct native sections, the decoder recovers 2,805/2,808 runes (23/24 exact complete continuations); every true control path remains admissible. The single ambiguous control is p40 H forward with F holds on WISDOM (153/156), so F-hold language selection is not assumed unique. These are planted controls, not authentic evidence of H iteration.

There is also a score-independent shared-state obstruction. In the outer and inner coordinate pairs, H acts as the same matrix [[1,-1],[1,1]]. Consequently H² is a quarter-turn times 2, H⁴ = -4 I, and H²⁸ = I over GF(29). Both anchor orbits have exactly 28 states (112 emitted shifts). Exhaust all 112 cyclic consecutive four-shift windows in each orbit and each direction: **neither key occurs anywhere in the other orbit**, including non-block-aligned positions. Because both candidate words contain no F, a literal-F hold clock cannot change this four-consuming-shift requirement. Thus no common uninterrupted H/H-inverse orbit can generate both anchors in either direction, irrespective of intervening F masks or distance. Even the wider block-aligned common pair similarity (aI+bJ applied identically to outer and inner pairs) cannot connect the two: the outer pair uniquely fixes (a,b)=(14,20), predicting inner [14,0] rather than [20,12]. The reproducer enumerates all 841 such matrices and all four cyclic streams.

**Decision:** retire these two deterministic H-orbit continuation laws under the fixed additive seeds and clocks. They neither authenticate nor disprove the earlier four-rune candidates, and do not exclude other state transitions or actual key changes. No unknown plaintext. Input blobs, all original outputs, exact replay and controls are in [raw output](lp2-hshell-fixed-anchor-iterated-key-output.json); [reproducer](../sims/lp2_hshell_fixed_anchor_iterated_key_sft.cjs). The experiment ran in connected V8; the standalone Node wrapper was not independently run.

## Exact shared homogeneous recurrence inversion (Agent41, 27 November)

Unlike the fixed H/H-inverse orbit and period-four reuse tests, this attack grants **every stationary homogeneous order-four GF(29) additive key recurrence** `k[i]=a*k[i-1]+b*k[i-2]+c*k[i-3]+d*k[i-4] mod29`, including lower-order cases. The two already published WILL and PATHS candidates supply complete four-symbol key states; there is no language-score fitting or new key-role selection. The model is exploratory rather than first-party authenticated; its purpose is to determine whether both four-rune candidates can belong to one short, continuous, reusable key mechanism, across printed page transitions.

Canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`: start physical p33 offset132, end of p40, 1779 runes. The second crib begins at relative offset1619, leaving 156 untouched suffix runes. The keys are [25,5,26,2] and [20,20,12,6]. All 29^4=707281 tap vectors were generated and checked at the exact ordinary clock distance and every possible literal-F held clock distance 1581..1619 (38 visible zero runes between the anchors). For each matching tap/gap, exact forward reachability permits a hold iff ciphertext=F, or consumption iff C−K≠F, forcing both the known second non-F word and its consuming position. No word boundaries are assumed. The ordinary case has **zero matching tap vectors**; the F-hold case has **46 matching tap/gap pairs before the intervening ciphertext test, zero legal paths through the second crib**. Thus no suffix is opened for either model.

Two same-length positive controls repeat the actual clear 95-rune p57 sequence, replace the two anchor words at the same offsets, and generate ciphertext with independently chosen tap vectors (3,5,8,2) ordinary and (23,5,6,15) F-hold. The ordinary control retains its true tap among three candidates (not unique); the F-hold control has 113 prefilter pairs, exactly one complete legal candidate, the planted taps at consuming distance1568. The controls establish reachability and enumeration, not linguistic authentication or unique recovery of all F masks. The original calculation is an exact all-key exclusion conditional on both proposed cribs, no resets, homogeneous order≤4 and the stated two clocks. It does not disprove either local candidate separately or arbitrary nonlinear/higher-order/state-reset schedules. No plaintext recovered.

Reproducer: `sims/lp2_will_paths_anchor_lfsr4.cpp`. Compile `g++ -O3 -std=c++17 sims/lp2_will_paths_anchor_lfsr4.cpp -o /tmp/lp2_wp`. From repository root run:

```sh
python -c 'import json;d=json.load(open("resources/liber-primus/lp2-corpus.json"));p=d["pages"];f=lambda a:"".join("0123456789abcdefghijklmnopqrs"[x] for x in a);print(f(sum((x["indices"] for x in p[33:41]),[])[132:]));print(f(p[57]["indices"]))' | /tmp/lp2_wp
```

Locally compiled and executed against connector-exported canonical tape and p57. Output RESULT columns are ordinary tap count, F-hold prefilter tap/gap count, legal prefix pair count, legal full pair count: original `0 46 0 0`, ordinary plant `3 40 0 0`, F-hold plant `2 113 1 1`. The ordinary and F-hold counts are separate hypotheses on each planted tape. No CI was invoked. Do not repeat arbitrary short homogeneous tap sweeps for this exact pair.

### All affine order-four extension

Grant an arbitrary fixed additive bias `v` to the same recurrence (20,511,149 coefficient vectors including zero bias). This is not a fresh source-selected family: it is the complete affine relaxation of the preceding four-state model. For fixed taps, compute the homogeneous output `h_i` from the first crib and the unit-bias response `r_i` from four zero initial values. For each potential consuming gap solve the four equations `h_(g+j)+v*r_(g+j)=K_PATHS[j]` over GF29; where all four responses vanish, keep all 29 biases iff all equations hold. This avoids enumerating each bias's entire stream. No candidates are discarded by language scoring before exact reachability.

Locally compiled C++ run: original **33** ordinary candidates, **1,099** F-hold prefilter tap/bias/gap triples, **zero** legal F-hold paths through the second crib. Exact ordinary candidates all re-encrypt 1779/1779. Rank ordinary candidates on the 1615 intervening runes *excluding both cribs*, then freeze the best (12,14,20,16; bias9) for the 156 untouched runes after PATHS. Pinned 3510-rune LP1-reference GP29 trigram model with add-one smoothing: best fit −3.396581 nats/rune, frozen suffix −3.435581, maximum suffix over all 33 −3.339892. All 33 full decoded IoCs lie .0341890–.0347669 and none gives coherent text. Across all length-matched contiguous windows in the independently pinned 62,492-rune Gibran control, the worst scores are −3.075399 (60,878 fit-length windows) and −3.221241 (62,337 suffix-length windows); higher is better. The true p57 source control scores −2.468145. Thus all original candidates fall below the finite independent control ranges in both splits; this is a calibrated rejection, not a theorem about arbitrary plaintext distributions.

Same-geometry p57-repeated plants with biases7/13: ordinary plant retains true (3,5,8,2;7) among 30 exact candidates; F-hold plant retains true (23,5,6,15;13) at consuming distance1568 as the sole full legal candidate among 2442 prefilter triples. The other 30 ordinary candidates on the F-hold plant are a rival model, not the planted truth. No claim of unique ordinary recovery or unique F masks. Both p57 plants use repeated donor text, not independent natural-length prose; the separate Gibran window control supplies a more meaningful language reference. Raw exact decoded candidates, full replay, training scores and input blobs: [JSON](lp2-will-paths-affine-recurrence-output.json).

Reproduce with the previous compile/pipe command substituting `sims/lp2_will_paths_anchor_affine4.cpp` and saving stdout to `/tmp/affine.stdout`, then `node sims/lp2_will_paths_affine_score.cjs /tmp/affine.stdout`. C++ executed locally; scoring core executed against pinned inputs in connected V8; standalone Node scorer not separately executed. Exact original output: `33 1099 0 0`; ordinary plant `30 1746 0 0`; F-hold plant `30 2442 1 1`. Retire shared continuous affine order≤4 additive recurrence between these cribs under both clocks; no authentic plaintext or key. This result does not exclude separate resets, higher-order/nonlinear rules, ciphertext-feedback generators, or different cribs. Do not extend tap sweeps absent a new independent source selector.

### Independent local-seed reset relaxation (Agent41, 27 Nov)

A further test grants independent recurrence states at the two four-rune anchors but requires the same stationary affine taps and bias. This accommodates separately initialized passages without using the intervening gap as a constraint. The original p33 suffix has 78 runes (4 ciphertext F); p40 has 156 (7 ciphertext F). Enumerate all 20,511,149 tap/bias vectors. Fit on p33 suffix only and evaluate frozen best on p40; separately record the exact number satisfying both finite Gibran control floors (all contiguous native windows, -3.320260 and -3.221241 nats/rune). F-hold scores maximize over **every** legal ambiguous mask, not a greedy decode. Both controls have the same geometry and separate native Gibran slices (offsets 10000 and 20000 in the canonical source-native donor).

| Mode | p33 clears native floor | Both clear native floors | Frozen fit / p40 | Best p40 among p33 floor-pass |
|---|---:|---:|---|---:|
| Original ordinary | 40,348 | 0 | -3.128182 / -3.413197 | -3.323435 |
| Original F-hold | 29,052 | 0 | -3.173836 / no legal path | -3.336306 |
| Plant ordinary (3,5,8,2;7) | 40,945 | 1 (true) | -2.945342 / -2.878900 | -2.878900 |
| Plant F-hold (23,5,6,15;13) | 7,735 | 1 (true) | -2.932191 / -2.878900 | -2.878900 |

Original F-hold p33 legal candidates = 5,974,270; planted = 2,609,740. The plant's F-hold p33 maximum is slightly higher than its actual donor score (-2.945342) due to mask ambiguity. True taps are recovered by p33-only ranking and by joint-floor criterion on each control; the held-out F mask is not asserted unique. No original candidate clears both floors, even allowing independently seeded states and exact optimal masks. As before this is a finite-control linguistic exclusion, not an algebraic impossibility of arbitrary non-native plaintext. The selected p33-only candidates are nonsensical on the original p40. Retire this shared stationary affine order≤4 model; do not increase order without independent source evidence.

Reproduce from repo root: `node sims/lp2_will_paths_reset_input.cjs > /tmp/reset.in`; compile `g++ -O3 -std=c++17 sims/lp2_will_paths_reset_affine4.cpp -o /tmp/reset`; run `/tmp/reset ordinary < /tmp/reset.in`, `/tmp/reset hold < /tmp/reset.in`, and append `plant` after the mode for each control. Local separate ordinary and F-hold C++ executables were run for all four searches; repository source consolidates the identical two algorithms, Node input wrapper is not independently run. Training/p57 scores independently matched to 1e-10.

### Hidden state modulo source 1033 or 3301 (Agent41, 27 Nov)

The printed cuneiform values motivate a **different** affine state family: `x_(i+1)=a*x_i+b mod m`, emitted key `x_i mod29`, m=1033 or 3301. Both moduli and direct reduction are explicit exploratory choices, not a proven authored opcode. Recover all `a,b,x0` from the first four-rune crib exactly: enumerate `x0,x1` with the observed residues and all a, solve b, check x2/x3. Continuous test jumps to every feasible second crib consuming offset and applies exact F-clock reachability. Separately intersect parameter pairs across the two independently initialized states, then evaluate both suffixes with exact best legal masks.

| Modulus | First-anchor states | Continuous ordinary | Continuous F-gap candidates / legal | Independent reset state pairs / both F-legal | Reset ordinary / F-hold joint native floors |
|---|---:|---:|---:|---:|---:|
| 1033 | 1,477 | 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3301 | 49,529 | 0 | 18 / 0 | 362 / 13 | 0 / 0 |

For m3301 even the best p33-only score among all matched reset state pairs is -3.353104 ordinary, -3.375172 F-hold, both below the p33 floor -3.320260. No original language candidate. The 1033 independent-reset case is an exact algebraic impossibility even before language scoring.

Controls use a=23,b=5,x0=76, and second independent seed127. Both continuous ordinary plants recover true state by long-fit ranking; both F-hold plants have nonempty complete legal candidates (5 and 2, not uniquely recovered). Reset plants retain joint-floor solutions in both clocks, but state nonidentifiability can produce equal p33 fits, so p33-only ranking is not guaranteed to recover the second state. Actual controls: ordinary joint-floor counts 7/7, F-hold 6/7 for moduli 1033/3301 respectively. This is a complete parameter-family result conditional on the two local cribs and direct state-mod29 emission, not an exclusion of other moduli or nonlinear generators. No unknown plaintext.

Reproducer: `g++ -O3 -std=c++17 sims/lp2_will_paths_source_moduli_lcg.cpp -o /tmp/lcg`; use previous `/tmp/reset.in`, run `/tmp/lcg plant < /tmp/reset.in` for originals and controls. Final C++ code executed locally with dynamic (not fixed-width) exact hold-count DP. The Node canonical input builder is shared with the reset relaxation.

### Exact ciphertext-feedback inversion from both anchors (Agent24, 27 Nov)

A distinct receiver replaces autonomous key evolution with the public history of consuming ciphertext. Let the six-tap affine law be

`C_i = P_i + b + sum_(j=1..6) a_j C_(i-j) mod29`.

Under literal plaintext-F holds, F emits ciphertext F without shifting the ciphertext register; a consuming plaintext F is forbidden. Ordinary consumption is tested separately. The four known non-F runes in each tentative WILL/PATHS anchor supply eight linear equations in seven coefficients. This tests every affine order <=6 simultaneously, including zero taps, with a continuous shared filter. For the hold model, enumerate every possible prior consuming register by allowing each observed zero to hold or consume; all nonzero ciphertext necessarily consumes. Solve the eight equations exactly by GF29 elimination for each pair of registers. Then enforce actual hold reachability between both anchors and to the end of p40 with no spacing assumptions. The first anchor's incoming histories relax prior legality, so failure is decisive. The seven-tap/eight-coefficient model is a deliberately saturated comparison; its fit is not independent evidence of a key.

Original corpus p33–40 has 1911 runes, anchors at offsets132 and1751 (p33:132 and p40:71); the held-out suffix after PATHS is 156 runes. Canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, native solved-source blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`.

| Order / clock | Anchor history pairs | Linear candidates | Complete legal candidates |
|---|---:|---:|---:|
| <=6 ordinary | 1 | 0 | 0 |
| <=6 literal-F | 2 | 1 | 0 |
| 7 ordinary (saturated control) | 1 | 1 | 1 |
| 7 literal-F | 2 | 2 | 0 |

All rank tests are full column rank. The sole six-tap hold candidate is [9,3,15,27,4,19,24] (bias first), which dies at p33 offset166, only 30 runes after WILL ends. The saturated seven-tap ordinary key [18,25,21,25,11,19,13,7] gives bigram scores -3.745955 on the intervening text and -3.769695 on the frozen suffix, versus -2.748519 on original clear p57 and -2.811617 on the 156-rune donor suffix. The decoded suffix begins ETSTLSOEOEXSOEOFMNPAEAETHGNGATHGPNNCIBIAINGNGDDCPISEL and is nonprose. Both seven-tap F-hold candidates fail at p33 offsets166 and216. The six-tap result is exact, independent of language scoring; the saturated ordinary seven-tap result is a predictive failure, not a general English impossibility theorem.

Two same-length native plants (WELCOME + KOAN1 + LOSS, trimmed and with anchors inserted at the original offsets) use independently specified keys and exact original geometry. Ordinary and F-hold controls each recover the exact planted six-tap key as the sole legal parameter candidate. Ordinary inverse recovers 1779/1779 runes; F-hold MAP recovers 1766/1779 with 466933209365773025280 legal paths, so exact key recovery does not imply unique F-mask recovery. Every reported MAP path re-encrypts exactly. Bigram model trained only on the other specified solved sections (warning, wisdom, jpg107-167, jpg229, p56), excluding the donor and p57. Exact source and output: [SFT](../sims/lp2_will_paths_cipherfeedback_anchor_sft.cjs), [raw output](lp2-will-paths-cipherfeedback-anchor-output.json). Core executed in connected V8; standalone Node wrapper has not separately run.

**Decision:** retire the complete shared continuous affine previous-ciphertext filter of order <=6 under both clocks, and the explicit order-seven continuation test. This is distinct from the earlier autonomous key LFSR and independently reset key-state tests. Conditional on both proposed cribs and the assumed recurrence; it neither validates nor disproves the local cribs themselves. No source-selected higher order or independent nonlinear feedback selector. No new plaintext.

## Evidence boundary

Preserve:

```text
p33 WILL  H(key)=[23,8,2,27]=[p,A,K,-K]
p40 PATHS H(key)=[14,8,3,26]=[-b,A,e,-e]
```

The correct shared evidence is the conditioned residual criterion over **62** unique four-rune source-state page/target pairs, with exactly those two hits.

The field-role labels `p,K,-b,e` were recognized after the local inverses. Fixed forward/inverse H-orbit continuation fails on both original page suffixes; the full joint-crib homogeneous order≤4 recurrence is exactly excluded under both clocks, and its all-bias affine relaxation is F-hold-impossible and ordinary-language-negative on every remaining candidate; even granting independent seed resets at both anchors yields no shared affine recurrence whose two suffixes meet the finite native-text floors. The continuous affine ciphertext-feedback extension of order ≤6 is also exactly excluded under both clocks, with the saturated order-seven ordinary continuation nonprose and its literal-F counterpart impossible. No reusable key evolution has been established. A decisive next promotion requires a first-party rule fixing the free H coordinates before another receiver is opened, or a genuinely prospective application in a different source-selected receiver family.

## Reproduction

- Conditioned full-matrix SFT: `sims/lp2_hshell_state_conditioned_crosspair_sft.cjs`
- Canonical same-index audit: `sims/lp2_sameindex_hshell_state_conditioned_sft.cjs`
- P33/p40 paired-page audit: `sims/lp2_p33_p40_shared_shell_sft.cjs`
- Corrected p40 inverse SFT: `sims/lp2_p40_paths_index40_local_inverse_sft.cjs`
- Direct repository calculation of the locked full-matrix script: **62 charged pairs, 2 residual hits, WILL33 and PATHS40 only**.
