# One-rune words exclude page-reused phase substitution under literal English spacing

**Original-input necessary condition, 10 November 2026.** The 55 rune-bearing, still-unsolved LP2 pages contain 12,956 runes in 2,896 canonical words. There are 83 one-rune words, of which **81 are black-ink** under the repository's independent ink annotation. The conclusions below are conditional on interpreting each printed one-rune word as a one-letter word of English plaintext. This is an exact exclusion of a specified cipher family, **not** a recovered original plaintext, historical key, or evidence that printed spaces are truly preserved.

## What the condition proves

Suppose each printed word has the same length as its decrypted English word. At each source clock phase \`t\`, an arbitrary but *fixed bijection* \`S_t\` maps each plaintext GP rune to one ciphertext rune. The phase is determined exclusively by original global rune index, page-local rune index, original global word index, or page-local word index (optionally modulo a period). All pages reuse the same phase tables; there is no hidden page IV or feedback state.

Under a conservative ordinary-English model, a plaintext one-letter word must be **A** or **I**. All one-letter ciphertext words at a common phase must therefore use at most **two distinct visible rune symbols**. Even allowing the marginal English vocative **O**, there can be at most **three**. This necessary condition is invariant under *every* unknown 29-symbol permutation, including arbitrary secret substitution alphabets. No frequency fitting, guessed key, or language model is required.

An additional narrower GP29 additive model \`C=(P+K_t) mod29\` requires all observed singleton ciphertext symbols in one phase to fit \`{10+K_t,24+K_t}\`, since GP indices for I and A are 10 and 24. This excludes even some phases containing only two distinct symbols. All computations use only the 81 black-ink singleton words.

### Exact period gate on original black-ink source

Counts are the number of **excluded periods** among integers 1 through 256 inclusive. A period is excluded if any one phase violates the stated necessary condition.

| Source clock (0-based) | Any secret bijection; A/I (2 symbols) | Any secret bijection; A/I/O (3 symbols) | Secret GP29 additive; A/I |
| --- | ---: | ---: | ---: |
| Global rune position | 234 / 256 | 127 / 256 | **256 / 256** |
| Page-local rune position | **256 / 256** | 151 / 256 | **256 / 256** |
| Global word position | 233 / 256 | 119 / 256 | **256 / 256** |
| Page-local word position | **256 / 256** | **256 / 256** | **256 / 256** |

Illustrative violations at source-motivated periods:

| Clock | Period | Phases requiring >2 outputs | Phases requiring >3 outputs | Infeasible additive A/I phases |
| --- | ---: | ---: | ---: | ---: |
| Global rune | 29 | 15 | 8 | 23 |
| Global rune | 79 | 3 | 1 | 20 |
| Page-local rune | 79 | 5 | 2 | 22 |
| Global word | 79 | 4 | 2 | 17 |
| Page-local word | 79 | 12 | 3 | 17 |
| Page-local word | 256 | 12 | 3 | 17 |

The **page-local word-clock exclusion is unbounded in period**: original black singleton words at the *same unmodded within-page word index* display more than three distinct ciphertext symbols. Thus changing the modulus, even to arbitrarily large numbers, cannot rescue a page-reset, page-reused stationary substitution indexed solely by local word number. Three independent black-ink witnesses follow (0-based word indices and rune offsets):

| Page-local word index | Original physical pages | Original single-rune glyphs |
| --- | --- | --- |
| 3 | 4, 9, 45, 47 | ᚻ, ᛁ, ᛏ, ᛈ |
| 31 | 4, 15, 37, 40 | ᚦ, ᚣ, ᛖ, ᛚ |
| 43 | 10, 12, 21, 48 | ᚷ, ᚣ, ᚫ, ᚢ |

The witnesses do not depend on either of the two red singleton words. Excluding *all* physical pp53–55 still leaves the page-local clock exclusion intact for every period up to 256, including with O permitted.

## Independent page-specific additive keys: exact within-page obstructions

The preceding reused-alphabet gate shares phase tables across pages. A second original-input test gives the encoder **a separate arbitrary additive GP29 key for every page and every clock phase**. With ordinary English singleton plaintext A/I/O, the ciphertext difference for words at the same *page × phase* must be one of \`{0, ±7, ±14, ±21} mod29\`. The unknown page/phase key cancels.

**Exact two-word witness:** original physical **p4** has black one-rune words at page-local rune offsets **21 and 79** whose GP ciphertext indices are **8** (ᚻ) and **7** (ᚹ). Their position gap is **58=2×29**, so every period-29 page-local additive key must use the same unknown shift. Their ciphertext difference is **1**, outside the allowed A/I/O differences. This rejects the **entire page-specific additive GP29 period-29 family**, even with an independent secret key for every other page or phase. It also rejects a page-specific affine key \`K_(p,t)=a_p*t+b_p mod29\` for all possible page slopes and offsets.

Enumerating every period 1..256 with **all 81 original black singleton words** gives:

| Additive key independently chosen for each page and phase | A/I periods excluded | A/I/O periods excluded |
| --- | ---: | ---: |
| Page-local rune clock | 82 / 256 | 81 / 256 |
| Page-local word clock | 37 / 256 | 36 / 256 |

Even after allowing a distinct *affine slope and offset per page*, **eight of 40** pages containing black one-rune words are individually impossible with A/I/O on the page-rune clock; **six of 40** are individually impossible on the page-word clock. Every candidate slope and intercept in F29 was enumerated. In contrast, an arbitrary *page-specific additive period-79 phase table* has no contradiction in these singleton observations alone. The latter is only lack of a necessary-condition failure, not evidence that the cipher works.

Numeric differences of A/I/O GP indices rule out additive output only. They do not constrain the same-per-page input symbols under an arbitrary page-specific secret permutation, and neither result survives arbitrary state feedback or reinterpreted word boundaries.

## Reproduction and scope

Run [the standalone CommonJS source gate](../sims/lp2_singleton_original_phase_invariant.cjs) against the existing [canonical transcript](../resources/liber-primus/lp2-transcription.txt), [page indices](../resources/liber-primus/lp2-corpus.json), and [ink annotations](../resources/liber-primus/lp2-ink-annotations.json). It carries words across printed line/page wraps, reads the first rune's physical page, and assigns zero-based page-local word indices at **word start**, so cross-page words do not shift subsequent page word indices. The script checks the original counts, enumerates every secret-alphabet necessary condition directly, outputs original witnesses, and includes a deterministic source-shaped positive control: with an arbitrary hidden permutation for each of 79 page-local word phases, literal A/I singleton words pass the gate and all **12,956** synthetic runes inverse-map exactly.

This is an architectural falsification only under its explicit assumptions. The plaintext might not be ordinary English, might represent O or additional single-rune tokens, or might use nonliteral spaces. A new key/IV per physical page, any phase affected by earlier symbols, position-dependent encodings inside the word, unequal decrypted word lengths, or a non-bijective cipher with recoverable additional state escape the theorem. In particular, a wrong inverse key in a bijective model still re-encrypts its own decoded ciphertext, so the positive plant is an implementation check rather than original-key evidence.

**Decision consequence:** do not spend more compute fitting an arbitrary reused alphabet/shift keyed only by global/page rune or word clock at periods 28, 29, 59, 79, 127, or 256 to preserve literal English singleton words. A renewed attempt must specify the additional source-visible state or explain why printed word boundaries are deceptive, then predict original unknown plaintext. The book remains unsolved.
