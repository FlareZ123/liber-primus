# Fixed-plaintext-marker hypothesis: original LP2 doublets versus English word shapes

**Status (Agent 10, 12 November 2026):** An independently reproducible, original-cipher, key-independent finite-corpus exclusion. The result constrains a reversible GP29 predecessor-difference family. It establishes no unknown plaintext, authenticated key, cipher architecture, or endpoint.

## Proposed cipher family

A plausible explanation for LP2's anomalously rare repeated adjacent runes is that each immediate ciphertext doublet represents one distinguished GP29 plaintext rune, perhaps `EA`. This investigation grants the entire 29-rune alphabet as possible marker values, and grants every later position its own freely changing secret bijection from the other 28 GP29 runes to the 28 nonzero predecessor-difference values.

The exact assumed rule, for every position after the first on each physical page, is

`C[i] = C[i−1] if and only if P[i] = m`,

with one fixed unknown GP rune `m`. Page-first ciphertext runes can be encoded independently. This architecture is lossless under any fixed invertible 28-way key schedule. It accommodates arbitrarily changing secret states, unlike collision-overwriting models. **The model also assumes the original printed word boundaries and GP-rune word lengths are preserved in the plaintext.** Neither premise is source-authenticated; both are being tested, and other cipher families remain open.

A source-native planted full-length changing-state implementation reproduces and decodes authentic English GP symbols exactly with three separate marker choices `EA`, `G`, and `N`.

## Original-source necessary constraints

The complete original unknown manuscript has **12,956 runes** on **55 rune-bearing physical pages**, organized as **2,896 printed words**. Exactly **86** adjacent equal-rune events occur within physical pages, distributed among **85 words**, and **23** of these events mark the **first rune of a word**. The first rune of each physical page has no same-page predecessor, creating **55 blind positions**. The proposed plaintext marker would thus occur **between 86 and 141 times** in the complete book, regardless of how its secret bijection changed.

The marker's word-local positions also become exact constraints: the doublet-containing source word at zero-based word index **1476** has length **12** and marked rune positions **5 and 11**, with no blind page-start position. Every candidate native plaintext word at this slot must have exactly that marker pattern. All 85 marked-word shapes are compared with native English words of the same GP length, including required *absence* of that rune at the other observed positions.

The complete rune stream is verified against `resources/liber-primus/lp2-corpus.json` and the printed word boundaries in `resources/lp2-transcription.txt`; typographic line and physical page wraps do not terminate a word.

## Finite original-cipher gate

**Lexical shape check:** normalize English by the GP29 spelling convention `K,Q→C`, `V→U`, `Z→S` and the seven special rune digraphs `TH,NG,EO,OE,AE,IA,EA`. Pool all unique complete words from the repository's Gibran, Shakespeare and Emerson texts with its TextBlob spelling list: **32,082 distinct GP-word types**. For each of all 29 possible markers, count how many of the original 85 marked word-length/mask configurations have at least one literal English word counterpart.

**Frequency check:** independently scan all **567,679 contiguous 12,956-rune windows** from the three complete native-GP control texts (Gibran **50,159**, Shakespeare **205,845**, Emerson **311,675**). Take the observed minimum and maximum occurrence count of each proposed marker. The allowed count is 86–141 after granting all 55 page starts as possible hidden marker occurrences.

| Literal marker | Compatible source word shapes / 85 | Native-GP window count range | Outcome |
| --- | ---: | ---: | --- |
| C | 85 | 286–663 | Exceeds allowed count |
| N | 85 | 637–979 | Exceeds allowed count |
| S | 85 | 644–1048 | Exceeds allowed count |
| T | 85 | 638–1045 | Exceeds allowed count |
| E | 85 | 1397–1698 | Exceeds allowed count |
| L | 85 | 409–690 | Exceeds allowed count |
| D | 85 | 404–721 | Exceeds allowed count |
| A | 85 | 744–1088 | Exceeds allowed count |
| Y | 85 | 186–466 | Exceeds allowed count |
| G | 84 | 106–297 | One word shape unsupported |
| H | 84 | 134–519 | One word shape unsupported |
| P | 84 | 138–402 | One word shape unsupported |
| B | 82 | 138–275 | Three word shapes unsupported |
| NG | 59 | 44–160 | 26 word shapes unsupported |
| EA | 80 | 35–172 | Five word shapes unsupported |

All other **14 GP markers** also fail at least one necessary condition. The SFT computes and examines all 29 values independently, and outputs the full surviving-group data. **No fixed marker survives both checks in the tested English register.**

The nine symbols with completely compatible word shapes occur at least 186 times in every examined native window, exceeding the absolute 141 ceiling. Each symbol whose native-window count could fall within the necessary interval fails at least one original word shape. `EA` is sufficiently rare to resemble the total doublet count but fails five marked-word shapes in the 32,082-word register, including the double-marked twelve-rune word.

## Interpretation and decision

This jointly tests marker frequency and exact word-local positions, independent of every secret phase, key, state update, row permutation, and selected GP marker. It extends the older *stationary* fixed-marker successor-diversity exclusion because the secret 28-way map here may vary at **every rune position**. The all-secret conclusion is restricted to the two exact marker and word-preservation premises.

The English register is finite. Another poem or exceptionally unusual word outside the corpus and dictionary might satisfy the pattern. If original word boundaries are not preserved in plaintext, the lexical word-shape check is inapplicable. Models with multiple marker symbols or a ciphertext repeat carrying a different kind of state signal also fall outside this result. The experiment supports de-prioritizing literal one-rune doublet interpretations until an original clue supplies an actionable inverse or different word grammar.

## Reproduction and source files

- **Node 22 standalone SFT:** [`sims/lp2_fixedmarker_original_wordshape_allsecret_sft.cjs`](../sims/lp2_fixedmarker_original_wordshape_allsecret_sft.cjs).
- **Passing independently dispatched original-input CI run:** [GitHub Actions 43288403581](https://github.com/FlareZ123/liber-primus/actions/runs/43288403581).
- Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, the three existing control prose files, and `resources/control/english_wordfreq_textblob.txt`.

The SFT asserts all original counts, the unique two-marker twelve-rune witness, exact GP source identity, native controls, three fully reversible English plants, every fixed-marker shape/frequency comparison, and the combined **0/29** result. It requires no source files outside the repository.

Related prior work: [lossless anti-repeat capacity](lp2-anti-repeat-lossless-capacity.md) and [stationary marker-successor result](../results/README.md).
