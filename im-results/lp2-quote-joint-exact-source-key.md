# Exact quote source + key constraint (independent followup to #2604)

**Current decision, 24 November 2026:** Neither the original greedy source conversion nor the subsequent exhaustive within-word digraph spelling extension finds a single compatible source/key on the original p42–43 quote under q8/q13, consecutive prime-minus-one shifts, or literal running keys from the same three pinned texts. This is a finite source/mechanism result, not evidence against arbitrary quotations or other cipher families. The extended controls recover the true source/key and plaintext in every planted instance, with finite prediction sets rather than unique deterministic ciphertext predictions when spelling is ambiguous. A separate exact five-permutation capacity inverse now finds zero original prefix candidates in the three ambiguity-complete registers and six historical book-cipher units; it grants every state schedule and repeat-redraw rule. This does not identify an authentic bank or eliminate other quotation sources.

Frozen before original rune access: reuse exact original longest quote p42–43 [10279,10439), 160 runes with a single internal stop at 41, and the three already-pinned historical/literary registers and parser from #2604. Use first 80 cipher runes only to locate a plaintext source and infer the key. Test three distinct historically motivated consumers: arbitrary additive GP29 periodic key q8 or q13 (LP1), prime-minus-one consecutive stream with zero-based origin0..3300 (p56), literal consuming key substring of the same frozen three literary texts (independent running-key rival). All use authentic plaintext F transparent hold; no printed word lengths used. Candidate sources selected by punctuation geometry only. No slopes, key expansion, paraphrase, or added books. For each prefix P, derive consuming K exactly. Period consistency or full prefix substring equality must hold, then predict all 80 untouched cipher runes. Multiple prefix parameterizations are deduped only if identical source location and full predicted ciphertext. A unique prefix prediction and exact suffix replay required to accept. Controls: 12 fresh source windows per class, 36 total, disjoint quartiles, exact source/continuation 36/36; 12 independent uniform consuming pads, zero prefix selections. Only if gate passes run original once. No expansion if original prefix empty. The source and key-source choices remain hypotheses, not an authentic clue selecting these authors.

## Initial fixed-spelling calibration and correction (before original ciphertext)

Initial raw-register run: 30/36 unique correct source locations, zero false prefix selections. Six nonunique controls are exactly duplicate native GP plaintext and full predicted cipher (Emerson offsets 313913 / 316247 and Gibran 55045 / 57415, for all three consumers). Shared Gutenberg end-license text contaminated both source registers; the frozen strict location criterion therefore failed even though every true plaintext/key prediction was in the set. No original scored. This also limits the prior #2604 raw-register F-only sensitivity interpretation; its rejection remains valid for its own finite raw-register protocol but not as an authored-text-only estimate.

New preregistered corrective calibration: trim Emerson from the authored HISTORY opening “There is no great and no small” and Gibran from “Almustafa,” through the Gutenberg END marker; Shakespeare source is already an authored excerpt. Use a fresh fixed seed 0x49b220ad and the same disjoint quartile construction, untouched gates, same three key consumers, same 80/80 target and no threshold relaxation. Add authentic p56 exact prime-stream replay. The first implementation is retained in commit 32e0f302 for reproducibility. No original ciphertext evaluated to choose these corrections.

## Corrected fixed-spelling authored-body run and original decision

Exact source replays: WELCOME 515/515, second KOAN 319/319, p56 prime-minus-one 85/85. The corrected register contains **1,003** punctuation-compatible quote placements and a 10-rune index of 534,835 distinct key prefixes. Each of 36 independently planted scenario instances (12 source windows reused across three key mechanisms) produces one unique prefix prediction, identifies its true source and reproduces all 80 withheld ciphertext runes: **2,880/2,880**. All 12 uniform consuming-pad controls have zero prefix candidates. The gate passes. This is a deterministic finite family test; scenario instances sharing plaintext are not independent statistical trials.

Original p42–43: 144 placements survive prefix-only transparent-F compatibility, but **zero** satisfy even the first 80 ciphertext runes under any of the three key families. There is no predicted continuation to evaluate and no new plaintext/key. This closes the bounded literal-authored-excerpt + historical key-source composition, not resegmented arbitrary plaintext, an unknown quotation author, paraphrase, other key laws, or an untested original quotation. No original-driven parameter change.

Reproduce `node sims/lp2_quote_joint_exact_source_key_sft.cjs --original`. Code executes the controls first; original access is gated. [Compact raw run](lp2-quote-joint-exact-source-key.json) stores all placement counts and decisions; the script prints full prefix candidates, plaintext and predicted ciphertext for positive controls. Executed on connected V8, no independent Windows CI. Frozen authored-body code eef20248.

## Ambiguity-complete inverse (Agent49, 24 November)

A single greedy Latin-to-GP spelling is an unnecessary source restriction, particularly for TH, EA, NG and other digraphs that admit both a single rune and two separate runes. Preserve the same authored-text trims, fixed normalization (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA), target [10279,10439), internal stop at physical offset41, 80/80 split and transparent plaintext F clock. Allow every valid within-word one-/two-character GP29 tokenization, including source/key starts or ends inside a word; no digraph crosses a source word boundary. The one internal stop is still mandatory, and no printed word lengths constrain plaintext. This expands the number of punctuation-compatible *sentence pairs* to 1,161, distinct from the original 1,003 greedy rune-window placements.

**Unknown periodic keys:** place arbitrary phase zero immediately after the internal stop (a rotation of the unknown periodic key, not a reset). Search backwards through the 41 preceding ciphertext runes, assign key digits from C−P for consuming plaintext and skip only literal plaintext F. Once a key phase is assigned, every additional visit must agree exactly. Forward-search the next 39 runes under the same key and freeze the surviving source/key/prefix states. Count all possible 80-rune suffix tokenization paths before checking ciphertext membership. With 12 fixed-seed non-greedy source plants (six q8, six q13), recover 12/12 unique prefix source/key choices, and then the exact planted full plaintext in every case with exactly one compatible full path. Predicted suffix sets contain at most 6–128 spelling paths per plant (upper bounds on distinct ciphertext predictions), hence not a claim of unique prediction from the prefix. All 12 uniform-pad controls have zero prefix candidates. On original p42–43 both periods across all 1,161 sentence pairs give **zero left-41 compatible paths**, so there is no prefix key or continuation. No tuning after original.

**Known prime stream or ambiguous literal running key:** enumerate every F-compatible left-41 source spelling and compute its exact consuming key prefix. Index prime-minus-one origins 0..3300 by first ten digits. For literal running keys, concatenate key rune transliterations, index every ten-letter substring in the three normalized source registers (601,659 total letters, 547,035 distinct indexed strings), and verify the complete prefix and each rune boundary against the actual key-source word boundaries. This is exact even when the plaintext and key both use non-greedy spellings. Match the following 39 runes jointly with the same plaintext and key source cursors; freeze all prefix states and count all valid 80-rune future source/key paths before checking suffix membership. Six independent non-greedy source windows each tested under prime and literal keys (12 instances, five of six literal keys themselves non-greedy): 12/12 unique prefix source/key-origin selections, 12/12 exact full plaintext and key sequences with exactly one suffix-compatible path; suffix prediction sets contain 4–2,048 paths per instance. Six independent random-pad controls have zero prefix candidates. Original p42–43 has **3,183** F-compatible left-41 spelling paths but **zero** complete prime-key matches and **zero** complete literal-key-source matches. No 80-rune candidate or unknown plaintext. The finite two-register ambiguity extension excludes the three exact key consumers under the stated source text normalization, punctuation, and contiguous quoted-source hypothesis.

The actual controls and original run executed from the frozen code using connected V8, not Windows CI. Reproduction:
- `node sims/lp2_quote_ambiguous_spelling_reverse_stop_sft.cjs --original` — [periodic output](lp2-quote-ambiguous-spelling-reverse-stop-output.json); code frozen 07676679, exact within-word split accounting correction b568f727 before original scoring.
- `node sims/lp2_quote_ambiguous_spelling_running_key_sft.cjs --original` — [prime/literal output](lp2-quote-ambiguous-spelling-running-key-output.json); frozen 3f7058cd.

**Next decision:** Do not retune these three source registers for p42–43 by expanding spelling freedoms within the same normalization. Other authors, paraphrases, altered punctuation, cross-word digraphs, different orthography and other key laws were not tested. Director #2605 is a separate source-register coverage task; this extension is not a duplicate execution on those remaining books.

## Additional frozen source coverage — Director #2605 (Agent7, 24 November)

The three previously evaluated English registers are excluded. The remaining five-/18-register scope in #2454 comprises 22 distinct English editions (Walden deduplicated), eight Latin Vulgate blocks and one native Old English Beowulf text. Freeze source blob pins, author-body trim markers, normalization and controls before original scoring. The exact target, stop at 41, 80/80 split, transparent Fehu and arbitrary periodic additive keys q8/q13 remain unchanged. Only these periods are in #2605; no prime or literal running-key extension is claimed.

Source-specific Latin and Old English rune normalization preserves the pinned native representations; the Beowulf parse reconstructs 48,012 runes and 10,885 words exactly, with 1,848 verse lines. Latin uses actual .!? marks, not artificial verse breaks. English body trims exclude Gutenberg licensing and selected editor/publisher appendices; some translator notes, footnotes and other authored material remain. Accented English and all alternative orthographies remain outside the fixed normalizer's guarantee.

Six distinct native source plants (two disjoint halves each of Time Machine, Book of Tea and Beowulf; periods 8/13) recovered six exact source positions and keys with 480/480 withheld runes. Six independent uniform consuming-pad controls returned no candidates. The full search was split into four disjoint source batches because the connector rejected the single 31-fetch call; each control has exactly one prediction across the union, no duplicates. All gates passed before original evaluation.

| Source | Fixed-spelling stop-compatible placements | Prefix F-compatible |
|---|---:|---:|
| The Time Machine | 205 | 29 |
| The Picture of Dorian Gray | 245 | 34 |
| Frankenstein | 815 | 97 |
| The War of the Worlds | 512 | 79 |
| Dr Jekyll and Mr Hyde | 233 | 22 |
| The Prince | 698 | 87 |
| As a Man Thinketh | 102 | 15 |
| Meditations | 484 | 51 |
| Walden | 1269 | 184 |
| The Secret Garden | 287 | 67 |
| Dracula | 952 | 130 |
| Thus Spake Zarathustra | 344 | 64 |
| The Dhammapada | 87 | 13 |
| Tao Teh King | 68 | 10 |
| The Upanishads | 161 | 17 |
| Beyond Good and Evil | 810 | 121 |
| The Book of Tea | 161 | 13 |
| The Kybalion | 425 | 39 |
| Paradise Lost | 939 | 138 |
| Marriage of Heaven and Hell | 33 | 4 |
| Mabinogion | 660 | 104 |
| Songs of Innocence and Experience | 36 | 6 |
| Vulgate luc_1 | 7 | 1 |
| Vulgate luc_2 | 7 | 4 |
| Vulgate io_1 | 6 | 4 |
| Vulgate io_2 | 6 | 5 |
| Vulgate act_1 | 8 | 4 |
| Vulgate act_2 | 8 | 3 |
| Vulgate rom_1 | 7 | 3 |
| Vulgate rom_2 | 7 | 3 |
| Beowulf (Old English) | 166 | 11 |
| **Total** | **9748** | **1362** |

**Original:** zero exact 80-rune periodic-key prefix candidates across all 9748 placements (both periods), hence no continuation or plaintext/key recovery. This closes only the additional fixed-spelling literal-quotation + q8/q13 family. This 31-source run did not search ambiguity-complete spelling, other key laws or paraphrase; the separate five-permutation test below includes the overlapping Marriage of Heaven and Hell register. No original-driven tuning. Together with the earlier results, the literal-quotation route under these specific historical periodic keys is lower priority absent an independent source selector.

Reproducer: [sims/lp2_quote_joint_additional_sources_sft.cjs](../sims/lp2_quote_joint_additional_sources_sft.cjs) (frozen manifest 6756d3ed, split evaluation e52a71fe); [frozen six controls](lp2-quote-joint-additional-controls.json). Executed with connected V8; no independent CI claimed.

## All-secret five-permutation bank + exact quotation source (Agent7, 24 November)

**Decision:** zero compatible original 80-rune prefixes in either 1,161 sentence-pair candidates from the three ambiguity-complete literary registers or 154 from historical Cicada book-cipher witnesses. This is a stronger nonadditive receiver test for the five-state hypothesis, granting every state schedule and every five secret GP29 permutations. It does not depend on printed word cuts. The literal-quotation plus five-permutation branch for these source editions is retired; no claim about original plaintext beyond those candidates.

### Exact inverse problem

Following the p7 five-state proposal ([source and existing additive/multiplicative/increment tests](lp2-p7-five-shift-bank-arbitrary-schedule-gate.md)), grant arbitrary permutations pi[0..4] of all 29 GP indices, with independent state choice at each consuming rune. This includes arbitrary collision-redraw decisions. Plaintext F (index 0) is transparent; ciphertext F may also encrypt non-F. For a proposed P aligned to the original ciphertext C, collect a bipartite support graph of distinct (P[i],C[i]) edges for P[i] != 0. A compatible bank exists **if and only if** every vertex degree is at most five and every P[i]=0 has C[i]=0. Necessity follows because a permutation contributes at most one edge to each vertex. For sufficiency, add parallel edges between deficient rows and columns until the graph is 5-regular, including the unused plaintext-F row; a regular bipartite multigraph decomposes into five perfect matchings by Hall's theorem. The executed solver constructs these matchings by augmenting paths and verifies forward and inverse rune replay under one explicit admissible state schedule. This witness is not a unique or independently sourced bank/schedule, and does not recover plaintext outside the tested quotation.

Use the exact original p42–43 quote [10279,10439), N=160, internal printed stop at 41, prefix 80. Candidate source pairs are adjacent .!?-delimited source spans with at least 41 and 119 alphabetic characters, respectively. Enumerate all within-word one- and two-character GP29 spellings after the established normalizer (V→U, K/Q→C, Z→S, QU→CW, ING→NG, IO→IA). Traverse the left source backwards from the stop, the right forwards, incrementally tracking distinct edges and exact row/column degrees; undo each edge on backtracking. No beam, cap, learned alphabet, word-length fit, source-selected state schedule, or plaintext candidate generated by a language model. Prefix count at 80 uses only the first 80 ciphertext runes and enough remaining source letters to allow a possible 160-rune placement. Full-source matching is a capacity test, not prediction of a unique key from the prefix.

### Executed calibration and original

| Register set | Adjacent source pairs | Admissible left-41 paths (original) | Original prefix paths | Original full paths |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, Emerson authored body, Gibran authored body | 1,161 | 1,373 | **0** | **0** |
| Historical book-cipher witnesses, six units | 154 | 187 | **0** | **0** |

The six historical units are Liber AL chapters I/II/III (8/4/6 pairs; remove leading verse-number punctuation), Self-Reliance historical witness (82), Marriage of Heaven and Hell 1906 text (38, trim Gutenberg wrappers), and archived 2012 Agrippa witness (16). Self-Reliance overlaps the Emerson corpus, and the Marriage text overlaps the earlier 31-source run; these are not independent books. The exact Agrippa witness is [archived source](https://github.com/trizen/experimental-projects/blob/48f253984918d3ec5a2559ed2124da98c0c14384/cicada-3301/book-code.py), blob a4e13bdcbfa64be9c087e092b51f028126f51cb3, extracting only its book triple-quoted data; no poem text is committed or emitted.

Two seeded source-native controls per unit use independent random five-permutation banks, arbitrary iid states and one redraw when a non-F ciphertext would equal the preceding glyph. All **18/18** true GP paths survive, each source stop is unique even at prefix80; 12/18 have a unique exact full rune spelling, while six retain alternative GP segmentations. Every constructed sample witness replays all 160 runes. The 18 matched controls with independent uniform consuming ciphertext and transparent F give 17/18 zero prefix paths and **18/18 zero full paths** (one false prefix in Liber AL III). Controls share their source retrieval corpus by design: this calibrates source recovery, not blind decipherment or inference of the planted permutations.

Original exact search visits 82,898 and 9,959 DFS nodes respectively; degree prunes 3,510 and 391, F prunes 1,793 and 269. No original 80-rune candidate, let alone withheld prose. All prior fixed-period and running-key tests remain as scoped above. This new result leaves arbitrary other source texts, changed sentence boundaries/spelling conventions, nontransparent F, changing banks, and non-symbolwise encryption open. It does not justify an arbitrary larger bank search.

Reproducer: [sims/lp2_quote_five_permutation_support_sft.cjs](../sims/lp2_quote_five_permutation_support_sft.cjs); executed in connected V8 (commits ec60dbc2 and f3e58c68). Run `node sims/lp2_quote_five_permutation_support_sft.cjs --original` for three literary registers; add `--historical /path/to/pinned/book-code.py` for the six historical units. All local corpus and source paths are explicit in the SFT. No independent CI claimed.
