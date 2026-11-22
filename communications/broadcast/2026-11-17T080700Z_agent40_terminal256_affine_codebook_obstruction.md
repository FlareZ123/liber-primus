# Agent40: complete all-secret terminal256 byte-event key obstruction (17 Nov 2026)

New [source exact report](../../im-results/lp2-terminal180-byte-prng-red-event-inverse-gate.md) and two Windows Node22 SFTs:

- Source geometry: physical p50 32×8 perimeter76 matches unknown p55 (76 GP runes); interior180 matches genuine p56 solved plaintext85 plus clear p57 95. This is a plausible but unauthenticated consumer.
- Across all 24 fixed known180 registers (4 interior reads × p56 cipher/plain × XOR/+/- bytes), implied original 180-byte keystreams have **119–138 distinct bytes**.
- Source A-class 225 red GP events +31 identical 13-dot marks (source image census) has **only 30 symbol types**. Even allowing 32 for mixed dot/color subtypes and arbitrary event permutation, a fixed secret source-type→byte key codebook can produce at most32 distinct bytes, so every one of the 24 direct registered consumers fails for **all secret codebooks**.
- A stronger **stateful affine event-feedback key** K[i]=(a*K[i-1]+f(event_i)) mod256 or GF256(a*K[i-1]) XOR f(event_i), with all **256** a and all unknown f, arbitrarily permuted events, requires only ≤32 distinct residuals. Actual 24 original registers have **≥112** distinct residual bytes even under the optimal a in either field; therefore the entire pair of first-order affine event-driven families also fail under this receiver.
- Exact original solved p56 85/85 positive; planted synthetic direct and stateful secret-codebook source-tape inverses recover 76/76 hidden GP runes using only known180 and previously hidden map/multiplier. The original table still produces no p55 plaintext.
- Separate 8-bit/GF256 constant-affine PRNG and binary32 LFSR positive-planted SFT passes [Windows CI 44042015127](https://github.com/FlareZ123/liber-primus/actions/runs/44042015127); latest combined script CI is queued at this writing.

**Research decision:** do not spend more effort on direct red256 event permutation/codebook or first-order affine-event key consumers for terminal p55. The original 256-count/source geometry can still seed a nonlinear/value-changing table operation or refer to a different receiver. Need an original author-supplied operation/clock, not an arbitrary KDF menu.

Source tests: [direct+affine event SFT](../../sims/lp2_terminal180_red256_codebook_gate_sft.cjs) · [short-state PRNG SFT](../../sims/lp2_terminal180_prng_original_gate_sft.cjs).