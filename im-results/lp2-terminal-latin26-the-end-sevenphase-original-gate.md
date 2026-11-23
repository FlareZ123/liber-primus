# Terminal Latin-six-letter THE END + known A: frozen seven-phase original inverse

**23 November 2026, Agent3. Classification: a bounded, source-linked failed plaintext hypothesis, not a solved page or new historical decipherment.** Exact single-file reproducer: [`sims/lp2_terminal_latin26_the_end_7period_sft.cjs`](../sims/lp2_terminal_latin26_the_end_7period_sft.cjs).

## Why this particular candidate

The only repeated two-word GP ciphertext phrase in 2,896 original words is the printed **3+3** `DJU BEI`, at p27 rune offsets 28–33 and at the end of p55 (70–75). A **seventh** original ciphertext rune also matches: p27 offset34 and p56 first rune both equal `AE` (GP index25). The latter is **independently solved** as plain `A` (index24 plus authentic p56 prime-totient shift1). The p55 ending is followed by the already-solved p56 title **AN END**. These facts motivate a *hypothesis* that the six prior symbols stand for the familiar final words **THE END**, with the solved seventh `A` providing an external anchor. This is a more restrictive literal-Latin-six-letter crib than native contracted GP `THE END`, which has only five runes because `TH` is one rune.

There is **no** first-party instruction that THE END is the source plaintext, that word spacing is unchanged, or that either previous unknown page used the p56 cipher. The inferred seven-constant repeat is a deliberately cheap *candidate operation*, not an historical fact. The raw-letter **THE END** and the fuller p27 guess **AT THE END OF A** were already documented in [the original raw-Latin register study](lp2-rawlatin26-terminal-crib-register-gate.md). This report adds two frozen full-original inverse receivers; the proposed cribs themselves are prior hypotheses.

## Frozen complete inverse on the actual original glyphs

Take original seven-cipher values `C=[23,11,1,17,18,10,25]`, ordinary Latin-letter hypothetical plaintext `P=[16,8,18,18,9,23,24]`. No word, rune, or clock phase is modified. Choose the **only two** additive orientations with a seven-symbol key: `C=P+K` or `C=K−P` modulo29. The source seven-block starts at local p27 offset28 and local p55 offset70, differing by42 (divisible by7). Extend each recovered key to those **entire** separate original pages with that fixed local phase, and demand native GP29 prose outside the crib. This is a conditional shared-clock test. The known p56 runes are *not* incorrectly reinterpreted as unknown cipher: only its independently solved initial `A` fixes the seventh crib symbol.

| Frozen inverse | Recovered seven-rune key indices | p27 full 234-rune IoC | p55 full 76-rune IoC |
|---|---|---:|---:|
| C=P+K | `[7,3,12,28,9,16,1]` | **0.033124243425** | **0.033684210526** |
| C=K−P | `[10,19,19,6,27,4,20]` | **0.034811635670** | **0.038596491228** |

Both decryptions reproduce the guessed seven-character phrase *at their two selected locations by construction*, and reverse-encrypt **every** tested p27/p55 glyph exactly. Their other source runes remain incoherent, with marginal concentration near uniform GP29 **1/29 ≈ 0.034483**, far below the native solved p57 register (about **0.06271**). The complete untouched p55 first20 transliterated runes under the first inverse are `X OE W J IA EA T W T O P Y W U E Y S AE H E`; the second begins `E D F AE L E O AE F R D NG I E X M NG J I EA`. These are not continuous language. The original p27 is an independent distant negative recipient, not a fitted second phrase.

The script confirms both source seven-glyph blocks, known p56 initial glyph, all original lengths, both key vectors, exact complete forward replay, measured IoCs, and full positive source-native p57 encrypt/decrypt roundtrips. The read-only program's complete seven-phase and fourteen-phase original-source assertions passed [GitHub Actions Windows Node22 run 45110081733](https://github.com/FlareZ123/liber-primus/actions/runs/45110081733). The earlier seven-phase-only version separately passed [run 45109496656](https://github.com/FlareZ123/liber-primus/actions/runs/45109496656).

## Extended original p27 context: AT THE END OF A and the wing's 14 positions

The source's larger p27 local glyph span at offsets26–36 is **BF-DJU-BEI-AEF-P**, original GP indices `[17,0,23,11,1,17,18,10,25,0,13]`, with printed word lengths **2/3/3/2/1**. The independent prior raw-Latin proposal is **AT THE END OF A**, literal GP class values `[24,16,16,8,18,18,9,23,3,0,24]`. If this fuller phrase were true, its *seventh* rune after THE END would be **O** on p27, whereas the identical ciphertext **AE** at p56 begins the genuinely solved **A**. This demonstrates why a shared deterministic six-rune ciphertext-history rule cannot simultaneously realize the two distinct conditional plaintext assignments across that chapter boundary. It does not prove either candidate phrase.

The original p27 wing has independently documented **14 enclosed membrane faces**; the two repeated-word starts p27 local28 and p55 local70 both have phase0 modulo14. As a concrete alternative to the first seven-phase check, fix a **14-position repeating additive key**, and derive its eleven GP29 shifts directly from the entire hypothetical p27 AT THE END OF A phrase. Exactly **11 of14 key phases** are now known; phases9,10,11 remain unconstrained, with no attempt to fit them from language. Decode only the **185 already-fixed p27 original positions** and **61 already-fixed p55 positions**. The *unknown* three phase keys cannot alter any of these outputs.

| Original complete p27 11-letter crib, 14-period key | Known key phases | p27 fixed positions, IoC | p55 fixed positions, IoC |
|---|---:|---:|---:|
| C=P+K | 11/14 | **185, 0.035135135135** | **61, 0.034426229508** |
| C=K−P | 11/14 | **185, 0.033725029377** | **61, 0.040437158470** |

Both orientations exactly reproduce the guessed p27 phrase and the matched six-runic p55 ending by construction. Yet the other unaffected known-phase runes are still near-uniform GP29 with no coherent continuous English. The original word breaks and missing three key phases are **not** retrospectively altered to rescue this negative. This is a bounded direct additive/Vigenère rejection in a raw-letter plaintext register; it does not extend the independent [14-phase all-secret native-GP obstruction](lp2-p27-p55-wing14-phase-original-gate.md) to every Latin26 or stateful cipher.

## Research decision

The tempting terminal-words reading **does not produce plaintext under either frozen seven-phase or 14-phase GP29 additive operation**. This does not exclude THE END as plaintext under a different independently identified cipher, a variable phase, raw 26-letter transport, or a deliberate ciphertext-only marker. It also does not establish a shared key merely because the original ciphertext repeats. Further work needs a creator-visible source selecting an operator that actually decrypts untouched words beyond the anchor; no phase/keyword optimization is justified by the seven-glyph coincidence alone.
