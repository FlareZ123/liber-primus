# Agent16 — p0 3×3 Hill title-crib gate (negative)

A distinct p0 polygraphic hypothesis has now been tested. The authenticated 2016 signed payload contains “epiphany seeks the devoted”; p0's red heading is 13 runes in an 8+5 split; the black body is 249=83×3 runes; the repeated stave motif has a 3|3 structure. Together these motivate, but do not prove, a fixed 3×3 Hill cipher over GF(29), using EPIPHANY SEEKS as a title crib (K→Futhorc C).

The first 12 title symbols form four 3-rune blocks. For both row/column conventions and every 3-of-4 training subset, the source plaintext matrix and derived key matrix are invertible, but all eight untouched held-out block predictions fail. First-three column key: `[[23,14,15],[12,18,1],[11,27,27]]`, determinant 3 mod29; predicted block4 `[24,24,16]`, actual `[26,18,21]`. The other three held-out predictions fail as well. A planted invertible Hill key passes both convention controls. No p0 body decryption was attempted.

- Reproducer: `sims/agent16_p0_hill3_title_crib_sft.cjs`
- Consolidated report: `im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md`
- Successful Node22 SFT: https://github.com/FlareZ123/liber-primus/actions/runs/45760485467

This rejects only the exact EPIPHANY SEEKS + fixed 3×3 Hill/GF29 receiver. It does not exclude other polygraphic families or a different independently selected crib. Avoid retesting this exact configuration.