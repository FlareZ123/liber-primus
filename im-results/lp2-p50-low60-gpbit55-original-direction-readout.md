# P50 55-entry GP29+direction schedule: direct page-rune readout

**Agent48, 22 November 2026.** Source-constrained original-ciphertext test. The only two fixed bit-to-direction polarities yield nonlinguistic 55-rune strings. No original LP2 plaintext, author-selected readout, key or final destination was recovered. This is a bounded decision on one natural consumer of the previously discovered schedule, rather than a fresh search for a numerical match.

## Independent starting inputs and literal hypothesis

The previous [low60 page-schedule study](lp2-p50-low60-gpbit55-page-schedule.md) identifies exactly **60** source table cells with a leading printed base60 zero. Under the historically used digit order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, the low-digit value `v` uniquely yields `q=floor(v/2)` and `b=v mod2`. The 55 values with `q=0..28` have the same count as the 55 **rune-bearing** unknown LP2 pages p0–55, after omitting source-rune-free p50. The five sentinel records `q=29` occupy table cells `[22,51,81,219,220]`.

The original signed 2016 instruction describes **numbers as direction**. A simple, human-executable candidate consumer is therefore: map the 55 non-sentinel table records to the 55 original rune-bearing pages in ascending printed order, use each `q` as a **zero-based rune offset** into that page, and use the record's `b` to choose **counting from the start versus counting from the end**. This operation needs no cipher-fitting, prime clock, hidden English crib, page permutation, transposition or extra KDF. The two bit-to-side polarities are the only alternatives because neither sign is printed in the original table.

The two core possibilities, in pseudocode, are:

```text
readout[p] = sourceRune[p][q]                      if bit==forwardBit
             sourceRune[p][pageRuneCount-1-q]      otherwise
```

Every target page has at least 76 runes, so all `q≤28` offsets exist. The original page order is unmodified, including the natural skip over numeric-only p50. The fixed GP29 mapping renders each extracted rune in its canonical Roman transliteration.

## Original 55-page output

| Parity interpretation | Actual source output | GP29 IoC |
| --- | --- | ---: |
| bit0 = forward | `ETXBGEGXTHUNTUAEAAEIAWDPPTHATHAJFEIEOLIARIMOJIAOFEAEOILOEYYFIAAEWNAEB` | **0.029629629630** |
| bit1 = forward | `MRHHREOTAPFWEAEDATNYDPIAIAEOGIAEYNATBITDXWXHELEJYCFXBSTDSOEOEOEO` | **0.036363636364** |

Both outputs consume **all 55 records** and **all 55 unique source pages**. Neither is a continuous recognizable GP29 English statement or an independently interpretable location/key. Isolated sequences like `THUNT` are insufficient, given 55 symbols and two allowed orientations. Both IoCs are close to uniform-GP29 values for this sample size.

A planted matched-source control takes the **first 55 authentic solved p57 PARABLE GP29 runes** and inserts one into each of the 55 selected source page slots, independently for each direction convention. The same readout retrieves **all 55/55** solved runes in either convention. This verifies selection, source page mapping, GP index handling and direction branch. It cannot validate a novel key.

## Research decision

The existing 60→55+5 factorization is a *candidate*, with no authenticated authorial instruction choosing it as a page key schedule. A conventional random 256-byte table can produce a sizable set of low60 cells and five high-valued tail records. This new test specifically excludes the **literal one GP29 rune per physical page, indexed by the record quotient and counted in the parity-selected direction** as a direct plaintext readout.

It does not exclude a future source-selected operation requiring a `(GP29 index, bit)` control pair per page. A promising next step would have to specify the consumer from an independent original clue and predict a held-out unknown-page plaintext segment, rather than tune more readout offsets on the same 55 outputs.

**Exact input:** `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/base60-grid.json`. **Read-only Node22/CommonJS reproducer:** [`sims/lp2_p50_low60_gpbit55_original_direction_readout_sft.cjs`](../sims/lp2_p50_low60_gpbit55_original_direction_readout_sft.cjs). Original output and planted positives are asserted in the executable. This is a negative intermediate result; `results/README.md` is unchanged.
