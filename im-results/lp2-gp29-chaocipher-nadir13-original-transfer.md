# Original-input GP29 Chaocipher transfer: 24 frozen wheels, no plaintext

**Decision (17 November 2026, Agent 6):** A deliberately narrow transfer of John F. Byrne's historical Chaocipher into the 29-rune Gematria Primus alphabet produces **no unknown-page plaintext** with either source-native alphabet direction, either of two natural nadir choices, or any of three plausible page/chapter clocks. All variants re-encrypt exactly, as any bijection must. This is a conditional negative for these 24 starting-wheel conventions, **not a cryptanalysis of arbitrary secret Chaocipher initial permutations**.

## Plausible route and strongest objection

Chaocipher is a human-executable, stateful cipher with alphabet disks that permute after every symbol. Its historical **26-letter** method uses position **13** as the nadir, while the original LP2 manuscript prominently uses 13-dot punctuation. The tempting proposed route is to apply that finite, published operation to the **29 printed Gematria Primus runes** with a nearby 13/14 insertion position. The original runes provide the natural printed order and its reversal as two inexpensive initial wheel candidates. A maker might expect readers to recognize the disk method, but **the 13-dot sign is not a first-party Chaocipher instruction**; in the historical 26-letter machine the 13 follows from the wheel diameter, whereas the GP29 wheel lacks a diametric opposite. No source supplies a Chaocipher-specific key, so this is a low-priority hypothesis discovery gate.

The independent rival is a direct anti-repeat state cipher or an external key/pad. An unknown-page ciphertext with **86/12,901** adjacent same-page equalities is radically unlike the 442–502 equalities produced by the tested Chaocipher inverses. The fitted wheels produce no English-like rune frequency profile.

## Frozen original input and controls

- Input: `resources/liber-primus/lp2-corpus.json`, exact **12,956** original unknown-page GP29 indices, **55 rune-bearing physical pages**, including 32 source-authentic word continuations. No text edits, no supplied cribs, no language-model optimization.
- Initial wheels: GP29 forward/forward, forward/reverse, reverse/forward, reverse/reverse, chosen **before** touching ciphertext.
- Historical alphabet permutation: left wheel rotate to the ciphertext symbol at zenith, move position 2 to nadir; right wheel rotate to the plaintext symbol then one extra place, move position 3 to nadir. Adapted 29-rune nadir positions **13** and **14**.
- Clocks: uninterrupted over all 55 rune-bearing pages; restart at each of the **nine** original chapter boundaries (p0, p3, p8, p15, p23, p27, p33, p40, p54); or restart on every rune-bearing physical page. Page 50 contains no runes and is not a text-page reset.
- **Historical positive:** the original 26-character Byrne/Rubin wheels `HXUCZVAMDSLKPEFJRIGTWOBNYQ` / `PTLNBQDEOYSFAVZKGJRIHWXUMC` encrypt `WELLDONEISBETTERTHANWELLSAID` to the independently published `OAHQHCNYNXTSZJRRHJBYHQKSOUJY`, exactly.
- **Planted positive:** all 24 GP29 wheel conventions encrypt and recover the original **95** clear runes of LP2 p57.
- **Source-original forward verification:** all 24 recovered candidate strings re-encrypt the original ciphertext across **all** 55 pages, respecting each specified clock. This only confirms the implementations.

## Whole-manuscript results

| Property | Original ciphertext | Range across 24 decoded candidates |
|---|---:|---:|
| Rune count | 12,956 | 12,956 |
| Adjacent same-page equalities | 86 | **442–502** |
| Whole-stream GP29 IoC | 0.034478 approximately | **0.03446559–0.03451681** |
| First 320-rune candidate IoC | N/A | **0.03281740–0.03458072** |
| Unseen p40–53 candidate IoC | N/A | **0.03429277–0.03457115** |

Each candidate's original rune stream remains essentially uniformly distributed instead of revealing GP29-prose frequencies. Across the independent 14-page p40–53 holdout none moves toward the source-native English register. No coherent unknown 150-rune plaintext span, authentic key, or original-cipher operator is recovered. Because the four starting-wheel arrangements and two nadirs are **not authenticated by the book**, treating this as disproof of Chaocipher in general would be unwarranted. Conversely, expanding into unconstrained 29! wheel-permutation searches has no source-selected human solve path and no present justification.

## Reproduction and disposition

Reproducer: [`sims/lp2_gp29_chaocipher_nadir13_original_sft.cjs`](../sims/lp2_gp29_chaocipher_nadir13_original_sft.cjs). It uses only Node.js standard modules and the pinned local JSON, prints all 24 cases and aggregate ranges, and asserts the exact historical positive, 24 planted clear-p57 positives, 24 complete original round trips, and the input counts. The 26-letter historical worked example and wheel-permutation instructions are documented in [Rubin, *Chaocipher Revealed: The Algorithm*](https://chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf) and [the independent reproduced example](https://kryptografie.de/kryptografie/chiffre/chaocipher.htm).

**Research decision:** retire this source-native small-key Chaocipher transfer. Do not treat a thirteen-dot punctuation match or exact round trip as a solution; only reconsider if an authentic source visibly selects a nontrivial initial alphabet or a different complete opcode before scoring original text. The current priority remains a source-selected key/receiver capable of genuine unknown-page plaintext.
