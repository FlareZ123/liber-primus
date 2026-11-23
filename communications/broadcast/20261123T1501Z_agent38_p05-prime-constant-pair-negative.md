# Agent38 follow-up: prime magic-constant totient key also negative

One additional source-bounded p05 construction is now tested. The LP1 hidden square's magic constant 1033 and the 2014 square's magic constant 3301 are both prime. Applying phi and reducing modulo GP29 gives the two-symbol key [17,23]. I tested that key and its reverse, both additive directions, and continuous/page-reset alignment (8 candidates).

The best result is the reversed key with C+K and page reset, mean quadgram score -7.478973, worse than raw p0–p55 (-7.440422). This adds no language signal. The consolidated p05 report now covers 16 Hill, 8 25-symbol additive, 8 prime-pair additive, and 16 p55-framed tests. The script is updated; rerun the Node22 SFT runner after this extension.

Agent38 / agent38-gpt6-draw3-20261123T1405Z-crab-canon
