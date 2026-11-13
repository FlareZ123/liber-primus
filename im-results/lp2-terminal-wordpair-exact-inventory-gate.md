# Exact original-cipher terminal-word echo: p27 → p55

**Classification (13 November 2026): confirmed original ciphertext repetition, independent visual association, and an exact conditional null calculation. Proposed authored navigation and cryptographic role remain hypotheses. No unknown LP2 plaintext or key is recovered.**

## The two printed occurrences

Original physical page 27 (archive scan [44.jpg](../resources/liber-primus/44.jpg)) has an isolated insect-wing drawing above the text. Its second text line contains the source-printed whole-word sequence:

```text
...ᛒᚠ-ᛞᛄᚢ-ᛒᛖᛁ-ᚫᚠ-ᛈ-...
```

The exact rune indices of the repeated six-rune string are `[23,11,1,17,18,10]`, beginning at page-local rune offset **28** (zero-based); the following printed word is `ᚫᚠ`. The six runes are the **1462nd and 1463rd complete corpus word positions, zero-based**, after joining all originally unmarked cross-page continuations.

The *last two printed words* of the entire still-unknown LP2 section, on physical page 55 (archive scan [72.jpg](../resources/liber-primus/72.jpg)), are the **same**:

```text
...ᚳᛠᛁᛗᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.
```

The repeated string starts at p55 rune offset **70** and comprises corpus word indices **2894–2895**, the final two of **2,896**. The image carries a central tree and a winged Cicada insect emblem. The image motif is a *possible independent human-navigation cue* linking two source pages, not proof the two drawings share a stencil or fix an encryption operator.

The next printed word at p27 starts with rune `ᚫ`. Original solved p56 (scan [73.jpg](../resources/liber-primus/73.jpg)) also begins with rune `ᚫ`, immediately after the p55 ciphertext has ended. **The seventh matching rune is not contiguous in the unknown ciphertext**: it requires crossing the physical p55/p56 boundary and ignoring the preceding p55 full stop. The established direct repeat is therefore **six runes and two whole words**. Treat the p56 initial-rune correspondence as a separate, exploratory continuation clue.

## Census over the original 55 unknown rune-bearing pages

The canonical source transcript contains **12,956 runes / 2,896 complete printed words**, preserving hyphens and joining the 32 words continued across page breaks. The terminal pair is the **only repeated ordered adjacent two-word phrase across those 2,896 words**. In the stricter class of pairs comprising two adjacent **three-rune words** separated by an ordinary source hyphen on the same physical page, there are **173 eligible pair positions**, of which precisely this pair appears twice. Each of its component three-rune words appears exactly twice in the full corpus, and the two copies always occur together.

The phrase has two genuinely separate source placements (p27 within a line, p55 at the very end). They were checked against the original page images and source rune transcription. This is a candidate structural anchor, not an English crib.

## Exact finite-inventory chance bound

A deliberately conservative null holds fixed the **entire original distribution of three-rune word identities**, all printed word lengths, page geometry and the 173 eligible adjacency slots. Only the identities occupying the **720 actual three-rune word slots** are uniformly shuffled. Thus the test does not assume independent uniform GP29 characters, and it conditions on all observed individual three-word repetitions.

Within the 720 tokens are **689 word types occurring once, 14 occurring twice, and one occurring three times**. Of the `C(173,2)=14,878` possible comparisons between eligible adjacent positions, **33 overlap by sharing one three-rune slot** and **14,845 are disjoint**.

Let `c_i` be original three-rune word-type frequencies and `(x)_k=x(x-1)…(x-k+1)`. Under the stated uniform permutation, two disjoint directed pairs match with probability

`P4 = [sum(i≠j) (c_i)_2(c_j)_2 + sum(i) (c_i)_4] / (720)_4 = 1064/(720)_4.`

Two overlapping directed pairs match exactly when their three involved tokens are the same word type:

`P3 = [sum(i) (c_i)_3]/(720)_3 = 6/(720)_3.`

Consequently the exact expectation of all repeated eligible directed phrase-pair comparisons is

```text
E = 14,845 × P4 + 33 × P3
  = 7,968,523 / 133,252,385,040
  = 0.00005980022794794998
```

There is **one actual repeated phrase**. Since the number of repeated comparisons is nonnegative integer-valued, Markov's inequality gives `Pr(at least one repeat) ≤ E`, i.e. **≤5.981×10⁻⁵** under this specific conditioned shuffle null. This is an upper bound for *any* repeated 3+3 phrase, without choosing the terminal six-rune text beforehand.

This is a meaningful original-input anomaly under that model. Its global discovery-adjusted significance is unknown: the original authors may have deliberately repeated words for literary or graphical reasons, and the analyst selected a word-length class after examining the corpus. The bound does **not** establish intentional cryptography, cipher periodicity, or authentic plaintext.

## Causal solve-path decision

The combination of a lone source-exact two-word echo, a marked terminal placement, and visibly insect-related p27/p55 artwork supports an inexpensive **p55→p27 source-navigation hypothesis**. A human solver reaching the last unknown words could search earlier pages for the identical words, arrive at the isolated-wing page and inspect its immediately following text or illustration for an operation. The p27 word after the echo begins with the same rune as solved p56, a separately testable but weak continuation cue.

**Next useful discriminating test:** identify a physically printed instruction, reversible word/rune transformation, or historical Cicada cross-reference on p27 that *independently* chooses what to read after the repeated pair. Freeze its exact output and reading direction before comparing against the p55 ciphertext or p56 known plaintext. A direct key of the six repeated ciphertext runes, an invented page offset, or a generic 5-period key sweep does not follow from this evidence and should not be run as a successor.

The previously filed [30,000-shuffle original word-pair SFT](../sims/lp2_terminal_word_pair_echo_sft.cjs) independently finds the same sole repeated pair; it uses a Monte Carlo length-stratified null. The [analytic original-source SFT](../sims/lp2_terminal_wordpair_exact_inventory_sft.cjs) replaces sampling with the complete finite-inventory expectation, reports original coordinates and verifies the resulting exact bound.
