# Original GP29 pointer-direction pilot, 17 November 2026

**Status:** Negative pilot slice. No recovered unknown Liber Primus plaintext or selected key. The complete 18-convention × 581-key two-window stage1 is running separately.

## Question and source-driven mechanism

The signed January 2016 Cicada message says that Liber Primus words are the map and their numbers the direction. Issue [#1329](https://github.com/FlareZ123/liber-primus/issues/1329) operationalizes *direction* as a forward/backward key-pointer walk selected once per printed ciphertext word by its position, length, or previous word's GP29 rune-index / prime-number values. It is distinct from a wordwise sign switch. This is a hypothesis: the clue does not specify a cipher key, rule, or pointer convention.

The experiment used the independent, pinned [pnotisdev/cicada3301 source commit `15200c67abee106913ba01ff504c5b6e88d16cc7`](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen), including `pdir_ref.py`, `pdir_pilot.py`, `dirrules.py`, its Rust `pdir=` engine, and independent `pdir_selftest.py`. Original GP29 equality against the local repository's 12,956 unknown runes was asserted before any test; 66 unique source-number rules, 581 selected flat-IoC key streams, all eight eligible original section windows and the engine's planted-reference-null controls also passed. The 2,896 printed word lengths agree exactly with the local source; nine external segments have different selected boundary cuts from the eight local chapter groups, but the physical rune and word order is the same.

## Frozen pilot scope and result

Run: [GitHub Actions #44006263630](https://github.com/FlareZ123/liber-primus/actions/runs/44006263630), successful, job 133782270041, uploaded [266 output files (artifact 14294834322)](https://github.com/FlareZ123/liber-primus/actions/runs/44006263630/artifacts/14294834322). Source script `sims/lp2_pdir_issue1329_gate.py` and manual workflow `.github/workflows/agent13-pdir-original-campaign-manual.yml`.

- Original windows: `seg0.7` and `seg0.8`; first 300 runes of each, not all 56 LP2 pages.
- First convention `pdir=000` (read-then-step backwards, no interword pointer move, compare against previous emitted rune); pointer pad 300.
- All 66 printed-word direction rules, both orientations = 132 vectors; 6 deterministically strided key streams of the 581-name flat library; both key multipliers 1/28 and both skip/coin anti-repeat models; 6 matched pseudo-random keystreams with the same scope.
- **Original best normalized IoC 1.3436**, `B7_prev_n`, reversed pointer direction. 3/132 original vector maxima >=1.30, none >=1.35, none >=1.40. Median of maxima 1.2596. Next best: `C_prev_f` reversed and `A_prev_f` reversed, both 1.3010.
- **Matched random best 1.3301**, `B5_prev_R`, forward pointer direction. 5/132 null vector maxima >=1.30, none >=1.35, none >=1.40. Median 1.2641. Next best null `C_cur_wp` forward 1.3223.

Preregistered candidate gate `IoC >=1.40` over the first 300 runes was not reached. The original maximum exceeded the matched null maximum by 0.0135, insufficient to establish a cryptographic signal. The permitted conclusion is **no original hit in this pilot slice**. It says nothing decisive about the remaining 575 key streams, 17 other pointer conventions, additional windows, unlisted source-derived keys, or variants using other word reset semantics.

## Follow-on tests already executing

[Six c=0 conventions with 12 disjoint rule shards](https://github.com/FlareZ123/liber-primus/actions/runs/44006868510), and [twelve remaining conventions with 12 disjoint rule shards](https://github.com/FlareZ123/liber-primus/actions/runs/44007390480), each use all 581 library key streams on the same two original windows, with matched 581-stream random controls for conventions 000, 001 and 002. Their outcomes are **not included** in this pilot conclusion. A candidate would need whole-window re-decode, margin over 20 random same-stream offsets, coherent authentic plaintext, and independent original forward checking. The campaign cannot prove or disprove the signed clue's wider meaning.
