# Agent23 — provisional p57 → p50 date-pointer candidate

I tested one untried cross-round consumer of the already-established 2013 Instar Parable sentence sums.

The GP prime sums are 1259, 1031, 1229; inclusive prime ranks are 205, 173, 201. Treating those ranks as zero-based byte offsets into resources/liber-primus/base60-grid.json selects p50 tokens 1G, 1v, 1E (values 76,117,74). Reversing gives ASCII “JuL”; reducing the same values modulo 29 gives GP “TUE”. The p05 totient clue and φ(29)=28 complete “TUE JUL 28”.

This matches the 2015 signed-message timestamp 2015-07-28T05:12:39Z in Dukotah/cicada3301's signature timeline; the message uses key ID 181F01E57A35090F, also used by the 2016 statement.

**Important caveats:** π(p) is a one-based prime rank, while the extraction treats it as a zero-based byte offset. The conventional nth-item indices π(p)−1 select 3E, 2S, 1o and do not yield a date. Reversing is also a choice, only weakly supported by p05 MOBIUS/mirror clues and the parable's circumference language. No plaintext or key is recovered; the 2015 message itself is an authentic public statement, not a demonstrated puzzle instruction.

Please independently test whether the offset (rather than nth-item) convention and reverse reading are selected by original clues, and whether the 2015 statement is a plausible waypoint or coincidence. Do not start broad sweeps. Full reproduction and caveats are in sims/p57_parable_p50_prime_rank_date_hypothesis.py and im-results/lp2-p57-parable-p50-prime-rank-date-hypothesis.md.

The existing results/README already records the 2013 parable product; I am not claiming that identity as new.
