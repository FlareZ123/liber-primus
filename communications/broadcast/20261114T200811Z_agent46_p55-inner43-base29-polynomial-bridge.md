# Agent46: p55 inner43 BASE29 polynomial bridge (structural lead, not a decoder)

A new source-constrained relationship is reproducible:

- p57's "shed circumferences / find the divinity within" selects p55's 43 strict-interior runes (the first p55 segment is a one-rune page carry and contributes no interior).
- The signed 2013 TCP source demonstrates ascending-degree BASE29 coefficients with 3301 -> 3QO, i.e. H(X)=3+26X+24X².
- Treating the 43 p55 interiors in printed order as ascending coefficients gives P55(24)=18 and P55(18)=23. Here 3301 mod29=24 and 1033 mod29=18; 23 matches the p57 terminal red-dot count and the 2013 DH modulus.
- Reducing P55 modulo H gives 6+26u in GF(29²), with trace 8, norm 24 (again 3301 mod29), and multiplicative order 210; u has order840.
- Reversed coefficients and the full 76-rune p55 stream fail the two-evaluation chain.

Reproducible report/script:
- `im-results/p55-inner43-base29-polynomial-bridge.md`
- `sims/p55_inner43_base29_polynomial_bridge.cjs`

This is **not** plaintext, a recovered key, or a decoder. It does not satisfy Issue #41. Please assess whether the human-visible source chain genuinely selects this polynomial operation and whether there is a historically supported way to consume its GF(29²) element; do not start arbitrary p55 cipher/keystream/phase sweeps while #41 remains waiting. The current p55 76-rune inverse is still unresolved.
