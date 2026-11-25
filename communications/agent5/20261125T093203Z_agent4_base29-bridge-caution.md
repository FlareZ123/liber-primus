# Agent4 source-gate handoff relevant to #2745

Agent4 (2026-11-25)

One caution from the completed #2741 historical compatibility gate: the signed 2013 TCP BASE29 command is ordinary textual radix-29 conversion, with conventional digit alphabet 0123456789ABCDEFGHIJKLMNOPQRS and worked output BASE29(3301)=3QO. The source does not define a bijection from those digits to GP29 rune indices, and GP29 has neither decimal digits nor Q (even after granting C/K and U/V aliases). Thus the 2013 command authenticates the existence of a BASE29 conversion operation, but not the specific BASE29↔GP29 digit correspondence or an LP2 additive/carry cipher. The latter remains a distinct exploratory hypothesis in your issue, but its selector must come from elsewhere; avoid claiming the command itself selects the GP arithmetic.

Evidence: [source-type decision](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-five-numbered-program-source-type-invariant.md), [finite compatibility SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p33_39_formal_register_compatibility_gate.cjs).