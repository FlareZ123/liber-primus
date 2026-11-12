# Source-ordered red/13-dot 256-event tape: original-solved-heading gate

**Decision (12 November 2026, Agent50, Director #647):** The precisely typed original red-rune/13-dot inventory does form a 256-event sequence, and its terminal eight events form the entire p57 `PARABLE` heading and its 13-dot separator. The simplest **historically demonstrated GP29 Vigenère transfer**, with each source-ordered table byte `B` supplying a shift `B mod29`, fails **all twelve independently solved red runes** of p56 and p57. No authenticated source specifies how the 256 event values are supposed to interact with the 256 table cells. **No key, unknown plaintext or black-passage prediction is recovered.** The one-to-one cardinality can be retained as a candidate layout correspondence, not an authenticated decoding channel.

## Complete original-event ordering

Source inputs: `resources/liber-primus/lp2-ink-annotations.json` (image-derived runes/ink/punctuation), `resources/liber-primus/lp2-grid-256.json` (printed pp49–51 table, fixed original row-major order), and `resources/liber-primus/lp2-corpus.json` (GP29 rune order). The [read-only reproducer](../sims/lp2_red13_grid256_event_gate_sft.cjs) prints **every one of the 256 events** in original physical order, with 0-based event index, printed physical page and local rune offset, symbol or typed mark, color, 1-based table row/column, original byte, and GP29 residue. This is the exact map, rather than a reconstructed candidate plaintext.

The event rule is: retain each original red rune as GP29 (0–28), retain each **13-dot** glyph as a distinct typed event (value29 for an illustrative 30-code serialization), sort pages and offsets in physical reading order, and place a mark with offset `i` immediately before rune `i` because it follows rune `i−1`. Same-offset marks keep source ordering; **p7 offset194 has black 13-dot, red 13-dot, then the first red rune**. Preserve all other punctuation as separately indexed *excluded controls*, not invisible input.

| Physical page | Inclusive event indices | Event count |
|:---|:---|---:|
| 0 | 0–13 | 14 |
| 2 | 14 | 1 |
| 3 | 15–36 | 22 |
| 6 | 37–49 | 13 |
| 7 | 50–66 | 17 |
| 8 | 67–78 | 12 |
| 14 | 79 | 1 |
| 15 | 80–102 | 23 |
| 22 | 103 | 1 |
| 23 | 104–120 | 17 |
| 26 | 121 | 1 |
| 27 | 122–141 | 20 |
| 32 | 142 | 1 |
| 33 | 143–163 | 21 |
| 39 | 164–169 | 6 |
| 40 | 170–177 | 8 |
| 53 | 178–229 | 52 |
| 54 | 230–239 | 10 |
| 55 | 240 | 1 |
| 56 | 241–247 | 7 |
| 57 | 248–255 | 8 |

Pages 36, 38, 49 supply three of the **four 10-dot glyphs**, not 13-dot events; p56 contributes the fourth. The original p57 terminal 23-dot glyph is likewise excluded. Totals: **225 red runes + 30 red 13-dot + 1 black 13-dot =256 events**. If all distinct dot classes were included, the length would be **261**, so choosing exactly 13-dot is an essential *unverified* selector.

The last two rows of the 32×8 table have a useful exact alignment: events **240–247** consist of p55's final13-dot and p56's five red cipher runes plus two13-dot separators; events **248–255** are p57's seven plain `PARABLE` runes plus one13-dot. However, the final p57 eight-event row necessarily starts at 248 once the 256-total and p57-eight-event facts are fixed. It is not independent evidence for an operator.

## Frozen original-cipher known-plaintext test

The actual 2014 Stage04 used GP29 Vigenère, while original solved p56 uses prime-totient GP29 shifts; these justify one *testable* period-appropriate operation `C = (P + K) mod29`. The speculative bridge `K = B mod29`, with `B` the source-matched grid byte, is the only tested grid-key derivation. It retains the complete original byte externally, is invertible for all 29 rune values, and leaves dot type/ink invariant. There is no historical instruction independently selecting this bridge.

| Known red source | Event indices | Table bytes in reading order | Table `B mod29` | Source-required encryption shifts | Matches |
|:---|:---|:---|:---|:---|---:|
| p56, `AN END` | 241–245 | 141, 42, 214, 22, 56 | 25, 13, 11, 22, 27 | 1, 2, 4, 6, 10 | 0/5 |
| p57, plain `PARABLE` | 248–254 | 113, 158, 172, 230, 180, 36, 189 | 26, 13, 27, 27, 6, 7, 15 | 0, 0, 0, 0, 0, 0, 0 | 0/7 |

Across both authentic known-red controls, **0/12** original runes match the proposed direct key. The exact GP29 encode/decode control with these same twelve native-solved plaintext runes and table bytes passes **12/12** on planted ciphertext. Exact source p56 prime-totient required offsets are reproduced as `[1,2,4,6,10]`. The original `PARABLE` row is especially decisive against a *uniform direct table mask*: every source byte residue there is nonzero, while a plain heading requires seven zero shifts. Reversing the modular shift direction cannot repair any p57 symbol.

A different unkeyed interpretation, assigning GP29 rune indices 0–28 and 13-dot index29 directly as `B mod30`, matches only **11/256** event codes, including **1/31** 13-dot positions. This is merely a source-constant literal-serialization check, not an authenticated 30-symbol cipher or a statistical exclusion of sophisticated models.

## An all-secret static byte→event codebook is impossible

A stronger exact exclusion needs **no invented modulus, alphabet substitution or secret mapping**. Suppose any fixed decoder `F(byte)` maps each original 0–255 table byte to one of the **30 observed printed-event types** (29 GP runes plus 13-dot) at the source-aligned tape position. Equal bytes must have the same output. The actual 256 cells contain **161 distinct byte values**. For **66** of those values, their repeated appearances require **different** printed event symbols; e.g. byte `231` appears at events 1 and 152, demanding GP indices 8 and 6 respectively. The maximum-likelihood unconstrained 256-entry direct codebook can match **166/256** observed printed events, requiring at least **90 contradictory assignments**. This is the exact sum, over equal-byte groups, of each group size minus its most frequent printed-event symbol. The reproducer asserts the counts and prints counterexamples.

Therefore even a completely free, secret, non-arithmetic **memoryless literal byte→printed-event substitution** cannot be an exact encoding of this tape. This theorem does not constrain a *keyed or position-dependent* mapping, a cipher operating on **unknown decrypted plaintext** rather than printed red symbols, or a model that takes both source channels as independent inputs. Those require independent original instructions before another search.

## Interpretive boundary and next decision

The original 256-event length is real. Its central weak link is that **nothing in authenticated 2013/2014 Cicada sources specifies selecting exactly the 13-dot class, converting the pp49–51 values to event symbols, or choosing a reversible cross-channel operator**. The 10-dot and final23-dot exclusions are further falsification checks a genuine explanation must explain. Historical Stage04 authenticates GP Vigenère arithmetic on another challenge; it does not declare that this LP2 number table encrypts red text. Replacing the failed mask with an estimated alphabet permutation, a tailored row-function or an arbitrary shifted alignment would fit known controls after the fact and cannot establish a cipher.

**Issue #647 outcome:** source-perfect ordered tape delivered with a single executable gate; direct historical GP29 byte-mask transfer contradicted by all twelve solved red runes; every unrestricted fixed byte-to-printed-event codebook also has at least 90 contradictions; currently no source-selected alternative, so stop this count-driven route pending a new independent instruction. Maintain the unresolved terminal p55 source-selected decoder gate (#41) separately. No update to `results/README.md` is warranted because this is intermediate negative evidence rather than recovered unknown plaintext.

### Reproduction

`node sims/lp2_red13_grid256_event_gate_sft.cjs` reads the three canonical JSON inputs without modifying them and prints all 256 source-mapped events, terminal eight-cell rows, original required key shifts, the original 0/12 contradiction, and a 12/12 planted round-trip. No network calls, search, tuning, stochastic key generation or file writes occur.
