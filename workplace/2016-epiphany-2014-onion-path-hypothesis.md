# 2016 "Epiphany" as a human clue to the 2014 onion path

**Classification:** source-grounded solve-path hypothesis; not a recovered key or plaintext.

## Source-visible sequence

1. The verified 2016 signed message contains the exact lines:
   - “The path lies empty; epiphany seeks the devoted.”
   - “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”
   - “Beware false paths. Verify OpenPGP 7A35090F.”
2. The archived 2014 puzzle record opens with “cca 07:30 GMT 6th JAN 2014.” The date is Epiphany (6 January).
3. The 2014 second onion, cu343l33nqaekrnw.onion, displayed the HTML comment “Patience is a virtue” above a 256-byte string that grew over time in five-minute-multiple intervals. The archive says the process continued for approximately 23 hours.
4. The next onion, fv7lyucmeozzd5j4.onion, initially showed a blank page before a string appeared and grew. Its Apache status page was also exposed.
5. The 2016 message's “path lies empty” can therefore be read as a pointer to the initially blank 2014 onion path; “epiphany” points to the 6 January 2014 round date; “devoted” echoes the patience demanded by the growing-string phase. “Liber Primus is the way” then directs the solver back to the manuscript rather than to an arbitrary physical destination.

This is a substantially more clue-constrained historical route than interpreting the GP primes as British A-road numbers. The latter mapping is non-discriminating: all 29 GP prime weights have corresponding A-road numbers (see im-results/2016-a-road-inveraray-route-audit.md).

## What this does and does not establish

**Established from the archived sources:** the 2016 message is signed; the 2014 round's archived start date is 6 January; the second onion had the patience comment and timed 256-byte growth; the third onion initially showed a blank page.

**Hypothesis:** the 2016 "Epiphany / empty path / devoted" wording intentionally sends a human solver back to the 2014 onion sequence and especially its timing channel as a possible source of key material or a route into LP2.

**Not established:** that the 2014 timing channel is an LP2 key; that the 2016 message specifically selects the 256-byte string rather than another part of the 2014 path; or that the published "approximately 23 hours" description and surviving timing samples give a complete, mutually consistent absolute chronology.

## Best next test

Freeze the historical selector before trying new cipher families:

- Treat 6 January as the date anchor, not an adjustable seed.
- Identify which exact 2014 path was initially empty (the third onion is explicitly described as blank on first visit).
- Distinguish the served 256-byte values, the five-minute interval sequence, and the later 1033 / server-status material; do not mix them into one unconstrained key.
- Reconcile the first observed byte, the last byte, the 23-hour statement, and the surviving BotSottile/Cripion timestamps. In particular, verify whether the timing cells are truly consecutive inter-byte intervals across the full string.
- Test only a mechanism that maps one of these source-fixed channels into LP2 with an independently specified alignment and operation. Require an exact original-ciphertext inverse and withheld-page validation.

The existing direct interval-stream sweep is negative for its pre-registered simple transforms; that does not rule out the historical clue, but it means the next step must supply a source-derived selector rather than another unconstrained cipher grid.

## Source links

- 2016 signed-message transcription: https://github.com/scream314/cicada3301/blob/master/2016.md
- 2014 round chronology and second/third onion descriptions: https://github.com/scream314/cicada3301/blob/master/2014.md
- Original stage-3 archive and README: https://github.com/scream314/cicada3301/tree/master/assets/2014/stage03
- Archived onion-2 timing witnesses and reconciliation: https://github.com/Dukotah/cicada3301/tree/master/liber-primus/analysis/round43/F5-stored
- Timing-channel negative result and coverage limits: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md
