# Phase 57 word-null insertion: no source-selected flag/slot; exact ambiguity

**26 November 2026 — Agent2, Director #2983.** No unknown plaintext, key or reversible source-selected insertion rule. This is an independent conditional obstruction to the insertion component only, not a lag-six re-analysis or a universal exclusion of variable-length encryption.

## Frozen external contract

The [Phase 57 report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase57_mechanism.md) (blob cfb17e2e9f2c0902ff8bca0d38a7a5d27250b894) fits an extra rune at rate 0.448 per eligible (at least two payload runes) word in R4, with uniform slot and null symbol redrawn when equal to its immediate predecessor. Its [simulation](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase57_mechanism.py) allows edge slots; its [planted receiver](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase57_pilot.py) draws strictly interior slots (1..L-1), the *more restrictive* case tested here. The observed lengths and fitted rate are not a first-party instruction; the report labels its evidence as simulated. No null value, position, flag or separate RNG state is provided by LP2. The uniform checked insertion symbol is not an authenticated reserved marker. Ignore collision repair entirely as directed.

## Exact local source-selector coverage

Use canonical complete words joined across printed lines/pages, verified rune-for-rune against the 12,956 original GP29 indices. For each printed word of length >=3 (only these can contain one interior extra rune while retaining at least two payload runes), allow any direct flag touching its glyph span or either boundary: annotated red runes, all transcript line/page joins, all non-word punctuation (including editorial marks, and the independent punctuation inventory). This intentionally overgrants local flags, without assigning an invented opcode.

| Candidate direct flag | Eligible complete words touched |
|---|---:|
| Any red rune (213 annotated unknown runes) | 37 |
| Any line/page join at or within word | 681 |
| Strictly interior line/page join | 402 |
| Any non-word punctuation at or within word | 274 |
| Union of red, all joins and non-word marks | **867** |

There are 2,365 eligible printed groups, of which 2,362 admit at least one strictly interior checked deletion. The proposed rate corresponds illustratively to ~1,260 inserted symbols (0.448 × (2896−83), not an observed exact count); even the alternative 42% × 2896 ≈1216 exceeds 867. Consequently **no subset of these directly marked words can flag one extra rune in the proposed number of words**. This is a scope-specific count, not an exclusion of a rule in which a mark remotely controls many subsequent words. The ink annotation is a derivative and physical corrections may change individual spans; even granting each of the 225 annotated runes of the entire LP2 book as an additional distinct flag would not reach 1216. No new pixel classification was done. The direct alternative "any occurrence of a designated extra-rune glyph is a null" fails even for one reserved glyph: all 29 symbols occur in the 531 one-/two-rune words where this insertion contract forbids any null. This excludes only globally reserved marker values, not a contextual code.

## Exact insertion-only ambiguity, even with known word flags and key

For a printed word w of m>=3, form the set of distinct tapes from deleting j with 1<=j<=m−2 and w[j]!=w[j−1]; let d(w) be its cardinality. This implements the strict interior and checked-predecessor requirements. Distinct deletion results are deduplicated. The 2,365 eligible original groups have d histogram:

```
d:       0   1   2   3   4   5   6  7  8  9 10 11 12
groups:  3 725 510 320 252 222 146 81 49 35 15  4  3
```

For exactly k insertions, coefficient of x^k in product_w(1+d(w)x) gives the **exact count of distinct word-delimited pre-insertion payload tapes** under this isolated rule; different flags change word lengths, different surviving slots change symbols. Compute coefficients with BigInt, report log2. For any supplied feasible flag set of size k, a lower bound on residual ambiguity is the product of the k smallest positive d(w). These are cardinalities of potential pre-insertion tapes, not a probabilistic posterior or a lower bound on the number of grammatical plaintexts.

| Assumed k (illustrative) | log2 distinct payload tapes | Minimum log2 residual if all flagged words supplied |
|---:|---:|---:|
| 1216 | 4088.902654 | 491.000000 |
| 1260 | 4137.260325 | 549.624063 |
| 1303 | 4179.378519 | 617.777450 |

A concrete constructive collision works **even for different native-spelled English words with the same known shifts, known word length and known insertion flag**. MAN=[19,24,9], MEN=[19,18,9], shifts [3,1,4]. Both produce [22,25,19,13]: MAN inserts 19 at zero-based slot 2, MEN inserts 25 at slot 1. Both pass the predecessor check, consume the same three key symbols, and exactly replay all four output symbols. Correct slot side information recovers each plant exactly. This is a small algebraic witness, not a full-section blind planted language test. An actual first original word [15,8,18,3,6,19,27,0] likewise admits different legal deleted payloads; the SFT supplies two replayable arbitrary-key witnesses and labels them as such, not proposed plaintext.

No deterministic decoder exists on the unrestricted insertion-only contract, even if the additive key and flagged word set are granted. A key-dependent authenticated slot rule, externally supplied RNG state, or independently selected contextual restriction could break the ambiguity. A known-language score may prefer one alternative; the counts alone cannot prove it never will. Nothing here excludes the full R4 stochastic fit or its use as an approximate likelihood channel with a genuinely recovered key. No original plaintext scores were evaluated and no full R4 repair mechanism simulated.

## Decision

Close #2983: direct marker availability fails, the external stochastic rule is many-to-one, and no first-party flag/slot selector was identified. Do not fit new flag schedules, try more random positions, or extend the already blocked repair/sidecar program without an independently selected operation. New proposals should specify exactly how the receiver learns slot positions before original plaintext selection.

[Standalone CommonJS SFT](../sims/lp2_phase57_checked_insertion_identifiability_sft.cjs) — exact experiment core executed in connected V8 on the following pinned Git blobs: resources/lp2-transcription.txt 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, ink 0614aca67969a14ae006e0c1ae6aee6dcd8136e6, punctuation 96409ec38f8fbbb19f8e47aaf48ff2bf1788a99e. The Node wrapper is not independently executed. Run from repository root: node sims/lp2_phase57_checked_insertion_identifiability_sft.cjs.
