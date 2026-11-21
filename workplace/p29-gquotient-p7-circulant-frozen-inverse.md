# P29 G-quotient as receiver of p7's source-DH right-circulant 5×5

**Agent6, 21 November 2026. Test plan frozen in the shared repository before inspecting this original decoder's 275-glyph output.** Candidate hypothesis; none of the cross-page state/key handoff is authenticated by an author instruction.

## Exact source-driven candidate

The five visibly separated red p7 words directly over five black dots, in their original order, have original GP29 products `[11,26,8,15,2]`; recent independently completed [#2066](https://github.com/FlareZ123/liber-primus/issues/2066) derives the right-circulant `M` and its exact inverse, whose first row is the authenticated 2013 Cicada DH23 state `[23,2,5,2,19]`. The immediately following p8 whole-page Hill consumer has already failed; **do not rerun it or adjust its phase**.

A materially different exact receiver is original **physical p29**. The authenticated 2016 29-word body explicitly ends with **DIRECTION** at source ordinal29, while LP2 p28–p29 contains independent direction-word and numeric route cues (see `im-results/lp2-p28-numbers-direction-readout.md`). The p29 original source has **277 GP29 runes**; dividing its unchanged high-degree-first GF29 rune polynomial by the original p39 red quadratic `G(X)=27+5X+15X²` yields **275 runes, exactly `55×5`** with zero two-symbol remainder. Further, `275=11×25` matches the separately established p50 source table's 11-cycle and the original 2013 five-by-five wisdom square. These numeric fits justify **testing** the compact branch but do not establish that a solver should combine p7, p29 and p39.

**Frozen decryption in original physical order:** treat all 275 quotient symbols as 55 consecutive **column** vectors `C_i` of length5; compute `P_i = M^{-1} C_i (mod29)`, concatenate every decrypted five-rune block without crossings/word resets, without key phase, secret seed or index changes. Use the literal published right-rotating source matrix and inverse only:

```text
M =        11 26  8 15  2
            2 11 26  8 15
           15  2 11 26  8
            8 15  2 11 26
           26  8 15  2 11

inverse = 23  2  5  2 19
          19 23  2  5  2
           2 19 23  2  5
           5  2 19 23  2
           2  5  2 19 23
```

**Fixed acceptance test:** entire 275-symbol output must contain at least 100 continuous, semantically coherent native-GP runes, with ordinary native-language symbol concentration, then independently predict an untouched original section using the same selected receiver rule. Verify exact round-trip `M×(M⁻¹×Q)=Q`, multiply original red G to recover all 277 source runes, and prove a full known-native p57 plant survives the entire G→Hill transport. A check-only affine fit or after-the-fact permutation is not success.

**Stop:** If this standard, source-rooted Hill inverse is nonlinguistic on original p29, reject this exact composite p7/p39→p29 route. Preserve new source algebra separately. Do not fit phases, row orientations, new matrix keys or grille masks to rescue it, and do not claim the original 2013 sample was a signed 2014 LP2 key.
