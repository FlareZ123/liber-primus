# P33 q-translation landing: local H/q successor closure fails the p40 [3,5] red-span holdout

**Agent 9, 28 November 2026. Classification: prospectively tested negative continuation of the p33:91 q-translation landing. The p33 field route remains a source-marked navigation result; this test supplies no body plaintext or key.**

## Frozen landing

The upstream chapter SUM/PRODUCT route reaches p33:91 prospectively as the unique red word with (SUM,PRODUCT)=(6,11) after the already-forced GF(29^2) translation x -> x+q, q=4.

The complete marked p33 rubric is two red words of lengths [3,5]. Its first red word is [21,2,12], with canonical outside-in H3=[9,2,4] = [first-last, center, first+last].

## Discovery-only local relation

While extracting the p33 rubric and its immediate typed neighbors, the immediate black successor was already visible. Its descriptor is (length,sum,product)=[6,4,9].

A compact relation exists: take H3=[9,2,4], apply the same upstream +q translation to the H center only, obtaining [9,6,4], then present coordinates as [center,sum,difference] = [6,4,9].

Within the finite 42-member family consisting of no translation or +q/-q on exactly one H coordinate, followed by all six coordinate permutations, this p33 descriptor has exactly one match: center +q, permutation [1,2,0]. Because the p33 successor was inspected before the rule was recognized, this is discovery evidence only.

## Prospective matched control

Independent earlier work had already established that p33:91 and p40:0 are the only complete red spans in LP2 with word lengths [3,5]. Before opening p40's immediate black successor, issue #3412 precommitted the unchanged rule.

P40's first red word is source input [0,9,19], with H3=[10,9,19]. The frozen p33-derived rule therefore predicted the immediate black successor descriptor [9+q,19,10] = [13,19,10].

Precommit: issue #3412 comment 7238670478.

## Result

The actual p40 immediate black successor is the five-rune word at offset8, [24,13,14,26,8], with descriptor (length,sum,product)=[5,27,3]. This is not the frozen prediction [13,19,10].

More strongly, none of the complete 42-member charged H/q/permutation family maps p40's first-red-word H3 to [5,27,3]. Thus the p33 local H/q successor closure does not transfer to the only independent [3,5] red-span control.

## Decision

Keep the prospective p54 -> p40 -> p33 GF29 q-translation landing and p33:91's source-marked arithmetic closure as structural/navigation evidence.

Do not promote the attractive p33 H3 -> center+q -> successor-descriptor relation to an authored consumer. The natural matched transfer fails before any language or fitted p33 body key enters.

Under #3412's completion criterion, the q-translation route therefore stops at p33 as navigation-only until a new first-party operation selects a different consumer.

Reproducer: sims/lp2_p33_qtranslate_successor_holdout_sft.cjs.
