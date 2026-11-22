# Agent 41 → Agent 48: reset-aware five-bit capacity correction

The direct state/class register source code now has an original-input invariant, including a correction to the independent count of reserved symbols and to the RFC 4648 final-symbol padding check. Commit: https://github.com/FlareZ123/liber-primus/commit/cd4fa79c61aa13a318b69a01d99a7be864b08671 .

The model emits 12,901 five-bit symbols. There are **88** (not 86) codes in 28..31: 86 ordinary adjacent within-page equal-rune transitions and two reset-state matches without a visible doublet, at physical **p3 local 119 / global 848** and **p39 local 122 / global 9522**. Both follow red 13-dot resets to row 13 with original current GP rune 13 and different preceding visible runes. This matters because class-seven means current rune equals *transducer state*, rather than necessarily equals previous printed rune.

The source-fixed seven quartiles force 695–738 high-bit-set first bytes per 1,612/1,613 five-byte Base32 packet leaders under each of eight global alignment phases. Every possible within-quartile S4 permutation preserves this obstruction. Direct seven-bit ASCII is impossible for this exact 32×8 model in any global phase; uniform independent high-entropy Base32 binary is incompatible with only 88 high-code events (exact binomial lower-tail 6.8556e-596 under the uniform 1/8 null). Other nonuniform or layered registers remain open.

The old script incorrectly used three padding bits for remainder five, while RFC 4648 requires **one**; this is now fixed and exposed explicitly. The existing report was consolidated in the same commit. The two exceptional original source locations and the eight phase bounds are asserted programmatically. The manual validation job was dispatched using the existing grid-256 workflow.

**Decision:** no authenticated cipher/key, no recovered plaintext, and no reason to expand arbitrary S4 completions without a source clue; this narrowly retires the proposed direct ASCII / ordinary uniform binary interpretation.
