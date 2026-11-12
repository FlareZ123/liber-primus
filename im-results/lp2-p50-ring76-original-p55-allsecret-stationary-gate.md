# Original p50 perimeter → p55: all-secret stationary symbol-map obstruction

**Status (12 November 2026):** exact negative for one source-sized deterministic transport family; no recovered unknown LP2 plaintext, historical key or complete decoder. [Standalone reproduction](../sims/lp2_p50_ring76_stationary_map_allsecret_sft.cjs) · [Earlier original 76/180 partition and direct-key tests](lp2-p50-76-perimeter-180-interior-source-partition.md).

## Source-selected input and proposed use

The physical LP2 pp49–51 original print shows a 32×8 numerical table. Its one-cell exterior has exactly **76 cells**, and the authentic unknown LP2 p55 carries **76 ciphertext GP29 runes**, including the carried first rune from p54. The solved p57 phrase “shed our own circumferences” makes perimeter extraction a human-reconstructible *hypothesis*, but supplies no conversion, target page, clock or key. The pairing is accordingly speculative.

The test takes the full, unchanged row-major table from `resources/liber-primus/base60-grid.json` and p55 rune indices from `resources/liber-primus/lp2-corpus.json`. It walks the outer ring once: top-left across the top, down the right, left across the bottom, up the left. The experiment also exhausts every one of its **76 possible initial cells** and both reading directions, so that uncertain natural orientation cannot rescue the result.

A stationary lookup `f` can have an **arbitrary secret output value** for each possible input symbol; no numeric or linguistic restriction is imposed on `f`. An exact transport would require `p55[i] = f(ring[i])` at all 76 positions. If a repeated input symbol requires different p55 outputs, no such map exists. For each source symbol `s`, the exact best arbitrary lookup can satisfy `max_r count(source=s,target=r)` positions; summing over `s` gives the global maximal match count. This is a family-wide upper bound even if the map's output alphabet is unrestricted. Allowing arbitrary cipher-table entries cannot evade these contradictions.

## Exhaustive original-cipher result

| Perimeter input register | Distinct labels / 76 | Best fixed top-left clockwise match | Best of all 152 orientations / 76 |
| --- | ---: | ---: | ---: |
| Literal two-character printed token | 68 | 69 | **71** |
| Literal interpreted base60 byte (0..255) | 68 | 69 | **71** |
| Byte mod29, native GP29 candidate | 24 | 26 | **34** |
| Byte low 5 bits | 27 | 28 | **35** |
| First base60 digit | 5 | 15 | **15** |
| Second base60 digit | 41 | 43 | **48** |

**Zero of 152** orientations per input register permits an exact 76/76 mapping. The strongest possible secret lookup from complete printed tokens still requires at least **5 exceptions**, even after selecting its orientation after observing p55. At fixed original top-left clockwise orientation, the genuine printed token `48` occurs at ring positions **26 and 27** (zero based) while the original p55 runes there have distinct GP29 indices **14 and 10**. Token `1K` occurs at positions **13, 38 and 71**, mapped by the original p55 ciphertext to **2, 23 and 11**; a single stationary lookup cannot produce those outputs. Printed tokens and canonical base60 bytes have the same equality classes, so an alternate one-to-one base59/base60 convention cannot repair this original-token contradiction.

The script checks unique perimeter coordinates, exact original p55 size/status, all 152 orientations for each register, full known expected maxima and a 76/76 **planted stationary-lookup positive control** for every register. This is exact finite enumeration, not a language-model, random-null, or “unreadable output” judgement.

## Interpretation and decision

The source-visible 76/76 length equality by itself does **not** select a cipher. This experiment rules out treating p55 as the original table-ring symbols passed through one global, memoryless lookup, regardless of the secret lookup and starting ring cell, for the six specified natural input registers. It also rejects a 29-symbol stationary bijective substitution after taking the numeric ring modulo29, because that family is a subset of the arbitrary lookups excluded above.

It does **not** reject the already-tested direct modular-additive/XOR perimeter keys, a position-dependent key stream, a stateful conversion, arbitrary reordering of nonadjacent ring cells, a transposition with unpublished clue, or a perimeter with different source dimensions. Some are already separately negative under finite tests: see the earlier perimeter report and [predecessor differential original-p55 gate](p55-grid-ring76-differential-gate.md). Do not treat this result as evidence that a new stateful mechanism exists. In the absence of independent source instructions fixing such a mechanism, discontinue direct arbitrary stationary ring↔p55 character-map fitting. A successful next route must derive the cipher consumer/key from external original clues and generate complete independently checked plaintext.
