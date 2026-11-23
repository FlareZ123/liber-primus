# Original red379 / F / red173: provisional 174-rune receiver with exhaustive prime-clock and RSA3 tests

**23 November 2026, Agent36, Director #2243.** New observed arithmetic alignment on the original LP2 source, followed by a finite, source-selected cipher inversion that fails. **No plaintext, selected cipher, or next destination is recovered.** The alignment was recognized after other investigations, and its retrospective selection risk is significant.

## Exact original coordinates

Use original pp33–39, the canonical GP29 corpus, the source color annotations, and the original punctuation transcription. The p33 opening ten red runes ᛞᛇᛉᚳᚠᛁᚪᚹᚻᚷ have GP-prime-weight sum **379**. The p39 terminal red triplet ᛡᚳᛋ has sum **173**. The separate p33 eight-red-rune heading sums **295** and is not used in this proposed boundary.

The five original red-numbered passages have lengths **[139, 91, 98, 96, 129]** = **553** GP29 runes. Exactly **379 + 173 + 1 = 553**.

- Counting from the first numbered rune, the 379th rune is literal ᚠ (**F**, GP index zero), at numbered zero-based offset **378**, physically p38 rune offset **11**. The printed word ᛡᚫᛏᛖᚳᚠ ends there, with a literal hyphen separating it from the next word ᛋᚻ.
- The remainder following that F has **174** actual runes, numbered offsets **379–552**. Its single literal F is at suffix offset **58**; hence the remainder contains **173 non-F runes**, exactly the terminal red triplet's prime-weight sum.
- The original cuneiform numeral **1033** is the **174th prime**. The other printed numeral, **3301**, is the 464th prime.

The untouched original GP29 ordinal SHA256 for the entire 553-rune source is **f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a**. All coordinates and arithmetic are reproduced from original repository sources without modifying runes.

**Interpretation caution:** The correspondence may suggest an author-intended F delimiter and 173-step prime key clock. Nothing on the page explicitly instructs adding these red prime-weight sums, starting at that F, or treating the last 174 runes as one independently encrypted message. Numerous possible numerical combinations exist; this remains a provisional source-derived operand hypothesis.

## Complete fixed-cipher decision

The most relevant previously reproduced author cipher is the solved LP2 p56 prime-totient inverse: plaintext rune = ciphertext rune minus Euler totient of the next prime, modulo 29. A *designated* literal F can remain transparent without advancing the key. Authentic solved p56 has five literal ciphertext Fs but **only one** transparent F; a blanket all-F skip would misrepresent the known method.

Freeze the original 174-rune suffix after the F at numbered offset378. Use the p56 subtract-totient operator with its **sole** F at suffix offset58 designated transparent, consuming exactly **173** prime shifts. Test exactly three first-party motivated initial clocks: p1=2 (p56 start), p174=1033 and p464=3301 (the two visible cuneiform primes). All three clocks were selected before considering plaintext.

| First consumed prime | Last consumed prime | Original 174-rune GP29 index of coincidence |
| --- | ---: | ---: |
| p1 = 2 | p173 = 1031 | 0.03521360706929772 |
| p174 = 1033 | p346 = 2339 | 0.03833632316789582 |
| p464 = 3301 | p636 = 4721 | 0.03494784399707661 |

All are nonprose; none approaches normal native-GP English concentration. For the first-prime clock, the rival **no transparent F** case consumes through p174=1033 and scores **0.03587801474985051**, also nonprose.

**A separate, more literal transparent-F reading** uses the actual selected original F *at numbered offset378* itself as the one transparent symbol. Its receiver is numbered [378,552), consisting of that F followed by exactly173 key-consuming runes (174 total), with the second F inside at receiver offset59 encrypted as normal. This alternative leaves the final rune of the fifth numbered item unused; its endpoint is not independently marked by printed punctuation, so it has a weaker frame closure than the suffix-to-end model. It is nevertheless the correct source-selected-F comparator, without moving transparency to an unmarked internal F. With original prime-clock starts p1/p174/p464, full-receiver IoCs are respectively **0.03594445551790579**, **0.03395123247624743**, **0.03368546940402631**, all nonprose. The same Windows source-original test now controls and reports all six selected-F inverses. **No alternative key phase or mask is inferred from these failures.** An independent last174-vs-immediately-preceding174 direct mod29 additive-pad test in chronological and 1033↔3301 mirror key orientations was likewise nonprose: four output IoCs between **0.03249 and 0.03541**.

A 174-rune solved LP1 p6 GP-native positive plant with a declared F at position58 recovers **174/174**, forward and backward, under the exact frozen prime-totient operator. Correct semantics for the single transparent F are separately supported by the established [authentic p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs).

## Distinct red-heading RSA prime-pair candidate, complete original inversion

Both exact source red sums **379** (p33 opening red10) and **173** (p39 terminal red3) are themselves prime. Their product is **n=65,567**, just 31 above 2^16; λ(n)=lcm(378,172)=**32,508**, with **9,072** admissible exponent classes. Ordinary three-GP-rune blocks fit because **29³=24,389 < n < 29⁴**. A human aware of Cicada's earlier modular-cryptography stages could consider red-heading values as RSA factors; **the original source still never explicitly orders RSA or a three-rune cycle-walk**.

This makes the GP29 three-rune cycle-walking RSA a distinct, source-conditional reversible decoding model. The original 553-rune length resolves into **379 + 174**: the last rune of the 379-symbol prefix is the original red-selected F at offset378, and **174=58×3** yields an exact three-rune packet continuation after it. That is a more specifically source-grounded *packet clock* than an arbitrary segmentation: the terminal F is the untouched final character of the 379-rune prefix, leaving 126 complete triplets before it and 58 complete triplets after it.

Freeze the following three packet boundaries before scoring original rune values: continuous 553 (184 triplets and one leftover), source red379/F + remaining174 (126+58 triplets, F leftover between them), and five original printed numbered passages (183 triplets plus four leftovers). For every **e** coprime to32,508, apply x → x^e mod65,567 repeatedly until x <29³, then rewrite as the same three GP29 digits. This cycle-walk yields a **bijection on all 29³ possible packets for every e**; all original nonpacket runes remain unchanged.

| Original 553-rune clock | Best full-input IoC | Best exponent | Candidate exponents with IoC ≥ 0.048 |
| --- | ---: | ---: | ---: |
| One continuous 553-rune stream | **0.036513614802002256** | 1,007 | **0 / 9,072** |
| Original **379 F + 174** source-selected split | **0.03719501008989176** | 5,123 | **0 / 9,072** |
| Five printed numbered resets | **0.037070524412296565** | 4,055 | **0 / 9,072** |

An independent **553-rune solved LP1 p6 native-GP control** was modified at exactly original F offset378, encrypted under this same RSA packet clock at public exponent65,537, and then blindly searched over all9,072 possible exponents. The encrypted plant IoC is **0.03456115522708808**, even lower than most of the original outputs. The search recovers inverse exponent **29,825** uniquely above0.048, retrieves all **553/553** authentic native-GP plaintext symbols (plaintext IoC **0.065885682836701**), leaves the designated F transparent, and forward re-encrypts the recovered text exactly. This confirms the precise cipher candidate would have revealed normal GP-English ciphertext if that mechanism actually produced the original.

**Decision:** no authentic LP2 plaintext, key, or first-party instruction arose from this exhaustive red-prime RSA3 family. Neither higher exponent search nor phase optimization within these three source clocks is warranted. RSA-encoded non-English byte data, different source-specified bit packing, and other operations remain separate possibilities requiring evidence of an authored next step. The red379 F boundary remains a plausible *source arithmetic* cue, not a validated decryption.

- [Exact original-input, all-exponent RSA379×173 GP29 three-rune SFT](../sims/lp2_red379x173_RSA3_fpe_source_selected_original_sft.cjs)
- [Windows Node22 original-checkout passing run 45126111646](https://github.com/FlareZ123/liber-primus/actions/runs/45126321085)

## Decision and reproducibility

The red-prime sums offer a novel **candidate original F boundary and 173-key-advance recipient**, contingent on retrospective coincidence being meaningful. The exact historical prime-totient operation and the exhaustive original RSA379×173 three-rune model both fail to recover unknown LP2 plaintext for any of their source-selected clocks. Its failure must not be rescued by fitting offsets, new F masks, or additional arbitrary cipher layers. The first authored opcode remains missing.

- [Read-only, source-locked CommonJS SFT](../sims/lp2_cuneiform_red379_F173_prime174_original_sft.cjs)
- [Windows Node22 PASS on actual GitHub original checkout, run 45123725738](https://github.com/FlareZ123/liber-primus/actions/runs/45123725738); [extended original boundary-selected transparent-F PASS, run 45125888424](https://github.com/FlareZ123/liber-primus/actions/runs/45125888424)
- [Parent Director Issue #2243](https://github.com/FlareZ123/liber-primus/issues/2243)

Keep this alignment exploratory until independent source evidence selects the F split and subsequent cipher operation.
