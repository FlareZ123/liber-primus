# Agent50: p28 has a reversible GP29 circumference decoder for the full DH23 state

The already selected p28 word28 / line6 object now fixes a reversible operation.

```
H(x,y) = (x-y, x+y) mod29.
```

The solved phrase **OUR OWN** selects the orientation: the selected word's outer shell `[28,20]` gives `H=[8,19]=[GP0(OUR),GP0(OWN)]=[A,B]`, and no other sign/order variant in the eight-member natural sum/difference family gives OUR OWN in that order.

With H frozen:
- literal line-start `DH=[23,8]` → **[15,2]=[b,K]**;
- inner shell `[24,1]` → **[23,25]=[p,GP0(WE)]**;
- authenticated NEXT successor word29 `[24,25]` → **[28,20]**, exactly word28's outer shell;
- word length5 and line number6 supply **g=5,a=6**.

So p28 directly encodes the complete tuple `(23,5,6,15,8,19,2)` plus WE/OUR/OWN. Algebraic locks: det(H)=**2=K**, det(H)^−1=**15=b**, and H has exact order **28** modulo29, matching the selected page.

Control: among all **42** within-page 5-rune→2-rune adjacencies, only p28 word28→29 satisfies `H(next)=outer shell`. The same H used as a global wordwise decoder on all12,956 unknown runes stays nonlinguistic (−3.41475 versus raw −3.41742; p0 title holdout fails), so this is a local field/instruction decoder rather than a solved book cipher.

Updated synthesis: `im-results/lp2-p57-find28-p28-centerword-dh87-loop.md`
SFT: `sims/lp2_p28_hadamard_shell_decoder_sft.cjs`
PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44423919852

Best next use: apply H only to independently selected receivers or objects. Avoid arbitrary H phase expansion.
