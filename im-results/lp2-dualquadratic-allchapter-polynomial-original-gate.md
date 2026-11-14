# Dual-quadratic source factor as a whole-chapter polynomial inverse: exact original test

**Agent32, 14 November 2026. Classification: one bounded, source-shaped original-cipher negative. No recovered unknown plaintext, authentic key or destination.**

## Why this is a plausible direct operation

The original p50 numerical grid, read as the canonical 256-cell base60 byte sequence modulo29 and then as high-degree-first coefficients of a GF29 polynomial, is **exactly divisible by two independently visible quadratics**. Their sources are the historically signed 2013 BASE29 worked example `3QO → 3301`, interpreted as coefficients `[3,26,24]`, and the original p39 red isolated three-rune `[27,5,15]` inscription. The normalized product is

\[
F(X)=14+9X+13X^2+28X^3+X^4\pmod{29}.
\]

The existing [source and factor study](2013-base29-gf29-grid-factor.md) establishes the table identity, source caveats and GF29 polynomial orientation. A direct human-executable next step is to ask whether the **same degree-four polynomial transforms plaintext into ciphertext in the nine visually delimited LP2 chapters**. Under that interpretation each original chapter ciphertext polynomial must have **zero remainder on division by F**, after losing four GP runes of polynomial overhead. This is key-independent and much cheaper than tuning derived keystreams or word-level phases.

The manuscript does not explicitly command this transfer from the numerical table to original rune ciphertext, so the experiment is a conditional direct-cipher gate rather than an authenticated method.

## Frozen original-input computation

Use original 12,956 GP29 cipher runes from physical pp0–55, split at the independently ink-supported nine visual chapter boundaries. Take each chapter's printed rune order as descending polynomial coefficients, and perform exact monic GF29 long division by `F` with no fitting or phase selection. Independently try the completely reversed rune stream as a rival reading. Keep the actual source order, untouched runes and source-known chapter cuts. The numerical table itself is the positive origin control.

| Physical chapter | Original runes | Exact forward remainder (four GP29 residues) | Quotient IoC, forward | Quotient IoC, reversed |
| --- | ---: | --- | ---: | ---: |
| p0–2 | 729 | 9, 3, 17, 26 | 0.03417 | 0.03406 |
| p3–7 | 1,145 | 14, 10, 1, 19 | 0.03471 | 0.03476 |
| p8–14 | 1,729 | 16, 21, 1, 7 | 0.03434 | 0.03453 |
| p15–22 | 1,903 | 26, 3, 20, 15 | 0.03442 | 0.03477 |
| p23–26 | 1,021 | 9, 6, 13, 4 | 0.03426 | 0.03438 |
| p27–32 | 1,433 | 27, 2, 11, 5 | 0.03481 | 0.03457 |
| p33–39 | 1,680 | 7, 7, 8, 0 | 0.03456 | 0.03434 |
| p40–53 | 3,008 | 20, 14, 8, 28 | 0.03440 | 0.03452 |
| p54–55 | 308 | 9, 3, 19, 21 | 0.03263 | 0.03593 |

**Every original chapter has nonzero F remainder.** Consequently none of these nine original chapter streams is a direct polynomial product `F(X)·plain(X)` in the printed order. In both standard orders, the quotient GP29 collision frequencies stay near the uniform baseline `1/29 ≈ 0.03448`; no fluent GP-English is recovered.

The original numerical table **does** divide exactly, remainder `[0,0,0,0]` under precisely the same code. Positive source-native controls use the independently solved p57 PARABLE GP indices as 95-rune material, repeat them to the exact nine chapter lengths minus four, multiply by `F`, and recover **all planted symbols with zero remainder** in each case. This validates both the forward polynomial operator and its inverse independently of the original unknown text.

## Decision

The mathematical relationship between the signed-2013 operand, original p39 red triad and table remains a meaningful conditional source clue. This direct transfer supplies **no unknown plaintext**. Retire only whole-chapter, zero-check, four-rune-shortened GF29 polynomial multiplication by the fixed source factor. Nonzero incoming state, a different code boundary, alternative plaintext register and a separate source-derived keyed consumer are not excluded; none is selected by these inputs. Do not expand an arbitrary menu of shift clocks to rescue this specific failure.

**Reproducer:** [Node22 CommonJS original-source SFT](../sims/lp2_dualquadratic_allchapter_division_sft.cjs). It consumes unchanged `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json`, independently verifies the historical factor product, table divisibility, all original chapter remainders, and complete positive controls. Existing [manual source workflow](../.github/workflows/lp2-wordlength-frozen-source-retrieval-manual.yml) includes the test alongside independent previous source gates. The [complete original-input and positive-plant run 43616782286](https://github.com/FlareZ123/liber-primus/actions/runs/43616782286) passed on 14 November 2026.
