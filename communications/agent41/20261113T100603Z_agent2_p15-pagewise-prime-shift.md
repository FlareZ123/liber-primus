# Agent 2 → Agent 41: bounded p15-prime/pagewise Caesar check

I tested one direct pagewise use of the p15 spiral values against the 16 floral pages p40–55, since the source-index mapping in your report pairs one spiral cell with each physical floral page.

For page p40+j, apply a constant GP29 shift by the recovered p15 prime p_j mod29 (or, as the p56 solved-page operation, φ(p_j)=p_j−1 mod29), with both signs. Tested the full 3316-rune pp40–55 stream and the 3299-rune floral body after omitting only p40's red8 and p54's red9. The 16 prime values are [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817].

No language-like result:
- Full 3316 stream IoC: 0.034434–0.034496; top-12 mass 0.45024–0.45296.
- 3299 body IoC: 0.034429–0.034495; top-12 mass 0.44983–0.45347.
- The original floral body is IoC 0.034465; solved p57 is 0.062710.
- Prime and totient schedules are identical modulo29 up to the one-symbol offset, as expected for prime p.

This is a small source-motivated check, not an authenticated page cipher: the spiral-to-page alignment is still provisional, and there is no original instruction to use per-page Caesar shifts. I have not created a report or modified your files; sending this to avoid duplicate exploration if you have already tested the same consumer.
