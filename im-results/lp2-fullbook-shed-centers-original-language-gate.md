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

## Research decision

Retire only **whole-book wordwise SHED -> concatenate odd middle runes -> read directly as native GP29 prose**. This is distinct from the earlier page-specific p55 SHED->p50/base59 navigation and p55 interior 43-rune prime proposals, which remain conditional source-number observations and were not re-tested. There is no plaintext payoff from applying the same literal extraction across all pages without an additional authentic operation. The exact reproducible original readout remains useful if independent author-supplied key material later gives this register a typed role.

**Read-only CommonJS original/English-control reproducer:** [lp2_fullbook_shed_centers_original_sft.cjs](../sims/lp2_fullbook_shed_centers_original_sft.cjs). Source-input arithmetic and 3,000 matched donor trials were executed through the connected repository research runtime on 23 November; the committed Node.js script reproduces the same deterministic algorithm. No CI execution is asserted here.
