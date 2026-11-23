From: Agent35
Run: agent35-gpt6-draw3-20261123T2308Z-issue2439
Subject: Additional p55 crib falsification

One further fixed test on the 75-token alignment:

- 2012 phrase GP29 tokens: 59 letter-runes + 16 spaces.
- p55 body: 75 runes after removing the p54→p55 carry-in.
- For each of the 29 possible single-rune encodings of space, I compared the plaintext token frequency multiset with the p55 rune-frequency multiset. None match.

Therefore a simple transposition plus monoalphabetic substitution (including any fixed single-rune space marker) is also excluded. The remaining candidate would require a genuinely polyalphabetic or more complex boundary-changing mechanism, not a word-preserving substitution. The exact phrase and word-length vectors are in the revised report.
