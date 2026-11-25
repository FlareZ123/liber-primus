# Standard chapter MTF outer layer with genuine prime/F-hold inner clock

**Director #2786 decision: retire the exact composition.** Eight of nine original physical chapters have no legal inverse for any of 3,302 initial prime cursors and any F-hold history. Both printed-marker alternatives around p15 also fail. The sole short terminal chapter has 16 complete paths, all exhaustively decoded; none yields native prose, and its independently selected p54 prefix cannot be continued into p55.

## Frozen candidate and distinct scope

Historical 2014 bzip2 motivates standard move-to-front (MTF), while solved p56 authenticates consecutive prime-minus-one shifts with literal plaintext F. This composition is exploratory; no source instruction joins these operations. #1468 used the historical 2015 prime-difference intermediate; #2719 rejects MTF-inverse followed by BWT; #2505 concerns adaptive rank schemes. The [earlier prime/MTF attack](lp2-prime-totient-mtf-assignment-original-inverse.md) established strong all-secret native-window repeat bounds, but its original inverse used an all-consuming phase-zero inner clock. The present exact legality gate grants *all* origins 0..3301 and *all* genuine literal-F histories, requires no donor-register assumption, and uses the fixed canonical list.

Encode P=0 as inner X=0 without consuming a prime. Otherwise X=(P+prime[cursor]−1) mod29, then advance the cursor; prime[0]=2. Encode X as its rank in list [0..28], move X to front, and reset the list and prime origin only at a visual chapter start. Decode ranks using the inverse MTF; at inner symbol X and cursor s, a hold is legal iff X=0, and a consuming branch is legal iff X differs from (prime[s]−1) mod29. On a consuming branch the nonzero plaintext is X−shift mod29. Ciphertext zero may consume as well as hold. No additional alphabet, clock, BWT, or word constraints.

## Exact language-independent original gate

DP state is just the current prime cursor; sum BigInt counts of distinct (initial origin, hold/consume history) when they merge. Start all 3,302 origins. If the state set empties there is no legal full inverse. The canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 is used without modifying a rune. The original-image physical-page cuts are identical to #2719. The isolated red nine-rune p15 rubric also admits the printed section-marker convention at rune3612 rather than physical page start3603; both affected alternative blocks are tested.

| Physical chapter | Runes | Inner zeros | Maximum legal prefix | Complete paths |
|---|---:|---:|---:|---:|
| p0–2 | 729 | 19 | 300 | 0 |
| p3–7 | 1145 | 39 | 485 | 0 |
| p8–14 | 1729 | 60 | 461 | 0 |
| p15–22 | 1903 | 61 | 374 | 0 |
| p23–26 | 1021 | 33 | 656 | 0 |
| p27–32 | 1433 | 56 | 557 | 0 |
| p33–39 | 1680 | 64 | 607 | 0 |
| p40–53 | 3008 | 98 | 210 | 0 |
| p54–55 | 308 | 8 | 308 | 16 |

The p0–1 training tape contains528 runes; the exact reachable set already empties on its 301st rune. Therefore no origin or F mask can be selected to predict p2. For the printed-marker convention, p8–14 plus p15 rubric has1,738 runes and dies after461; p15 after rubric through22 has1,894 runes and dies after527. Both fail.

## Exhaustive actual terminal candidates

The remaining p54–55 block deserves direct recovery rather than stopping at its nonempty path count. MTF is inverted continuously from p54 through p55. At the end of p54 (232 runes) there are48 legal origin/mask paths with29 cursors. At the end of p55 (76 more runes), 16 full paths and10 final cursors remain; the four full-path origins are1870,2466,2547,3112.

Enumerate all48 prefix paths without using p55. A fixed smoothed spacing-free GP29 trigram model from the nine solved sections (native reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f) selects origin795, cursor1022, prefix score −4.852102 nats/rune. **No legal continuation** from that frozen boundary state exists on p55. The exact context-augmented Viterbi optimum agrees with prefix enumeration.

Backtrack all16 complete histories separately, re-encrypt every complete candidate through both layers, and preserve their full rune strings in [raw JSON](lp2-mtf-native-prime-fhold-raw.json). Even granting retrospective selection, the best p55 score is −4.933621, and every complete candidate contains at least15 EO/OE runes, absent in the 2,979-rune genuine native reference. Full IoCs are .034646–.038686. No coherent original plaintext appears. This last comparison is finite native-register evidence; the eight dead chapters need no such assumption.

## Positive and matched negative controls

The code directly reproduces p56's original 85/85 glyphs and p57's clear95/95. Nine genuinely solved sections are planted with MTF outside the authentic prime/F clock at hidden origins [0,23,133,331,761,1033,3299,3301,17]. Each target section is excluded from its own scoring model. Use the p0–1/p0–2 training fraction (528/729), exact Viterbi with cursor and previous two plaintext runes, then freeze the selected state; decode the continuation with the unchanged model. All nine true paths are legal, nine hidden origins are selected, six exact full continuations and 804/826 withheld runes are recovered. All nine fitted states remain legal on their holdout. The short PARABLE plant recovers only11/27 heldout runes because F ambiguity survives the frozen state; the short WISDOM and WELCOME controls have5 and1 errors. Heldout selected-score range −3.611447…−2.449411.

The same all-origin exact gate on nine raw-prime and nine uniform independent-pad tapes of matched donor lengths rejects each of the three longest donors (515,755,780) but accepts the six short tapes in each negative family. Thus short-block legality is not cipher identification. This is why the complete terminal paths were inspected rather than reported as positive evidence.

## Reproduction and scope

[CommonJS SFT](../sims/lp2_mtf_native_prime_fhold_exact_sft.cjs), [raw output](lp2-mtf-native-prime-fhold-raw.json), commits 9221656399e250d484bdc096ebf3f61864ec8ce6 and 230b12c30f155e016cc50e43172def70a4563dcd. Executed on pinned repository sources in connected V8; no CI claimed. Run `node sims/lp2_mtf_native_prime_fhold_exact_sft.cjs` from the checkout.

No new unknown plaintext or key. Retire this exact chapter-local canonical MTF/prime-F composition; no additional phase, alphabet, reset or transform sweep absent an independent selector.
