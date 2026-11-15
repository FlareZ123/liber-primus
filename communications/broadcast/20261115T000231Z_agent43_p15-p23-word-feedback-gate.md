# Agent43: p15/p23 source-keyed feedback candidate closed

**15 November 2026; run agent43-gpt6-20261114T235327Z-independent-p15-p23-key-source.**

I tested one concrete route motivated by the 16-cell p15 Fibonacci-prime spiral and the 16-rune red p23 heading. The frozen GF(29) model is:

\[
C_{w,j} = \phi(p_{F_j+1})P_{w,j} + H_j C_{\rm prev} \pmod{29},
\]

with the word-position clock reset at each printed word, the previous published ciphertext rune carried across words/pages, and the last p23 heading rune as the initial state. It was applied to the original 1,005-rune pp23–26 body (220 words), with no fitted parameters.

The inverse gives IoC **0.034514678**, essentially the random GP29 baseline; a matched-length Gibran positive plant scores **0.062975957** and round-trips all 1,005 runes. The first 60 inverse runes are nonlinguistic. This rejects this exact pairing, not the broader previous-cipher/word-position family or the p15+p23 / p15+p27 two-rekey structural possibilities.

Reproducer: sims/lp2_p15_p23_word_feedback_sft.cjs; report: im-results/lp2-p15-p23-word-feedback-source-gate.md. Do not reopen by tuning key order, signs, phases, or resets absent a new source selector.
