# Agent12: strengthened solved-p57 within-word checksums and a shared zero/F endpoint

14 November 2026. [Consolidated source report](../../im-results/lp2-p57-divinity-p50-primewalk-closed-loop.md), [read-only original-source SFT](../../sims/lp2_p57_divinity_p50_primewalk_sft.cjs), [passing Windows Node22 CI 43638766952](https://github.com/FlareZ123/liber-primus/actions/runs/43638766952).

**More direct source cue than our earlier GEM graph.** Solved p57 says "TUNNELING", "SHED OUR OWN CIRCUMFERENCES" and "FIND THE DIVINITY WITHIN". For each *original rune word* W, address the 256-byte original p49-51 table at one-based \`GPprimeSum(W) mod256\`, then compare the byte to the GP-prime sum of W with its **first and last GP rune removed**:

- Original p57 \`TUNNELNG\` sum339 → one-based **cell83**, original \`3L\` = **201**; interior \`U N N E L\` prime sum **201**.
- Original p57 \`DIUINITY\` sum376 → one-based **cell120**, original \`34\` = **184**; interior \`I U I N I T\` prime sum **184**.
- These are **the only 2 matches among all 20 p57 complete words**. Across all 2,896 original unsolved printed ciphertext words only six meet the same condition; no universal word-cipher or plaintext follows.
- Separately first p57 word/title \`PARABLE\` prime sum449 mod256=**193** → source cell193 **literal \`00\`/F**. The already-known 2016 signed wordmap \`LIES\` prime sum224 =58×3+50 → fourth original p50 token \`3D\` = byte **193** at joined cell84; **new simple byte→one-based cell pointer** 193 likewise reaches cell193=\`00\`. Signed 2016 source says "The path lies empty", but **no authenticated byte→cell pointer operation is supplied**.
- On Agent6's **previously fixed** GP29 q/r+keypad graph, p57's within-word seed cell120 reads \`I O G E M\`, joining signed-2016 original width-prime ordinal start103 at cell111. Prime-summing the full five symbols gives **193**, exactly the terminal cell128 source byte193, also points to the same \`00\` cell. The q/r/keypad convention remains hypothetical.
- This new p57-internal **184** equals the previously published p32 13-rune window source operand \`184+193+36=413\` in [p32 signed-2016 source report](../../im-results/lp2-2016-signed-message-base58-word-map.md), with 193 also selected by old LIES base58. That relates landmarks but still gives no cipher operation.

This is provisional **source-constrained navigation evidence**, with actual source-string assertions, exact row/byte positions and no invented plaintext. It does **not** undo previous p50/p55 all-secret key obstructions. No unknown LP2 rune decrypted.

**Needed next:** one authentic 2014-2016 clue or a precommitted *original-cipher consumer* using the observed 184,201,193 and possible zero/F endpoint; without it, further chain arithmetic will not recover text. Please assess this new within-word rule before commissioning more broad low-complexity key sweeps or arbitrary paths.
