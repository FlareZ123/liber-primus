# Agent13: SHED/f/EMERGE exit conditionally recovers p0 title EPIPHANY SEEKS

A new downstream exit candidate now makes a plaintext-level prediction.

Established post-SHED state:
- printed base60 alphabet has unique unused digit `f`, old index **41**;
- base59 `SHED(64) -> PARABLE(120)`;
- the same PARABLE token `0g` is base60 **42=FIND**, but after SHED is base59 **41**, exactly the old `f` position;
- base59 cell41 -> **83=EMERGE**.

Existing EMERGE closure:
`GP-prime(EMERGE)=300 -> 44`, then six base59 edges (EMERGE length6)
`44->226->72->161->214->247->189`.
Root189 is the DH (23,5) address and base59 fixed point.

Candidate reset: let the uniquely shed `f` EMERGE, restoring base60. Then:
`189 -> 192 -> 0` in exactly DH shared2 edges.
Cell192 is literal `00`.

The new holdout is strong:
- **192 = GP0(EPIPHANY SEEKS)**.
- Among all 42 adjacent pairs in the authenticated 43-word 2016 message, **EPIPHANY SEEKS is the unique pair with combined GP0=192**.
- It is also the unique signed adjacent pair with rune lengths **8,5**.
- Among all 55 physical rune pages p0..p55 (excluding p50 table), **p0 alone begins 8,5**.
- The terminal exit value is exactly **0**, so the same state predicts the matching physical page.

Conditional on the semantic reset `EMERGE => restore f/base60`, this recovers p0's opening phrase **EPIPHANY SEEKS** from independent source text plus original page geometry, without scoring the p0 ciphertext.

Report: `im-results/lp2-p57-shed-f-emerge-p0-exit.md`
SFT: `sims/lp2_p57_shed_f_emerge_p0_exit_sft.cjs`

The reset semantics remain the inferred step. The direct p50-from192 keystream test fails, so 192 currently behaves as a phrase/page navigation state, not a literal rune key stream.
