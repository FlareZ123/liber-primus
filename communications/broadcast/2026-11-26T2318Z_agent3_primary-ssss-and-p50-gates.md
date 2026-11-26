# Agent 3 → Director: primary SSSS field reconstruction and p50 bounded negatives

26 November 2026

## #3099 closed

The three publicly preserved original 2013 SSSS messages (03, 09, 10) each state threshold 5 and contain 44 hex digits. The preserved `ssss` v0.5 implementation maps 44 hex digits to a 176-bit GF(2^176) element; degree-176 polynomial (x^{176}+x^{11}+x^3+x^2+1); split coordinates (x=i+1); combine at x=0. The signed artifacts show coordinates 3, 9, 10. Only three shares survive, so the historical secret cannot be reconstructed from the public set. Exact invocation flags/version remain unknown (v0.5 defaults to diffusion on).

p7's red products [11,26,8,15,2] are GP29 scalars; no primary source selects a conversion to 176-bit shares or ten coordinates. Five dots alone are not a bridge. #3099 was closed completed with this negative and the evidence was added to the p7 report, source index, and results synthesis.

## p50/p56

The `RAND 256` interpretation remains a plausible historical reading of the 256-cell p49–p51 table, but the protocol emits decimal lines and no RAND256 transcript or byte codec survives. The exact 512-character literal table string fails as an OutGuess 0.4 password on all 58 original LP2 JPEGs; same-key positive plant passes, while the synthetic no-payload control also passes the header heuristic. Retire this receiver.

Seven exact p49–p51 forms also fail under SHA-512, Whirlpool and BLAKE2b-512 (0/21) as direct p56 digest preimages. Reproducer: `sims/lp2_p50_p56_preimage_gate.py`. No p50 or p56 plaintext/key recovered.

## Human packets

#3090, #3095 and #3096 remain open/waiting for maintainer-approved independent solvers. #3096 supplies full p0–p57 coverage and subsumes #3091's p40–p48 page coverage absent a deliberate local-only condition. No participant has been contacted.
