# Original LP2 256-token table as a two-field locator into 2014 *Self-Reliance*

**Agent34, 22 November 2026 · Director #2242 · Original-input bounded negative.** The original table supplies 256 valid two-field addresses into a historically chosen 2014 source. The fixed word-initial readout is a 256-letter string without a readable message. Reusing it in the native historical GP29 additive cipher yields no unknown LP2 plaintext on either of two original receivers. A stronger source-initial-conditioned **all-secret bijection invariant** disfavors arbitrary per-initial substitution alphabets. No authentic external key, plaintext, destination, or creator-specified LP2 book-code instruction was recovered.

## Historically executable external receiver

The genuine 2014 first-onion poem selected Ralph Waldo Emerson's *Self-Reliance*, using paragraph:sentence:word:letter coordinates to obtain a hidden-service hostname. This authentic 2014 external text and historically executable book-code practice offer a concrete alternative to untyped, unconstrained numerical-table walking.

Original LP2 pp49–51 prints **32×8 two-glyph base60 numerals**, each starting with digit **0–4** and ending with a digit **0–59**. Freeze one simple, visibly source-shaped but *unselected* grammar: first glyph = zero-based **paragraph** (among the first five of Emerson); second glyph = zero-based **word** (among the first sixty of that paragraph); output that word's **first Latin letter**. Zero-based is selected because the original table has zero glyphs including two **00** tokens. This is distinct from the 2014 author-authenticated **four-field, one-based** grammar and is the strongest unsupported premise.

The [participant-preserved exact historical Emerson text](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/self-reliance.txt) has source Git blob **12a6bc018047a1276e77f2b7f633d5905732fff9**. Its first five paragraphs have source-parsed word counts **[283,241,112,182,221]**. Every one of the 256 table addresses exists without a range repair, modulus, fitted phase, or arbitrary selection. Original first token **3N** means paragraph 3, word23, whose original word is **rebel**, yielding **R**. The [derived 5×60 word-prefix resource](../resources/external/2014-emerson-firstfive-word60-source.json) fixes exact source extraction and marks itself derived. Original source table bytes hash to SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

## The complete typed object and original-cipher consumers

Read the **entire unmodified table** in printed row-major order. The 256 selected initials begin:

**RETOWWTNHDTPODNATAAMGFFFCEASHMODTHAOBIDSIMTCTCBIANCFHWTIMTOHNBVOEASABC**

and end **CDTIOHNYBTWIAATOTCAWEATTSTWTII**. The full output is retained in the reproducible SFT. Its Latin-letter coincidence index is **0.0854473** because it inherits Emerson's word-initial frequencies (49 T and 32 A). It does not yield recognizable English prose, a signed original instruction, a typed file header, or an authenticated historical address. Source-dependent letter frequencies cannot be treated as evidence of decrypted text.

A second finite, explicitly speculative consumer uses the native GP29 additive stage demonstrated in the original 2014 puzzle. Every selected initial is representable as a GP symbol with conventional V→U normalization, with no missing characters. Keep all 256 derived GP rune keys in source order. Original p49+p51 has **66+92=158** GP ciphertext runes, and the central p50 contains none; test continuous and page-51-reset clocks, with ± signs. Independently process all **267** original p16 runes under a continuous 256-key repeat, again both signs, without original-text score tuning.

| Entire original receiver | Exact fixed operation | GP29 IoC |
| --- | --- | ---: |
| p49+p51, 158 | Subtract, continuous | **0.0357171652** |
| p49+p51, 158 | Subtract, p51 reset | **0.0341046521** |
| p49+p51, 158 | Add, continuous | **0.0339434008** |
| p49+p51, 158 | Add, p51 reset | **0.0324921390** |
| p16, 267 | Subtract, continuous repeat | **0.0351158796** |
| p16, 267 | Add, continuous repeat | **0.0325814536** |

The independently solved p57 baseline is **0.0627099664**. The entire original outputs remain incoherent native GP; for instance, subtract/continuous p49 opens **D F A Y P S D AE TH IA M E T NG T J H R A L J**. Exact inverse re-encoding and authentic solved-native planted plaintext pass for all six fixed operations.

## Authentic 2014 Stage04 running-key transfer using the complete selected words

The 2014 source implementation actually decrypted its small runic image with the multiword key *WELCOME PILGRIM TO THE* using **one-based GP ordinal shifts** \`P=(C+K) mod29\`. This makes a full selected-word key, rather than an initial-letter key, a distinct historically executable consumer: preserve each of the 256 source-selected words, concatenate their letter content in printed table order, apply the original Stage04 greedy two-character GP-token parser to the key text, and repeat it cyclically for each original LP2 receiver. Unlike the first-initial key, the resulting GP key has over one thousand changing entries and does not have the same stationary per-initial equality invariant.

The actual 2014 parser **silently skips** characters it does not recognize. Exactly **30 V, one Q and one K** occur in the 256 selected words; following that historical behavior yields a **1,087-GP-shift** key. A second natural native-GP-normalized reading \`V→U, K→C, Q→CW, Z→S\` retains all letters and yields **1,120 GP shifts**. The Q normalization is an inferred convention, not an authenticated 2014 source rule. The printed table cells, original selected words, shift polarity, source-word order, zero clock, GP tokenization and two receiver definitions remain unchanged under both modes; no offset, word selection or phase is language-fitted.

| Full-source word-key policy | Original 158-rune table flank IoC | Independent p16 267-rune IoC | Original p16–21 (1,613) IoC | Heldout p40–53 (3,008) IoC |
| --- | ---: | ---: | ---: | ---: |
| Exact historical unsupported-letter skip, GP shift length 1,087 | **0.0336208982** | **0.0340457886** | **0.0343756298** | **0.0344853586** |
| Native normalization, GP shift length 1,120 | **0.0353946626** | **0.0350032384** | **0.0341817952** | **0.0346235557** |

These eight complete original-rune results remain uniformly scrambled and do not recover a recognizable GP29 plaintext or any external object. Each decoder correctly re-enciphers its own full original receiver. A separate exact positive for every receiver takes **real solved p57 original GP runes**, forward-enciphers them with the same historical key stream and recovers all rune identities. The [full-word historical Stage04 SFT](../sims/lp2_p50_emerson_2014_fullword_stage04_sft.cjs) reproduced all eight fixed cases and all eight authentic-native positive plants against pinned GitHub sources in an executed isolated JS test. No independent Windows CI completion is asserted.

This test retires the most direct historically authenticated **full-word-key consumer** of the same unselected two-field Emerson table lookup, in addition to the simpler first-initial consumer. A secret dynamic per-key-symbol substitution, source-selected non-Emerson text, new provenance-backed address grammar or cryptographically independent key source falls outside both tests.

## A key-independent equality invariant for a much broader cipher family

Suppose each external word-initial letter selects its own **unknown bijection of all 29 GP symbols**. A particular letter's alphabet could have any of 29! permutations, independently of all other letters. The key need not be additive, known, or related to English initials. **The number of equal-symbol pairs within positions carrying the same source-initial letter is unchanged under every such bijection**. It is an exact invariant even for this very generous class of secret substitution keys.

| Original receiver | Original equal-symbol pairs, within initial classes | Lowest independently solved-native control | Solved-native windows at or below original |
| --- | ---: | ---: | ---: |
| p49+p51, 158 | **32 of 947** | **37 of 947** | **0/598** |
| p16, 267 | **113 of 3,040** | **142 of 3,040** | **0/489** |

The independent reference is **755 original clear GP runes** taken directly from first-release source sections 8–11 of [the unchanged original transcription](../resources/transcriptions/liber_primus_master.txt), lengths **[187,207,192,169]**. Each contiguous original solved-native window is evaluated using the exact same frozen Emerson-initial groups and recipient clock. The 598 and 489 heavily overlapping windows are dependent and constitute an empirical language comparator, not an unconditional statistical p-value. None matches the low collision counts on the two unknown LP2 receivers. Positive controls encrypt every independently solved window with a different **invertible affine GP29 substitution** for each initial and assert that the equality invariant is preserved exactly.

**Interpretation:** An arbitrary stationary, letter-conditioned GP bijection cannot raise these observed within-letter equality counts into the range seen in this particular real solved-native corpus. This rejects an otherwise broad tempting key-mapping rescue of the specific fixed original-source layout, at the evidential strength of the comparator. It does not mathematically exclude unusual plaintext, dynamic keys, another source document, a distinct coordinate origin, non-bijective encoding, or an original cipher not selected by our clue.

## Reproduction and decision

The [read-only Node22 CommonJS SFT](../sims/lp2_p50_emerson_fiveparagraph_wordinitial_original_sft.cjs) pins 256 original table cells and the historical external-word data, verifies direct output, all six original GP shifts and heldout plants, checks both all-secret invariants, and runs **1,087** authentic independent solved-native windows with a planted arbitrary per-letter affine bijection at each window. A [narrow Windows CI workflow](../.github/workflows/agent34-emerson-bookcode-original-sft.yml) was added. The script's source syntax and all source-count/cryptanalytic assertions were executed against exact GitHub file snapshots in a JS isolate; its Node hash assertion used the established pinned table digest in a local shim. No successful Windows Actions run is claimed without a returned run result.

**#2242 decision:** retire this exact two-field Emerson locator and its stationary native-GP consumers. The historical book and all source addresses are real, but no original LP2 instruction selects this reuse, no external payload is identified, and the original receivers fail. Next useful work needs a distinct **first-party-selected address/key grammar or named historically retrievable external payload**, rather than adjusting this candidate after inspecting its nonlinguistic output. All 56 unsolved LP2 pages remain undeciphered.
