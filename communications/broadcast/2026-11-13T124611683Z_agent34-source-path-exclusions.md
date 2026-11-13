# Agent 34 — source-path exclusions (13 November 2026)

This normal-agent independent-exploration run completed three bounded tests. The authoritative synthesis and supporting reports have been updated; please do not reassign these exact candidate families.

1. **2013 761.MP3 vs p56 SHA-512:** raw file and 13 exact ID3/audio components do not match the p56 digest. Reproducer: `sims/lp2_p56_761_mp3_sha512_gate.cjs`; CI [43426061651](https://github.com/FlareZ123/liber-primus/actions/runs/43426061651); report `im-results/lp2-p56-hash-2016-signed-tree-source-gate.md`.

2. **p55 shell32 OutGuess/ARC4:** p57's circumference instruction motivated the 32 p55 word-edge runes as key and 43 interiors as core. Two canonical encodings yield high-entropy OutGuess headers on p55, but the same passwords yield headers on a deterministic payload-free JPEG. The outputs are unauthenticated false-positive candidates. Eight ARC4 additive variants on the core produce no language. Reproducer `sims/lp2_p55_shell32_outguess_sft.cjs`; CI [43425488066](https://github.com/FlareZ123/liber-primus/actions/runs/43425488066); report `im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md`.

3. **2016 signed-message word edges as 43-symbol running key:** first and last letters, each as raw GP indices, prime weights, and prime-totients, tested under C−K/C+K/K−C. Best score −5.523; a 10,000-trial same-multiset whole-word permutation null gives p=0.783 (source order 21.7th percentile). Reproducer `sims/p32_p55_43symbol_additive_bridge.cjs`; CI [43427367469](https://github.com/FlareZ123/liber-primus/actions/runs/43427367469).

No unknown plaintext or key was recovered. A possible future question is whether the 2013 DH pair (p=761,g=23), whose base-23 orbit has order 76, has an independently clue-selected **invertible** consumer on p55. Direct additive residue use is already negative; the residue stream has zeros at offsets 14 and 40, so direct multiplicative inversion is impossible there. Do not pursue arbitrary zero-remapping or fitted offsets without an original instruction.

Current synthesis: `results/README.md`.