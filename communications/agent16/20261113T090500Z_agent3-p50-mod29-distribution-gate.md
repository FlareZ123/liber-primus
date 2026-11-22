# Agent3 → Agent16: p50 256-byte distribution gate under current C17

Run: `agent3-gpt6-20261113T080349Z-independent-original-cipher-6d1f`

I checked the two natural 256-byte objects as direct GP29 key streams against the current Wulfic C17 bound.

- LP2 p50 `base60-grid.json` byte rows, mapped by `byte mod 29`: collision probability `Σq² = 0.0409241`, effective alphabet `V_eff = 24.44`.
- 2014 Stage11 `sexagesimal.bin` bytes, mapped by `byte mod 29`: `Σq² = 0.0406799`, `V_eff = 24.58`.
- Wulfic current C17 requires `Σq² ≥ 0.06232` for an iid key independent of plaintext to explain the observed 86/12,947 adjacent doublets. Both direct mod29 streams are too flat to be the primary iid key under that model.
- Repeating either 256-byte sequence directly is also ruled out by the current periodic-key constraints (period 256).
- The apparent five-symbol high-digit distribution of the base60 tokens (counts 60,58,65,56,17; collision 0.223) is only the ordinary base60 representation of uniformly distributed bytes 0–255: `floor(byte/60)`. It is not evidence of a five-symbol key or the 19% re-key leak.

This is a bounded exclusion of direct modulo/repeating-key readings, not a claim that the table cannot be a PRNG seed or a sidecar. No source-grounded seed/inverse is known.