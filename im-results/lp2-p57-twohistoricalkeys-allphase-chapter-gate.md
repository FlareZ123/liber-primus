# P57's two exact earlier keys: complete phase-and-interrupter test on original p54–55

**Agent 5, 18 November 2026. Original-cipher gate, no new unknown plaintext.**

## Source-motivated operation and its strongest rival

In solved LP1, *DIVINITY* is an authentic 8-rune GP29 Vigenère key (transliterated `DIUINITY` in the alphabet) and *CIRCUMFERENCE* is the authentic 13-rune `FIRFUMFERENFE` key, with F treated as its own GP rune. Clear LP2 p57 explicitly mentions **DIVINITY** and **CIRCUMFERENCES** next to the final unknown-page picture. This gives a historically motivated pair for a human to try, although p57 does **not** explicitly say that those two keys ciphered p54/p55.

The earlier exact single-phase test `sims/lp2_p57_circumference_divinity_double_vigenere_sft.cjs` did not recover original p55 prose and found F-bypass collisions. Its natural unresolved edge was source-unknown starting phase. Here all **13 × 8** possible GP29 key phase pairs are exhaustively tested, without fitting a phase to a crib. Both layer orders, both signs for both layers, both historically justified plaintext-F bypass choices (active or inactive independently on either layer), and both continuous p54→p55 key clock and page-restarted key clock produce **2×2×2×2×2×13×8 = 6,656** original-cipher models. On each layer, consumed plaintext F is forbidden when the literal-F bypass is active, and an observed ciphertext F can be either an unconsumed F or a consumed non-F; exact dynamic programming retains all reachable phase pairs.

The original input is the 232-rune physical p54 plus the 76-rune p55, **308 runes**. Also check p55 isolated (76) so that chapter-level collisions are never falsely represented as a p55-alone exclusion.

## Exact outcomes

| Outer F bypass | Inner F bypass | p54–55 continuous: survivors / 832 | p54–55 reset: survivors / 832 | Isolated p55: survivors / 832 |
|---|---|---:|---:|---:|
| No | No | 832 | 832 | 832 |
| No | Yes | **29** | **20** | 230 |
| Yes | No | **0** | **0** | 322 |
| Yes | Yes | **0** | **0** | 81 |

Every one of the 6,656 configurations has an **exact plant-and-recover positive test**: a 308-rune native p57 cleartext tape tiled across the same 232+76 lengths is encrypted by that model and the inverse retains its correct path. Thus the outer-bypass contradictions reflect actual source incompatibility rather than an impossible decoder.

All-consuming, i.e. neither layer bypasses F, yields whole-308 original GP29 IoC **0.03257328990228013–0.03777655569186514** across *all* key orders, signs, starts and clocks. Original p54+55 is **0.03382122763230255**, while genuinely clear p57 is **0.06270996640537514**. No all-consuming inversion yields normal GP-native prose. The maximum is chapter-continuous, first key outer, both signs +1, phases12/1, IoC 0.03777655569186514.

When the **outer** layer preserves the historically established literal-F rule, not one original 308-rune model survives, even after allowing every phase, sign and order. When **only the inner** layer preserves F, **49** full-chapter models survive structural feasibility, so this narrowly defined class is *not* mathematically excluded by the experiment and must not be called impossible. Those survivors do not identify a unique plaintext, key clock, or chosen inversion.

## Research decision

Do not pursue p57's two named LP1 keys as a direct doubly F-transparent GP29 Vigenère receiver on p54–55; every original phase is impossible. Neither bypassing Vigenère gives a nonlinguistic full-chapter result. **Isolated p55 remains structurally feasible** under double F transparency (81/832), but no source selects one of these variants. A new source-specified ordering, decoding layer, or operator is required before another search. In particular, these outcomes do not license a blanket exclusion of p55 or of non-GP-native plaintext registers.

**Reproduction:** [Node.js 22 read-only source-input SFT](../sims/lp2_p57_historical_keypair_allphase_f_original_sft.cjs) operating on `resources/liber-primus/lp2-corpus.json`. **Passing Windows Actions original-input run:** [44261422563](https://github.com/FlareZ123/liber-primus/actions/runs/44261422563). 
