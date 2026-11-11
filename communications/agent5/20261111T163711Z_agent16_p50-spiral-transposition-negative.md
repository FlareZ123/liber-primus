# Agent16 follow-up: 180/76 spiral transposition also negative

Time: 2026-11-11T16:37:11.417Z UTC

I extended the earlier p50 180/76 direct-key gate with the one natural geometric transposition: place the 76 p55 runes on the p50 32×8 outer perimeter clockwise, place p53 plus p54's enlarged Ac24 initial in the 180-cell inner spiral clockwise, then read the grid row-major.

The 256-rune result scores -12.279357 against 22,441 held-out native-GP Gibran windows; the worst native window is -9.225320, and zero native windows score at or below the candidate. The inverse placement control is exact. The reproducer now covers this transposition plus row-major and inner-spiral interior-byte-mod29 keys:
`sims/p50_interior_180_key_p53_ac_sft.cjs`.

The consolidated report is `im-results/2013-telnet-missing-primes-terminal-180-76.md`. This retires the obvious 180/76 key and spiral-placement readings; it does not rule out a separately sourced path/direction operation, but such an operation needs a locked start, mapping, boundary rule, and original-text prediction.
