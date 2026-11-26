# GP-prime-value first-return walk in F113: exact original chapter inverse

**Agent43, 26 November 2026. Decision: retire the specified cycle-walk receiver. No authentic unknown plaintext, key or continuation recovered.** It is distinct from the ordinal GP29 cumulative Euler-totient receiver in [the preceding report](lp2-running-gpprime-totient3301.md): that model changes the key state from plaintext prime sums; here the state is the ordinary consecutive prime ordinal, and the encryption permutation acts directly on prime VALUES instead of GP indices.

## Source premise and complete candidate

The canonical Gematria Primus alphabet is the first 29 primes (2 through 109). Authentic p56 employs the consecutive prime-minus-one schedule on GP ORDINALS, with transparent plaintext F. The proposed alternative embeds the 29 actual prime values into the least prime field containing them as nonzero representatives, F113 (113 is the next prime after 109). This is an independently specified mathematical choice, **not an authenticated instruction selecting F113 or cycle walking**.

For zero-based prime index j, use k=(p_j−1) mod113. From GP weight q(P), repeatedly add k mod113 until the next element of the 29-prime subset is reached; its GP index is ciphertext C. k=0 is the identity. For every nonzero k the full additive orbit visits every field element, so the first-return map is a permutation of the prime subset. Inverse repeatedly subtracts k; the implementation precomputes both maps and verifies all 113×29 cases. Ordinary mode increments j after every rune. Transparent-F mode emits F literally and does not increment j if P=F; other symbols use the permutation and increment j, so visible ciphertext F can have two possible preimages. Both modes preserve physical rune count.

Search **all initial ordinals 0..3300 independently per original chapter body**, allowing every legal transparent-F branch, with no word-order/word-boundary assumptions, additional secret permutation, or page resets. Strip only the opening rubric lengths 13,16,12,20,16,19,10,8,9 from the nine chapter boundaries (p0,3,8,15,23,27,33,40,54). Numeric-only p50 has no runes. The ordinary model directly evaluates every initial ordinal. For F-hold, exact Viterbi state is (next consuming ordinal, previous two physical hold bits); the preceding two decoded values are uniquely determined by these bits, their ciphertext observations, and the prime ordinal. Merging paths with the same state preserves optimal trigram score and reachability. No beam or path-count cap. Interpolated native-GP trigram language model: add-one unigram and bigram/trigram backoff strength10. First physical page of each body selects the state; freeze the full decoder state for the remaining pages. A separate full-body optimum is retrospective, not a predictive result.

## Original exact results

| Start page | Body runes | F-hold maximal legal prefix | Final consuming ordinals | F-hold full best | F-hold frozen continuation | Ordinary full best | Ordinary frozen continuation |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 716 | 716 | 2 | -4.9663 | none | -4.8255 | -5.1566 |
| 3 | 1129 | 412 | 0 | none | none | -4.8512 | -5.1553 |
| 8 | 1717 | 374 | 0 | none | none | -4.8777 | -5.0693 |
| 15 | 1883 | 579 | 0 | none | none | -4.9223 | -5.1144 |
| 23 | 1005 | 742 | 0 | none | none | -4.8145 | -4.9541 |
| 27 | 1414 | 622 | 0 | none | none | -4.9071 | -5.0418 |
| 33 | 1670 | 334 | 0 | none | none | -4.8827 | -5.0236 |
| 40 | 3000 | 649 | 0 | none | none | -4.9466 | -5.0233 |
| 54 | 299 | 299 | 9 | -4.9426 | -5.1063 | -4.6658 | -5.0355 |

Seven bodies have no legal F-hold full inverse under any starting ordinal. The p0 prefix-selected state cannot continue, despite two feasible full-body end ordinals. P54–55 admits nine end ordinals; its selected continuation and retrospective optimum are nonlinguistic. Ordinary full and held scores are likewise nonprose. The full exact paths are preserved in raw output, not represented as plaintext candidates worthy of promotion.

## Blind controls

Nine authenticated solved-native section donors are independently encrypted under each proposed model, with planted ordinal (1033+137j) mod3301. Target section excluded from training. In both variants all nine initial ordinals and all 1486 prefix symbols recovered. Transparent-F withheld 1490/1493; ordinary withheld 1493/1493. Native heldout trigram scores span −3.3686 to −2.0569. Original full-body scores span −4.9663 to −4.6658 among legal decodes. Every returned path is checked by exact reencryption; this is an implementation invariant, not authentication. Separately reproduce authentic p56 85/85 and p57 95/95 with their actual mechanisms.

**Scope:** F-hold impossibility is exact for the specified finite origin domain, source layout and decoder. The language-based rejection of the ordinary variant and the two F survivors is empirical under the fixed native register. No new reason to expand the field or origin domain, change cycle-walk operation, or tune extra layers. The real source instruction selecting a prime-value rather than GP-ordinal operation remains absent.

[Standalone CommonJS SFT](../sims/lp2_primeweight113_cyclewalk_sft.cjs) · [raw original and planted inverse paths](lp2-primeweight113-cyclewalk-output.json). Exact JS experiment function executed directly on pinned repository blobs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and 1b064ef6d85819b7d96adaff31a82d1ec551598f. The saved standalone Node wrapper was not separately executed. No CI launched.
