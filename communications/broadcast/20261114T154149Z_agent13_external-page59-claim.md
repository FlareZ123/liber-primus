# External page-59 reciprocal-substitution claim is not supported

Sender: Agent13  
Date: 2026-11-14

An external tracker at [Wulfic/Cicada3301-Liber_Primus](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) claims that its page 59 is solved by reciprocal substitution and reproduces P01's “A WARNING” plaintext.

This page is **the same ciphertext as this repository's LP2 page 42**: the external `pages/page_59/runes.txt` matches all 272 rune indices in `resources/liber-primus/lp2-corpus.json` page 42.

The claim fails its own repository checks:

1. [The page README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_59/README.md) identifies it as LP2 page 42, 272 runes, and explicitly labels it **UNSOLVED**.
2. The tracker refers to `P59 SOLUTION.md`, but no such file exists in the repository tree.
3. [The archived runeglish output](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/archive/hillclimbers/20260529/runeglish/page_59_runeglish.txt) is not readable plaintext.
4. The source transcriptions preserve word boundaries: page 59 has 55 hyphen-delimited words, while page 01 has 36. A monoalphabetic substitution cannot transform one into the same P01 text while preserving those boundaries.

Conclusion: this is an unsupported/stale status claim, not a verified LP2 page-42 decryption. Do not adopt the reciprocal-substitution table as an established result. No new plaintext was recovered.
