# Original p27 word: anti-repeat null and strict block-clock obstructions

**17 November 2026 · Agent 6 · exact original-input impossibility; no unknown plaintext or key.**

## Source-motivated model and rival

The original 12,956 unknown GP29 runes have only 86 adjacent equalities, and the source-printed word lengths are on average longer than ordinary GP-English controls. A contemporary external cryptanalytic synthesis, [pnotisdev Phase57](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md) (22 October 2026), proposed R3: a **strict anti-repeat** ciphertext generator, with every would-be repeat repaired by writing a different rune, then a **second pass inserting at most ONE unconstrained null rune into approximately 44.8% of the source-printed words**. Because later nulls are not checked against the prior emitted rune, R3 can reproduce the book's low *aggregate* repeat count without a probabilistic repair. Phase57's own simulations reported a favorable aggregate nine-statistic fit (R3 P≈0.717) but no original plaintext/key.

A falsifiable, **key-independent necessary condition** follows: deleting zero or one rune from **each actual printed ciphertext word** must produce a word with no adjacent equal GP symbols. An inserted rune can create two adjacent identical-pair sites only when both sites touch that *same* inserted position (the `AAA` pattern). It cannot create two spatially disjoint repeated pairs in a word that previously had none. This is true for every null value, slot, secret key, prior ciphertext, plaintext language and key clock.

The test preserves authentic printed word boundaries: `-`, `.`, and `&` terminate a word; line `/` and physical-page `%` marks carry words. It uses exactly 55 rune-bearing unsolved pages p0–p55 and stops at rune 12,956 before the solved end.

## Original image witness and complete-source decision

The source-original physical page **p27**, archived as [`44.jpg`](../resources/liber-primus/44.jpg), displays the following exact word in its **fifth manuscript line**. The same word is present verbatim in [the canonical source transcription](../resources/liber-primus/lp2-transcription.txt):

```text
Original runes: ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ
GP translit:    EO R N S O O C A E Y E E
GP ordinals:    12 4 9 15 3 3 5 24 18 26 18 18
Indices 0-based:            4 5           10 11
```

The two doubled-pair sites are **O O at local offsets 4–5** and **E E at offsets 10–11**; they are separated by five other symbols, and the pairs share no character. The word is zero-based **global printed word 1476**, starting at zero-based global GP rune **6606**, at source p27 local rune **79**. Inspection of the original 2400×3600 source JPEG confirms both repeated glyph pairs visibly, rather than relying on automated transcription alone.

The full exact book has **63 within-word adjacent equalities in 62 distinct words**. Sixty-one of those 62 doubled words have exactly one doubled pair. **Exactly one** has two disjoint pairs and fails every possible single-rune deletion: word1476 above. The repository [read-only CommonJS SFT](../sims/lp2_r3_one_null_per_word_original_obstruction_sft.cjs) asserts all exact counts, positions, the original GP29 ordinal sequence, original page/JPEG mapping, and completeness of the source. It exhausts all **12 insertion positions ×29 rune values =348** one-null plants of an 11-rune no-repeat source word (all must be admitted) and checks a two-distant-null negative (must fail). This SFT **passed direct V8 execution on the unchanged GitHub source bytes**. Native Node22 [GitHub Actions run 44068644635](https://github.com/FlareZ123/liber-primus/actions/runs/44068644635) **passed** the specific original-input R3 step, independently executed in job [133988848226](https://github.com/FlareZ123/liber-primus/actions/runs/44068644635/job/133988848226).

## All-phase strict fixed-block anti-repeat obstruction (21 November 2026)

An independent cipher-family question follows from the same original word. Suppose an unknown GP29 encoder divides ciphertext into fixed-length blocks of **L >= 2 runes**, forbids equal adjacent emitted runes **strictly within** each block, and permits repeat pairs only at block joins. The key, substitution and plaintext can be completely secret. Every observed repeated-pair *end* within one reset scope must therefore have the same residue modulo L. The gcd of all pairwise repeat-position differences is an exact necessary condition, with no bound on L.

The [new read-only CommonJS SFT](../sims/lp2_antirepeat_blockclock_allphase_obstruction_sft.cjs) uses all 12,956 source runes, 86 same-page doublets, the original 2,896 word delimitations and 63 within-word doublets. The exact gcd by clock model is:

| Origin scope | Gcd | Possible L > 1 |
| --- | ---: | --- |
| Continuous global clock | 1 | none |
| Shared page-reset phase | 1 | none |
| Completely arbitrary phase independently on each page | 1 | none |
| Shared printed-word-reset phase | 1 | none |
| Completely arbitrary phase independently on each printed word | 6 | 2, 3, 6 |

A **single original p3 page** already proves the strongest page-based claim: its page-local doublet ends are **53, 180, 203**, whose differences 127 and 23 have gcd1. No choice of page phase or secret key can fit an L>1 strict block clock there. For independent word phases, the original p27 12-rune word (global start6606) has the two doubled end positions **5** and **11**, whose distance6 restricts L to divisors of6. A **five-rune strictly collision-free block** is therefore impossible even with freely chosen phase for each word.

The test's 12-rune planted positive has precisely the same two repeated end offsets, passes the strict L6 boundary condition and fails L5; the unchanged-source [Windows Node22 CI run 44959806793](https://github.com/FlareZ123/liber-primus/actions/runs/44959806793) passed. The exclusion requires a **strict zero-within-block-repeat rule**. It leaves within-block exceptions, variable block lengths, extra nulls, changed word boundaries and dynamic repair mechanisms open. No unknown plaintext, source key or cipher inverse is recovered.

## Separate R7 checked-word-end null diagnostic (conditional evidence)

R3's hard failure does **not** logically refute Phase57 R7: that model uses imperfect collision repair and appends a distinct checked rune at approximately **44.8%** of source words. But R7 supplies a further **frozen positional prediction** absent from the initial published nine-statistic score: whenever a checked end rune has been appended, the final adjacent pair in that printed word cannot be doubled. Its unrepaired doublets, under Phase57's random-key/position-homogeneous collision premise, should be exchangeable among all **pre-existing** within-word adjacent positions.

Original source has **10,060** within-word adjacent pair slots, of which **2,813** are the very last pair in a multi-rune word. Its 63 within-word doublets include **19** on final pairs. With `K` end checks, exactly `10,060-K` adjacent slots remain eligible to be doubled, and `2,813-K` of these eligible slots are terminal, regardless of which eligible words received the checks. The test conditions on **the actually observed 63** doubled pairs, so no repair probability or ciphertext-key frequency needs estimating; it uses the exact finite-sample **hypergeometric upper tail** `P(final doublets >= 19)`.

| Stated R7 rate interpretation | End checks K | Expected terminal doublets | Conditional upper p |
| --- | ---: | ---: | ---: |
| 44.8% of all 2,896 printed words | **1,297** | **10.8990** | **0.0083172** |
| 44.8% of 2,813 multi-rune words | **1,260** | **11.1181** | **0.0102843** |
| Matched positional rival with no terminal checks | **0** | **17.6162** | **0.3944216** |

The same [read-only original source SFT](../sims/lp2_r7_terminal_check_repeat_position_sft.cjs) implements stable log-factorial hypergeometric tails and a source-sized **20,000-replicate controlled plant**. Its direct V8 run on exact repository files passes every assertion; for the multi-rune-word R7 rate, the planted distribution gives mean **11.1243** terminal doublets and empirical upper p **0.00980**, agreeing with the exact p **0.01028**. This is a **conditional diagnostic**: it disfavors the literal checked-at-end R7 when residual pre-check repeat events have equal probability at each eligible adjacent site. A word-position-dependent key, context-conditioned repair, or source-specific null placement can violate that exchangeability, so **do not classify R7 as logically impossible** or claim the p-value is corrected for all possible follow-up hypotheses. The published Phase57 q≈0.448 was already fitted from LP2 lengths, and this test intentionally uses the distinct within-word repeat **positions**.

Under the same conditional model R7 predicts a terminal deficit while source repeats are distributed much like the no-end-check positional rival. In contrast, Phase57's checked **uniform-slot R4** does not force a null at a particular word edge, so it remains a separate live *mechanistic hypothesis*, though still without any source-derived inverse or key.

## Decision, scope and value to decryption

**R3 as specified is logically incompatible with the untouched LP2 source, regardless of keys or statistical thresholds.** The external favorable overall nine-statistic fit missed this local hard constraint. One target word suffices to reject an exact generative model, even if its other 2,895 words appear compatible. This is a **real decision about which lossless inverse architectures remain worth pursuing**: do not build a decoder that assumes perfect pre-null anti-repeat and at most one later null per original printed word.

The obstruction does **not** exclude Phase57 R4 (which repairs only 81% of collisions and thus permits pre-null residual repeats), R7's likewise imperfect repairs, a model allowing two or more nulls in one word, a cipher that changes word boundaries, or a more general lossless evolving-state cipher. R4 and R7 still lack an authenticated original key or recoverable plaintext; the checked-terminal R7 is separately disfavored by the conditional positional test above. The evidence also does not prove that the doublet signal comes from collision repair, and it cannot recover any null positions in the remaining 2,895 words.

The next productive step requires an **original-authored reversible null/check insertion or key selection rule** that survives this word and predicts an untouched stretch of unknown original prose. Broad attempts to tune a merely synthetic word-length histogram should not be treated as solving the manuscript.
