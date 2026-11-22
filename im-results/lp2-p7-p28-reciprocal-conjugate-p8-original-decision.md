# P7’s inverse-pair operands plus p28’s reciprocal opcode: one frozen nonlinear five-phase original receiver

**Agent34, 22 November 2026.** Negative bounded original-cipher test. **No unknown LP2 plaintext, creator-selected key, or complete cipher recovered.** This reuses two distinct already documented source observations and commits to *one* low-description-length nonlinear inverse, rather than fitting phases or alphabet permutations to output.

## Why a 2014 solver could think to try this

The five real red words at the end of physical p7 have GP29 index-products `[11,26,8,15,2]`, with source exact reciprocal pairs `11×8≡1`, `15×2≡1`, and a cross-page reciprocal `26×19≡1 (mod29)` using p6’s red singleton19 ([original source inverse packet](lp2-p7-red-multiplicative-inverse-dh-packet.md)). Independently, the source-specific but post-discovery p28 local proposed `READ OUT` operation is `x→x^27 mod29`, the *multiplicative reciprocal on nonzero GP symbols, with 0→0*, applied to five literal source runes after one central cube; it is not an author-attested instruction ([p28 arithmetic](lp2-p28-cube-reciprocal-decomposition.md)). Together these suggest testing a GP29 inversion cipher with the actual five p7 operands. P7 ends immediately before p8; p8 contains **255 original runes = 51 complete groups of five**, even though its black body is independently 243 runes after the original heading.

The chosen one-step GP29 decoder **conjugates this exact reciprocal by a source-keyed translation**:

```text
K = [11,26,8,15,2], phase i=0 at original p8 first rune
inv29(0)=0; inv29(x)=x^27 mod29 for all nonzero x
P_i = inv29(C_i+K[i%5]) − inv29(K[i%5])      mod29
C_i = inv29(P_i+inv29(K[i%5])) − K[i%5]      mod29
```

This model is a full 29-symbol involutive-kernel bijection for **every** key/phase. It preserves the index0 `F` symbol exactly (`P=0↔C=0`), consistent with the genuine solved p56 F-transparency example. It is **mathematically nonlinear** and genuinely different from the prior plain five-phase multiplicative pad, p7 5×5 Hill, third-order cubic, affine, or key-pointer models. The clock continues unreset from the whole 255-rune p8 into all p9–p14, with the independent p16–p21 check starting phase0. There are no fitted letters, keys, source reordering, arbitrary IVs, or alternate phase scans. Original printed word breaks remain untouched.

The decisive unsupported step is the **translation conjugation**: neither p7 nor p28 explicitly commands shifting before and after inversion or applying its five products to unknown p8. Thus failure retires exactly this plausible receiver; it cannot disprove all keyed nonlinear Galois-field operations.

## Exact original and native controls

| Unmodified interval | Runes | Original GP29 IoC | Decoded GP29 IoC |
| --- | ---: | ---: | ---: |
| Physical p8, 255 runes | 255 | **0.03427512737** | **0.03307086614** |
| Continuous next p9–p14 | 1,474 | source printed in SFT | **0.03468861948** |
| Independent p16–p21 | 1,613 | source printed in SFT | **0.03448639235** |

The genuine source p8 inverse begins (GP transliteration, runes preserved): `EA G OE R A EA U IA I T M H D NG G A E W A P M AE X R N R E B E N I M Y B F TH IA B NG NG M U C G M IA O EO B W O N P G P NG IA OE N J A J C Y N N P Y I C Y T M A N N EO G S E EA OE D O M S`. No recognizable GP prose appears; the 1,474 and 1,613 rune independent receivers likewise have near-random frequency, failing native-language discovery.

The read-only SFT asserts exact original p7 word products, all five reciprocal values, two source inverse-pair relations, the specific p28 `[9,28,24,10,1,20]→[4,28,23,3,1,16]` local `READ OUT` proposal, and source p8/p9–14/p16–21 runic lengths. **Every original interval reencrypts exactly.** Native actual solved p57 clear-GP (**95 runes**) and an independent native-GP-encoded Shakespeare register both reencrypt/decrypt **100%**. Their exact GP29 statistics are included in the test JSON. The actual solved p57 is a cleartext positive, not an unknown source.

**Windows 11/Node22 code:** [lp2_p7_p28_reciprocal_conjugate_p8_original_sft.cjs](../sims/lp2_p7_p28_reciprocal_conjugate_p8_original_sft.cjs). [Independent successful original-input GitHub Actions run #45024611170](https://github.com/FlareZ123/liber-primus/actions/runs/45024611170).

## Decision

**Retire the exact source-keyed five-phase reciprocal conjugation as a direct p8–p14 native-GP inverse.** The original artistic inverse pairs and local p28 result are intriguing separate data, yet jointly still do not select a genuine p8 receiver, state evolution or source instruction. The original output remains ciphertext-like on both long independent control sections. Prior independent all-secret stationary five-phase exclusion makes further tweaks to fixed pointwise phase bijections unproductive. Any further attempt needs an independently visible operation that **changes state across symbols, groups, or source objects**, or an actual historical key.
