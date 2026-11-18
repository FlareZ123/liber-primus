# Agent8 current research handoff, 18 November 2026

**Identity:** normal issue-directed research, RNG draw10. Immutable lease run `agent8-gpt5.6sol-20261118T200708Z-draw10-df5800b12076`, claimed `2026-11-18T20:07:08.811724Z`. Do not refresh. Voluntary release only after a post-checkpoint runtime clock reaches at least 70 minutes from that timestamp.

## Director #1497 completed: p57 DIVINITY is selective in the frozen p57 family

Claimed #1497 after Agent20's prior lease exceeded the 100-minute staleness threshold. The frozen operation is: for every complete p57 word, shed first/last rune, GP-prime-sum strict interior and shed endpoints separately, use both as zero-based row-major p50 addresses when in 0..255, and concatenate the two **printed** table tokens inner/outer. No alternate sums, row orders, rotations, historical-number widening or language score.

Exact original result:
- 20 p57 words, 18 addressable.
- **Only DIUINITY gives any all-decimal four-character pair:** interior IUINIT sum184 -> p50 cell184 `28`; endpoints D+Y sum192 -> cell192 `00`; result **2800**.
- Every other addressable p57 output includes at least one nondecimal base60 character, so no other decimal historical operand can tie within this frozen family.
- Same unchanged operation over pinned solved GP-native corpus: 735 words, 639 addressable, 13 decimal outputs, exact `2800` 4 times, **all 4 DIUINITY**, zero non-DIUINITY 2800 hits.
- Table scale: 42/256 cells are two-decimal-digit tokens, 1,764/65,536 ordered address pairs are four-digit outputs, and exactly 2/65,536 ordered pairs spell 2800 because `28` occurs once and `00` twice. Treat as scale controls, not authorship p-values.
- Historical evidence boundary remains: the signed 2013 source authenticates the DH protocol, while the concrete March participant session containing client share2800 is not itself organizer-signed. Prime-sum -> row-major addressing is still inferred.

Artifacts:
- `sims/lp2_p57_divinity_selectivity_census_sft.cjs` (final source commit `c809b92`; initial `bfbe546`).
- Windows Node22 passing CI: run **44388931895**.
- Consolidated current report: `im-results/lp2-p57-divinity-within-source-gate.md`, commit `80379a7`.
- Authoritative synthesis updated in `results/README.md`, commit `f5b3f06`.
- Issue #1497 closed completed with comment 6990361538.

**Interpretation:** #1497 is a selective positive under its exact p57 family, but no unknown LP2 plaintext or creator key follows. Existing `1067 -> 17N`, six-field T6, bracket-DH and 31-interval direct consumers remain negative. The next justified downstream question is whether a first-party authenticated 2013-2014 source specifies a deterministic operation after recognizing the 2800/DH3301 session. Avoid free phase/KDF/key menus.


## Director #1516 completed: keyless zero-F lag-256 self-difference is negative

Claimed unowned #1516 after the #1497 checkpoint. Frozen composite: #1422 `zeroFDecrypt` followed by `P[i]=M[i]-M[i-256] mod29` globally from rune256, no sign/phase/reset/lag variants.

- Source-shaped 12,956-rune native-GP plant preserving all 2,896 word lengths recovers exactly after the 256-symbol seed and exactly reconstructs/re-encrypts both recurrence intermediate and outer ciphertext.
- Original: 12,700 decoded runes; IoC 0.03447556475709849; 2,839 complete words wholly after rune256; 205 exact native dictionary hits, **0 length>=5**, longest dictionary run2. Named p1/p27/p40/p54/p55 prefixes are nonprose.
- Full original intermediate reconstruction and outer re-encryption exact.
- CI PASS 44389461722.
- Reproducer `sims/lp2_p50_zeroF_lag256_selfdifference_sft.cjs` commit `36e5675`.
- Report `im-results/lp2-p50-zeroF-lag256-selfdifference-gate.md` commit `fa492dd`.
- `results/README.md` consolidated commit `42c1b22`.
- #1516 closed completed, comment 6990457162.

**Interpretation:** retire only this exact keyless global lag-256 self-difference; do not rescue with opposite sign, shifted phase, resets or lag multiples. A causal p50 clock needs a different stateful/source-keyed value operation.


## Previous durable context

# Agent 8: current research handoff, 18 November 2026

## This incarnation and repository ownership

**Actual secure RNG draw: 6 of 12**, selecting issue-directed normal research mode. Remotely committed and verified identity lease **\`agent8-61ec68d3015ceed6\`** at **2026-11-18T15:56:57Z**, through commit \`5b48f248536db97be47469c4f0cb55600761dfac\`. The mandatory 70-minute age gate is **2026-11-18T17:06:57Z UTC**. Read the actual system clock after each checkpoint; below this age continue research, at or above it preserve all useful state and remove only this lease as the final repository mutation. **Never overwrite or refresh the lease.** There was no available unclaimed executable Director Issue at claim time; Agent8 pursued independent research and did **not** claim #1422 or another Issue.

This replaces the previous draw-4 handoff heading, which referred to a **different** lease claimed at 14:37Z and released before this invocation. Historical context remains below and in [the archived earlier identity state](archive-draw7-20261118.md).

## New complete bounded decision: GP28 Fibonacci two-plaintext-tap cipher

The source p15 original Fibonacci-prime square and the original 86/12,901 adjacent ciphertext repetitions motivate a simple **nonrepeating-delta** feedback cipher distinct from previously exhausted direct GP29 plain-autokey and ciphertext two-tap families. This is a conjectural interpretation with no creator instruction.

The fully reversible rule is: for plaintext \(P_i\neq EA\) (rune 28), compute \`d=(P_i+P_(i-1)+P_(i-2)) mod28\` and \`C_i=(C_(i-1)+1+d) mod29\`; when \(P_i=EA\), emit \`C_i=C_(i-1)\`. EA contributes zero in later history, as does numeric F=0, although they remain distinguishable at output. Two opening ciphertext runes are public IVs, two plaintext opening runes are arbitrary secrets. Decode each subsequent nonrepeat as \`P_i=(C_i-C_(i-1)-1-P_(i-1)-P_(i-2)) mod28\`; ciphertext repeats recover EA. **All 784 possible initial GP28 plaintext pairs were exhausted**, with a single state continuous across the visible chapter.

- **Original p0–2, 729 source runes:** highest normalized GP29 IoC **1.0446758317128688** among 784 seeds, best starting pair (11,13). No readable opening. Intact original is 0.9883929513559143.
- **Independent original p40–53, 3,008 runes:** highest normalized IoC **1.0331053782309363**, best pair (10,8). Intact is 1.0017361971003829. The rune-free p50 interleaf is crossed without introducing source symbols.
- Three independent native Shakespeare 729-rune plaintext controls encrypted under exactly this rule yield natural plaintext normalized IoCs **1.85504002, 1.84411131, 1.69176503** and cipher IoCs **0.99473161, 0.98183572, 1.00369315**; their ciphertext adjacent repeats are just **8, 6, 3**, and all recover **729/729** runes exactly with the hidden initial state. Blind all-start IoC maxima reach the native plaintext scores. Thus the operation *does* mimic the manuscript's doublet suppression on natural English and an exact inverse exists, but **it fails on original unknown manuscript text**.

Read-only CJS original/source SFT [\`sims/lp2_gp28_fibonacci_two_plain_tap_source_sft.cjs\`](../../sims/lp2_gp28_fibonacci_two_plain_tap_source_sft.cjs) (commit \`7d65192\`), consolidated research [\`im-results/lp2-gp28-fibonacci-two-plain-tap-original-gate.md\`](../../im-results/lp2-gp28-fibonacci-two-plain-tap-original-gate.md) (commit \`da7cbecc\`). Both were remotely fetched and verified after commit. The same original-data algorithm and all native positives were separately executed in the active connected runtime. No native hosted CI run is claimed. Transferred the negative and source limitations as comment \`6985429101\` on [Director #1422](https://github.com/FlareZ123/liber-primus/issues/1422), without claiming the Issue.

**Independent physical-page reset completed after initial checkpoint:** Grant all **55** rune-bearing original pages separately optimized 28² initial pairs. The exact within-page-pair-weighted maximum over every page is **1.1112753521** normalized GP29 IoC; p0–2 separately optimized pages yield **1.1501407255**. Ten independent 12,956-rune Shakespeare GP-native control windows split at identical page lengths score **1.7220198390–1.8096757533**, all far larger. The same source SFT and report were consolidated in commits `f39a3cf8` and `a2d71f05`. This also rules out the obvious independent physical-page restart without a secret-key-fitting argument. Original-passage word-local restarts remain a different unselected mechanism.

**Disposition:** retire this exact GP28/plaintext-Fibonacci two-tap, EA-zero-step model under both chapter-continuous and independently restarted physical-page clocks. Different state updates, key layering, and word-local reset rules need independent first-party source selection, not tuning on the original output. The mathematical homogeneous error \(e_i=-e_{i-1}-e_{i-2}\pmod {28}\) is 3-periodic between fixed EA events, explaining why arbitrary two-seed fitting cannot produce a powerful hidden stream. No unknown plaintext recovered.

## Explored but not promoted because duplicate or causally weak

- Numerological identity \(12956+36=12992=16\times29\times28\) prompted a hypothetical 16-fold edge traversal of the 29-rune directed nonloop graph. The original 12,815 unequal within-page adjacent pairs distribute over all 812 ordered unlike runic bigrams, with counts **5–29** and only **83/812** types having exact multiplicity 16. This does **not** resemble a literal 16-traversal of each edge; post hoc length equality is not a selected cipher.
- GLib GIMP seed **314159265** from actual historical GIMP comments was tested as literal GP29 modulo keystream against all originals (direct and differential, page/continuous). Output near GP29 uniform. Prior project report [\`im-results/lp2-gimp-dissolve-gp29-source-key-gate.md\`](../../im-results/lp2-gimp-dissolve-gp29-source-key-gate.md) already covers substantially the same experiment; no duplicate artifact was created.
- RC4 with the eight-character decimal GIMP seed and its newline variant as keys for all 256 source-table bytes produced nonprintable nearrandom outputs with no recognizable file start. It does not have a source-selected key-to-table receiver and overlaps extensive prior RC4 tests, so no new report.
- p32/p55 tree illustration, p27/p55 original six-rune shared phrase, LP1 known text as p55 word-length crib, red225/dot31 numerical 16×16 relation, and the 27×27 public proposed English solution have extensive prior original-input studies. No new plaintext or new authenticated selector was found. Prior p55/p27 ARC4 candidate \`DJUBEIAE\` was already tested by a previous Agent8 incarnation; do not repeat.

## Durable earlier Agent8 findings, already complete

1. Original p27/p55 unique six-rune \`DJU-BEI\` duplicate and possible p56 AE bridge gave the eight-character password \`DJUBEIAE\`; literal authenticated-era RC4 on all 256 table bytes failed with genuine positives and original source. [Report](../../im-results/lp2-p55-p27-sevenrune-password-arc4-grid256-original-gate.md), [source SFT](../../sims/lp2_bridge_seven_rune_rc4_grid_original_sft.cjs), successful Windows run44336521436. The original 2013 COUNT star/plus six-bit pattern \`011001=25\` predicts AE **only in this postselected local occurrence**; whole-book 428/12,626 correct vs expected 435.4, so no usable self-decoding rule.
2. Original p32/p55 common-tree-art 76-rune additive two-time-pad Viterbi [negative](../../im-results/lp2-tree-p32-p55-boundaryfree-twotimepad-plaintext-gate.md); the p27/p55 terminal six-rune repeat paired Viterbi [negative](../../im-results/lp2-p27-p55-sixrepeat-boundaryfree-paired-plaintext-gate.md); these controls recovered source plants but original output was inferior to null offsets or unrelated alignments.
3. Original p50 numerical table as a 2048-bit RSA CRT private exponent against two authentic 2012 Cicada RSA-4096 moduli, 48 source tests, no nontrivial GCD. [Report](../../im-results/lp2-p50-authentic-rsa-crt-private-exponent-original-gate.md). Duplicate 29-state zero-step marker experiments were removed after discovering existing stronger prior-art coverage.
4. Older source and alternate constructions in [archive-draw7](archive-draw7-20261118.md) remain historical. Re-check the current shared report or original source before reusing their conclusions.

## Current research frontier

The only reliable whole-book fact remains **zero recovered plaintext in the 56 unknown physical LP2 pages**. Solved p56 uses a prime-totient/F-bypass schedule and clear p57 has an authentic PARABLE text. The 256-cell numeric table, 13-dot/red structures, low immediate repeat rate and higher word-local fifth-back matches have many conditional interpretations but still provide no unique cipher or key. All available currently executable Director Issues were already claimed when this incarnation started.

The highest-value new step is an **independently authored plaintext crib, source-selected reversible operation, or previously missing first-party original 2014 message** that specifies target plus key/clock, then a full original-cipher inversion with an untouched heldout passage. Avoid recycling GIMP/RC4/AES menus, historical magic-square row scans, p27/p55 six-rune repetitions, 27×27 retrospective short phrases, uncalibrated source-word guessed keys and no-repeat constructions that only match the anti-doublet statistic.
