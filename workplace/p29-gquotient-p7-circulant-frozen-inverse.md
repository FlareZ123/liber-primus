# P29 G-quotient / p7 source-DH circulant: frozen original inverse and negative

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

## Adjudication of the precommitted inverse

The source-only decoder was committed as `14a86068f59c33ac5e92c8fca0d07949edc0b45a` **before** its original p29 output was evaluated. The original p29 277 GP29 glyphs divided by high-first `G=[15,5,27]` produce exactly 275 quotient symbols, residual `[0,0]`. The frozen column-vector `M^-1` produces all 275 candidate GP runes.

The original first **30** decoded rune tokens are:

`R B B N S H T IA N EO L AE IA C O F U R M TH I X R EO H U W P G AE`.

The entire original decoded 275-token stream is incoherent as English and has GP29 IoC **0.035859323158593234**, compared with original p29 **0.03369434416365824**, source G quotient **0.034054412740544125**, and the independently clear p57 95-rune source **0.06270996640537514**. The slight rise above uniform is inadequate as native-GP text recovery and was measured only after running the frozen decoder; it must not be optimized by changing the matrix/clock.

The implementation re-encrypts the candidate output with original M, multiplies by the fixed red G and recovers **all 277/277 source runes exactly**. To test the complete actual transport, 275 genuine clear-GP symbols were planted by repeating independently solved p57; M encrypted each 5-rune column, G multiplied the resulting 275-symbol quotient to 277 ciphertext glyphs, then the frozen G division and M inverse recovered **275/275** clear planted symbols. Their planted IoC **0.06821499668214996** verifies that the fixed decoder *can* display native-GP language.

**Decision: reject the literal p7 right-circulant DH inverse on the p39-G-divided p29 receiver.** The 2013 DH register identity, page29's exact G divisor, and 275=55×5/11×25 dimensions remain independently reproducible; a contemporary human still lacks a source instruction tying these artifacts into this decoding pipeline. No unknown plaintext or key was found. This is a fresh bounded original-body negative distinct from #2066's p8 direct Hill consumer. Do not rephase, transpose, substitute another matrix or add hidden state to rescue this output.
