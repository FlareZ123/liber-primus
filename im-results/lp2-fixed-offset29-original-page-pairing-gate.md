# Original LP2 58-image release: fixed offset-29 two-cycle gate

**15 November 2026, Agent18, with a bounded source-fold anchor added by Agent10. Decision: no supported two-cycle cipher selector or plaintext.** A fixed pairing of second-release physical pages `p ↔ p+29` is a natural hypothesis because the 58 original images equal twice the 29-symbol Gematria Primus alphabet. This test does not search offsets or fit keys. The actually printed illustrations and ten preregistered page-level measures do not supply an independent transformation rule or reproducible LP2 decipherment.

## Original-input contract and source geometry

- The original second release comprises **58 physically ordered images** `17.jpg`–`74.jpg`, indexed here p0–p57. No original printed page number or first-party instruction prescribes pairing page p with p+29. The last two are already known: p56 `AN END` (85 runes) and p57 `PARABLE` (95 runes).
- **Runes:** [LP2 corpus](../resources/liber-primus/lp2-corpus.json), exactly 58 pages with **12,956 encrypted GP29 runes on physical p0–55** and 180 solved controls. The original numeric p50 has zero runes.
- **Words:** [source rune transcription](../resources/lp2-transcription.txt), 57 rune-bearing page records because numeric p50 is absent. A source-native parser counts a word only when terminated by `-.$&§` or at text end; line and page breaks do not terminate words. It confirms **2,896 unknown whole words**, plus 45 solved-page words. Per-page values below count words by the physical page of their *initial rune*, preserving page carries.
- **Printed ink:** [source annotation register](../resources/liber-primus/lp2-ink-annotations.json) for red-rune spans and large punctuation; original JPEG contact-sheet inspection separately compares page artwork.
- Reproducer: [fixed source-only CommonJS SFT](../sims/lp2_fixed_pageoffset29_pairing_sft.cjs), which checks those input totals and evaluates exactly the 29 pairings `p=0..28 ↔ p+29`, no other offset.

The left pages p0–2 contain the repeated black triple-bar-cross motifs, while right p29–31 contain mostly plain text; p3–7's mirrored scrollwork is paired with p32's tree and p33–36's red-cuneiform chapter. Later insect/body/flower imagery does not preserve the offset-29 association, and the paired solved pages p56 and p57 have distinct layout and text lengths from p27 and p28. Original source illustrations therefore provide no common orientation, starting point, or readout.

## Frozen tests and controls

For every fixed pair the SFT evaluates runic/word-count association, exact count equalities, positionwise identity of the first and last twelve GP rune indices, and co-presence of red text, 10/13/23-dot punctuation, and cross-page word carries. Nulls arise from **10,000 deterministic shuffles of only the right 29-page half**, preserving the full original distribution of page lengths, solved pages, red and punctuation identities. The generator is xorshift32, initial state `0x6d2b79f5`. Each row's empirical tail count is descriptive, since this set of ten statistics was examined jointly; it is not a formal independent-trials p-value.

| Frozen statistic | Fixed p↔p+29 | Shuffled mean | Shuffled SD | Shuffles ≥ fixed (of 10,000) |
| --- | ---: | ---: | ---: | ---: |
| Rune-count Pearson r | **−0.05218** | −0.00403 | 0.18784 | 5,712 |
| Mean absolute rune-count difference | 67.586 | 66.222 | 6.460 | 4,393 |
| Exact equal rune-count pairs | 2 | 0.734 | 0.818 | 1,608 |
| Word-start count Pearson r | 0.11040 | −0.00362 | 0.18805 | 2,659 |
| Mean absolute word-start difference | 15.138 | 16.314 | 1.542 | 7,863 |
| Same first-12 rune positions, all pairs | 19 | 12.757 | 3.495 | **569** |
| Same last-12 rune positions, all pairs | 11 | 12.724 | 3.441 | 7,329 |
| Pairs both with red text | 1 | 1.930 | 1.056 | 9,251 |
| Pairs both with large punctuation | 4 | 4.152 | 1.294 | 6,945 |
| Pairs both ending in an unfinished word | 10 | 9.915 | 1.338 | 6,252 |

Only two pairs happen to have equal source rune count: **p13/p42 = 272/272** and **p19/p48 = 271/271**, but their independently parsed word-start counts are **61/57** and **65/66**, and their actual word-length profiles are different. A superficial regex that treats punctuation and line wraps as interchangeable can misleadingly equate unrelated word fragments; source-native whole-word starts for p5/p34 are 58 versus 60, so that pair supplies no exact word-count control.

The largest positive original-versus-shuffle difference is the first-twelve rune match total **19**, but at least **569** of 10,000 shuffled pairings equal or exceed it, and the opposite end goes in the other direction. Among ten fixed comparisons, that isolated, incomplete-position overlap does not select a cipher or predict plaintext.

## Solved-page boundary check

The only solved controls are fixed to the second half:

| Source-fixed pair | Rune counts | First-12 equal | Last-12 equal |
| --- | --- | ---: | ---: |
| p27 ↔ p56 | 234 / 85 | 0 | 2 |
| p28 ↔ p57 | 269 / 95 | 2 | 0 |

These pairs share neither complete lengths nor a published operation allowing the known p56 or p57 cleartext to decode their respective unsolved partners. No held-out word, alphabet relation or reversible key conversion can be inferred from their source-visible features.

## Source-selected midpoint exception: p14 FOLD ↔ p43 reversed word (Agent10, 15 November)

A source-constrained possible *instruction path* survives the overall null comparison without constituting a decoder. The already documented 2016 signed-message GP-prime-sum fold square conditionally addresses `THE=72=14+58×1` as original p14 word1 (zero-based), which is the **literal GP rune word FOLD**, the only full printed FOLD on the 2,896-word unknown corpus. Physical p14 is the centre of the first 29-page half and physical p43 the centre of the second half. In the original signed-2016-to-LP2 interpretation these are source-motivated positions, but **the signed message never explicitly instructs page folding or prescribes the modulo58 word-address formula** ([full prior source report](lp2-2016-signed-message-fold-square.md)).

Two *new exact* source relations at that paired midpoint are unusual and can be checked independently of any decryption score:

1. **p14 has 137 runes, p43 has exactly 274 = 2×137**. Across **all 841** possible first-half/second-half page combinations, only p14/p43 and p14/p47 have exact length doubling; under the fixed offset29 pairs, p14/p43 is the only such pair. The p14 scan's large mayfly/tree illustration offers a mundane alternative explanation for its unusually short text.
2. The printed **first complete rune word of p14 is TJ**, and the printed **last complete word of p43 is JT**. Reversing the latter produces TJ. Over *all 29×29=841* original cross-half pairings, this **single two-rune match is the only complete first-word versus reverse-last-word equality**. The two-source-word match gives a visual bookend compatible with a backward fold; it is **only a two-rune shared span**, and there is no longer equal word or full-page alignment. Its uniqueness among possible pairings is descriptive, not a calibrated after-discovery probability.

A third after-noticed numerical relation is p43's opening word **HJ**: its GP indices 8,11 are **8×29+11=243**, while its GP prime sum is **23+37=60**. The existing signed-message clue independently has `HELLO=LIBER=243`; the p49–51 table is commonly read in radix60. These observations supply **no original instruction converting GP indices to BASE29 positional digits at this location, or selecting a numeric consumer**. Do not use them as independently validated key material.

One fixed, historically motivated three-lane inverse was evaluated before proposing any fitted variations: take p14's 137 runes as lane A, p43's first137 as B and p43's second137 in reverse order as C (physical fold), then apply the degree-two three-share finite-field interpolation at x=1,2,3: `P=(3A−3B+C) mod29`. This **single original output** has IoC **0.0342421640**, compared with **0.0627099664** for the clear source GP p57; its text is nonlinguistic. A synthetic polynomial sharing of all95 p57 known runes recovers **95/95** with the identical interpolation. This is a direct negative for that decoder, not a theorem excluding a different authored fold operation. It avoids searching alternate orientations, algebraic coefficients or endpoint alignments.

**Decision:** retain the midpoint reversed-bookend clue as a **provisional, specific human-puzzle lead**. It changes the question from “Does every pair p↔p+29 have similar statistics?” to “What authored operation, if any, consumes p14 FOLD, reversed TJ/JT and p43's doubled rune tape?” Until source fixes a reversible transform predicting an untouched page or authentic plaintext, the broad offset29 null result and no-solution status remain unchanged. The [extended original-source SFT](../sims/lp2_fixed_pageoffset29_pairing_sft.cjs) asserts the complete 841-pair uniqueness, length comparisons, signed address, numeric observations and direct three-share source/control outputs.

## Disposition

The equality **58=2×29** supplies only a possible cycle length. The native source evidence does not select pairing direction, original rune/key alignment, an invertible map, or any positive solved-page transfer. Reject the fixed simple offset-29 structural pairing as a chosen decoding route; retain the full quantitative output for future comparisons. This is **not** a proof against all conceivable multi-page cryptosystems, but no further shifts or decryption searches follow without an independent author cue. The previously closed mod58 word-address hypothesis is untouched.

**Reproduction:** run `sims/lp2_fixed_pageoffset29_pairing_sft.cjs` under Node.js 22 from a local repository root. It performs all assertions and prints original-vs-control statistics with no writes and no environment-dependent inputs.