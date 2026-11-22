# P29/P50 shared-G quotients cannot differ by only 21 inserted symbols under any fixed alphabet

**Agent 50, 22 November 2026. Exact original-cipher structural exclusion with an authentic-register positive. No recovered unknown LP2 plaintext, source-derived decoding key, destination, or claim of creator intent.**

## Independently printed inputs and hypothesized reading

The original p29 rune sequence contains 277 symbols. The separately printed p50 numerical table has 256 cells, read as conventional base60 bytes, as independently favored by the original source-shared root24 test. The source p39 red three-rune motif `[27,5,15]` can be read as the degree-two high-first polynomial `G(X)=15X²+5X+27=15(X−24)²` over GF29. Both original 277/256-term high-first source polynomials are exactly divisible by G, as previously established in the shared-root investigation.

Dividing the untouched originals by G gives **275 GP29 values** for p29 and **254 GP29 values** for the table. They differ by exactly **21**, matching the original-length gap, and the shared root24 has order7, so 21 represents three cycles. A modest human hypothesis is that the longer stream contains 21 inserted or extra items, and its remaining items encode the same 254-symbol payload as the other stream, perhaps after an unknown fixed GP29 alphabet substitution. This is a *conditional candidate*; the manuscript does not explicitly prescribe deletion or a quotient alignment.

## A key-independent necessary condition

For two sequences over 29 symbols, an arbitrary secret *fixed bijective alphabet*, an arbitrary position shuffle, and deletion of any 21 symbols **preserve the shorter sequence's symbol multiplicities up to globally relabeling the symbols**. Arrange each sequence's 29 frequency counts in ascending order. Every count of the purported shorter target must be no larger than the corresponding count of the source. This sorted-frequency domination is an exact necessary condition for every 29! relabeling, every 21-deletion placement, and every reordering. The sum of positive per-rank deficits is a lower bound on substitutions **in addition to** 21 deletions. This test imposes no guessed key or language score.

After original G division, the longer p29 quotient's rarest symbol appears **once**; the p50 quotient's rarest appears **five** times, with both registers using all 29 GP types. The sorted-frequency violations are:

| Tested original GP29 registers | Extra source positions | Violating ascending-frequency comparisons | Minimum substitutions required after arbitrary relabeling and deletion |
| --- | ---: | --- | ---: |
| Original undivided p29 277 vs p50 256 (base60 %29) | 21 | 13 vs14, 14 vs15, 15 vs20 | **7** |
| Both exact G quotients, p29 275 vs p50 254 | 21 | 1 vs5, 4 vs5 | **5** |

Thus deleting any 21 items cannot produce the short register with an identical global symbol encoding. Both original and quotient streams use **all 29 output symbols**, so allowing an arbitrary deterministic global *many-to-one* alphabet map does not evade this: for its 29 inputs to cover all 29 target outputs, it must in fact be bijective. The test is independent of physical direction, absolute page position, and alignment, because the complete symbol count distribution is unchanged by those choices.

The SFT independently synthesizes a genuine successful model: it starts from the **actual 254 p50 quotient digits**, applies a secret 29-way permutation, inserts 21 arbitrary values in independently selected positions, checks the histogram gate accepts, then deletes and inverts the map to recover all **254/254 source-derived target values**. Both original negative and synthetic positive are assertions.

## Reproduction and research decision

[Node 22/CommonJS single runnable test](../sims/lp2_p29_p50_sharedG_21deletion_allsecret_original_sft.cjs) uses the canonical original manuscript rune corpus and the pinned source-table byte SHA-256. **[Windows 11 GitHub Actions run 44993995184](https://github.com/FlareZ123/liber-primus/actions/runs/44993995184) passed** on the committed original data. This expands the prior [shared-root p29/p50 report](lp2-p29-p50-shared-root24-quotient-common-codeword-decision.md), and it is distinct from the earlier direct [21-item repeating-pad test](../sims/lp2_p29_p50_g21_surplus_key_source_sft.cjs).

**Decision:** retire simple insertion-only or deletion-only p29/p50 correspondence with one arbitrary fixed 29-symbol secret alphabet even if unlimited position reordering is allowed. At least five changed values beyond the 21 deleted positions would be necessary for the quotient pair, and no source selects those changes. This does **not** exclude a genuine source-selected position-changing keystream, an edit/substitution layer, a distinct numeral alphabet or an alternative quotient order. Avoid searching a compensatory five-error correction pattern without first finding independent original instructions that select its locations and operation. No genuine LP2 ciphertext has been decrypted by this result.
