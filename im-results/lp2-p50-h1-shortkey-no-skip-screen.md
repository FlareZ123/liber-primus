# p50 remainder stream + short keyword: no-skip H1 screen

**Status:** negative for the tested zero-drift additive submodel; not a rejection of the full R4/skip/null H1 hypothesis.

## Question

The independent `pnotisdev/cicada3301` research programme leaves open a two-layer family: a source-selected structured stream (t_j) combined with a short keyword (w_{j\bmod L}), under word-local repair/null and key-pointer drift. The p50 256-byte table is a candidate structured stream; `ANEND`, `PARABLE`, `DIVINITY`, `INSTAR`, and the p6 red span are source-visible candidate short keys.

This pilot tests only the simplest form:

[
P_i = C_i - (t_{i\bmod256}+w_{i\bmod L})\pmod{29},
qquad
t_j=\operatorname{byte}_j\bmod29.
]

No R4 rewrite, inserted null, key-pointer skip, or offset search is included.

## Inputs and controls

- Original p50 256-byte table: `resources/liber-primus/lp2-grid-256.json`, row-major byte order.
- Original LP2 rune indices: `resources/liber-primus/lp2-corpus.json`; unknown pages 0–55 contain 12,956 runes. The p51–55 tail contains 842 runes.
- p6 red key: exact 11-rune span at page-local offset 71 from `resources/liber-primus/lp2-ink-annotations.json`.
- Short keys use the GP29 source orthography. In particular, DIVINITY is `DIUINITY` because V→U; the other tested spellings are `INSTAR`, `ANEND`, `PARABLE`, and the exact p6 red span `ATXBMGIASBXEO`.
- A p57 known-plaintext plant round-trips exactly under each composite pad (five positive controls).
- A deterministic uniform-rune null stream uses seed `0x51a7c0de`.

Reproduction: `node sims/lp2_p50_h1_shortkey_no_skip_screen.cjs` from the repository root.

## Results

Baseline LP2 unknown-stream IoC is **0.0344784**. The p50 remainder stream IoC is **0.0371630**; after subtracting it, residual IoC is **0.0344672**.

| Short key | GP29 spelling | Full LP2 IoC, (C-K) | Full LP2 IoC, (C+K) |
|---|---|---:|---:|
| DIVINITY | DIUINITY | 0.0344653 | 0.0344628 |
| INSTAR | INSTAR | 0.0344625 | 0.0344668 |
| ANEND | ANEND | 0.0344803 | 0.0344633 |
| PARABLE | PARABLE | 0.0344566 | 0.0344747 |
| p6 red span | ATXBMGIASBXEO | 0.0344817 | 0.0344996 |

None improves on the ciphertext baseline or produces readable plaintext. The p51–55 tail checks are similarly unpromising. After subtracting the p50 stream, the largest periodic IoC for periods 2–30 is **0.0347395 at period 27**; the deterministic random null's maximum is **0.0346112 at period 22**. This tiny difference is not a useful periodic-key signal.

## Interpretation and next decision

The tested p50-plus-keyword **zero-drift additive form is not supported**. Do not spend more effort on these exact pads without new source evidence.

This is not a full test of H1. A genuine H1 attempt would need to specify why the p50 table is the selected (t_j), specify the keyword and phase independently, and implement the R4 rewrite plus word-local null and key-pointer skip model with planted positive and negative controls. The current result must not be cited as excluding that richer model.
