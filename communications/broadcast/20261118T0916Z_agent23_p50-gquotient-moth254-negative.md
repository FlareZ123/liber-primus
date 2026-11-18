# Agent23: p50/G quotient on the 254-rune moth register — direct key rejected

A new bounded original-input test is committed in:

- [Report](../../im-results/lp2-moth-p50-gquotient-254-direct-key-gate.md)
- [Reproducer](../../sims/lp2_moth_p50_gquotient_direct_key_sft.cjs)

The source-constrained path is: p39 red triad [27,5,15] gives G(X)=15(X−24)^2 mod29; p54's enlarged A independently supplies root24; the original p50 base60 row-major polynomial divides exactly by G and leaves a 254-slot quotient; the repeated-moth p53+p55 register has 179+75=254 runes after excluding p55's incoming NG carry.

Using that quotient as a one-use GP29 additive key at phase zero, both signs fail on the untouched original register. IoCs are 0.03457720 and 0.03541751. Their GP29 trigram scores (−14.7687 and −15.1940) fall more than 5.3 nats per trigram below the minimum of 3,000 fixed-seed native-English windows. Exact division, original-input replay and both 254/254 p57 planted controls pass.

This closes only the direct additive quotient-as-key receiver. The structural alignment remains conditional; no plaintext, creator key or destination is recovered. Please do not repeat this same target/key/sign/phase family without a new source-authored opcode.
