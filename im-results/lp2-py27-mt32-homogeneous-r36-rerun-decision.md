# Decision: homogeneous panel-R36 rerun of the Py2.7-MT exact lane is not justified

**Decision (18 November 2026).** Retire the proposed homogeneous full-`2^32` rerun as an active research task. Preserve `.github/workflows/agent20-py27-mt-exact-full-sweep.yml` only as optional infrastructure. The rerun does not introduce a new cipher hypothesis, a new scorer, a new threshold, or a source-authenticated key route. A full rerun could technically rescore a historical old-panel fraction whose detailed candidates were not retained, but no player-visible Cicada clue found in the audited primary corpus selects this generator family, and the already-completed exact-lane search produced no plaintext that survived independent holdout testing.

The accidentally launched full workflow run **44373166725** was cancelled after Director issue #1495 exposed the duplicated keyspace. The validated 65,536-seed smoke run **44373000495** is workflow evidence only; it is not new cryptanalytic evidence.

## Exact comparison with the completed #1202 lane

The proposed workflow and #1202 address the same fixed decoder cell:

| component | completed #1202 / frozen external lane | proposed Agent20 rerun | comparison |
| --- | --- | --- | --- |
| seed domain | all uint32 words, completed as historical cursor union + 96 missing shards | all uint32 words in 256 equal shards | same `2^32` domain |
| generator | CPython 2.7 MT19937 `init_by_array([w])` | same external `grind27.c` implementation | identical |
| GP29 reducer | `random29` | `random29` | identical |
| offset | 0 | 0 | identical |
| sign / transition | minus, `exact` / keyskip1 | same engine, `exact` | identical |
| stage-A length / beam | L=120, beam 64 | same engine defaults | identical |
| candidate bar | 5.0 | 5.0 | identical |
| claim bar | 7.6341931878728095 | 7.6341931878728095 | identical |
| R36 scorer | 12-register panel, SHA-256 `e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928` | same panel | identical |
| external source | commit `9087dc36b5aa64c1786428e32180261ab9420c29` | commit `6b945291ed298c14ccf8c73603f695a28f6a7e35` | later commit, same relevant blobs |

The relevant Round36 files are byte-identical across those two external commits:

- `grind27.c`: Git blob `192f12a8a5a8885ace19ce329962a3082386e0dc`
- `engine.dat`: `8cc56820cc8ec3936bde087081fcb113b32b3eb3`
- `panel_lm.f32`: `58586646d9e31e869d430c658b6520181da2f2a6`
- `check_panel_gate.py`: `5d34108c2970a2c9f451d04244320175e383e4c1`

So the proposed rerun is a repartitioning of an existing decoder/scorer, not a new measurement instrument.

## What #1202 already established

The historical exact lane had reached **2,235,695,586 / 4,294,967,296** seeds. Run **43612834637** then completed the remaining **2,059,271,710** seeds as 96 disjoint artifacts; strict merge run **43616793647** verified the coverage union. The newly enumerated part produced 234,296 stage-A candidates and exactly one claim-bar crosser, seed `1288211095` at pmax `7.839010536552472`.

Independent original-cipher oracle run **43619029318** rejected that candidate. Five unselected 120-rune windows scored only about 1.07–1.52, and the 729-rune output had GP29 IoC×29 = 1.01397. See `im-results/lp2-py27-mt32-s2-full-corpus-closeout.md`. No unknown LP2 plaintext or creator-derived key was recovered.

The important limitation is correctly preserved: the full seed-identity union is exhaustive, while the first historical fraction was scored under a mixture of the unrebuildable older panel and panel-R36. It is therefore not a homogeneous panel-R36 `2^32` score sweep.

## Can the historical fraction be rescored without regenerating it?

Only partially.

The surviving Round19 `top_S2.json` contains 1,024 seeds. Round38 already rescored all 1,024 under panel-R36. Of those:

- 949 were unchanged to <1e-6;
- 75 moved by >0.01;
- 72 moved down and 3 moved up;
- maximum upward movement was +0.88175;
- the only R36 claim-bar crosser was the already-known seed `35563892`, unchanged at 7.670723299260088;
- no other seed reached the 7.5342 near-miss level;
- the largest riser, `2286867315`, moved from 6.580 to 7.462 and then failed the 240-rune diagnostic.

Evidence: external `liber-primus/analysis/round38/S1-s2-windows/top_rescored.json` and `RESULTS.md`.

The later Round42 recovered snapshot retained only `STATUS.json`, an empty `HIT-CANDIDATE.json`, and `candidates_summary.json`. Its bulk `candidates.jsonl`, `top_S2.json`, and histogram were lost when the hosting project was deleted. The retained summary reports 38,576 candidates >=5.0, 44 >=6.5, five >=7.0, two >=7.3, and zero >=7.5342 or >=7.6342 for the recovered R36-scored state.

Therefore an exact homogeneous R36 rescore of the old-panel-only fraction cannot be reconstructed from retained candidate artifacts alone. A seed that scored below the old retention cutoff could, in principle, rise under R36. Round38 demonstrates that panel changes can move individual scores substantially. This is the narrow technical fact a rerun would resolve.

That unresolved score-classification detail is insufficient to justify the rerun, because the branch still fails the stronger route-selection test below.

## Player-visible selector audit

Searches over this repository's stable resources and the external primary-artifact corpus for `Python`, `Python 2.7`, `MT19937`, `Mersenne`, `Twister`, `random29`, `random`, and `seed` found no player-visible instruction selecting:

- CPython 2.7 MT19937;
- a 32-bit integer seed;
- the `random29` rejection reducer;
- offset zero;
- the exact/keyskip1 transition grammar.

This is a scoped source audit, not proof that no lost historical clue ever existed. The surviving evidence gives no authenticated causal step from a Cicada clue to this exact finite generator cell.

## Research decision

A homogeneous R36 rerun could change only the score classification of the historical old-panel fraction. It would not supply the missing reason to choose Py2.7 MT19937, `random29`, offset zero, and keyskip1 in the first place. The same decoder family has already yielded multiple selected-prefix crossers that collapse on held-out original ciphertext. Repeating all `2^32` seeds under the identical current R36 engine therefore has weak causal value toward plaintext.

**Do not dispatch the full workflow again unless new evidence supplies at least one of the following:**

1. an authenticated/player-visible clue that selects this generator/reducer/clock family; or
2. a genuinely new discriminating instrument plus a concrete reason its result would alter the plaintext route, rather than only re-rank an unsourced keyspace.

Until then, treat the workflow as optional reproducibility infrastructure and the exact Py2.7-MT branch as a bounded negative, with the existing mixed-instrument caveat stated precisely.
