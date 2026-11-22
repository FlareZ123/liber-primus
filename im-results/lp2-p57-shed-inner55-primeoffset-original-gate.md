# P57 word interiors as per-page prime-start offsets

**13 November 2026, Agent50. Classification: bounded original-cipher negative.** No unknown LP2 plaintext or authentic key was recovered. This report concerns the *all-symbols-consume* version of a direct prime-totient cipher, explicitly separated from Agent10's stronger literal-plaintext-Fehu skip-cursor feasibility analysis.

## Human-solvable clue and fixed source choice

The solved original p57 PARABLE includes “shed our own circumferences” and “find the divinity within.” Its **20 fully printed words and 95 GP29 runes** yield exactly **55 strict interior runes** when each word's first and last rune are removed. The unknown physical pp0–55 have **55 rune-bearing pages** because p50 is a numerical table without runes. A human can therefore map the 55 inner values in order onto 55 original pages without tuning a key.

P57 word lengths are `[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]`; their strict interiors (zero-based GP indices) are:

`[24,4,24,17,20,10,5,9,15,16,24,1,9,9,18,20,1,4,0,24,5,1,15,8,18,1,7,10,4,5,1,19,0,18,4,18,9,5,18,10,9,10,1,10,9,10,16,10,2,10,9,19,18,4,6]`

The vector sum is 573. All 95 source p57 rune indices match the canonical corpus and original printed word divisions exactly.

The 2016 signed instruction that numbers are the direction motivates testing the **three canonical, source-defined numeric readings** of each key rune: (i) GP alphabet index 0–28, (ii) its GP prime weight, and (iii) that prime's Euler totient, prime−1. A single direct operation is chosen from the genuine p56 known method: let `q[0]=2,q[1]=3,...` be the consecutive primes and let `s[p]` be the per-page key numeral. Then test

`candidate[p,j]=(original[p,j] ± (q[s[p]+j]−1)) mod29`.

The per-page clock starts at the source-derived offset and advances on **every** source rune, including Fehu. Page boundaries reset the clock, and numeric-only p50 consumes no key symbol. This is a fully reversible fixed-clock prime-pad analogue, **not the exact solved-p56 cipher where literal plaintext Fehu is an interrupter**. The alternative literal-Fehu skip model has its own previously completed all-secret feasibility analysis, and these results must not be read as superseding it.

## Results, 12,956 original unknown runes

| Source interpretation of each p57 interior rune | Subtract totients IoC | Add totients IoC |
|---|---:|---:|
| GP ordinal 0–28 | **0.03447388179259219** | **0.034473143015656474** |
| GP prime weight | **0.034478314454206495** | **0.03448794238588488** |
| GP prime totient | **0.03451726706393006** | **0.034502777503384374** |

The source ciphertext has IoC **0.03447839786450569**; genuine solved p57 has IoC **0.0627099664**. Every six whole-book candidate remains essentially uniform and nonlinguistic in direct GP29 transcription. No unknown plaintext is identified. Exact decryption/re-encryption holds for all 55 source pages for each variant. All **330** independent page-specific positive controls, containing original native GP plaintext plants from solved p57, recover their plaintext when encrypted under the respective frozen model. These are implementation checks, rather than independent evidence that a historical key was found.

The test uses the printed original `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, without selecting offsets from ciphertext. Its standalone CommonJS source is [the original-input SFT](../sims/lp2_p57_shed_inner55_primeoffset_sft.cjs); the updated six-model test **passed in its isolated manual GitHub Actions job** ([run 43378085559, job 131729200958](https://github.com/FlareZ123/liber-primus/actions/runs/43378085559/job/131729200958)). The unrelated legacy job in the same multi-job manual workflow failed; the independent source-key test was successful.

## Decision

The exact p57 55-symbol extraction remains a real source-side numerical clue; the direct six fixed-clock prime-totient consumers above **do not** turn it into plaintext. Do not expand this into unselected prime phases, independent signs on pages or rescues by arbitrary cipher layering.

**Important overlapping work:** Agent10's contemporaneous [literal-Fehu skip feasibility gate](lp2-p57-shed-primecursor-fskip-gate.md) proves an even stronger result about the *authentic p56 interruption law*: many original pages cannot be decoded under any 0–109 prime-start offset with that law, even with arbitrarily chosen secret per-page offsets and F positions. The present six-score table addresses only the alternate all-runes-consuming convention and documents numeric reading ambiguity; it is **not** new evidence for the 55-character correspondence as an authentic LP2 key.
