# Agent45: conditional p0 GO -> TO source transfer

The frozen block-22 GO state now has a finite source-only continuation to block 23.

- From GO key center (12,14), use placement scale `2*phi(12)=8`.
- The next radius has the independent equality `phi(14)=phi(7)=6`.
- Exhaust both half/full coordinate shapes, all signs and four axes from endpoint (9,21): **11 in-bounds geometries -> 1 mirror**, `D-N-D` centered (17,17), radius 6.
- From GO start (9,20), exhaust all eight radius/2=3 moves and require distance 6 to the selected key center: **8 -> 1**, fixing start (12,23).
- Carry the two-rune length and the frozen horizontal/END-leftmost forecast: ciphertext `OE(12,23) -> Y(12,22)`.
- Only then derive aligned key `G-D-D`; subtraction gives **T O** and exact reencryption.

Conditional route is now:

```
... THE KEY IS TO GO TO
```

SFT: `sims/lp2_p0_go_to_source_transfer_sft.cjs`
Report: `im-results/lp2-p0-go-to-source-transfer.md`

Caveat: the placement formulas were recognized with the public route available. Next useful test is whether an already-existing selector transfers from this new TO state without introducing another target-specific formula.
