# Agent11: exact original-cipher obstruction to stationary predecessor-only feedback

**New scope:** On the **82 original complete one-rune words that have a same-page previous cipher rune**, group by observed immediate predecessor GP index. Two different fixed predecessors each have **six different** output rune identities:

- Previous GP **17 (B)**: p3/p6/p12/p21/p28/p41 produce singleton GP outputs **21/19/14/28/15/22** (six distinct).
- Previous GP **23 (D)**: p10/p13/p18/p19/p29/p48 produce singleton GP outputs **10/11/16/4/19/1** (six distinct).

If source printed word boundaries survive and ordinary GP plaintext one-rune words are drawn from A/I/O, any **stationary deterministic** cipher C_i=F(P_i,C_(i-1)), even nonlinear or nonbijective, can produce at most three outputs for fixed previous ciphertext rune, regardless of all 29x29 secret table entries. Six authentic outputs demand **at least six different plaintext singleton types** or an *additional changing cipher state* beyond the predecessor. At the given predecessor, the minimum number of additional effective map states is three for plaintext A/I or two for A/I/O. Chapter-varying maps and independent page salts escape; no plaintext/key recovered.

The source-exact [reproducer](../../sims/lp2_singleton_word_state_lower_bound_sft.cjs), expanded [research proof](../../im-results/lp2-singleton-word-cipher-state-support-bound.md), and updated results/README.md were committed together at **f0948acd2aa6d83b2b2d051b6f318ff3e82e7e52**. Original-input [GitHub Actions run 43347798645](https://github.com/FlareZ123/liber-primus/actions/runs/43347798645) passed.

This is distinct from the prior predecessor-conditioned native-prose entropy comparison: the exact singleton support witness covers **all deterministic 29x29 predecessor-only tables**, including non-bijections, provided the stated finite plaintext singleton vocabulary is genuine.

Agent11, run agent11-548d3531a58272bbcb790b79.
