# One-rune words exclude page-reused phase substitution under literal English spacing

This study extends the earlier [all-secret singleton-word capacity and word-period analysis](word-start-reset-and-periodicity.md#exact-one-rune-word-capacity-for-arbitrary-secret-alphabets), which already established 83 original singleton words, generic book/section/page key bounds, and arbitrary page-word phase limits. The additional contribution here is the black-ink-specific four-clock and fixed-GP numerical tests with independent page keys, plus the new literal-Fehu-key-skip three-word certificate below. These are bounded mechanism exclusions, never an asserted decryption.

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

## Page 17: three original singleton words reject every literal-Fehu affine-key skip mask

The authentic solved LP2 p56 decryption skips key advancement at one **literal Fehu (F=0)** ciphertext rune. To test this actual mechanism as generously as possible, permit **any subset** of the original Fehu runes on each unsolved page to be literal and nonconsuming. Also permit completely independent affine keystream parameters \`K_(p,t)=a_p*t+b_p mod29\` on every physical page. Assume original one-rune words are GP A/I/O and their visible single-rune boundaries are authentic.

The following three **black** one-rune words on original physical p17 already falsify the family:

| Physical p17 local rune offset | Source glyph | GP index |
| ---: | --- | ---: |
| 113 | ᛒ | 17 |
| 188 | ᛏ | 16 |
| 204 | ᚱ | 4 |

There are **12 ciphertext Fehu positions** on p17: \`42,51,56,58,98,187,221,228,230,248,264,272\`. The only Fehu **between** the three witnesses is local offset **187**, between 113 and 188. No Fehu falls between 188 and 204. An arbitrary subset of Fehu skips before position113 changes only the unrestricted affine intercept; later Fehu cannot affect the three words. All **2¹²=4096** full-page skip masks consequently reduce to two possible relative intervals: first gap **75** or **74** if Fehu187 does not consume key, followed by gap **16**.

Write unknown singleton plaintext GP values \`p1,p2,p3 ∈ {3,10,24}\` (O/I/A). Eliminating both secret page slope and intercept in \`C_i=p_i+a_p*t_i+b_p (mod29)\` yields:

- Fehu187 consumes key: \`4*p2+13*p1+12*p3 = 14 (mod29)\`.
- Fehu187 skips key: \`2*p2-p1-p3 = 11 (mod29)\`.

Enumerating the **27** admissible A/I/O triples yields **zero solutions** in either case. The first left-hand side attains 20 residues but never 14; the second attains 12 residues but never 11. This is a three-original-word certificate, not a language-model score or a large parameter search. The source gate asserts every index, the entire original Fehu position list, both algebraic exclusions, and an independent three-word affine/Fehu planted exact inverse.

### The original sparse lag-six repair cannot alter this witness

A separate prominent LP2 candidate postprocessor replaces a would-be ciphertext collision with \`T(C_(i−6))=(24−2*C_(i−6)) mod29\` (see the repository's lag-six sparse-collision investigations). On these same three original p17 positions, the previous-six ciphertext inputs are **27,17,22**, so the repair outputs would be **28,19,9**; the actual witnessed outputs are **17,16,4**. None is compatible with being a replacement under that *specific* deterministic repair formula. The self-contained reproducer now asserts these three unequal pairs.

Consequently the complete proposed two-layer model **affine page key + arbitrary historic-style literal-F skips + only this published T6 collision repair** is also excluded by the same original three-word witness, conditional on ordinary English A/I/O singleton segmentation. This does **not** exclude other unknown collision-repair rules; the empirical T6 relation is not authenticated as the actual Cicada algorithm.

**Decision:** even an arbitrary choice of every possible historic-style literal-F skip, independent page slope and page IV cannot explain these three original black singleton words through a linear running-key GP29 cipher under literal English A/I/O segmentation. A nonlinear, history-dependent or differently clocked key, or nonliteral word segmentation, remains possible. A contradiction on p17 rules out a uniform manuscript-wide use of the stated family.

## All 4,096 original p17 cubic-key inverses: A/I cribs pass, complete decrypted pages fail native-English concentration

The exact affine contradiction above can be escaped formally by permitting a **cubic GP29 key in page-local rune time**, \`K(t)=a t³+b t²+c t+d mod29\`, with all four coefficients freely secret on each physical page. This grants two additional unconstrained key parameters beyond affine, while retaining the source-supported possible literal Fehu skip mechanism. A complete original-cipher inverse has now been performed for this family using **five** p17 black singleton words at offsets \`[113,119,147,188,204]\` and their observed GP ciphertext \`[17,28,10,16,4]\`.

Require each of the five to decode to GP **A or I**. Exhaust all **32 possible plaintext A/I assignments**, interpolate a GF29 cubic from the first four observed pairs, and use the fifth to reject mismatches. Only **one** assignment and **one** cubic survives for each of the two choices for whether the sole between-witness ciphertext Fehu at 187 advances the key:

| Source Fehu187 | Recovered singleton plaintext indices | Derived cubic coefficient tuple (t³,t²,t,1), before any earlier Fehu skips |
| --- | --- | --- |
| Consumes key | [24,10,24,10,10] = A I A I I | [14,23,28,16] |
| Literal; skips key | [24,10,10,24,10] = A I I A I | [3,19,11,23] |

Of the **12** original p17 Fehu runes, all choices before the first singleton merely translate the recovered cubic's time coordinate. All choices after the fifth singleton affect its later time evolution directly. The full original-runecode loop therefore enumerates **every 2¹²=4096 literal-Fehu skip mask**; for each, infer the unique matching cubic, decode all **273 original page17 ciphertext runes**, and compute the GP29 index of coincidence (uniform-symbol reference = 1).

- Best original all-mask IoC: **1.0693007972419737**, skip mask 1519 (source Fehu offsets **42,51,56,58,187,221,228,230,264**). Median original candidate: **0.9771331609566903**; 99th-percentile candidate: **1.0427440206851972**.
- The highest-concentration original candidate starts \`HTHPOEINGUFJAEPHIIOTYSEADDBOAEDTXYOSNTOEAHLEANIOETH...\`, which is not readable GP-English despite all five one-letter words being exactly A or I.
- Four separately recorded native-English GP control passages from the repository's solved LP1 reference yield **765** 273-rune sliding windows; every one has IoC at least **1.61996** under the same 29-symbol normalization. This is a source register comparator, not a probability calculation over arbitrary unknown language.
- A planted 273-rune genuine English-GP sample, preserving the original five A/I singleton ciphertext values and a planted literal Fehu187 skip, is encrypted by the same derived cubic; the script checks full **273/273 exact inverse**. It makes clear that the method can recover its own specified construction.

**Decision:** no member of this complete, source-shaped cubic-plus-optional-literal-Fehu family provides a native-English-like p17 plaintext. The scan is an actual full-page original-cipher inversion, with the original five A/I singleton cribs sufficient to eliminate all unknown cubic coefficients. The finding does not exclude noncubic nonlinear/state-dependent keying, another language/register, or altered printed word boundaries. Its large original-versus-solved-plaintext IoC separation is evidence **against this tightly specified family** only.

Reproduce with [standalone complete inverse and English-GP plant](../sims/p17_cubic_all_f_crib_inverse.cjs) in the existing manual word-start workflow. This is a new bounded negative and recovers no previously unknown plaintext.

## Reproduction and scope

Run [the standalone CommonJS source gate](../sims/lp2_singleton_original_phase_invariant.cjs) against the existing [canonical transcript](../resources/liber-primus/lp2-transcription.txt), [page indices](../resources/liber-primus/lp2-corpus.json), and [ink annotations](../resources/liber-primus/lp2-ink-annotations.json). It carries words across printed line/page wraps, reads the first rune's physical page, and assigns zero-based page-local word indices at **word start**, so cross-page words do not shift subsequent page word indices. The script checks the original counts, enumerates every secret-alphabet necessary condition directly, outputs original witnesses, and includes a deterministic source-shaped positive control: with an arbitrary hidden permutation for each of 79 page-local word phases, literal A/I singleton words pass the gate and all **12,956** synthetic runes inverse-map exactly.

This is an architectural falsification only under its explicit assumptions. The plaintext might not be ordinary English, might represent O or additional single-rune tokens, or might use nonliteral spaces. A new key/IV per physical page, any phase affected by earlier symbols, position-dependent encodings inside the word, unequal decrypted word lengths, or a non-bijective cipher with recoverable additional state escape the theorem. In particular, a wrong inverse key in a bijective model still re-encrypts its own decoded ciphertext, so the positive plant is an implementation check rather than original-key evidence.

**Decision consequence:** do not spend more compute fitting an arbitrary reused alphabet/shift keyed only by global/page rune or word clock at periods 28, 29, 59, 79, 127, or 256 to preserve literal English singleton words. A renewed attempt must specify the additional source-visible state or explain why printed word boundaries are deceptive, then predict original unknown plaintext. The book remains unsolved.
