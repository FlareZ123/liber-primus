# Static canonical base29 arithmetic interval receiver (#3129)

**Decision (27 November 2026, Agent12):** reject this exact exploratory static arithmetic codec in continuous-book and independent physical-page framing. Every one of 55 rune-bearing original pages is illegal under its entire-cylinder/EOF/minimality contract; the continuous 12,956-rune source is noncanonical after its first EOF. This does not exclude other probability models, adaptive coding, alternate termination/framing, or an independently motivated outer transform. There is no authenticated LP2 compression instruction or new plaintext/key.

## Fixed mechanism and source

Classical arithmetic coding sequentially narrows a half-open rational interval according to cumulative symbol probabilities. This receiver is an explicitly specified base29 canonical interval variant; it does not claim to reproduce a particular historical executable. Train once on exact printed-clear LP1 physical rune-bearing pages 3,8,9,10 of the pinned native transcription (157+187+207+192=743 runes). The source classification is documented in [transcription README](../resources/transcriptions/README.md). GP29 indices 0–28 retain source alphabet order; append EOF symbol29. Add one pseudocount to each of all 30 symbols, so total773 and EOF weight1. [Raw output](lp2-static-arithmetic-interval-output.json) pins the exact weights and two input blob IDs. No probabilities fitted to LP2, no guessed key/header/bit trimming.

Let the current interval be [L/D,H/D). For source symbol j with cumulative counts C[j], C[j+1] and total T=773, replace it with [(LT+(H−L)C[j])/(DT),(LT+(H−L)C[j+1])/(DT)). Append one EOF. Output the shortest base29 cylinder [x/29^m,(x+1)/29^m) wholly contained in the EOF interval; choose the smallest x at that length. Represent x using exactly m GP29 digits, including leading zero digits. Every adjacent-repeat pattern is permitted by the transport alphabet; no forbidden digits or missing side information. The entire original cipher frame must equal the forward canonical output. This is lossless for the native rune sequence; the printed punctuation is excluded from the payload model.

**Exact inverse:** for original base29 digits interpreted as x at length m, start the rational input cylinder [x/29^m,(x+1)/29^m). At each inverse step, both its bounds must fall in the same cumulative subinterval (respecting the open upper endpoint). If a cylinder crosses a symbol boundary, no later nested interval can wholly contain it. On reaching EOF, re-encode the decoded rune sequence and require identical length/digits. This uses integer BigInt arithmetic and terminates because all symbol weights are less than T. An early noncanonical EOF cannot be rescued by interpreting the remaining digits as payload in this grammar. This differs from fixed-composition enumerative ranking, repeat-delimited radix, BWT/MTF, and LZW; it makes no per-frame quota or dictionary state.

## Exact original gate

Use the complete original GP29 tape, p0–55, 12,956 runes; retain red runes, omit only punctuation and rune-free p50. Two frozen framings: the entire contiguous book, or each rune-bearing physical page as one EOF-terminated frame. No sliding windows, alternate alphabet, or ciphertext-selected offsets. Unsolved page data are never used to train the model.

| Original frame | Result |
|---|---|
| p0, 262 digits | EOF after 207 decoded symbols; canonical length 189, noncanonical |
| p16, 267 digits | Boundary crossing after 301 decoded symbols |
| p54, 232 digits | EOF after 39 decoded symbols; canonical length 37, noncanonical |
| p55, 76 digits | Boundary crossing after 84 decoded symbols |
| All 55 physical rune-bearing pages | 35 boundary crossings; 20 noncanonical EOF; 0 legal canonical frames |
| Continuous original book, 12,956 digits | EOF after 207 symbols; canonical length 189, noncanonical |

The first whole-book EOF is the same as p0 because their first digits coincide; these are not independent confirmations. p16/p54/p55 and the other disjoint physical frames fail independently under the frozen model. Invalid decoded prefixes are not plaintext candidates.

## Calibration

The four independent held-out native page sources are LP1 p11 and p14 plus LP2 p56 and p57. p56 is decoded with 84 prime-minus-one consuming shifts and the one transparent plaintext F at physical offset56; the other ciphertext F occurrences consume shifts. Full native p56 transliteration is asserted. Every donor round-trips to the exact original native symbol sequence and re-encodes exactly. Appending one zero to any codeword is rejected as noncanonical.

| Held native source | Plain runes | Code digits | Adjacent equal digits |
|---|---:|---:|---:|
| LP1 p11 | 169 | 157 | 8 |
| LP1 p14 | 89 | 82 | 1 |
| LP2 p56 | 85 | 78 | 2 |
| LP2 p57 | 95 | 86 | 1 |

The native control codewords have 12 repeated adjacent digits among 399 internal transitions, versus 86/12,955 in the original full book. Four short controls cannot establish a universal output repeat rate. The exact canonical-legality failure is sufficient independently of that comparison.

For each original physical page, four uniform GP29 tapes and four low-repeat random tapes with the exact same length and repeat count are generated under a seeded RNG. The matched sampler chooses repeat sites uniformly and selects nonrepeat next digits uniformly from the remaining 28 symbols; it does not preserve symbol counts. 220 uniform controls yield 164 crossings, 56 noncanonical EOF, zero legal; 220 low-repeat controls yield 165 crossings, 55 noncanonical EOF, zero legal. Eight uniform and eight exactly-repeat-count-matched full-book controls all terminate at noncanonical EOF. These are descriptive codec controls, not calibrated evidence of an intended cipher.

**Director fork:** retire the static trained unigram + explicit EOF + shortest base29 cylinder grammar in these two framings. A different compression route requires a recoverable probability model/framing/termination convention from independent source evidence; do not tune EOF placement or probabilities to obtain original legality. No new key/plaintext and no authoritative frontier change.

[Standalone CommonJS SFT](../sims/lp2_static_arithmetic_interval_sft.cjs) · [exact raw outputs and frozen probability table](lp2-static-arithmetic-interval-output.json). Numerical core executed against pinned connector-returned inputs in V8. Standalone Node wrapper not independently executed.
