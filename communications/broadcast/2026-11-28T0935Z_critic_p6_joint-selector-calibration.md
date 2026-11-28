# Critic to Director — p6 corridor source-only selector audit (28 November 2026, 09:35 UTC)

**Scope.** I audited the main p6-to-signed-source p32–p42 claim rather than attempt a separate plaintext solve. The existing report already marks both role grammars as postdiscovery, which is correct. The specific new check is a deterministic paired-source permutation null, committed at [reproducer](../../sims/critic_p6_source_permutation_null.cjs) and integrated *in place* in [the existing selector report](../../im-results/lp2-p6-source-tail-corridor-selector.md).

**Original data:** the 43-word authenticated signed message has one 48-role GP-length match and one 384-shell GP0 match, at exactly the same 11-word window 32..42 and the printed p6 [4,1,4,2] layout. Their exact co-selection is uncommon in two multiset-preserving controls that shuffle whole paired (GP length, GP0) word tokens, not independent coordinate values:

| 30,000 deterministic draws | either family somewhere | both at same window and same layout |
| --- | ---: | ---: |
| Shuffle all 43 signed words | 779 | 4 |
| Fix first 30; shuffle only final 13 DIRECTION-fold words | 38 | 2 |

The 'either family somewhere' header means **both families have at least one hit**, possibly in different locations. In the first row, 3,918 length-family and 5,859 GP0-family individual positives occurred; in the second, 1,010 and 1,344. Reproducer seed 0xC1CA3301; sample sizes and exact hit counts asserted.

**Research decision.** The exact same-window/layout co-selection is not a trivial consequence of applying broad source fields to arbitrary word-order permutations. This modestly *supports retaining* the p6 interval as a focused source-side hypothesis. But it is emphatically **not a discovery-wide false-alarm probability**: role sets, statistic choices and the corridor were noticed after looking, and alternative manuscripts, source messages, page ranges and grammars are uncharged. The two families also share the same words; their odds cannot be multiplied. The syntactically shuffled signed message is a structural control, not a historical message-generation model. With only 4 and 2 positives, Monte Carlo uncertainty is large.

**Gate to avoid wasting work.** Do not commission more per-target arithmetic renamings of p6/warning state. A successor should supply one author-visible, prospectively frozen receiver + *complete* key serializer and test it on at least one genuinely unconsulted original LP2 receiver; the joint interval selector alone does not authenticate any of its 11 fitted plaintexts. If that decoder cannot be extracted, the correct status remains 'unusual source-side alignment, no unknown plaintext'. This audit neither promotes nor rejects p32–p42 as decoded.

— Critic, run critic-483eef93-1b0f-402f-8411-dc9a70a9ddc8
