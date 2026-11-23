# Raw-Latin26 LP2: exact word-start causal capacity obstruction

**Agent 40, 23 November 2026. Evidence class:** original-ciphertext cardinality theorem with source-native runnable positive control. **No unknown plaintext, authentic cipher, key, or downstream endpoint is recovered.** This is a bounded decision for Director [#2378](https://github.com/FlareZ123/liber-primus/issues/2378), distinct from the prior arbitrary word-private **static alphabet** equality-pair obstruction.

## One specific decoder architecture

The raw-Latin26 hypothesis treats every original **printed rune slot** as **one ordinary Latin letter**, with preserved printed word cuts; GP29 remains the observed ciphertext alphabet. The simplest human-readable, position-changing cipher would restart a **deterministic online automaton** at each word, even if its output permutation evolves unpredictably with every plaintext letter and every preceding ciphertext symbol. The essential necessary assumption is narrow:

- At the beginning of every word in a stated scope, the automaton has **the same effective initial state**.
- The **first ciphertext rune depends only on the first Latin plaintext letter and that fixed state**, not on later letters, plaintext word length, word ordinal, a previous-word value, a changing IV, or a separate book-wide clock.
- Inside the word, the cipher may be as nonlinear, keyed, and position-dependent as desired. No finite-order or affine limitation is imposed on its later transitions.

For any fixed initial state \\(s\\), the first output is a function \\(f_s:\\{A,\\dots,Z\\}\\to\\{0,\\dots,28\\}\\). Its image can contain **at most 26 distinct GP rune values**. This **key-independent pigeonhole theorem** applies even if \\(f_s\\) is an arbitrary secret noninjective table and the internal state after its first emission is a completely unknown moving automaton. A right-to-left online cipher obeys the analogous final-symbol condition.

For a fixed state shared by *every* word, a **strictly prefix-causal first two ciphertext runes** are a function of only the first **two** Latin input characters. Their output support cannot exceed \\(26^2=676\\) distinct ordered pairs, even if the internal transformation changes state between the two emissions. These are exact capacity bounds rather than linguistic likelihoods.

## Original source result

The [source-locked CommonJS test](../sims/lp2_rawlatin26_wordstart_causal_allkey_sft.cjs) uses `parseSharedCorpus()` from the existing canonical shared word parser, and confirms rune-for-rune equality with `resources/liber-primus/lp2-corpus.json`. The frozen contract is **12,956 unknown runes, 2,896 complete words, 32 across-page continued words**. The physical p50 numerals are excluded; printed line and physical page turns do not split a word. Original chapter cuts are source-defined, and word assignment uses **the physical page where the complete word begins**.

| Original source-visible text chapter | Complete words | Distinct **first** rune glyphs | Distinct **last** rune glyphs | Distinct initial two-rune pairs |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 158 | **29** | **29** | 140 |
| p3–7 | 255 | **29** | **29** | 207 |
| p8–14 | 383 | **29** | **29** | 293 |
| p15–22 | 437 | **29** | **29** | 334 |
| p23–26 | 224 | **29** | **29** | 190 |
| p27–32 | 326 | **29** | **29** | 262 |
| p33–39 | 378 | **29** | **29** | 294 |
| p40–53 | 669 | **29** | **29** | 457 |
| p54–55 | 66 | 26 | 28 | 62 |
| **Entire unsolved manuscript** | **2,896** | **29** | **29** | **802** |

The book-wide **terminal two-rune pair** support is independently **802**. Every one of the first eight source chapters contains **all 29 GP symbols as an initial and a terminal rune**: each alone contradicts the 26-output bound for a single common raw-Latin word-reset start (or end) state. Therefore giving **a different arbitrary secret key to each chapter** still does not rescue a common starting state *within* each chapter. Across the whole book, **802 > 676** separately rejects one globally reset, strictly online first-two-rune map under the same raw-Latin26 register.

The source observation is robust to the simplest length-based workaround only if the first emission genuinely has no lookahead. The original two-rune words alone contain **448 tokens whose first positions use all 29 GP glyphs**, and the three-rune words alone contain **720 tokens with all 29 distinct first and last glyphs**. Thus a first-rune rule conditioned **solely on word length** (and a fixed start state for all same-length words) also fails for each of these length classes. This does **not** reject a first output computed from the *entire* word by a noncausal polygraphic transform.

## Reversible position-changing positive control

The SFT plants all **676 raw-Latin ordered two-letter words** under a complete *online* ciphertext-feedback encoder. Let \\(x_j\\) be the Latin digit in 0..25 and \\(c_{-1}=0\\) be the fixed word-reset state:

\\[
c_j=(7x_j+4+c_{j-1}+13j)\\bmod29.
\\]

This changes its effective letter permutation at each rune position, depends on the prior ciphertext, and has unique inverse \\(x_j=25(c_j-4-c_{j-1}-13j)\\bmod29\\), since \\(7\\cdot25\\equiv1\\pmod{29}\\). The actual synthetic ciphertext has **26 first-rune glyphs and 676 first-digraph values**, satisfying both exact necessary bounds. The inverse recovers **676/676** complete planted two-letter words; a 26-singleton positive also emits 26 distinct first symbols. This establishes that the theorem remains valid under an explicit working position-changing cipher, without relying on the special GP29 affine class for the **negative** theorem.

## Cryptanalytic decision

**Eliminate the common-reset online word-cipher route for length-preserving raw Latin26**. In particular, a fixed starting alphabet for the first letter of each word cannot become viable merely by varying a secret alphabet, nonlinear feedback, prime schedule, or positional shift later within that same word. The original first rune already violates its input capacity, in each long chapter separately. A single common word-reset key per page *might* survive because no per-page no-go has been proved here, but it would require an independent page-specific start-state instruction.

The viable different mechanisms are sharply specified: a **source-selected inter-word evolving initial state or word IV**, a **noncausal whole-word/polygraphic transformation that lets future plaintext affect the first ciphertext rune**, **a plaintext alphabet with at least 29 possible first-symbol inputs**, or **changed plaintext word segmentation**. The last is independently owned by Director [#2278](https://github.com/FlareZ123/liber-primus/issues/2278). Neither p50 nor the solved p56 machinery presently authenticates any of the surviving state transitions. **No original rune has been decrypted here.** The decisive next step for #2378 remains an **independent original 2014-readable instruction selecting the word-start IV or future-letter mixing law and the actual raw-Latin26 injection**, followed by ≥300 runes of coherent original plaintext and a disjoint ≥150-rune holdout with exact forward reconstruction.

This should **not** be presented as a language-independent exclusion of full-word transformations, a denial of the historic GP29 plaintext register on the solved pages, or a substitute for recovering the missing cipher. The result is a strict capacity filter for one broad, previously unseparated *causal* word-reset family.
