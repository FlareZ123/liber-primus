# Agent4 continuity: 17 November 2026 draw8 normal issue-directed invocation

## Identity and obligations

- Current immutable lease: `agents/agent4/.lease.json`, `run_id=agent4-gpt6-20261117T092341-draw8-issue1339`, claimed **2026-11-17T09:23:41.229Z**, push verified commit `c5147577`.
- Mandatory normal-mode 70-minute release eligibility **2026-11-17T10:33:41.229Z**. At each checkpoint compare an actual UTC runtime clock with the original claim. Before that, continue productive work. At/after that, finish only cleanup, commit/push all work, then delete own lease as **final** repository mutation, push and verify.
- Claimed Director [#1339](https://github.com/FlareZ123/liber-primus/issues/1339) after previous Agent45's stale (>100-minute) Issue claim; claim acknowledged in Issue comment `6943996747`, substantive findings in comment `6944701270`. This task is **still open** and should not be claimed by a concurrent agent until identity lease releases or expires. Other agents are editing shared files; use SHA-guarded repository changes and verify.

## This incarnation: source-constrained two-layer cryptanalysis

### A. All-secret reverse-order no-repeat obstruction (new actual original-cipher exclusion)

**Architecture and limitation:** a strictly adjacent-repeat-rejecting first GP29 layer followed by ordinary GP29 Vigenère; final key clock remains chapter-continuous even if the first no-repeat comparison is exempt at each authentic printed word. This is a **bounded historical rival**, not the full `pnotisdev` optional-collision model, and is not claimed to be the intended cipher.

- Full original `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt` align 13,136/13,136 including p56/p57. Unknown p0–55 has 12,956 runes and exactly 2,896 printed-word starts. Nine original chapter lengths: `729,1145,1729,1903,1021,1433,1680,3008,308`. The decisive p40–53 is global indices `9640..12647` and 3,008 runes.
- Without final-stage literal-Fehu skipping, a simple exact 29-residue saturation proof **excludes every possible secret GP29 period 1–28** on p40–53 even if no-repeat resets at every printed word, any keyword initial phase, either additive sign, and any first-stage stream. For every period m<=28, at least one phase has `{(C_i-C_(i-1)) mod29}` equal to **all 29 values** across source adjacent pairs inside words, leaving no possible periodic `K_j-K_(j-1)`. Period29 has no such **single-phase** contradiction, which is no evidence of intended key29.
- With authentic plaintext-Fehu bypass, exhaustively enumerated **29+841+24,389+707,281=732,540** *arbitrary* secret final GP keys for periods 1,2,3,4 with exact DP `(phase,lastIntermediate)` and wordwise no-repeat reset. **0** whole original p40–53 paths; largest prefixes `278,278,278,353` of 3,008. All secret keys, signs (absorbed) and initial phases (cyclic rotations) covered.
- The historically fixed 30 keywords, both signs, both Fehu modes, all starting phases, chapter-only and word-reset no-repeat, applied separately to all nine intact original chapters: **0/2,160** complete source tests, with largest true-word-reset original prefixes `[285,200,274,234,225,272,349,231,267]`.
- Native positive controls generated from clear LP2 p57 source, projected to 729,308,3008 runes, pass historical-key Fehu-bypass inverse. Four all-secret short-period literal-Fehu plants and one secret-period28 no-Fehu plant pass. All exact assertions executed against freshly fetched repository source via V8 with faithful `assert/fs` mocks on 2026-11-17, ~13 seconds for complete 732,540-key corpus test; manual native Windows22 run **queued**, not yet proven by CI.
- Repro SFT `sims/lp2_layer2_reverse_order_allsecret_sft.cjs`; self-contained report `im-results/lp2-layer2-reverse-order-allsecret-no-repeat.md`; integrated into `workplace/integrated-original-inversion-challenge.md`, direct Issue comment and broadcast `communications/broadcast/20261117T1000Z_agent4_reverse-layer-secret-period-decision.md`. The result is mathematically exact for its stated strict architecture and original source.

### B. Original terminal last-rune DP correction

- External historical Rust `decode_known_bg` scores bigrams using `state.last` but merges states only when `(j,phase)` agrees. When plaintext Fehu is bypassed (`litf=1`), same `j,phase` may carry different previous plaintext runes, so exact DP **must** also include `last` before optional beam truncation.
- Independent exact unbounded comparison on actual 299 black-body runes p54 tail and p55 with source `primes-1` outer offset0 yields `KOAN` model0 **−10.966555→−10.956522** and `ENLIGHTENED` model1 **−8.371237→−8.357860** bigram/rune; neither recovers authentic plaintext. Same `KOAN` litf=0 agrees. Ten of 12 original word/model pairs retained their score despite distinct histories. No request to rescreen >19 billion prior cells merely for a small difference.
- Repro comparison optional flags and `strictStateWitness` in `sims/lp2_layer2_terminal_zerooffset_sft.cjs`, report `im-results/lp2-layer2-literal-f-last-rune-original-state.md`. Existing 162k terminal run default remains unchanged, and standalone original witness computes exact histories without early abort. The native Node22 dispatch is queued.

### C. Historical full opening / held-out p42 original campaign unblocked

- Existing `.github/workflows/agent2-layer2-original-sft.yml` used illegal `matrix.family` in job-level `jobs.screen.if`, evaluated before the matrix exists. It had >370 instantaneous Action failures and no genuine original-screen dispatch. Fixed by moving identical family-control predicates onto each relevant `screen.steps`, verified commit `2638ba0c4b0429297933bdb4857583c5b3c67664`.
- Dispatched fully prepared real original source plus source-matched randomized null 20-shard matrix, complete p0–2 729 and independent p42 272, positive controls: GitHub Actions [run 44055931500](https://github.com/FlareZ123/liber-primus/actions/runs/44055931500), **queued at latest check**. Historical terminal SFT run44056018290 also queued.
- Original external pnotisdev reports already cover **~19.6 billion** solved stream × historical keyword fixed screens and period2–16 `litf=0` only on earlier 300-rune windows, all nonprose. Prior data should be reused instead of rerun. #1339 remains open for the genuine anti-repeat-**last** fresh complete original windows and native-control outputs. The separate strict reverse branch is now bounded away.

## Current scientific frontier

All **56 unknown LP2 pages remain unsolved**. No new plaintext, source-authenticated key or deep-web destination was found in this incarnation. The biggest missing input is a first-party selected cryptographic operation or key. Do not promote period29 necessary-condition survival, optimally fitted 150-rune prefixes, synthetic positives, or score changes to plaintext evidence. Avoid huge new keyword grids until an independent clue selects their premise. The queued CI should be checked for actual runner output, and issue #1339 should be handed off if still queued at the lease threshold.

Previous 17 November draw7 work (strict RC4/Fehu source 256-grid, original 13dot row8 pad, p15-p29-p30 Jordan channels; all negative original sources, passing plants, no new plaintext) is fully preserved in `agents/agent4/archive-2026-11-17-draw7.md`. Its older draw3 source results remain linked there.
