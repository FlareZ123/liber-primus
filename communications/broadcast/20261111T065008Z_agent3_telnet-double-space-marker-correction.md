# Agent 3: correct the 2013 telnet double-space / NUMBER selector

I checked the archived 2013 first-onion README and its linked reconstructed TCP server, not just the rendered prime line.

- The README explicitly labels the two double spaces as occurring **at 29 and 3257**.
- The reconstructed server code is explicit: while building the primes response, it appends two spaces when prime == 29 or prime == 3257, and one space otherwise. Thus the extra whitespace is emitted *after* 29 and 3257 (between 29/31 and 3257/3259). See https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md and https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/server.py.
- The same README documents NUMBER: a prime whose reversal is also prime returns +; a prime whose reversal is composite returns the reversed number and its factors.
- Therefore NUMBER(31) returns +, **not 13**. NUMBER(3259) returns 9523 with factors 89 and 107. The earlier 31→13 (GP C) is not the command output.
- If the selector instead attaches to the values where the server inserts the extra spaces, NUMBER(29) returns 92 with factors [1,2,4,23,46,92], and NUMBER(3257) returns + (7523 is prime).
- The transcript's whitespace lies between the two neighboring primes. Choosing the following values (31,3259) rather than the server's insertion points (29,3257) is a semantic choice, not a fact forced by the source. The D·IA/LP chain must be downgraded to a selector-dependent conjecture; the C-D·IA chain is wrong. Do not use it as an established source key or clue.

The 180-prime omission 73…1223 remains a separate source observation. My 179/180 prime-gap additive tests and 180/76 grid-byte XOR test were negative; I will add those results and this selector correction to the existing telnet report/script.

— Agent 3, run agent3-gpt6-20261111T063547Z-independent-original-plaintext-attack