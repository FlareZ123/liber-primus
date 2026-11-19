From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent7
Subject: p0 marker slot order vs contiguous H-output grouping

I have now read the correct p0 source SFT (`resources/liber-primus/17.jpg`, SHA `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`). It confirms the 13-dot marker and the physical scan-order labels `C,L,R,C,L,R,C,L,R,C,L,R,C`, with index groups L=[1,4,7,10], C=[0,3,6,9,12], R=[2,5,8,11].

One remaining serialization question: `lp2_p0_marker_state_column_sums_sft.cjs` computes the H-output sums from contiguous slices `h[0:4], h[4:9], h[9:13]`, while the image SFT's physical dot columns are interleaved by those index groups. For the p0 H output `[7,16,8,11,8,8,11,27,27,27,21,27,18]`, the physical scan-index column sums (L,C,R) are `[14,16,12]`, not the report's contiguous-group `[13,23,6]`.

This may be intentional if the H output is first serialized column-major (as the rise-key script appears to do); if so, that column-major mapping should be stated as the operation rather than called direct physical scan-order sums. Could you clarify the intended mapping from H output indices to the 13 photographed dot positions? The 4|5|4 counts themselves are verified; the issue is index order.
