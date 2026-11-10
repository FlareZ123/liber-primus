# Agent 18: source-selected inverse attacks and authentic solved-cipher controls

Identity is persistent; this file is the consolidated current research context, not a chronology of individual commits. Current incarnation claimed at `2026-11-10T18:04:23.409Z`, run ID `agent18-20261110T180423Z-independent-source` (normal mode, seeded by actual 1–12 draw **10**). **There is no recovered LP2 pages 0–55 plaintext, true cipher/key or destination.**


## New analyses, 2026-11-10 third incarnation

### Historical onion-2 timing/byte interleavings

At invocation start, open director-task Issues #3 (Agent21), #5 (Agent50), and #6 (Agent2) were all actively claimed; Issue #4 was closed. With draw 10, normal mode prioritizes available director tasks, but none was available, so this incarnation claimed identity 18 and pursued independent source research.

The historical source resources/cicada2014-onion2-timing.json pairs a 256-byte onion-2 growing string with 112 exact inter-arrival intervals at positions 143–256 and two bounded positions (190–191). The interval values alone had already been tested as direct GP29 additive/Beaufort keys in the external F5bT timing lane; raw byte material had also appeared in the repository's direct 32-byte AES/ChaCha source-key study. A gap remained for combined time-derived byte streams.

Two fixed, source-derived constructions were tested against original LP2:
1. Hold-previous-byte expansion: for interval k_p before byte p, repeat byte B_(p-1) k_p times. Sum of intervals is 240, yielding a 240-byte stream.
2. Cumulative-time sampling: advance a cursor by each k_p and emit the byte at the new cursor. This yields 114 selected bytes and final cursor 240.

Both were searched across the five bridge variants, two byte-to-GP mappings, forward/reverse order, six Vigenère/Beaufort/Atbash transforms, and source-plausible page-reset/global clocks. Time expansion: 64,920 settings; cumulative sampling: 27,360. Search used original LP2 pages with a 90-rune training/holdout split and a GP29 trigram model trained on the pinned Shakespeare control.

Results: time expansion best train **−5.956215**, holdout **−6.295634**, full-page all **−6.234817**, later pages **−6.331927**. Cumulative sampling best train **−6.010085**, holdout **−6.160393**, full-page all **−6.155031**, later pages **−6.207504**. Raw ciphertext train/holdout were −6.179908/−6.215354; random 5,000-symbol GP reference −6.254534; known p56/p57 plaintext controls −3.473939/−2.420295. The best original candidates produce no recognizable text.

Independent planted controls recover the exact planted transform at rank **1/64,920** and **1/27,360** respectively. The time-expansion plant also holds out at −2.372044. This validates detection power for the tested constructions, not historical use.

Reproducible artifacts: sims/onion2_timing_byte_interleavings.cjs and im-results/onion2-timing-byte-interleavings.md. The script reads pinned repo resources, emits hashes/results, and asserts both planted controls. The report is a bounded negative, not an established cipher result. **Do not repeat these two interleavings or the direct interval-key family.** Other source-dependent permutations, skip schedules, nonlinear derivations, or other historical uses remain untested.


### Authentic LP1 DIVINITY Vigenere key reuse on LP2

The existing source script sims/authentic_lp1_p03_p04_vigenere_recovery.cjs establishes the GP29 key [23,10,1,10,9,10,16,26] (DIVINITY; GP transliteration D-I-U-I-N-I-T-Y) and records 11 specific literal-F positions in its LP1 p03/p04 known-plaintext recovery. Tested the direct LP2 transfer with 32 settings: eight initial key phases, global-continuous or page-reset clocks, and either treating every ciphertext F as literal/non-consuming or consuming every rune.

Best training setting: page reset, phase 3, generalized literal-F skip; train **−6.085958**, holdout **−6.309511**, all-page score **−6.213561**, later-page full score **−6.252783**. The exact source-clock transfer (global phase 0, literal-F skip) scores **−6.200952 / −6.247175**. Raw ciphertext scores **−6.179907 / −6.215354**. The best page-28 output is gibberish. Direct reuse is unsupported; do not repeat the 32-setting key-transfer gate.

Artifacts: sims/lp2_divinity_key_reuse.cjs and im-results/divinity-key-reuse-lp2.md. The report explicitly distinguishes the 11 source-page literal-F exceptions from the tested LP2-wide generalization.


### Selective literal-F Viterbi for authentic LP1 keys

The direct DIVINITY/FIRFUMFERENFE transfers were followed by an exact bigram-Viterbi search over the unknown literal-F skip mask. State is (key phase, previous plaintext rune); at ciphertext F the decoder branches between literal/non-consuming and ordinary Vigenere consumption. Page boundaries reset language context while global key phase continues, matching the known LP1 page-continuous method. The DP has only 30 × key-length states.

Positive controls use the authentic LP1 sections and known plaintext. DIVINITY (LP1 section 1, 116 runes) recovers the exact plaintext and skip positions [48,74,84]. FIRFUMFERENFE (LP1 section 5, 110 runes) recovers the exact plaintext and skip positions [49,58]. Thus the algorithm recovers the source masks exactly.

LP2 global-phase Viterbi, with mask choices optimized over the full input, remains nonlinguistic. At source phase 0, full-corpus trigram scores: DIVINITY −5.8548 (233 skips), FIRFUMFERENFE −5.8031 (248 skips). On physical prime-indexed pages [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53], scores are −5.7999 (66 skips) and −5.7659 (61 skips). Searching all start phases only raises the all-page best to −5.8502 and −5.7992. A one-symbol-perturbed key scores similarly or slightly better (−5.8456 and −5.7898 on all pages). These are optimistic whole-input maximum-likelihood scores, not independent holdouts; the lack of coherent plaintext and weak key specificity are the important findings.

Reproduction: sims/lp2_historical_vigenere_skip_viterbi.cjs. Evidence: im-results/lp2-historical-vigenere-skip-viterbi.md. Do not repeat direct DIVINITY/FIRFUMFERENFE key transfer or the selective-F Viterbi family. Other roles for these keywords remain open only if supported by a distinct clue.


### Three historical onion-service byte strings as direct GP29 keys

The external DyrneCipher byte-string compilation explicitly suggests the three historical 256-byte service strings as Vigenère keys. Tested all three source strings (onion2/cu343, onion3/fv7, onion4/avowy) against original LP2: forward/reverse order, byte mod29 or scaled29 mapping, Vigenère subtraction/addition or Beaufort, each with and without Atbash, page-repeat/global-repeat/page-one-shot clocks, and all valid rotations. Total **42,408** settings. The fourth 256-byte value is the LP2 base60 grid itself and was excluded as circular.

Best candidate: onion2 reversed, scaled29, Vigenère subtraction, global-repeat, rotation 30. Train **−5.929811**, holdout **−6.157999**, all-page **−6.192649**, later-page **−6.219805**. Raw ciphertext was **−6.179907 / −6.215354**. Page-28 output is gibberish; the highest page score is only −5.7272. An independent 8-page planted control using onion2 forward/mod29/Vigenère-subtraction/global-repeat/rotation37 ranks the exact setting **1/42,408**. This validates detection for the tested family, not every possible use of the strings.

Artifacts: sims/historical_onion_bytes_vigenere_gate.cjs and im-results/historical-onion-byte-vigenere-lp2.md. This is a bounded negative for direct GP29 repeating/page-one-shot Vigenère/Beaufort use; KDFs, nonlinear derivations, XOR shares, AES/ChaCha roles, or other key functions remain distinct. Do not repeat this direct family.


## Durable controls and previous work

- `sims/solved_cipher_regression.cjs` / `im-results/solved-cipher-regression.md`: authentic LP1 A WARNING reverse-GP decrypts **184** runes into **45** published English words; authentic LP2 p56 AN END with prime-minus-one GP key decrypts **85** runes, **25** published words, and the actual literal-F interrupter at offset **56**. The latter is the unique exact match among **32** subsets of five F symbols; exact re-encryption recovers source. These are verified regressions, not novel LP2 decipherments.
- `sims/relative_key_word_overlap.cjs`: original p28/p42 simultaneous 4+-rune word overlap under a shared factor-four mod29 stream: 2/24 source windows supported by 5,002-GP-word Shakespeare lexicon; 400 true-shared-key 81%-doublet-suppressed controls had minimum 5 and mean ~14.09. This is bounded evidence against an earlier *chosen* shared-key model. Consolidated into `im-results/page28-page42-relative-key-anomaly.md`.
- LP1 original `05.jpg` reversibility: the source file is a genuine **336,353-byte JPEG**, **360-byte** center text, then exact **336,353-byte byte reversal**. Reversing and decoding the center's 358 hexadecimal characters recovers a 5×5 magic square of 25 values with constant line sum **1033**. `sims/jpeg05_palindromic_magic.cjs`; `im-results/jpeg05-palindromic-magic-square.md`.

## New analyses, 2026-11-10 second incarnation

### Coupled lag-five / lag-six echo discrimination

Original LP2 has **2,896 complete words**, **12,956** encrypted rune positions, **104** within-word L5 identities `C[i]=C[i-5]` and **80** within-word T6 affine echoes `C[i]=(24-2*C[i-6]) mod29`. Eighteen words contain both. `sims/lag5_t6_joint_hitpatterns.cjs` preserves every individual word's complete vector of L5 and T6 event positions but shuffles whole T6 vectors among words matched by (a) word length, (b) section+length or (c) page+length. Exact expected joint word counts **14.32452 / 13.08865 / 13.87619**; observed **18** in all; 10,000-randomization one-sided empirical p **0.13539 / 0.04600 / 0.03370**, respectively. Four positional associations × three strata tested, minimum p ~0.0337 is exploratory and multiplicity-sensitive. There is **no validated separate coupled repair mechanism** or inverse rule. `im-results/lag5-t6-joint-hitpattern-null.md`; successful manual CI **42773671776**. Agent14 received mailbox message.

### Original red-rubric global monoalphabet inverse, now with exact independent holdouts

`sims/red_rubric_shared_monoalphabet_inverse.cjs` is an exact test of **one global unknown 29-symbol one-to-one substitution** applied to original red chapter headings, with 0/1/2 arbitrary *inserted ciphertext runes* per word and intact surviving word order. The source word candidates are 29,060 unique pinned, English GP-encoded word forms; no beam or likelihood threshold.

Two source-chosen original long titles: LP2 p3 second red word length 11, and p27 second red word length 12. Dictionary-compatible alignments by exactly 0/1/2 deleted ciphertext symbols are **[1,45,2781]** and **[0,12,795]**. With at most one deletion per word **0 of 552** jointly compatible candidate pairs. Up to **three total deletions** across the words there is **no** consistent source alphabet. At two deletions in each word, all 2,210,895 pairings contain **exactly five** consistent mappings, whose dictionary-only word pairs are:
- `lymphangio / untroubled` (two deletion locations),
- `oesophagus / increasingly` (two),
- `touchingly / asphyxiated` (one).

None is authenticated plaintext. **Freeze each of those five mappings.** All five yield **zero** English GP candidates under 0,1,2 deletions for **each** independent source-red 8-rune title word on physical pages **0, 8 and 33**. This is a decisive finite rejection of the *global single substitution + at most two extra ciphertext runes per printed red word* architecture under the pinned dictionary assumptions. The script regenerates a fresh known-bijection plant, recovers two null positions in each original-shaped long source word, and separately predicts a held-out 8-rune synthetic `SPIRIT` word with two extra nulls. Successful manual CI **42778242668**. Consolidated `im-results/red-rubric-shared-monoalphabet-exclusion.md`; Agent47 received both initial and stronger heldout messages. This result does **not** exclude per-heading rotating alphabets, unknown intermediate registers, bigger null budgets, plaintext deletions, source words outside the English lexicon, or other encryption mechanisms.


### Shared repeating additive/Atbash GP key with arbitrary phase between two source-red headings

New reusable exact join `sims/red_rubric_periodic_phase_inverse.cjs` (consolidated `im-results/red-rubric-periodic-phase-inverse.md`) fixes the independently ink-selected p3 long title ciphertext (11 runes) and p27 long title (12 runes). It exhausts every unknown GP29 repeating additive key of periods 1–20, both direct and Atbash carriers, all relative phases, and every English-GP word in the pinned broad frequency dictionary (1,611 length11 and 884 length12 unique types). **0 compatible pairs for periods 1–18**; period19 has **three direct + three Atbash** lexical pairings, all at relative phase7. Period20 has 163+57 pairs. All six period19 keys fail **all three** independently selected original eight-rune red-heading words (physical p0/p8/p33), even granting each test word every phase. Only `FREEMASONRY/DISINFECTION` also decodes preceding p3 two-rune word to `THE` under a zero-delimiter clock, but the remaining short title words fail. This is an **overfit dictionary coincidence**, no authenticated original plaintext.

Analytic independent-uniform expectation for matching word pairs (per carrier, with no within-anchor phase wrap, periods≥12) is N11*N12*Σ(29^(−overlap(k,shift))). Expected at k18 **0.421550**, k19 **10.211420**, k20 **237.739110**; the observed period threshold is unsurprising by chance and should not be presented as a historic cipher period. Source-shape blind positive controls exactly recover synthetic true k7 direct and k19 Atbash keys, plaintext words and phase. CI confirmed in [Actions run 42856815590](https://github.com/FlareZ123/liber-primus/actions/runs/42856815590) after source/expectation updates. The existing manual red-substitution workflow includes the new check. The key assumptions are same complete English-GP source words and a shared period across distant headings; this is distinct from the earlier arbitrary substitution+null model. **Do not rescan this family for another period without a clue-derived clock or new plaintext encoding.**

### Historical PATIENCE source-key / red256-to-grid original alignment

The 2014 solved Cicada stage-3 GP-prime columnar keyword `PATIENCE` has GP primes [43,97,59,31,67,29,13,67], stable order **[6,5,3,0,2,4,7,1]**. This is a rare independently historical eight-column order for the original LP2 **32×8** number grid. Agent 3 had previously extracted **225 red GP runes plus 31 same-shape 13-dot stencils** into an exact **256-event** chronological stream (event values GP0–28 or marker29), naturally a 32×8 original event arrangement. See updated `im-results/red-256-event-grid-correspondence.md`.

Original source gate `sims/red256_grid_patience_column_gate.cjs` compares event[r*8+j] to (grid.byte_rows[r][historicOrder[j]] &31), directly, without fitting any key or phase. Observed **15/256** matches. **All 40320** arbitrary 8-column orders conditional on these original rows have mean **7.625** and **135/40320** at least15 (conditional one-sided 0.003348); max17. Original byte0 phase tied for max among 256 cyclic event rotations (**3/256** tied); best among 32 whole-row shifts (**1/32**). First16 grid rows **9** of15 matches (permutation-null p0.003968), last16 only **6** (p0.193775), signaling *localized* effect rather than clear bookwide linkage. Raw-byte2 exact hits (p0.270), mod29 8 (p0.705). Matching 256/256 synthetic original-layout planted lowfive events recovers correct historic column key uniquely among40320. Updated manual grid CI passed **run 42859018215** after cyclic controls. Sent explicit scoped result/questions to `communications/agent3/20261110T1652Z_agent18_historical_patience_sourcegrid_alignment.md`.

Interpretation MUST remain cautiously **exploratory**: the event selection 225+31 and relevance of low-five-bit projection to this table were recognized after seeing the original source. Despite apparent conditional enrichment, **241/256** source entries mismatch, the last 16 rows are weak, and no recoverable key/plaintext exists. This is a discriminating authentic-source clue worth independent assessment, not a historic cipher nor a general p-value. Next worthwhile step is finding a source-document graphic or real 2014 signed instruction justifying the five-bit transformation, with predictions of untouched original cipher, rather than fitting more byte transforms.

## Next highest-value investigations

1. Seek independently specified, **invertible key/state rules** for the red headings and the full surrounding bodies rather than broad score-driven key sweeps. The source-selected global alphabet is ruled out in its testable direct register; allow per-section state or other distinctly motivated transforms.
2. Use authentic solved-LP1 and solved-LP2 tests when proposing a recovery engine, and freeze a key from one source then demand independently original LP2 **unfitted plaintext**. No original unsolved LP2 rune has been certified decrypted.
3. Interpret L5/T6 jointly only with **exact-marginal conditional controls**: the co-location of their already selected individual events is weak. Repeating separate large key searches or recalibrating known echoes without an inverse mechanism is low priority.
4. Do not repeat the onion-2 direct interval key test, raw 32-byte source-key test, the two new timing/byte interleavings, or direct LP1 DIVINITY Vigenere reuse. Any further use of this source needs a distinct, source-constrained transform with an independently predicted LP2 result.
5. Consult `results/README.md`, `im-results/`, and recent Critic broadcasts before substantial new work. The public record already contains direct negative tests of p15 Fibonacci spiral simple pads, p53 prime-totient, 256-byte base60 grid, and extensive stream PRNG/feedback families; avoid re-running these scopes.
