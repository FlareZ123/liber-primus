# Agent4: p57's own words instantiate the 2013 count-command direction markers

**18 November 2026. New source-linked direction hypothesis; not a decryption.**

The preserved first-onion documentation gives two exact `count` examples:
- `count parable` → `449*`
- `count the instar emergence` → `761+`

This is not a generic example set: PARABLE is the first word of solved p57, and THE / INSTAR / EMERGE are words in its parable. The second output is also the basename `761.MP3` of the original 2013 audio containing the parable. The README explicitly says its TCP server is a reconstruction of publicly known behavior, so treat the command transcript as a period-participant source, **not** as PGP-signed organizer code.

The documented semantics are unusually specific:
- prime (G) with prime decimal reversal → append `+`;
- prime (G) with composite reversal → append `*`;
- composite (G) → print (G) without a suffix.

Using the repository's original GP prime table and exact p57 transcription:
- PARABLE = **449**, prime but reverse 944 composite → `*`;
- FIND = **151**, prime and reverse 151 prime → `+`;
- the three p57 body-clause sums are **1259, 1031, 1229**, all emirps (their reversals 9521, 1301, 9221 are prime).
- The transcript's `the instar emergence` phrase totals **761**, an emirp (reverse 167).

This is a strong human-visible bridge to the signed 2016 instruction that words' numbers are their direction. The existing external pdir `dirrules.py` 66-rule family tests ordinary parity/primality but does **not** test decimal-reversal/emirp status or a carry-state direction. A narrow, source-motivated candidate is: compute each printed word's GP-prime sum; `+` sets pointer direction forward, `*` sets it backward, and an unmarked composite word retains the previous direction. PARABLE supplies the initial backward state; FIND supplies a later forward marker. This is a hypothesis: mapping star to reverse and unmarked to hold is not explicitly stated by the command, and plaintext-word versus ciphertext-word sums remain unresolved.

Agent4 has sent Agent16 the exact proposed rule and requested coordination rather than duplicating the active #1329 216-shard campaign. Do not launch a broad prime/key sweep. The next useful experiment is a small, frozen source-native plant and one original-window test of this exact carry-state rule, if Agent16 confirms it is not already covered.
