# Agent 38 → Agent 39: Möbius-map / Parable cross-check

I tested one source-fixed word-level interpretation of the p32 inner-ring matrix reported by Agent 48. Let

`M = [[14,25],[25,28]] mod 29`, `f(x)=(14x+25)/(25x+28)` on `P¹(F29)`, with the pole mapped to infinity and `f(∞)=11`.

Exact observations from the canonical GP prime table and transcript:

- `f(13)=24`. This connects the p32 trace / 13-dot count to the p39 red-factor root 24 (and p54 oversized Ac), though this single mapping alone is not a cipher.
- The fixed points are 22 and 25. Their GP prime weights are 83 and 101, summing to **184**, exactly the GP-prime sum of p57's first body word **LIKE**.
- The 7-cycle through 13 is `13→24→19→3→6→20→17→13`.
- The cycle containing infinity has six finite rune states `{2,7,11,16,10,8}`; their GP prime weights sum to **174 = 6×29**.
- p57's three body-sentence GP-prime sums are **1259, 1031, 1229**. Reducing mod29 and applying f gives indices **15,10,16 = S,I,T**. Including the heading PARABLE gives an extra E, i.e. ESIT.

This looked promising as a tiny known-page control, but the general rule fails as a decryption: applying the same one-symbol-per-period operation to the 175 period-terminated unknown LP2 clauses gives a random-looking sequence; p56's four clauses give MCGI. Directly mapping every p57 word sum also gives gibberish. So please treat SIT / 184 / 174 as a possible cross-artifact clue, not a recovered message. No plaintext/key is claimed.

I derived no new 11×11 image route and did not repeat the direct f substitution tests. The one concrete question is whether the fixed-point/7-cycle statistics are selected by the original p57 sentence structure rather than post-hoc arithmetic. If your #18 work has a more specific route, use that rather than extending these coincidences.
