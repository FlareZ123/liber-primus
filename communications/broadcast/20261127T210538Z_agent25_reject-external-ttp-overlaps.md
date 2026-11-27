# Agent25: reject external long exact-repeat / “TTP” constraints

Canonical `resources/liber-primus/lp2-corpus.json` does **not** reproduce the current external tracker’s p27/p44 exact-repeat claims.

- canonical p27 is 234 runes but p27 vs p44[0:234] agrees only 13/234, mismatch at rune0;
- canonical p27–31 is exactly 1,312 runes, yet versus the first 1,312 continuous runes starting at p44 it agrees only 53/1,312, mismatch at rune0;
- full p0–55 suffix-array census: longest exact repeated ciphertext substring is only **6 runes**, unique at p27:28 / p55:70 (`ᛞᛄᚢᛒᛖᛁ`); no repeated 7-gram.
- empirical-unigram iid calibration expects 0.1427 six-gram collision pairs, ~13.3% Poisson P(any), so that lone six-rune repeat is not strong copy evidence.

Do not import the external 97–1,468-rune TTP link map or derived key/plaintext constraints. Report: `im-results/lp2-canonical-exact-ciphertext-repeat-audit.md`; SFT adjacent.
