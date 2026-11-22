# LP2 short-clause prime-sum parity obstructs non-F-count-preserving enciphers

**Original-manuscript necessary condition; Agent 6, 11 November 2026.** The unsolved original LP2 p0–55 ciphertext contains **70 clauses of at most 40 runes** under its displayed `.` and `&` punctuation. Only **37** have an odd GP-prime sum. If the unknown plaintext has the deliberately prime-enriched short clauses observable in Cicada's independently cleartext passages, a cipher that preserves printed clause boundaries and the number of **non-F** runes in every clause cannot preserve that enrichment, even if it inserts or deletes F nulls. The test is an exact key-independent obstruction for that class, conditional on transferring the authorial prime-sum habit. **No unknown plaintext, source-selected cipher, or key recovered.**

## Source antecedent and narrow cipher family

Liber Primus itself instructs readers to respect its *words and numbers*, and the GP alphabet assigns a distinct prime weight to each of its 29 runes. Cicada's earlier 2013 `761.MP3` metadata contains the numerical product of the three original p57 PARABLE body-clause prime sums `1259 × 1031 × 1229 = 1595277641`, already source-indexed in [the repository synthesis](../results/README.md). Thus deliberately chosen clause sums are plausible authorial constraints. External 2026 source-audited work independently measured **32/53 short solved body clauses with prime sums**, out of 76 body clauses in total, versus a ~14% shuffled-input reference ([source analysis and exact transcripts](https://github.com/pnotisdev/cicada3301/blob/main/work/prime_sums.py)). That study provides motivation, but LP2's plaintext need not follow the same style.

The test uses only original GP prime assignments and displayed punctuation. It covers any key schedule, page reset, arbitrary secret per-position substitution among the **28 non-F glyphs**, symbol reordering **inside a printed clause**, and even an arbitrary number of inserted or removed F-only null/escape runes. The invariant requires just the same **non-F symbol count modulo two per clause** on both sides of the cipher. Thus any decoder that transmits its non-F symbols through this sort of rank28/F-null channel must satisfy it. Mapping a source F into a non-F glyph, removing a non-F glyph, or changing clause boundaries can evade the result. The hypothesis that the unknown plaintext has similarly prime-enriched short clauses remains independent and unproved.

## Exact key-independent parity law

Every GP prime weight except F's is odd. The GP prime assigned to F is **2**, and the other 28 primes are **3–109**. For a clause of length `L` printed runes and `f` literal F occurrences,

`sum(GP_prime[rune]) mod 2 = (L - f) mod 2`.

No knowledge of any of the other 28 glyphs or the secret key is required. Replacing, rerouting or independently ciphering every non-F position does not change the sum parity. **Adding or deleting any number of F symbols also preserves it**, since F contributes even weight 2, so the same exact obstruction survives F-only null and escape handling with unchanged non-F count. Any genuine prime-summed clause with sum greater than2 must have **odd** parity, so an even-parity printed clause cannot possibly decrypt to a prime-summed clause under the restricted F-transparent model. Two positive controls replace every non-F rune independently by another non-F rune, and separately insert or delete F-only symbols, verifying each original clause's parity remains unchanged.

## Original-source counts

The [exact Node22 reproducer](../sims/lp2_f_literal_clause_parity_sft.cjs) uses `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`. Extract the first 55 rune-bearing pages, which contain the full **12,956 unsolved runes**, including any original page-spanning clauses. Split only on original `.`, `&`, `$` and `§`; printed word hyphens, line slashes and physical-page separators are not clause boundaries. This explicit whole-source rule retains headings, short standalone marks and all canonical segments, without a language heuristic or retrospectively removing difficult units.

| Source-original clause grouping | Short clauses, length ≤40 runes | Odd prime-sum parity | Actual prime-summed ciphertext clauses |
|---|---:|---:|---:|
| **Original unknown p0–55, all units retained** | **70** | **37** | 17 |
| Already clear LP1 0.2 SOME WISDOM | 5 | 4 | 4 |
| Already clear LP1 0.4 A KOAN | 17 | 11 | 9 |
| Already clear LP1 0.6 AN INSTRUCTION | 6 | 5 | 5 |
| Already clear LP2 p57 PARABLE | 4 | 4 | 4 |
| **Pooled original Cicada cleartext controls** | **32** | **24** | **22** |

The unknown printed source totals **175 clauses**, with **105** longer than40. Its 70 short clauses contain 33 even-parity clauses, excluding them from being GP-prime sums under the literal-F-preserving model regardless of other cipher transformations. The source-authentic plain controls have 22/32 = **68.75%** actual short-clause prime sums, and 24/32 = **75%** odd clauses. In the 70 unknown clauses, matching even the control **prime** fraction would require 49 prime clauses, thus **at least 12 clauses with changed F-parity**. Matching the control odd-parity fraction would require 53 odd clauses, thus **at least 16 changed F-parities**. These are deterministic lower bounds on necessary changed clause parities, without guessing which clauses, F locations, keys or plaintext words. A necessary parity change requires a change in **non-F count parity**, for example converting an F to a non-F symbol, deleting/adding non-F material, or using different plaintext clause boundaries. F-only nulls cannot account for it. The bound does not establish which operation was intended.

A conservative qualification: the four cleartext sources differ in genre and length from the unknown pages. The known prime-sum excess is strongest on short aphoristic clauses; unknown LP2 has much longer clause distributions. The matched short-length cutoff40 comes from the previously published solved-clause analysis and was fixed before counting the unknown. Here the control retains headings uniformly; statistical significance from 32 related sentences should not be extrapolated as an authenticated LP2 plaintext distribution.

## Reproduction and cryptanalytic implication

`node sims/lp2_f_literal_clause_parity_sft.cjs` checks every original count, all 29 GP weight parities, native source controls, a seeded non-F-replacement positive, F-only insertion/deletion parity invariance, and the exact two required parity-change bounds. It passed in [GitHub Actions run 43085645348](https://github.com/FlareZ123/liber-primus/actions/runs/43085645348), as a second independent stage of the manual-only 27group workflow.

**Decision:** a proposed LP2 decoder that preserves the count of non-F runes in every printed clause, including rank28/feedback ciphers with optional **F-only nulls**, encounters this necessary source-level obstacle if the intended plaintext follows the solved author's short-clause prime-sum habit. Enciphering F as a non-F rune, allowing non-F insertion/deletion, changing the clause partition or changing the plaintext style can evade it. An independently recovered plaintext candidate should be checked for prime clause sums alongside linguistic evidence and full original-cipher roundtripping. This invariant supplies **no plaintext** and cannot establish whether LP2 followed the solved author's prime habit.
