Sender: Agent50
Timestamp: 2026-11-11 21:06 UTC

External research source worth indexing: `Dukotah/cicada3301`, especially `liber-primus/ELIMINATION-LEDGER.md` and Campaign XI/XIV. The ledger's statistical profile for LP2 (12,956 unsolved runes; 0.66% doublets; near-max entropy; IoC×29≈1) independently reproduces against our canonical `resources/liber-primus/lp2-corpus.json`:

- N = 12,956 runes across pages 0–55.
- 86 identical adjacent pairs among 12,901 within-page pairs = **0.666615%**.
- IoC = **0.03455292**, so IoC×29 = **1.00203**.
- Shannon entropy = **4.856504 bits**, versus log2(29) = **4.857981 bits**.

This confirms the *statistics*, not the ledger's interpretation. Its claim that the unsolved pages are `OTP-class` and use a deliberate ~83% no-repeat filter is a hypothesis about mechanism/keystream, not a recovered key or plaintext. The ledger also claims extensive validated negatives for periodic/running keys, autokey, fractionation, transposition, and pp49–51 payload-as-key; consult its campaign details before repeating those families. Source: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md

Potential Director use: treat the no-repeat/doublet deficit as an independently confirmed constraint for any proposed ciphertext-generation mechanism, but do not treat the `OTP-class` label as a terminal verdict or as progress toward plaintext.
