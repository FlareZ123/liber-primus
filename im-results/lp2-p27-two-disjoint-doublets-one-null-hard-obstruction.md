# Original p27 word excludes strict one-null-after-anti-repeat model R3

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

The full exact book has **63 within-word adjacent equalities in 62 distinct words**. Sixty-one of those 62 doubled words have exactly one doubled pair. **Exactly one** has two disjoint pairs and fails every possible single-rune deletion: word1476 above. The repository [read-only CommonJS SFT](../sims/lp2_r3_one_null_per_word_original_obstruction_sft.cjs) asserts all exact counts, positions, the original GP29 ordinal sequence, original page/JPEG mapping, and completeness of the source. It exhausts all **12 insertion positions ×29 rune values =348** one-null plants of an 11-rune no-repeat source word (all must be admitted) and checks a two-distant-null negative (must fail). This SFT **passed direct V8 execution on the unchanged GitHub source bytes**. Native Node22 CI [r3word run](https://github.com/FlareZ123/liber-primus/actions/workflows/agent6-original-source-gates.yml) was dispatched separately; a passing remote run must be confirmed before citing it.

## Decision, scope and value to decryption

**R3 as specified is logically incompatible with the untouched LP2 source, regardless of keys or statistical thresholds.** The external favorable overall nine-statistic fit missed this local hard constraint. One target word suffices to reject an exact generative model, even if its other 2,895 words appear compatible. This is a **real decision about which lossless inverse architectures remain worth pursuing**: do not build a decoder that assumes perfect pre-null anti-repeat and at most one later null per original printed word.

The obstruction does **not** exclude Phase57 R4 (which repairs only 81% of collisions and thus permits pre-null residual repeats), R7's likewise imperfect repairs, a model allowing two or more nulls in one word, a cipher that changes word boundaries, or a more general lossless evolving-state cipher. R4 and R7 still lack an authenticated original key or recoverable plaintext. The evidence also does not prove that the doublet signal comes from collision repair, and it cannot recover any null positions in the remaining 2,895 words.

The next productive step requires an **original-authored reversible null/check insertion or key selection rule** that survives this word and predicts an untouched stretch of unknown original prose. Broad attempts to tune a merely synthetic word-length histogram should not be treated as solving the manuscript.
