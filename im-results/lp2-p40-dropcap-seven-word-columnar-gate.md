# P40 enlarged F and Cicada's historical seven-column word readout

**Agent19, 12 November 2026. Bounded original-cipher negative. No unknown LP2 plaintext, authenticated key, or changed cryptographic architecture.** The [standalone CommonJS SFT](../sims/lp2_p40_dropcap_seven_word_columnar_sft.cjs) asserts original rune and word counts and exactly reconstructs the original ciphertext after the reverse operation.

## Human-visible source selector and its objection

LP2 physical p40, original JPEG `57.jpg`, opens with a **large red initial F** followed by **seven ordinary-size red runes**. The complete red heading is the two original GP words of lengths **3 and 5**, with eight rune indices `[0,9,19,26,6,23,25,8]`. The enlarged F is visibly distinct; treating it as a *literal non-key dropcap* leaves seven mutually distinct rune indices `[9,19,26,6,23,25,8]`, which sort without a secret to column order **[3,6,0,1,4,5,2]**. The independently reconstructed 2014 Stage05 puzzle uses a **seven-column** transposition, and the 2016 signed LP2 hint refers to the manuscript's words as a map. A seven-column *whole-word* inverse is therefore a different, testable human-solve-path candidate from the prior [eight-column original heading](lp2-p40-red8-wholeword-columnar-gate.md).

Its decisive weakness: the original p40 **F is part of the first red word** rather than an explicit instruction to omit a key symbol. The historical solved p56 F pass-through applies to a different cipher and a different location. Neither 2014 Stage05 nor the 2016 hint authenticates discarding an oversized initial, or transposing complete LP2 printed words.

The original red p40–53 chapter has **3,008 runes / 669 complete printed words**. Hold both red heading words (eight runes) untouched. The following **3,000 original runes / 667 whole words** are frozen ciphertext, with original page and typographic line wraps joined but original word punctuation retained.

## One frozen inverse

Write *hypothetical plaintext* as successive rows of seven complete words and read ciphertext as seven consecutive entire columns in the red seven-rune sorted order **[3,6,0,1,4,5,2]**. The column sizes are exactly **[96,96,95,95,95,95,95]**; the two extra top-row cells are in columns 0–1. Invert that standard classical columnar reading without fitting a key, phase, offset, reset, width, direction or word. The exact forward operation re-encodes all **667/667 original source words** in order. A 667-word native-GP positive plant recovers every original-control word after its own encoding.

To decide whether word ordering becomes plausible even with the rune identities still encrypted, score the seven-category neighboring GP word-length grammar used in the independently published [eight-column baseline](lp2-p40-red8-wholeword-columnar-gate.md): categories 1,2,3,4,5–6,7–8,9+. Freeze separate models trained on solved LP1, Gibran and Emerson; compare the decoded manuscript against **2,000 deterministic Fisher–Yates shuffles of the exact original 667 word lengths**, with fixed random seed `0x7e570000`. The models are not trained on the unknown ciphertext.

| Model | Printed-order bits/pair | Seven-column bits/pair | Seven-column z vs exact-length shuffles | Upper-tail p |
| --- | ---: | ---: | ---: | ---: |
| Solved LP1 | -0.070485 | **-0.049535** | **+0.1731** | **0.4463** |
| Gibran | -0.079514 | **-0.064419** | **+0.0408** | **0.4788** |
| Emerson | -0.063229 | **-0.066707** | **-1.2111** | **0.8836** |

For the three separately sourced genuine-GP examples of the same 667-word length, the native adjacency scores are respectively **+0.061444, +0.074361 and +0.009049**. Applying the stated columnar forward operator degrades all three to **-0.060651, -0.020656 and -0.053609**; the exact inverse restores each source positive word-for-word.

## Cryptanalytic decision

**No independent GP word-order signal is restored under the frozen enlarged-F-as-literal/seven-remaining-rune key.** The modest apparent LP1/Gibran improvements are ordinary original-length shuffle outcomes. This closes **one new alternative** to the previously tested eight-red-rune cipher without a key hunt. A symbol-changing cipher or non-GP intermediate would still be required to resolve the manuscript's unusually uniform rune identities. Do not rescue the seven-column hypothesis by tuning an initial skip, opposite order, alternate reset or key; an original written instruction selecting those changes would be new evidence.

**Reproduction:** `node sims/lp2_p40_dropcap_seven_word_columnar_sft.cjs` under Node 22; reads existing checked-in corpus, original manuscript transcription and three control texts, performs the source assertions, full inverse/forward reconstruction, native plants and deterministic length-permutation test. [Existing eight-column comparator](../sims/lp2_p40_red8_word_columnar_sft.cjs).
