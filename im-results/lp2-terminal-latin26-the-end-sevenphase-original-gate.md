# Terminal Latin-six-letter THE END + known A: frozen seven-phase original inverse

**23 November 2026, Agent3. Classification: a bounded, source-linked failed plaintext hypothesis, not a solved page or new historical decipherment.** Exact single-file reproducer: [`sims/lp2_terminal_latin26_the_end_7period_sft.cjs`](../sims/lp2_terminal_latin26_the_end_7period_sft.cjs).

## Why this particular candidate

The only repeated two-word GP ciphertext phrase in 2,896 original words is the printed **3+3** `DJU BEI`, at p27 rune offsets 28–33 and at the end of p55 (70–75). A **seventh** original ciphertext rune also matches: p27 offset34 and p56 first rune both equal `AE` (GP index25). The latter is **independently solved** as plain `A` (index24 plus authentic p56 prime-totient shift1). The p55 ending is followed by the already-solved p56 title **AN END**. These facts motivate a *hypothesis* that the six prior symbols stand for the familiar final words **THE END**, with the solved seventh `A` providing an external anchor. This is a more restrictive literal-Latin-six-letter crib than native contracted GP `THE END`, which has only five runes because `TH` is one rune.

There is **no** first-party instruction that THE END is the source plaintext, that word spacing is unchanged, or that either previous unknown page used the p56 cipher. The inferred seven-constant repeat is a deliberately cheap *candidate operation*, not an historical fact. Prior reports test GP-native 3+3 literature cribs, including OUR OWN, but raw-letter THE END falls outside that native spelling inventory.

## Frozen complete inverse on the actual original glyphs

Take original seven-cipher values `C=[23,11,1,17,18,10,25]`, ordinary Latin-letter hypothetical plaintext `P=[16,8,18,18,9,23,24]`. No word, rune, or clock phase is modified. Choose the **only two** additive orientations with a seven-symbol key: `C=P+K` or `C=K−P` modulo29. The source seven-block starts at local p27 offset28 and local p55 offset70, differing by42 (divisible by7). Extend each recovered key to those **entire** separate original pages with that fixed local phase, and demand native GP29 prose outside the crib. This is a conditional shared-clock test. The known p56 runes are *not* incorrectly reinterpreted as unknown cipher: only its independently solved initial `A` fixes the seventh crib symbol.

| Frozen inverse | Recovered seven-rune key indices | p27 full 234-rune IoC | p55 full 76-rune IoC |
|---|---|---:|---:|
| C=P+K | `[7,3,12,28,9,16,1]` | **0.033124243425** | **0.033684210526** |
| C=K−P | `[10,19,19,6,27,4,20]` | **0.034811635670** | **0.038596491228** |

Both decryptions reproduce the guessed seven-character phrase *at their two selected locations by construction*, and reverse-encrypt **every** tested p27/p55 glyph exactly. Their other source runes remain incoherent, with marginal concentration near uniform GP29 **1/29 ≈ 0.034483**, far below the native solved p57 register (about **0.06271**). The complete untouched p55 first20 transliterated runes under the first inverse are `X OE W J IA EA T W T O P Y W U E Y S AE H E`; the second begins `E D F AE L E O AE F R D NG I E X M NG J I EA`. These are not continuous language. The original p27 is an independent distant negative recipient, not a fitted second phrase.

The script confirms both source seven-glyph blocks, known p56 initial glyph, all original lengths, both key vectors, exact complete forward replay, measured IoCs, and full positive source-native p57 encrypt/decrypt roundtrips. The program is read-only and makes no claim of hosted CI execution.

## Research decision

The tempting terminal-words reading **does not produce plaintext under either direct seven-phase GP29 additive operation**. This does not exclude THE END as plaintext under a different independently identified cipher, a variable phase, raw 26-letter transport, or a deliberate ciphertext-only marker. It also does not establish a shared key merely because the original ciphertext repeats. Further work needs a creator-visible source selecting an operator that actually decrypts untouched words beyond the anchor; no phase/keyword optimization is justified by the seven-glyph coincidence alone.
