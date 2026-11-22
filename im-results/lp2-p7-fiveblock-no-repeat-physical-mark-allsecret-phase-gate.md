# Original LP2 five-rune block-no-repeat hypothesis: physical mark and phase impossibility

**Agent48, 22 November 2026. Scope:** Exact, finite original-input exclusion of a fixed five-position output-block architecture. It recovers no unknown plaintext, cipher key, or creator-selected opcode. The five-position hypothesis is motivated by the five original red words and five-dot figure on p7; their presence does not authenticate this operation.

## Exact source contract

Read the authentic runes in `resources/liber-primus/lp2-transcription.txt` into 55 rune-bearing LP2 physical pages, skipping the original rune-free p50; retain **12,956** GP29 runes. Count adjacent-equal transitions **within each physical page**: **86** original repeat destinations. Use `resources/liber-primus/lp2-ink-annotations.json` to supply all **31** original large 10-/13-dot marks on unknown pages. Of those marks, 19 introduce additional distinct internal subdivisions beyond the 55 page starts; other marks occur at page endpoints or duplicate an existing position. There are **74** resulting nonempty physical segments.

Hypothesis: within any block of five consecutive emitted GP29 runes, consecutive runes must be *different*. An equal adjacent pair can occur only at a boundary between blocks or at a true externally printed reset. We grant two extreme phase conventions for every segment: (a) phase0 at its actual first source rune, or (b) any one of five starting phases, chosen secretly and independently with perfect hindsight to maximize the number of explained original repeat events. The second convention strictly contains all five globally shifted alignments and all fixed page/mark phase clocks.

For a printed segment starting at rune offset `s`, assign each repeat destination `i` (except `i=s`) to residue `(i-s) mod5`. For fixed phase, only residue0 may be a block boundary; for an unknown segment phase, **at most the count in its most frequent residue** may land at block boundaries. Summing this exact maximum across segments gives an unconditional lower bound on forbidden repeat events regardless of any secret emission key, output alphabet, or prior five-rune-state algorithm obeying the block rule. An equal pair directly straddling a printed reset is generously allowed and does not contribute to the lower bound.

## Original result

| Declared output-block boundary privilege | Source intervals | Repeat events  | Maximum explained | **Minimum forbidden** |
| --- | ---: | ---: | ---: | ---: |
| Physical page starts, phase0 fixed | 55 | 86 | 18 | **68** |
| Physical page starts, independently optimal secret phase | 55 | 86 | 52 | **34** |
| Physical pages plus every original large mark, phase0 fixed | 74 | 86 | 17 | **69** |
| Physical pages plus every original large mark, independently optimal secret phase | 74 | 86 | 54 | **32** |

In the most generous original-source segmentation, **32/86 observed repeat events** have no permitted position in a strict five-rune adjacent-distinct encoder. None of the 86 is exactly on an internal printed large-mark reset. Independent fixed-phase counts (runic destination zero-based mod5) are **[18,21,16,11,20]** globally and **[18,20,22,15,11]** when resetting at physical pages. Among 63 within-word repeat events, the printed word-local phase counts are **[6,18,22,9,8]**, excluding a deterministic five-phase restart at every word as well.

A stronger candidate that requires **all five symbols of every five-rune block to be pairwise different** fails even if one grants the full continuous 12,956-rune stream one of five possible offsets. Between **537 and 587 of 2,591–2,592** blocks of five contain at least one repeated symbol, with **563–620** extra appearances.

## Cryptanalytic decision

The actual p7 five-dot/five-red-word clue cannot be implemented as an exact *fixed-position five-rune no-adjacent-equal code* with the original page and large-mark resets, even with a freely secret phase in every such segment, unless it supplies an additional state-dependent exception rule or other unprinted reset positions. Extra hypothetical exceptions would themselves need a source-derived reversible grammar. The test says nothing about a five-phase **keystream**, changing key state within blocks, nonlocal transformations, arbitrary unobserved block boundaries, or codes that permit internal repeats. It does not imply that the creator intended a five-rune output-block code.

**Reproduce**: [read-only Node22 CommonJS SFT](../sims/lp2_p7_fiveblock_boundary_impossibility_sft.cjs) · [Windows GitHub Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45010476720). The SFT reads the two existing original-source reference files, checks every count against exact constants and includes a non-repeating synthetic five-block control. A previous short nonclaiming [Director #2083 comment](https://github.com/FlareZ123/liber-primus/issues/2083#issuecomment-7077431495) reported the simpler fixed-phase finding; this consolidated report supersedes its scope with the all-mark all-secret-phase impossibility.
