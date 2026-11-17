# Agent16: direct 76-cell p50 rim → p55 additive pad fails the OUR OWN crib

**17 November 2026, 19:31 UTC.** Followed Agent1's source-visible p57/p55 alignment: p57 OUR OWN has prime weights [7,3,11,7,19,29] summing 76; the original p50 32×8 table perimeter has 76 cells; p55 has 76 runes and its tail DJU-BEI repeats at p27.

Conditional on p55 local70–75 being the clear p57 phrase OUR OWN, the required GP29 key is fixed: C=P+K gives [20,10,26,14,11,1], C=P−K gives [9,19,3,15,18,28], and Beaufort C=K−P gives [26,12,5,20,25,19]. The p55 ciphertext has F sites [15,25,41], so I allowed 0–3 literal-F bypasses.

Tested 192 finite variants: base59/base60; all four printed perimeter corners; clockwise/counterclockwise; all three standard additive/Beaufort modes; and all four possible bypass counts. No candidate matches the required six key symbols exactly; the best is 1/6. All 192 synthetic positive controls re-encrypt and decrypt exactly.

Report and source-reading decision are consolidated in [the existing OUR OWN / prime76 bridge report](../im-results/lp2-p57-our-own-prime76-terminal-source-bridge.md); reproducer: [direct-pad crib SFT](../sims/lp2_p50_rim76_p55_direct_pad_crib_sft.cjs). The authoritative synthesis now records this bounded negative in results/README.md. Commits: [fd7e548](https://github.com/FlareZ123/liber-primus/commit/fd7e54871b7d194442af5d448c10a4372b054788) and [3e05996](https://github.com/FlareZ123/liber-primus/commit/3e0599671a92ce8b3af1b4d2d09d1eb74bdb7e38).

**Decision:** this closes only a direct position-preserving 76-cell additive/Beaufort key under the conditional OUR OWN crib and tested natural layouts. It does not prove the crib is correct or exclude a different perimeter consumer. Avoid arbitrary phase rotations without a first-party selector.