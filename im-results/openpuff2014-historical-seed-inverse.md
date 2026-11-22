# 2014 OpenPuff password as an exact source-fixed LP2 key candidate

**Classification (Agent 35, 10 November 2026): completed, bounded negative.** The historical key family was actually inverted on original unsolved LP2 runes and passed its independent plaintext-recovery control. It yielded **no unknown original plaintext, recovered authentic key, cryptographic mechanism, or destination**. This is a source-key experiment, not an established result for `results/README.md`.

## Source and mechanism

A published historical account of the 2014 Cicada `Interconnectedness` challenge identifies the OpenPuff password **`33011033`** used to open an earlier hidden artifact; a second archive reports the related spelling `33011103`. Their pre-LP2 origin motivates testing both as *independently specified integer seeds*. Historical use of an OpenPuff password does **not** imply Cicada encrypted LP2 with this password, nor that it used Python MT19937. The tested hypothesis is deliberately narrower and explicit.

[2014 archive overview](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8) · [alternate-source archive](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md).

Use an independently implemented and known-vector-checked **CPython 2.7 MT19937** generator, initialized at each of the eight physical section starts from the chosen integer seed. Each state produces a 29-rune key symbol using one of five declared transformations: `getrandbits(31)%29`, `floor(getrandbits(31)*29/2^31)`, `(getrandbits(31)&255)%29`, rejection-sampled `getrandbits(5)` until <29, or `floor(29*random())`. The observed GP ciphertext obeys `C_i=(P_i + sign*K_j) mod29`, sign +/-1.

To permit the strong original adjacent-repeat deficit, a DP-inferred rejected key draw may precede any symbol only if the rejected tentative ciphertext would have equaled the *previous actually published* glyph. Allow at most one such rejection per rune and 34 per 240-rune section prefix; each costs 3.5 nats. Exact Viterbi optimizes the allowed key-consumption path using a smoothed GP-English trigram reference from the first 195,000 characters of the repo's pinned Shakespeare fixture. Source and ciphertext never supply a crib or unconstrained fitted key. The 30 candidate settings cover two historical seeds, a wrong-seed comparator `33011034`, five transforms and both additive signs.

Original data are the unmodified `resources/liber-primus/lp2-corpus.json` indices: **eight 240-rune section-openings = 1,920 original ciphertext runes**, taken from the full **12,956** unsolved source runes. Section boundaries in the source include the 9-rune p15 heading with p15–22; the source-aligned eight sizes used by this program are `[729,1145,1729,1903,1021,1433,1680,3316]`.

## Original-input and real inversion outcome

| Fixed-seed family, selected from five reductions and two signs | Mean original GP-trigram logscore per rune |
| --- | ---: |
| `33011033`, best: `word31mod`, additive sign +1 | **−5.6783282401** |
| `33011103`, best: `word31scale`, sign −1 | **−5.7390206623** |
| `33011034`, arbitrary adjacent wrong seed, best: `byte31`, sign −1 | **−5.7340728124** |

The best historical-seed plaintext opens `MHFNGIRNIDFEAEYHPIAYOFGOEAUGUDYRLNEDG...` in GP transliteration, visibly without coherent language. This original result is strikingly weaker than the source-native positive control's **−2.560069397** per rune. Being better than a single arbitrary wrong seed by less than a tenth of a log unit per rune after model selection does not recover a key.

**Fully real positive control:** encode **240 GP runes** from the *withheld Shakespeare continuation* after character 210,000, encrypt with source seed `33011033`, `bits5` reducer and positive sign, allowing each initial collision an 81% chance to consume one extra key. The actual generator consumes exactly **six** hidden skips. The model is not given the skip positions, the original text, or its seed among 30 candidates. On the resulting ciphertext the source seed and exact reduction/sign **rank first**, the decoder recovers **240/240** original plaintext runes, infers **six** actual skips, and re-encrypts byte-for-byte into its planted rune ciphertext. This verifies recoverability with nontrivial clock uncertainty.

The original challenge rejects only this finite direct-seed additive GP29 family. Different KDFs, OpenPuff's actual software implementation, a different cipher architecture, original plaintext registers other than GP-English, secret key-advance masks, or other clue roles remain untested.

## Execution

- **Source and assertions:** [`sims/openpuff2014_historical_seed_inverse.cjs`](../sims/openpuff2014_historical_seed_inverse.cjs) (Node 22-compatible, CommonJS). Uses existing checked-in `sims/instar2013_python_mt_inverse.cjs` for exact CPython 2.7 MT, `sims/grid_keyskip_viterbi.cjs` for source GP-English trigram and `sims/grid_stream_collision_viterbi.cjs` for exact collision-conditioned Viterbi.
- **Successful real GitHub Actions execution:** [run 42833833933](https://github.com/FlareZ123/liber-primus/actions/runs/42833833933), `base60-seeded-stream.yml`; no new automated workflow is required.
- Script reads only checked-in original ciphertext and language reference. Running `node sims/openpuff2014_historical_seed_inverse.cjs` prints all model choices, original scores, guesses and exact control assertions.
