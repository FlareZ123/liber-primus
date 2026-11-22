# Original GP29-to-GP30 ciphertext-history map: exact all-secret SPACE and rune-rank bounds

**Agent34, 22 November 2026. Status:** source-exact conditional **negative** for the simplest reversible one-/two-ciphertext-predecessor GP29-to-(GP29+SPACE) maps. These bounds neither recover unknown LP2 plaintext nor identify a historical Cicada key. [Source-exact Windows Node 22 CJS SFT](../sims/lp2_gp30_ciphertext_history_space_capacity_sft.cjs), [read-only GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/45054978514).

## Distinct original-language architecture, assumptions and controls

LP2 p0–55 provides **12,956** original GP29 cipher runes, **2,896** authentic printed *complete* words, **32** physical page-crossing complete words, **83** singleton words and **448** two-rune words. Signed Cicada 2013 used an actual \`BASE29\` command, and both the manuscript and the solved PARABLE distinguish rune identities from interword boundaries. Hypothesis: each ciphertext rune directly encodes *one* plaintext GP rune or an otherwise hidden plaintext SPACE, via an online source-framed transducer. Unlike the earlier complete-word radix29→30 numeral conversion (#2278), **this model transforms one source rune to one output token**; it uses previously read ciphertext symbols as finite-state selectors and grants even entirely secret codebooks. No guessed external sidecar, deleted glyph, inserted rune, digit-base conversion, or dictionary-chosen space placement occurs. The original printed frame is retained as public inverse side information, including page-carry words; its boundaries need not equal recovered plaintext spaces.

For each public source-visible state \`s\` (possibly selected by the previous \`k\` ciphertext runes since a given reset), permit an **arbitrary injective** mapping

\`f_s : {0,...,28} -> {0,...,29}\`,

where output 29 denotes SPACE. Every state can use its own unrelated secret table; all input runes remain recoverable because \`f_s\` is injective, and decoder state can be reconstructed during re-encryption from the previously recovered ciphertext. This is considerably more permissive than a 29-to-30 Caesar, Vigenère or fixed alphabet and is **not** a guessed historical cipher.

### The sharp invariant

Let \`n_s(c)\` count **original** ciphertext rune \`c\` at state \`s\`. At most one input \`c\` per state maps to literal plaintext SPACE. Consequently

\`max possible SPACE tokens = Σ_s max_c n_s(c).\`

Likewise, the maximum fraction of output runes occupying **any five GP labels** is bounded by \`Σ_s sum(top five n_s(c)) / 12956\`. Both are **exact tight maxima**, not random samples, because an independent injection can assign each state's most common source glyph to SPACE, or its five most common source glyphs to a shared five-target GP set. A codebook choosing the modal input for SPACE is explicitly built in the SFT for *every* class and its online inverse returns all 12,956 untouched source runes exactly. Its decoded output is an artificial maximum-capacity witness, not claimed language. The SFT separately constructs a native-positive plant from **the actual twenty words of solved p57 PARABLE**, preserving all **95 original clear runes and 19 genuine interword spaces**, then encodes/decodes that authentic GP30 text with a nontrivial deterministic previous-ciphertext-state injection. It recovers all 114 tokens exactly. Thus the method can carry natural GP text where its capacity permits it, while the original unknown pages still fail the declared native benchmark.

The tested selectors use (i) a source-wide stream; (ii) reset on each authentic **complete printed word**, including the 32 words crossing pages; (iii) reset and new independent secret alphabet at each of the original nine visually marked chapters; (iv) reset and new independent alphabet at each physical rune-bearing page. Optional visible word length, within-word position, chapter or page may select additional secret tables. No keys, transitions, or delimiters were selected by checking English outputs.

## Entire original register: exact maximum counts

Every row below uses the **same 12,956 original runes** and **grants one free arbitrary injection per independently visible state class**.

| Reset / codebook owner | History k | Distinct reachable secret tables | Max SPACE count | Max SPACE fraction | Max five-GP-rune count |
| --- | ---: | ---: | ---: | ---: | ---: |
| One global table | 0 | 1 | 492 | 3.797% | 2,375 |
| Global continuous context | 1 | 30 | 717 | 5.534% | 3,147 (24.290%) |
| Global continuous context | 2 | 842 | **2,021** | **15.599%** | 7,032 (54.276%) |
| Word-reset shared tables | 1 | 30 | 695 | 5.364% | separately computed in SFT |
| Word-reset shared tables | 2 | 867 | **1,848** | **14.264%** | separately computed in SFT |
| Nine independently keyed visual chapters | 1 | 270 | **1,267** | **9.779%** | 4,832 (37.295%) |
| 55 independently keyed rune-bearing pages | 1 | 1,645 | 2,790 | 21.534% | 9,224 (71.195%) |
| Word-reset plus original word length | 1 | 378 | 1,355 | 10.458% | separately computed in SFT |
| Word-reset plus within-word position | 1 | 309 | 1,175 | 9.069% | separately computed in SFT |
| Word-reset plus chapter label | 1 | 270 | 1,237 | 9.548% | separately computed in SFT |
| Word-reset plus page label | 1 | 1,638 | 2,668 | 20.592% | separately computed in SFT |

All values are upper bounds *over every possible independently secret 29-to-30 injective codebook* in the specified family. Here the \`k=1\` state is the actual preceding ciphertext rune, or a start sentinel; \`k=2\` uses the preceding two actual ciphertext runes since the reset. These are **ciphertext histories**, so no guessed plaintext or secret-state search is involved. Original \`k=3\` global and word-reset branches already permit **10,076** and **5,643** SPACEs respectively and thus are explicitly *not* excluded by this SPACE test. Chapter-private \`k=2\`, page-private \`k=1\`, and word-length-specific \`k=2\` also exceed native benchmarks and remain open.

For an independent native control, genuinely solved physical p57 PARABLE contains **95** GP29 runes and **19** internal word spaces in a 114-token GP30 text, a literal **16.6667%** SPACE share; **46/95 = 48.4211%** of its runes occupy its five most frequent GP letters. An independent previously audited clear LP1 passage has **755 runes and 180 internal spaces**, a **19.2513%** GP30 SPACE share. The globally shared two-predecessor model can reach at most 15.599% SPACEs, slightly below even the compact solved PARABLE reference; the source-word-reset two-predecessor model falls to 14.264%. Even **nine fully independent, chapter-private, one-predecessor tables** cannot reach the native PARABLE top-five rune concentration (37.295% versus 48.421%). These are **source-native language benchmarks**, not a mathematical minimum on arbitrary conceivable English, sparse typography, unspaced text or a non-GP plaintext register.

### Untouched full original intervals

State histories for disjoint p16–21 and p40–53 are computed from their **actual global predecessors**, with no new plaintext-selected boundaries. In each interval we grant a *fresh set of secret tables* when calculating its own exact maxima, so the bounds are deliberately more favorable than one fixed whole-book key.

| Original continuous interval | Original runes | k=1 max SPACE | k=1 max five-GP count | k=2 max SPACE | k=2 max five-GP count |
| --- | ---: | ---: | ---: | ---: | ---: |
| p16–21 | 1,613 | 164 | 612 | 768 | 1,599 |
| p40–53 | 3,008 | 235 | 958 | 982 | 2,837 |

A true decoder would need one author-specified, unchanged codebook rule that recovers actual language in both intervals and exact forward replay. The capacity witness deliberately chooses most common ciphertext labels to maximize spaces; it supplies neither authentic keys nor English.

## Decision and next plaintext-directed gate

**Reject as a normal GP+SPACE prose route** any direct reversible one-symbol-to-one-token history-dependent substitution with a single shared one-predecessor alphabet and ordinary plaintext-space density, even granting unknown 30-symbol tables; likewise a shared two-predecessor map stays below the native SPACE controls. The independent nine-chapter one-predecessor family also suffers a robust GP top-five deficit. This is a conditional original-source, native-language exclusion of **these precise automata**, not a rejection of all finite-state or anti-repeat mechanisms (#2083 and #2273 own those broader branches).

A viable route must now supply something substantively different: a truly source-selected third predecessor or richer nonlocal dynamic state, a source-readable page-private codebook/key derivation, a separately encoded plaintext-boundary tape, an alternate source alphabet, or genuine external key material. Its author-supplied update and cipher receiver must be specified **before** choosing English outputs and must transfer to untouched p16–21 and p40–53. **No unknown LP2 plaintext, complete cipher, or destination was found.**
