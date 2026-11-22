# Authenticated LP2 prime-totient: two-million-position key recovery and literal-F Viterbi inversion

**Evidence class: verified retrospective recovery of an existing solved LP2 page under a source-defined cipher family, with large-scale source-conditioned negatives on authentic unsolved pages. No previously unsolved LP2 plaintext, new genuine key, or destination has been recovered.** Agent 3, 10 November 2026.

## Principal contribution: recover the known solved p56 key position and literal-F clock interruption without supplying either

The authentic, already-solved LP2 page 56 contains 85 original Gematria Primus runes and is publicly explained by the forward series of prime totients, phi(prime_i)=prime_i−1 modulo29, with a single ciphertext rune F treated as literal plaintext F **without consuming its key symbol**.

The exact inverse implemented here treats the starting prime index as free among **two million** consecutive possible positions (0 through 1,999,999). Each published rune normally consumes the next key index and decrypts as plaintext[rune]=(ciphertext[rune]−key[index]) modulo29. An observed F rune is allowed to take either the normal consuming path or a literal-F nonconsuming path. Its choice is **unknown to the search** and carried by a finite-state dynamic program with up to nine skipped prime positions, a fixed prior probability0.2 for a literal at each observed F and probability0.8 for a consuming F.

The plaintext language reference is one-count-smoothed GP29 unigram frequencies from the first 240,000 characters of the independently pinned Shakespeare sample. No words, keys, exact F positions or page56 plaintext are supplied as search constraints. For every possible prime start, an exact Viterbi optimum over all allowable literal-F masks scores the **first 60 ciphertext runes**. The search ranks the correct historical prime starting position **0 first of two million**. It then tests the remaining 25 actual ciphertext runes at that fixed selected source start.

The best true-start candidate scores **−2.987245 nats/rune** on the source-selection prefix and **−3.035436** on its 25-rune conditional heldout interval; complete-page Viterbi score **−3.001418**. The next-ranked source offsets 1,754,762 and 284,464 score **−3.228587** and **−3.228786** on the same source-selection prefix, with heldout scores −3.780959 and −3.786120. Thus the correct start is independently discriminated by real original source language, rather than supplied as a preset offset.

**Exact traceback:** the selected original page56 source index 0 yields the unique maximum-scoring path with one nonconsuming literal-F **at rune offset 56** (zero-based) and recovers **all 85 authentic original plaintext runes**, exactly matching the established AN END plaintext after the fact. This is a fully invertible, source-trained, no-plaintext-or-mask-injected recovery of an **already-known** LP2 passage. The known-target check is an assertion performed *after* the search and traceback. It establishes that an unknown beginning key position and punctuation-preserving literal-F mask can be inferred within this cipher family.

The independently encoded, already published p56 plaintext is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

The original GP transliteration preserves historical EUERY/SEEC forms. The visible source page includes spacing and punctuation; our GP-only inversion works on its 85 original runes.

## Source-matched original-language plants and unknown LP2 tests

Two further synthetic **262-rune** GP-English controls were independently drawn from the *last* 60,000 Shakespeare characters, with a hidden true prime start **123,456**. Both controls explicitly force one plaintext F at offset 43 to bypass the key clock, add an otherwise unused prime at that index, and run the proposed 81% adjacent-collision output repair (the six-back affine transform when available). They contain **13 and 10** genuine output repair events respectively. The exact source-index search recovers the correct start at **rank 1** for both additive signs, without requiring the planted true skip mask. Their complete-language Viterbi scores are **−3.097222** and **−3.099114** nats/rune. These powered positives demonstrate that the search can tolerate one real hidden-F pause and local glyph repairs under this source/English register.

Search the same **two-million unrestricted prime start indices**, both additive signs, original rune stream and the exact literal-F Viterbi model on the eight independently specified LP2 section-opening pages **0, 3, 8, 16, 23, 27, 33, 40**. For each page/sign search all starts against 90 original ciphertext runes; retain the best twelve offsets and independently evaluate runes 90–179 and the entire page. This tests **16 full-page model/source competitions**, each preceded by all two million start positions. Each plain output is scored under the same fixed English reference used for the authentic solved page and the plants.

| Original LP2 physical page | Best whole-page score/rune | Best 90-rune heldout score/rune |
| ---: | ---: | ---: |
| 0 | **−3.663675** | −3.832705 |
| 3 | −3.670988 | −3.761786 |
| 8 | −3.729283 | −3.810576 |
| 16 | −3.616070 | **−3.666758** |
| 23 | −3.672754 | −3.761865 |
| 27 | −3.709007 | −3.799626 |
| 33 | **−3.604459** | −3.715612 |
| 40 | −3.720150 | −3.909745 |

None approaches the recovered genuine p56 or the two English-GP plants on complete-page or heldout language. The strongest original full-page winner is **−3.604459** on physical LP2 page33 (positive sign, source offset 1,196,042); the strongest original heldout winner is **−3.666758** on page16 (negative sign, source offset 1,249,951). Neither has an independently validated readable complete original plaintext or a forward-compatible recovered key.

The separate **no-literal-F-pause** search at [prime_totient_long_offset_inversion.py](../sims/prime_totient_long_offset_inversion.py) searches both source directions, both additive signs and every possible prime index up to two million on **47** longer unsolved pages (11,995 original runes). It recovered two independent real-key English plants at source index123456, each rank1, with 10 or7 actual glyph collision repairs; its own eight-five-rune original p56 regression re-enciphers the established plaintext under the known single F mask. Its best original complete-page score is **−3.642927**, and its best original withheld-segment score is **−3.701815**. A no-skip negative alone cannot exclude the authentic p56 mechanism, hence the separate unknown-F Viterbi experiment above.

## Ciphertext-driven prime-ordinal clocks with exact collision-rejected draws (Agent 11)

An independent, reversible extension addresses a different class of hidden clock error than the literal-F interruption above. Starting from the historically verified `K_j=(p_j−1) mod29`, update the **prime ordinal** after every emitted ciphertext rune by either **1**, the **one-based published GP index**, its **GP prime weight**, or its **GP prime weight minus one**. Six independent source-derived starting ordinals are **1,15,22,53,78,79** (the natural origin and red-triangle numbers). Both additive signs are tested, yielding **48 source-fixed models** across eight complete authentic section-body prefixes, each 300 original runes. A rejected key draw is allowed before each published rune only if its tentative output exactly collides with the preceding published rune. The full necessary equality constraint is enforced; hidden skip count and previous skip bit are optimized with exact bigram/trigram Viterbi, up to 26 extra draws per section.

The strongest model is selected from just the **first 150 original ciphertext runes of each of eight bodies** (1,200 source-selection runes). Its **Viterbi boundary state is frozen**; the subsequent 150 runes per body are scored without refitting model, start, sign or preceding skip state. Source/G P-English language scoring uses an independently pinned Shakespeare training interval. A matched control randomizes the totient tape and repeats the entire 48-model selection and frozen heldout continuation on the same actual LP2 ciphertext.

| Measurement | Exact result |
| --- | --- |
| Independently planted GP-English ciphertext with the authentic totient tape, ciphertext-GP-prime ordinal clock, and 81%-chance collision skips | **2,396 / 2,400 runes recovered** |
| Plant source-key model selected by all 48-model competition | **Exact true rule gp-prime, start22, sign+1 at rank 1** |
| Plant train and frozen heldout log scores per rune | **−2.51516** and **−2.51452** |
| Best original LP2 selected model | **unit ordinal stride, start15, sign−1** |
| Original train and frozen heldout scores per rune | **−5.70882** and **−5.84428** |
| Matched 30 wrong-totient-tape heldout scores | median **−5.93035**, **2/30** at least as high |
| Add-one heldout upper p | **3/31 = 0.09677** |

The source-selected original winner has **no readable GP-English plaintext**, and the original heldout log score remains over three nats/rune below the corresponding fully invertible genuine-language plant. Its modest advantage against the small null is insufficient for any key claim, especially with 48 model choices, source-start postselection and imperfect null calibration. This result exercises **a text-dependent prime walk with genuinely variable hidden state**, beyond the two-million-fixed-offset additive/literal-F models above; it does not exclude other message-dependent transitions, longer skipped-draw runs, external secrets or secondary alphabet transforms.

Exact source and test code: [sims/ciphertext_prime_walk_inversion.cjs](../sims/ciphertext_prime_walk_inversion.cjs). [Successful original-source workflow 42786268230](https://github.com/FlareZ123/liber-primus/actions/runs/42786268230), invoked through the Agent 11 existing manual source-inversions workflow with `probe: primewalk`. The source file includes the actual reversible planted encoder, source-prime sieve, byte-exact hidden-skip forward rule and frozen-boundary Viterbi.

## Interpretation, limits and reproduction

**Positive:** This is a reproducible constructive exact inversion of the **authentic historical p56 cipher mechanism** which recovers the starting key index, exact skip mask and plaintext under a fixed genuine language reference, without giving those as decoding inputs. It clears a considerably stronger control standard than an arbitrary synthetic key model and enables later source-key search on truly unknown LP2 pages. The ciphertext p56 was already solved, so this is a mechanism/recovery technique advance rather than a newly deciphered page.

**Negative scope:** The source-trained starts0..1,999,999, both additive signs, at most9 literal-F pauses and 90-original-rune selection on eight unsolved section openers provide no evidence that the authentic *page56* mechanism in this exact form recurs at those section starts. The rest of the 47 longer pages have been checked in the no-F-pause direct-key variant. This does **not** exclude a different starting-prime range, a reversed prime stream in the F-viterbi stage, 10+ literal-F pauses, ciphertext-dependent *non-F* key skips, other collision-rewrite processes, nonaffine outer substitutions, altered plaintext segmentation, or non-English registers. The final top-twelve source-start selection after the training prefix bounds the power of the full-page observation.

**Implementations and durable artifacts:**

- [Source-derived two-million-start exact direct additive inverse](../sims/prime_totient_long_offset_inversion.py).
- [Exact hidden-literal-F mask Viterbi, known-p56 source recovery and original-unsolved test](../sims/prime_totient_F_interrupt_viterbi.py).
- [Existing manual shared source-key workflow](../.github/workflows/rand1955-running-key.yml).
- [Successful two-million-offset direct prime source run 42782743427](https://github.com/FlareZ123/liber-primus/actions/runs/42782743427) with 47 original pages and two synthetic genuine-key controls.
- [Successful F-pause source recovery run 42783526886](https://github.com/FlareZ123/liber-primus/actions/runs/42783526886) with original p56 rank1, hidden skip and original LP2 section-start exact Viterbi results. A subsequent rerun adds explicit source-agnostic traceback assertion for plaintext and mask.
- Source prime generator is a deterministic NumPy prime sieve; original GP ciphertext from resources/liber-primus/lp2-corpus.json, language register from resources/control/shakespeare_first300k.txt; Python3.12, NumPy2.2.6, Numba0.61.2. The complete results and original source/heldout scores are stored in the GitHub Actions artifact named lp2-external-and-authentic-source-inverses.

**Next useful actual-solve route:** Extend the already powered authentic-p56 unknown-mask inversion to all remaining source offsets/pages under independently motivated clock behavior, use a stronger source word-language model and exact forward re-encryption. If the original pages remain language-incoherent, prioritize a different source-derived cryptographic construction rather than endless new postselected phrase guesses.
