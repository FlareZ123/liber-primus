# Direct whole-book SHED centers: source-selected 1,450-rune literal reading gate

**Agent46, 23 November 2026. Classification: bounded original-input decision.** The final solved LP2 parable gives a human-readable reason to remove the edges of printed words. The unchanged 12,956 encrypted GP29 runes produce 1,450 middle runes after literally shedding each word until its center. This resulting stream is statistically incompatible with a direct GP29 prose reading in the three matched original-English controls tested below. **No unknown LP2 plaintext, secret key, creator-selected cipher, or final destination is recovered.**

## Source and one frozen extraction

Original material: [LP2 original corpus](../resources/liber-primus/lp2-corpus.json) and [full printed transcription](../resources/liber-primus/lp2-transcription.txt), physical pp0–55 inclusive, runeless p50 omitted from the rune stream. The authenticated solved final page p57 says:

> WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.

A literal, reproducible whole-book read takes each of the **2,896 complete printed words**, retains one middle GP rune if its length is odd and discards that word if its length is even. It keeps the original word and page order, joins **32 source words carried over physical page boundaries**, and never makes a new boundary at a line break. This is the ultimate odd-center form of repeatedly removing each surviving word's first and last rune; no search for a grid shape, key, character offset, phase, or split rule is involved.

The exact direct output has **1,450 GP runes** and index of coincidence **0.03438947193070132**. The first 30 native GP rune names are:

    E J N S G B J D U O AE X NG U F J NG G I H EA G F EO NG U U OE S EA

Its length also happens to equal 29×50, but that integer observation neither specifies a reversible codec nor selects a useful ciphertext receiver.

## Decisive original-versus-native reading control

An ordinary GP29 English text filtered to the middle rune of its odd-length words should retain a highly nonuniform middle-letter profile, even after the surrounding characters have been discarded. Test this under the *exact printed word-length inventory*: for each of the 1,450 original odd-length slots, independently choose a genuinely occurring English donor word having **that exact GP29 rune length**, then select its center. Three checked-in independent texts, Gibran, Emerson, and Shakespeare, use the repository's explicit conventional native GP transliteration. Each provides at least one donor word for every observed odd-length slot. Draw 1,000 complete independently sampled full-length center streams per donor, with seeded xorshift32 and unchanged original word lengths.

| Center readout | GP29 index of coincidence |
| --- | ---: |
| **Original unchanged 1,450 middle runes** | **0.03438947** |
| Gibran, 1,000 exact-length native controls | min **0.09012541**, mean 0.09716778, max 0.10637919 |
| Emerson, 1,000 exact-length native controls | min **0.08651103**, mean 0.09396502, max 0.10391566 |
| Shakespeare, 1,000 exact-length native controls | min **0.09056519**, mean 0.09936376, max 0.10684182 |

All **3,000/3,000** controls have higher middle-rune repetition than the original. For these three registers and the disclosed matching procedure, the direct original extraction does not produce ordinary native GP prose. This is a particularly narrow necessary-condition test: a secret static rune relabeling could change which letter the symbols represent, while still preserving the extremely low original IoC, so it cannot make the **literal center tape** look like these matched source-native controls.

The observed 1,450 count and low coincidence are genuine source measurements. The donor values are finite sampling controls, not a universal English-language impossibility or an adjusted probability of author intent. A further changing-state cipher, a keyed transformation, an unusual plaintext register, or respecified word boundaries could in principle consume the middle-rune tape, but none is selected by the parable alone.

## One directly source-nominated key consumer: the genuine p56 GP29 additive operation

The solved last page p57 explicitly says to shed circumferences and find something within. The preceding solved p56 supplies an authenticated modular-29 additive cipher convention. A minimal falsifiable second step is therefore to treat the extracted **1,450-rune** full-book center tape as a fixed repeated GP29 key, without guessing an additional value map, starting shift, or alternate pass. Conditional on supplying that tape externally as key material, use \`P_i = C_i ± K_i (mod29)\`. Both orientations and two physically transparent clocks (one unbroken 12,956-rune stream, or page-by-page restart) are fully invertible with the frozen tape. There is no author-supplied instruction selecting a mode; all four are documented.

| GP29 additive receiver | Full unknown 12,956-rune IoC | Opening p0–p2 729-rune IoC | Held-out p40–p53 3,008-rune IoC |
| --- | ---: | ---: | ---: |
| Book-global, subtract | **0.03450185** | 0.03416165 | 0.03438342 |
| Book-global, add | **0.03446173** | 0.03490028 | 0.03442079 |
| Page-reset, subtract | **0.03449102** | 0.03462141 | 0.03453224 |
| Page-reset, add | **0.03447829** | 0.03453097 | 0.03452383 |

Every original symbol re-encodes exactly when the extracted center tape is treated as an independently preserved key. All outputs remain near the GP29 uniform baseline (1/29), far below the native GP29 English controls above. **These four direct p56-like additive consumers fail to reveal genuine plaintext**. Because the key itself is computed from the original ciphertext, their algebraic replay says nothing about reconstructing an *unknown forward encoder* without supplying that tape, so it is not an independently recovered cryptosystem. More elaborate keyed center consumers are unconstrained and outside this gate.

Reproduced in the same exact original-input CommonJS SFT and passed Windows Node.js22 [run 45141582966](https://github.com/FlareZ123/liber-primus/actions/runs/45141582966), source commit \`78f1d0cd5c51b68ad95c13879e6d22546d2f4a50\`.

## Research decision

Retire the two exactly tested direct interpretations: **whole-book wordwise SHED → concatenate odd middle runes → read directly as native GP29 prose**, and **the same extracted frozen tape → ordinary modular-29 periodic additive key** under the four printed-book/page clocks and signs. This is distinct from the earlier page-specific p55 SHED→p50/base59 navigation and p55 interior 43-rune prime proposals, which remain conditional source-number observations and were not re-tested. There is no plaintext payoff from applying the same literal extraction across all pages without an additional authentic operation. The exact reproducible original readout remains useful if independent author-supplied key material later gives this register a typed role.

**Read-only CommonJS original/English-control reproducer:** [lp2_fullbook_shed_centers_original_sft.cjs](../sims/lp2_fullbook_shed_centers_original_sft.cjs). All 12,956 source positions and the exact **3,000** matched native-GP controls were **executed in the committed Windows Node.js 22 SFT**, with exact original input replay and status PASS: [GitHub Actions run 45140110206](https://github.com/FlareZ123/liber-primus/actions/runs/45140110206) (23 November 2026, job `source-test`). The output reproduces the stated IoCs and first 60 extracted GP runes.
