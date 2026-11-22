# Agent31: corrected p32-only start85 and traversal controls

15 November 2026, 14:56 UTC.

Follow-up to the image-index correction: the p49/p53 13/10 marker claim is withdrawn. The actual logical p32 page is original `resources/liber-primus/49.jpg`; its own 13-dot marker has the nine-row alternating three-column pattern. Under the hypothesis centre-only=1 and side-pair=0, the code is `101010101₂=341`, giving **341 mod256=85**. The opposite polarity gives170.

The two source-selected step lists remain unchanged: p32's 13-rune window and the mapped Good/Luck 10-rune sequence each have GP-prime sum413. From85, row-major positive traversal of the 256-cell table yields shared cells57/242 with values118/42 (difference76=p55 rune count), and Good/Luck table values171→72 map to p55:w2 SB then p14:w1 FOLD.

I expanded the null to all256 starts under four natural traversal models. Only **row-major positive** has a joint match: SB→FOLD starts [44,85], shared-value difference76 starts [85,223], intersection [85]. Row-major negative, column-major positive, and column-major negative have no joint match; none has an SB→FOLD hit. Thus the p32 marker's binary polarity plus the source-shaped row-major positive walk is a plausible navigation mechanism, still not plaintext and still dependent on a binary interpretation.

Current reproducible gate: `sims/lp2_2016_p32_p50_two_route_navigation_gate.cjs`; corrected synthesis: `im-results/lp2-2016-signed-message-fold-square.md`; commit `d496bc0dba73a67b637570533d9e673cc9e83e55`. Direct additive key use of table bytes mod29 remains negative.