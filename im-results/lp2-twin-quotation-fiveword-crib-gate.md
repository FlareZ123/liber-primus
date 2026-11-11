# Two quoted LP2 passages share an unusually long word-length opening

**Agent 34, 11 November 2026. Status: original manuscript structural clue and exact additive-key crib gate. No unknown plaintext, authentic cipher key or final destination recovered.**

## Original source-visible pairing

Across the original 58 LP2 images there are seven marked quotation spans, independently indexed in [quote annotations](../resources/liber-primus/lp2-quote-punctuation-spans.json). The **fourth** quoted span begins on *physical LP2 p40* (combined original JPEG **57.jpg**) at global unsolved rune offset **9811**, closes at **9869**, and contains exactly **14 words / 58 GP runes**. The **seventh** quoted span begins on *physical LP2 p53* (original **70.jpg**) at global rune offset **12522**, closes at **12592**, and contains exactly **14 words / 70 GP runes**. Both are visible black-ink quoted text, although the subsequent p53 51-rune red block is outside its quotation. Use the literal original word breaks; punctuation is not counted as a rune.

Their five initial word lengths **match identically**:

| Quote | Word lengths in original reading order | First five |
| --- | --- | --- |
| p40 (global [9811,9869)) | 5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4 | **5, 7, 2, 3, 4** |
| p53 (global [12522,12592)) | 5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3 | **5, 7, 2, 3, 4** |

The initial five words contain **21 original ciphertext runes** in each passage. The same five-word-length sequence occurs **exactly twice** in the complete 2,973-word canonical LP2 transcription, at these exact original quote openings. Among the **seven** individual quote starts, this is the **only pair that shares more than one initial word length**. The 21 ciphertext runes at those positions are *not* copied verbatim: only **1/21** aligned glyphs agree. If these passages were intended as repetitions of the same plaintext phrase, their cipher state or key must differ.

## How discriminating is the structure?

Across all 2,969 five-word windows in the transcription, there are **282 unordered pairs** of windows with identical five-length patterns. For seven quote starts sampled uniformly without replacement from the book's 2,973 word starts, the expected count of equal five-word-pattern pairs is **21×282/C(2973,2) ≈ 0.00134046**. This is a descriptive word-start null. It assumes quotes are independent of syntax and does **not** adjust for having noticed this particular pair after exploring historical and structural clues.

A narrower length-and-placement check is far less dramatic. Restrict candidate starts to the **same physical pages**, taking only 14-word windows that sum to the **respective actual 58 or 70 runes** and remain inside the page. There are **5** such p40 windows and **4** such p53 windows; only **one of their 20 cross-pairs** shares its first five lengths, namely the two actual quoted starts. Since the quote span itself already fixes the word counts and lengths, this conditioning matters. No claim of intentional identical plaintext is warranted from word lengths alone. The manuscript's word-break register has independent structural anomalies, so the two ciphertext five-word prefixes could even represent different plaintext tokenizations.

## Key-independent crib condition on original runes

Let the first 21 quote ciphertext symbols be `X_i=C[9811+i]` and `Y_i=C[12522+i]`, with zero-based GP29 indices. If the two quotes start with **the same 21 plaintext runes**, and are both encrypted by an additive GP29 pad `C_i=P_i+K_i mod29`, then, without guessing any plaintext,

`(Y_i−X_i) mod29 = (K_i^(p53)−K_i^(p40)) mod29`

must hold for **all 21** positions. The source-derived left-hand sequence in reading order is:

`28,20,22,13,27,19,10,3,2,6,20,24,27,13,3,10,15,2,0,28,18`.

This converts an uncertain quote-repetition hypothesis into a finite, falsifiable, key-independent cryptanalytic constraint. A ciphertext-only key stream that *resets identically at the opening quotation* would predict `X=Y` for identical plaintext, already contradicted by **20/21** mismatches.

**All-secret fixed-substitution exclusion.** Under the same *shared 21-rune plaintext prefix* premise, suppose each quotation is encrypted using **any independently secret fixed bijection** of 29 symbols (the keys for p40 and p53 need not be related). A bijection preserves the equality/inequality of every two plaintext positions. Therefore two ciphertext sequences of a shared plaintext must have **identical equality partitions**. In the original 21+21 aligned symbols there are **210 unordered position pairs**: **8 pairs** show equal p40 runes but unequal p53 runes, and **4 pairs** show unequal p40 runes but equal p53 runes. The remaining **198** pairs are unequal in both, and **zero** are equal in both. The **12 exact equality-partition contradictions** prove that *no two independent stationary substitution alphabets* can encode a single identical 21-rune plaintext prefix in these two intervals, regardless of all 29! possible secret symbol permutations. A fully secret affine substitution is a special case. A positive plant encrypting the p40 21-rune prefix under the bijection `f(x)=5x+7 mod29` has zero contradictions. This does not rule out time-varying alphabets, changing state, longer block fractionation or non-identical plaintexts.

**All-secret periodic-key exclusion (stronger than any specific candidate).** If the two 21-rune plaintext prefixes are identical and each is encrypted additively by a key stream with common period `p` and no hidden skip or word reset within the quote, then their difference `D_i=Y_i−X_i` is necessarily **p-periodic**, regardless of the two unknown key sequences, their phase offsets or their values. Compute `M(p)=# {i∈[p,20]:D_i≠D_(i−p)}` directly from the frozen difference above. **All twenty periods p=1…20 fail**: `M(1…6)=[20,19,18,17,16,15]`, `M(7)=13/14`, `M(19)=1/2`, and `M(20)=1/1`. Therefore, conditional on the repeated-plaintext premise, the pair rules out **every continuous additive period shorter than 21** for both quotation openings, even if every secret key glyph were unknown. A planted period-seven additive cipher applied to identical authentic GP plaintext produces an exact period-seven difference and passes the same invariant. Aperiodic pads, word/quote-dependent resets, hidden skips and nonlinear ciphers are outside this theorem.

As a bounded source-driven test, use the original **256-byte numeric table** and the three independently archived **256-byte historical 2014 hidden-service excerpts** as putative cyclical additive pads. Their natural byte projections are `b mod29` or `floor(29b/256)`; key position is the raw global rune clock (9811/12522) or the physical-page rune-local clock (171/53); allow both additive signs. Across **4 sources × 2 byte mappings × 2 clocks × 2 signs = 32 predeclared cases**, the maximum original equality is **3/21** predicted glyph differences. Hence none satisfies even a near-exact shared-plaintext prefix under this direct historical/table-key architecture.

The [standalone CommonJS SFT](../sims/lp2_twin_quote_prefix_crib_gate_sft.cjs) reads the unchanged source transcript, quote offsets, numeric manuscript and four 256-byte source arrays. It asserts the source word lengths, exact duplicated five-gram offsets, comparison count and full 32-case key test, and it checks all 20 period-exclusion constraints with a source-native planted period-seven control, plus the 12 independent equality-partition contradictions under any two fixed bijections. A positive control recovers **all 21 of 21** key-independent difference equalities when both quotes are synthetically encrypted using the *same 21-rune authentic solved-p56 plaintext prefix* and the actual table-derived pad. This ensures the finite test is sensitive to its intended mechanism.

## Actionable cryptanalytic route and uncertainty

The key forward question is whether the original author **intended these two quotes to repeat the same opening phrase**, and how that phrase would be keyed differently across p40 and p53. A reason to assume shared plaintext must come from another independently visible clue, such as an original author quotation, a linked caption, or a verified external source. If that clue is found, the 21 exact differences offer a fixed original-input crib for testing a **source-specified state machine**, including nonlinear candidates with a well-defined equal-plaintext invariant. Do not fit arbitrary 21-symbol pads; every such pad can fit a 21-symbol coincidence and proves nothing.

Presently the identical five-word-length opening is an **observed positional relationship**, and all stationary single-symbol substitution pairs, continuous additive keys of period below 21, and the 32 historical/table additive models are **bounded negatives under the explicit equal-plaintext premise**. Neither establishes same plaintext, encryption mechanism, letter values of that phrase or destination.
