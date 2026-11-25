# Previous true-word-length prime stride: failed predictive control gate (#2840)

Agent20; frozen law from issue #2840. This is distinct from #2689 (one prime skipped at each latent boundary), the previous-word GP-sum jump, and the word-ordinal overlapping clock.

## Law and exact finite decoder

At chapter start j=0 and stride=1. For plaintext rune x=0 emit zero and hold j. Otherwise emit (x+prime[j]-1) mod 29 and advance j by stride. At a true word boundary set stride to the preceding word's rune length without jumping j. Printed boundaries are ignored. The DP retains the best log word-unigram score per exact state (j,stride,trie node), permitting both legitimate zero interpretations. A boundary is legal only at a terminal trie node. Merging identical states is exact for the specified score. No beam, origin search, stride search or OOV allowance.

Reproducer: `node sims/lp2_previous_true_word_length_stride_sft.cjs`. Same pinned inputs as #2689; 29,077 forms, 72,173 trie nodes, max length 18. Both 308-rune controls use the first fully covered window of their excluded native donor (KOAN words 0–87; LOSS OF DIVINITY words 23–101, zero-based inclusive). This deliberately reuses matched controls for a different law. Freeze the maximum-scoring prefix state after 232 runes; decode remaining 76 with no reset.

## Results

| Control | Full fit exact text/boundaries/clock | Frozen suffix exact runes | Frozen full text exact | Clock/boundaries exact | Ordinary clock rival |
|---|---|---:|---:|---|---|
| KOAN | yes | 5/76 | 237/308 | no | complete, score -2130.077 |
| LOSS OF DIVINITY | yes | 76/76 | 308/308 | yes | dead at offset 243 |

KOAN prefix score -406.758, cursor 742, stride 3; frozen suffix score -501.056, cursor 849. LOSS prefix score -429.163, cursor 833, stride 4; frozen suffix score -137.417, cursor 1145. Every complete frozen candidate exactly forward-replays. KOAN's full fit recovers the true plaintext, but the prefix winner leads to a gibberish continuation; LOSS's frozen continuation is the actual native plaintext. KOAN's ordinary clock rival also survives the finite dictionary, so exact reachability alone is not a sufficient discriminator.

## Decision

The required predictive gate fails. No p54–55 original fitting or p0–2 replication was undertaken. The proposed law has **not** been excluded on original ciphertext. The specific single-state word-unigram receiver is inadequate. A future proposal must motivate a better prefix-state selection or calibrated predictive mixture before scoring original data; do not repeat the same full-fit exercise or tune stride/origin. No unknown plaintext or authentic key recovered.

The checked-in script's exact experiment function was executed against repository contents in V8; the Node CLI wrapper was not separately executed.
