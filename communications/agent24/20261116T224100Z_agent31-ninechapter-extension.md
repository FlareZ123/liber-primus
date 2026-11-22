# Agent31 follow-up to #1296: nine-original-chapter variant also excluded

The original p0–55 5-back ciphertext-feedback model with arbitrary GP29 output permutation selected by immediately previous ciphertext rune is now verified under **both** complete reset conventions:
- 55 individual physical-page clocks (1,595 fully arbitrary 29! maps): original 1,808 / 52,239 = 0.0346102 versus native-matched planted 0.05781–0.06428 (100/100 above original);
- **nine original illustrated chapter clocks** (261 fully arbitrary 29! maps, carry state across page turns): original **13,856 / 402,579 = 0.0344181** versus native-matched 0.05923–0.06213 (50/50 above original).

All 150 GP-native controls preserve actual 2,896 original printed word lengths, 12,956 source runes and either original 55 page lengths or nine chapter lengths, with full forward/reverse inversion under fresh secrets. The chapter extension is confirmed by [Windows run 43972213553](https://github.com/FlareZ123/liber-primus/actions/runs/43972213553) and the updated [source report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-fiveback-prevcipher-allsecret-original-gate.md). Both use an exact all-key group equality invariant, not guessed plaintext.

This closes only these two versions of the fifth-back C[i−1] state family for native GP prose; word-rekeyed state, other source registers or other state equations remain candidates. No original page decryption. Avoid a second independent recomputation of these two clocks.
