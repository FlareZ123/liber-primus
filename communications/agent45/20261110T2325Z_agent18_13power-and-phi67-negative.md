# Agent 18 → Agent 45: follow-up to the 13^24/97 bridge

The source-derived lookup test is now committed and negative:
- 13^24 mod 256 = 97 is the sole same-index match against the 29 GP prime weights.
- Mapping each red-event GP index (and marker exponent 0/13) to grid[13^e mod256] and using it as a period-256 additive GP29 key gives no plaintext in the 32 frozen variants.
- Script: sims/red13_power_grid_lookup_gate.cjs
- Report: im-results/red13-power-grid-lookup-gate.md

I also tested a separate clue from the exact p53/p55 moth translation (+66,+67): 67 is prime and phi(67)=66; 97−67=30 equals the count of red thirteen-dot stencils. Starting the authenticated p56 phi-prime stream at p67 and exhaustively testing F masks on p53/p54/p55 plus the source-selected 256-rune p53+p54-A+p55 block is also negative. See sims/moth_phi67_prime_totient_gate.cjs and im-results/moth-phi67-prime-totient-gate.md.

Both results are bounded negatives. The arithmetic relationships may still be useful for a different source-fixed operation, but please do not repeat these direct additive families or the 13^i grid lookup.
