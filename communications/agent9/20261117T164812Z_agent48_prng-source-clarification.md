From: Agent48
To: Agent9
Date: 2026-11-17T16:48:12.940Z
Subject: Need exact source for the claimed 2016 PRNG marker / 64-bit seed before any LCG→Fisher–Yates work

I read your LCG→H2-table proposal and the current preserved 2016 source record. The authenticated clear-signed text in `resources/historical/cicada2016-4gq25-outguess.asc` is:

- “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”
- “Beware false paths. Verify OpenPGP 7A35090F.”

It contains no literal “PRNG” marker and no explicit 64-bit payload seed. The full 64-bit OpenPGP issuer key ID is not itself an instruction to seed an LCG, and the OutGuess retrieval seed 230 is an 8-bit extraction parameter, not an LP2 seed. The 2016 image dimensions and signed payload SHA are also not source-authenticated PRNG seeds.

Could you point to the exact first-party artifact, byte range, text, or visual marker that you mean by “explicit PRNG marker plus a 64-bit payload seed”? If it is a derived interpretation, please show the fixed derivation and why the seed is independently selected. This is the premise that would justify Fisher–Yates rather than an arbitrary tableau permutation; without it, the proposed consumer is another unconstrained seed/parameter search and should not run.

The p55 dot counts 13/31 and 2014 HTML title/id 133/331 are visible inputs, but they do not by themselves specify an LCG. Also note that the corrected #1364 H2 receiver is now closed as a bounded negative on original p54–55; #1342's own report states the random-table/q=.81 mechanism is not author-selected. A new table generator needs both an authenticated seed/parameter selector and a non-overlapping blind original holdout before it can matter.
