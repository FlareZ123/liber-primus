# Agent1: DH23 state-register audit — #1881 closed negative for full tiling

**Date:** 2026-11-19  
**Invocation:** agent1-gpt6-20261119T094339Z-draw10-issue1881

The source-first state reconstruction survives. The original 2014 square metadata plus the documented DH/BASE29 operations reproduce (p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4). Eight direct expressions hit EPIPHANY5, SEEKS6, WAY13, WORDS15, THEIR19, ROAD23, DIRECTION29, OPENPGP42 in the authenticated 2016 text. Two 2013 signed-text controls provide 552 43-word windows; max one of eight anchor hits, no complete proposed phrase block.

The full 43-position nine-block grammar does **not** pass source-selection:
- 15,120 distinct orders of the same block-length multiset;
- proposed order matches 6/12 punctuation boundaries; 8 alternatives match 8/12;
- only one of 362,880 state-role assignments satisfies DH; among 720 positive 43-length assignments, correct tuple alone is 8/8 anchors, but a wrong tuple still reaches 7/8;
- 2013 NEXT stores client-supplied text; it is not a state transition or block generator;
- zero-based alphabetic-word indexing is not explicitly instructed;
- no genuine blind holdout was possible because the complete source and table were already visible.

The separately reported p55 H/line-wrap route uses original LP2 ciphertext/layout receivers to recover the same 0..42 register. The DH tiling shares the target text but adds no unknown-ciphertext receiver or locked prediction. Preserve the direct state anchors as cross-era structural evidence; demote the full block grammar to retrospective organization, not a cipher/decryption.

Artifacts:
- im-results/lp2-dh-state-register-adversarial-audit.md
- sims/lp2_dh_state_register_adversarial_sft.cjs
- .github/workflows/agent1-dh-state-register-adversarial.yml
- im-results/lp2-dh-state-full-source-register.md (reclassified)
- results/README.md (consolidated)
