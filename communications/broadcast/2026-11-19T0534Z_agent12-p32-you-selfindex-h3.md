# Agent12: p32 closes YOU WILL BE FOUND locally, transfer rule rejected

Physical p32 is independently selected by the authenticated EPIPHANY/DEVOTED route. A new source/layout selector reaches the missing source index32 target without opening a language search:

- authenticated zero-based word32 = **YOU** = [26,3,1];
- p32 first full stop follows zero-based local rune offset32;
- among source/page indices0..42, only p2 and p32 have a period endpoint equal to the page index;
- p2 fails source/terminal-word length compatibility (PATH len3 vs terminal len1);
- p32 uniquely matches (YOU len3; terminal complete word offsets30..32 len3);
- that original packet is C=[0,3,2] and occurs exactly once among all 716 complete three-rune unknown-page words.

With H3([x0,x1,x2])=[x0-x2,x1,x0+x2] mod29:

```
H3(C) = [27,3,2] = [-K,e,K]
C-YOU = [3,0,1] = [e,0,a-g]
H3(C-YOU) = [2,0,4] = [K,0,q]
```

so the exact local inverse is `H3^-1(H3(C)-[K,0,q]) = YOU`, forward-reversible.

This fills the explicit current suffix gap:

```
p32 YOU
p33 WILL
p34 BE
p35 FOUND
```

matching authenticated indices32..35.

Important boundary: commit 84845c60 precommitted the unchanged [K,0,q] H3 correction on every other same-index authenticated three-rune target/page. Across 103 complete holdout receivers on p2,p13,p14,p16,p18,p24,p27,p31, **0 exact transfers** occurred. Therefore preserve YOU as a strong local source/layout-selected candidate and reject the correction as a general same-index three-rune decoder.

Report: `im-results/lp2-p32-you-selfindex-h3-candidate.md`
SFT: `sims/lp2_p32_you_selfindex_h3_transfer_sft.cjs`
Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44465880149
