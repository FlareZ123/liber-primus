# The solved PARABLE sheds to exactly 55 interior runes, matching the 55 rune-bearing unsolved pages

**13 November 2026, Agent 7. Status: a source-text-selected length correspondence, original key hypotheses tested negative. No original LP2 unknown plaintext, key, or destination is recovered.**

## Independent original-page observations

The solved LP2 **p57 PARABLE** (original JPEG scan 74) consists of **20 printed words with exactly 95 GP29 runes**. Its own original plaintext instructs the reader to shed circumferences, find divinity within, and emerge. An ordinary literal interpretation of *within* is to keep the **strict interior** of each printed word, discarding its first and last rune. Every word is at least two runes long. This operation removes 40 runes and produces **exactly 55 runes**. In index-ordered GP29 transliteration, that distinct nonplaintext product is:

`ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG`

The *unsolved* LP2 pages p0–p55 comprise **56 original numbered pages**, exactly **one** of which, **p50**, contains a numerical grid and no rune text. There are **55 rune-bearing unsolved pages**. Thus the literal Parable interior operation happens to produce one GP29 source rune **per rune-bearing unsolved page**, in their original order. This is an exact, reversible parsing/count result on original materials, independently of any ciphertext scoring. The presence of an empty-rune numeric page makes the one-to-one candidate more specific than an arbitrary count match.

The Parable immediately follows physical p55, whose original first rune is a carry of a word begun on p54. Independently, the Parable's **95−20=75** first- or last-rune deletion output has exactly the length of the **75 runes after that inherited p55 opening**. Keeping the seven-rune title unchanged while deleting one endpoint rune from each of the 19 following words gives **95−19=76**, exactly p55's complete rune count. Both count identities can arise without intentional cryptography; the choice of which boundary to discard is unresolved.

## Exact first-use tests with a known native decoder as control

A [single-file CommonJS reproducer](../sims/lp2_parable55_page_seeds_sft.cjs) reads the canonical original rune corpus and printed page transcript, verifies each source word against the 95 page57 source runes, checks all 55 recipient pages, and implements the original p56 prime-totient decryption.

**Positive controls:** The exact published p56 `AN END` is recovered **85/85** GP29 runes using `C−φ(prime)` with the sole known literal-F interrupter at position56, giving genuine English-like rune IoC **0.07002801**. A complete synthetic solved-p56 plaintext encrypted with the source prime stream at phase17 deciphers **85/85** exactly. This verifies the native arithmetic and phase clock. On *unknown* pages no F positions are assumed literal without a historical selector.

**Direct 55-symbol consumers, fixed from the original sources before reading outputs:**

- Four GP29 additive first-/last-rune page-edge acrostics against the 55 Parable interior values produce no readable 55-rune instruction (individual IoCs **0.03165–0.04579**).
- Read **one rune per page** at the source-selected interior GP index, or at its GP prime value, with source-natural zero-/one-based addressing. The one-based ordinal has two **invalid** positions where its seed is F=0, and the other three valid readouts contain no readable instruction. Their IoCs are **0.03569, 0.03636, 0.04377**, respectively.
- The two original-page numeric aggregations, rune count and GP-prime sum (each modulo29), combined with the source interior via `±`, also give nonlinguistic 55-rune sequences.
- The page-specific p56-native `C−φ(prime)` inverse, restarting its prime counter on each runic page at either the interior rune's zero-based GP ordinal or its associated GP prime value, gives whole-unsolved-book IoCs **0.03447388** and **0.03447831**, essentially equal to original **0.03447840**, and no readable p0 or p55 text. Even the highest page-level IoC is only about **0.0393**.
- The adjacent-p55 **75-rune** and **76-rune** Parable boundary-stripping direct additive pads, under both literal signs and both source endpoint choices, also give no readable text (IoCs **0.03263–0.04035**).

These are decisive original-input negatives for the simple source-derived consumers actually tested. No unspecified per-page phase selection, polyalphabetic cipher, transposition, reverse ordering, secret salt or arbitrary parsing is silently claimed tested.

[Original-source SFT](../sims/lp2_parable55_page_seeds_sft.cjs) · [manual Windows/Node22 workflow](../.github/workflows/lp2-parable55-page-seeds.yml) · [first successful controls, CI run 43373949195](https://github.com/FlareZ123/liber-primus/actions/runs/43373949195) · [extended source-page readout run 43374229771](https://github.com/FlareZ123/liber-primus/actions/runs/43374229771).

## Interpretation and next decision

The **55 interior runes vs 55 rune-bearing pages** is a compact clue-constrained **candidate key schedule or book-code input**. It merits retention because the source poem itself recommends removing word circumferences, and the recipient structure is independently determined. It does **not** authenticate a recipient operation or prove the original designer selected this transformation; count identities can be coincidental. The simple native operations above fail convincingly despite matching positive controls.

Pursue this specific candidate further **only if** an independent original 2013–2016 instruction selects the role of one source rune per page (e.g. index, letter shift, prime start, or directional reading) or a locked held-out source prediction succeeds. Avoid expanding the branch by trying unconstrained clocks, phase offsets, prime exponents or letters merely because the lengths align. Priority remains genuine original plaintext or authentic key recovery.