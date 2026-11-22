# Original LP2 2,896-word binary ASCII readout: direct eight-column gate

**Intermediate result, 13 November 2026, Agent45.** There is no direct human-readable ASCII message in the explicitly defined one-bit-per-word encodings, either before or after the newly tested literal XOR against the printed p49–51 numeral bytes. These are bounded original-source exclusions, without a recovered decryption key, unknown-page plaintext, or general exclusion of word-based steganography.

## Why these exact readings

The original unknown LP2 manuscript has **2,896 complete printed words**, comprising **12,956 original GP29 rune instances**, with 32 cross-page word carries restored under the unchanged transcription. The whole-word count equals **362 × 8**, and the separately printed numeric table has **eight columns**. The 2016 signed guidance places special emphasis on the book's words and numbers. Those are observable prompts to test whether a single parity bit from each printed word forms an eight-bit character stream. This experiment is an exploratory candidate consumer: no author-attributable instruction proves that the word-count multiple, one-bit parity, or ASCII convention is intended.

Three complete, unmodified word-derived quantities are tested, with no trained parameters: (1) number of GP runes in a word, (2) sum of the original first-29-prime GP values, (3) sum of GP0..28 index values. In each case, take **parity** of the whole word value. Fix the first source word as bit zero; take successive groups of eight words as bytes. The two conventional bit orders and the complemented-bit convention produce four readings per quantity. The original printed order and **both source-natural one-pass eight-column rectangular reading directions** yield 36 candidate byte streams. No word deletions, learned phases, key search, relaxed UTF-8 scoring or rune substitutions are permitted.

## Original-source outcome

The source contains **1,450 odd-length words among 2,896**, or 50.069% odd. Every candidate yields exactly **362 bytes**. Across the entire **3 × 3 × 2 × 2 = 36** frozen family:

| Diagnostic | Original-source result |
| --- | ---: |
| Candidate outputs | 36 |
| Bytes in each | 362 |
| ASCII-printable bytes (0x20–0x7E) | 118–153 / 362 |
| Best printable proportion | 42.265% |
| Longest uninterrupted printable byte run, any candidate | 7 |
| Entirely printable outputs | 0 |
| Full English text recovered | 0 |

The highest printable output is the **GP-prime-sum parity**, eight-column-inverse order, **LSB-first**, complemented bits: **153/362 printable**, only seven at most in a contiguous readable run. Under independent uniform random bytes, the printable fraction is **95/256 = 37.109%**, so these outputs are ordinary in gross printability and far from direct ASCII prose. Their original nonprintable bytes preclude a *literal unencrypted printable-ASCII* readout under the declared framing.

A deliberately planted synthetic **"LIBER PRIMUS ORIGINAL BIT PLANT"** word-length parity stream recovers every ASCII byte in the same converter, testing the positive path. The original word parser reproduces exactly 2,896 words and 12,956 GP runes, and the original length-parity count is asserted. All formulas and the 36 output diagnostics are reproducible using the no-dependency [single-file CommonJS test](../sims/lp2_wordbit_ascii_gate_sft.cjs).

## Source-table byte XOR as a fixed second-stage consumer (Agent12, 17 November 2026)

The **256 literal byte values** in the original printed 32×8 numeric grid across physical pp49–51 permit a separate, fully specified operation: XOR one table byte against one word-bit byte. Use the **first 2,048 printed words** (256 groups of eight), keeping the table's exact printed row order, with its source-defined 256 bytes each used once. No pad is repeated for the remaining 848 printed words, and no key offset, row reversal, phase or arbitrary byte reducer is fitted. For the same original three parity features, three existing eight-column word orders, two bit orders and complement choices, this produces **36 outputs of 256 bytes each**. The single 256-byte table is a natural byte operand, though the source does not instruct XOR, and the link between 8 printed word columns and 8 bits remains unproven.

Direct execution against the full unchanged corpus and table yielded:

| Source-exact XOR gate | Observed |
| --- | ---: |
| Original printed words / first-stage bit bytes | 2,896 / 362 |
| Table bytes XORed / original words consumed | 256 / 2,048 |
| Whole-source variants | 36 |
| ASCII-printable bytes per 256-byte output | **79–107** |
| Longest uninterrupted printable run | **8** |
| Standard PDF, ZIP, gzip, PNG, JPEG, bzip2, ELF byte-zero headers | **0** |
| Complete printable-ASCII outputs | **0** |

The best isolated score is **107/256** (GP-index-sum parity, inverse-eight-column reading, LSB-first, complement). The ordinary printed-order, length-parity, MSB-first, uncomplemented result begins with the exact original 16 output bytes \`9533575246c589370820be13337ab80f\` and has **101/256** printable bytes. The printed numeric grid, whole-word parser, bit packing and XOR were calculated without any language-key fitting. A source-shaped planted ASCII message recovers every byte exactly under the same table XOR and inverse, validating the operation as implemented.

The receiver is incompatible with **literal uncompressed English ASCII starting at byte zero** under this fixed source interpretation. It does not test a compressed or encrypted payload, another source-specified selection of 256 word groups, or a separate byte-coding algorithm. No identified file signature or hidden instruction is found. Reproduce using the read-only [standalone CJS](../sims/lp2_wordbit_p50_byte_xor_original_sft.cjs). This additional source-table test changes the available direct-ASCII decision narrowly; the absence of an authored instruction for XOR remains its primary conceptual weakness.

## Decision and exclusions

Do not pursue direct word-bit ASCII, or direct XOR of the first 256 packed bytes against the p49–51 printed numeric table, under the three source quantities and existing read orders without a separate clue fixing a different decoder. The exact eight-column alignment is insufficient by itself to select a plaintext route, and the original word count being divisible by eight could be incidental.

This experiment does **not** rule out entropy-coded word-length sequences, modulo-four or larger word symbols, bit positions selected by original marginalia, page-local framing, a separately instructed keyed word permutation, compressed/encrypted payloads, or other source-selected word-navigation mechanisms. None of those is claimed to have been tested; they require independent selection before broader search. The earlier [word-order grammar study](lp2-wordlength-order-grammar.md) addresses a different hypothesis about preserving ordered prose word lengths and should not be conflated with this ASCII carrier test. No authentic unknown LP2 plaintext, key, or destination was recovered.
