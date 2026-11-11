# LP2 short-clause prime-sum parity obstructs literal-F-preserving enciphers

**Original-manuscript necessary condition; Agent 6, 11 November 2026.** The unsolved original LP2 p0–55 ciphertext contains **70 clauses of at most 40 runes** under its displayed `.` and `&` punctuation. Only **37** have an odd GP-prime sum. If the unknown plaintext has the deliberately prime-enriched short clauses observable in Cicada's independently cleartext passages, a cipher that preserves original rune count, printed clause boundaries, and every literal **F versus non-F** position cannot preserve that enrichment. The test is an exact key-independent obstruction for that class, conditional on transferring the authorial prime-sum habit. **No unknown plaintext, source-selected cipher, or key recovered.**

## Source antecedent and narrow cipher family

Liber Primus itself instructs readers to respect its *words and numbers*, and the GP alphabet assigns a distinct prime weight to each of its 29 runes. Cicada's earlier 2013 `761.MP3` metadata contains the numerical product of the three original p57 PARABLE body-clause prime sums `1259 × 1031 × 1229 = 1595277641`, already source-indexed in [the repository synthesis](../results/README.md). Thus deliberately chosen clause sums are plausible authorial constraints. External 2026 source-audited work independently measured **32/53 short solved body clauses with prime sums**, out of 76 body clauses in total, versus a ~14% shuffled-input reference ([source analysis and exact transcripts](https://github.com/pnotisdev/cicada3301/blob/main/work/prime_sums.py)). That study provides motivation, but LP2's plaintext need not follow the same style.

The test uses only immutable original GP prime assignments and original displayed manuscript punctuation. It covers any key schedule, page reset, substitution cipher, polyalphabetic additive cipher, arbitrary secret per-position maps among the **28 non-F glyphs**, or symbol reordering **inside a printed clause**, provided the algorithm keeps every F=GP index0 position fixed as F and never creates new F at another position. Printed clause boundaries and total original rune count must also be preserved; a plaintext length change or F insert/delete evades the result. These are **necessary**, source-visible assumptions, not a claim that Cicada used a cipher of this kind.

## Exact key-independent parity law

Every GP prime weight except F's is odd. The GP prime assigned to F is **2**, and the other 28 primes are **3–109**. For a clause of length `L` printed runes and `f` literal F occurrences,

`sum(GP_prime[rune]) mod 2 = (L - f) mod 2`.

No knowledge of any of the other 28 glyphs or the secret key is required. Replacing, rerouting or independently ciphering every non-F position does not change the sum parity. Any genuine prime-summed clause with sum greater than2 must have **odd** parity, so an even-parity printed clause cannot possibly decrypt to a prime-summed clause under the restricted F-transparent model. A randomized positive demonstration replaces every non-F rune independently by an arbitrary other non-F rune and checks that all clause parities remain unchanged.

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

The unknown printed source totals **175 clauses**, with **105** longer than40. Its 70 short clauses contain 33 even-parity clauses, excluding them from being GP-prime sums under the literal-F-preserving model regardless of other cipher transformations. The source-authentic plain controls have 22/32 = **68.75%** actual short-clause prime sums, and 24/32 = **75%** odd clauses. In the 70 unknown clauses, matching even the control **prime** fraction would require 49 prime clauses, thus **at least 12 clauses with changed F-parity**. Matching the control odd-parity fraction would require 53 odd clauses, thus **at least 16 changed F-parities**. These are deterministic lower bounds on necessary changed clause parities, without guessing which clauses, F locations, keys or plaintext words. An F-parity change may require reinterpreting an F or modifying the plaintext/ciphertext length; it does not by itself prove a specific operation.

A conservative qualification: the four cleartext sources differ in genre and length from the unknown pages. The known prime-sum excess is strongest on short aphoristic clauses; unknown LP2 has much longer clause distributions. The matched short-length cutoff40 comes from the previously published solved-clause analysis and was fixed before counting the unknown. Here the control retains headings uniformly; statistical significance from 32 related sentences should not be extrapolated as an authenticated LP2 plaintext distribution.

## Reproduction and cryptanalytic implication

`node sims/lp2_f_literal_clause_parity_sft.cjs` checks every original count, all 29 GP weight parities, native source controls, a seeded non-F-replacement positive, and the exact two required parity-change bounds. It passed in [GitHub Actions run 43085645348](https://github.com/FlareZ123/liber-primus/actions/runs/43085645348), as a second independent stage of the manual-only 27group workflow.

**Decision:** if a proposed LP2 decoder assumes that F is copied literally through encryption *and* expects the solved manuscript's designed prime-sum pattern to persist into the unknown short clauses, that model has a specific source-level obstacle before any key search. A decoder permitting F as an encrypted rune, a special null/escape, insertion/deletion, or different plaintext punctuation avoids the obstruction and remains viable. An independently recovered candidate plaintext should be scored for prime clause sums along with linguistic and full-cipher roundtripping. This invariant supplies **no plaintext** and cannot establish whether the intended unknown prose followed the solved author's prime habit.
