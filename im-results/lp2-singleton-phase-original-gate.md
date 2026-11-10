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

## Reproduction and scope

Run [the standalone CommonJS source gate](../sims/lp2_singleton_original_phase_invariant.cjs) against the existing [canonical transcript](../resources/liber-primus/lp2-transcription.txt), [page indices](../resources/liber-primus/lp2-corpus.json), and [ink annotations](../resources/liber-primus/lp2-ink-annotations.json). It carries words across printed line/page wraps, reads the first rune's physical page, and assigns zero-based page-local word indices at **word start**, so cross-page words do not shift subsequent page word indices. The script checks the original counts, enumerates every secret-alphabet necessary condition directly, outputs original witnesses, and includes a deterministic source-shaped positive control: with an arbitrary hidden permutation for each of 79 page-local word phases, literal A/I singleton words pass the gate and all **12,956** synthetic runes inverse-map exactly.

This is an architectural falsification only under its explicit assumptions. The plaintext might not be ordinary English, might represent O or additional single-rune tokens, or might use nonliteral spaces. A new key/IV per physical page, any phase affected by earlier symbols, position-dependent encodings inside the word, unequal decrypted word lengths, or a non-bijective cipher with recoverable additional state escape the theorem. In particular, a wrong inverse key in a bijective model still re-encrypts its own decoded ciphertext, so the positive plant is an implementation check rather than original-key evidence.

**Decision consequence:** do not spend more compute fitting an arbitrary reused alphabet/shift keyed only by global/page rune or word clock at periods 28, 29, 59, 79, 127, or 256 to preserve literal English singleton words. A renewed attempt must specify the additional source-visible state or explain why printed word boundaries are deceptive, then predict original unknown plaintext. The book remains unsolved.
