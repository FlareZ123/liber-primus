# Root-15 no-repeat clock: bounded original-input negative

**Status:** intermediate negative; no plaintext or key recovered. This tests one source-constrained finite-state mechanism, not the entire family of possible online encoders.

## Human solve-path hypothesis

The existing red-span investigation reports three source-derived quotients: 15, 22 and 78. Their residues satisfy

- (15^2 \equiv 22 \pmod{29})
- (15^4 \equiv 20 \equiv 78 \pmod{29})

and 15 has multiplicative order 28 modulo 29. A solver who has already recognized the 29-symbol GP alphabet and the red-span relation could reasonably try the nonzero F29 differences as a 28-state alphabet, using the powers of 15 as a compact clock.

A no-repeat channel then has a simple reversible interpretation: zero ciphertext movement is reserved for GP-EA (index 28), while the other 28 plaintext symbols select the 28 nonzero F29 differences. The visible hyphens/word delimiters, printed lines and physical pages offer plausible places to reset a short clock. This is a motivated hypothesis, not an established creator instruction: the red-span arithmetic is itself exploratory and does not prove that the author intended a discrete-log cipher.

## Exact transducer tested

Let (P_i,C_i\in\mathbb Z_{29}). For a noninitial rune define

[
D_i=(C_i-C_{i-1})\bmod29.
]

Use the source-derived 28-state key schedule

[
K_j=(15^{j+\phi}\bmod29)-1,
\qquad j\in\mathbb Z_{28},
]

where the two natural orbit origins tested were \(\phi=0,1\). For either orientation \(s\in\{+1,-1\}\), the inverse is

[
P_i=
\begin{cases}
28 & D_i=0,\\
s\log_{15}(D_i)-K_j\pmod{28} & D_i\ne0.
\end{cases}
]

The forward map is (D_i=0) for (P_i=28), otherwise
(D_i=15^{s(P_i+K_j)}\bmod29), followed by
(C_i=C_{i-1}+D_i\bmod29). Since 15 is primitive, every nonzero difference has exactly one logarithm in \(\mathbb Z_{28}\). This is a finite-state invertible online map, not a fitted per-position key.

Three source-visible clock interpretations were fixed before evaluation:

1. **Page clock:** the first rune on each physical page is direct; both predecessor and clock reset there.
2. **Word clock:** the clock resets at every printed word start, but the preceding ciphertext rune carries across words, lines and pages. A cross-word doublet therefore remains a zero step, not a discarded boundary.
3. **Line clock:** the clock resets at every printed line start, but the preceding ciphertext rune carries.

The first rune of the whole stream is direct in every interpretation. Every subsequent rune advances the clock once, including zero steps. A singleton word is not omitted: under the word clock its sole rune is processed as an ordinary transition at clock state zero. Printed line wraps and page boundaries do not reset the word clock; words that cross pages remain continuous. Large punctuation is not a rune and was treated as non-consuming/non-resetting. This is consistent with the solved-page punctuation control, where the 13-dot and 10-dot marks do not advance or reset the known \(\phi(\mathrm{prime})\) clock; that control is not assumed to prove that every LP2 cipher must share the same mechanism.

The finite candidate family was 3 clocks × 2 orientations × 2 orbit origins = 12 configurations. No additional phase, arbitrary permutation, or per-character key was fitted.

## Original-stream structure

The original transcription and canonical GP29 corpus agree on the 55 rune-bearing unsolved pages:

| Observable | Count |
|---|---:|
| Runes | 12,956 |
| Physical pages | 55 |
| Printed words | 2,896 |
| Singleton words | 83 |
| Printed lines | 594 |
| Words crossing a page boundary | 32 |
| Adjacent identical-rune pairs | 86 |
| Large punctuation marks on unsolved pages | 31 |

The 86 zero-difference positions have the following exact joint structure:

| Position of second rune in its printed word | Count |
|---|---:|
| Cross-word | 23 |
| Interior | 44 |
| Word ending | 19 |
| **Total** | **86** |

Thus 63 events are within words and 23 cross word boundaries. Four cross printed-line boundaries; none crosses a physical page boundary. None of the 31 large punctuation marks immediately borders a repeated pair.

The page holdout split used below is physical pages 0–27 for selection and pages 28–55 for evaluation. The first half contains 45 repeated pairs (9 cross-word, 25 interior, 11 word-ending); the held-out half contains 41 (14 cross-word, 19 interior, 8 word-ending), including all four line-crossing events.

## Held-out result

The language test deliberately removes spaces and scores the recovered continuous GP stream, so it does not assume that ciphertext hyphens are necessarily plaintext word boundaries. A trigram model was trained on the first 240,000 characters of the repository's Shakespeare control. The 12 fixed candidates were ranked only on pages 0–27; the best candidate was then evaluated unchanged on pages 28–55.

| Stream | Held-out mean log-likelihood (nats/rune) |
|---|---:|
| Original ciphertext, unchanged | −4.48114 |
| Best training-selected candidate: word clock, (s=+1,\phi=1) | −4.49393 |
| Native LP1 matched-word controls, mean | −2.43528 |
| Native LP1 matched-word controls, 5th–95th percentile | −2.45139 to −2.41919 |

The selected candidate is slightly worse than the untransformed ciphertext on the held-out pages and approximately 2.06 nats/rune below the native controls. The other page- and line-clock configurations do not produce a meaningful language signal either. The selected word-clock output has 86 EA zero-step markers and 85 post-marker successors; those successors span 27 GP symbols with maximum multiplicity 9. That is a diagnostic, not a standalone rejection, because the available native references do not impose one universal successor-support bound.

**Result:** the tested root-15 orbit with page-, word- or line-derived clocks does not decrypt the original LP2 stream. In particular, the word-clock version handles all 23 cross-word and 63 within-word repeats explicitly, yet fails on pages never used for selection.

## Positive implementation control

The script samples 2,896 words from the 796-word solved LP1 plaintext reference, matching the original LP2 ciphertext word-length sequence, and encrypts that 12,956-rune stream under the selected word-clock map. It recovers all 12,956 runes exactly. In the recorded control, the 80 GP-EA plaintext runes produce exactly 80 ciphertext doublets.

This roundtrip checks the inverse and boundary handling only. It is not evidence for the LP2 hypothesis; the evidence against the hypothesis is the original-input held-out failure.

## Decision and missing input

Retire this particular mechanism: the F29 primitive root 15, the fixed orbit (K_j=15^{j+\phi}-1), both orientations, and the three source-visible page/word/line clock interpretations tested here. Do not continue sweeping phases, arbitrary key tables, or combinations of resets without a new independent source clue.

The red-span arithmetic can motivate the generator 15, but it does not presently specify that the generator should be used as a discrete-log difference alphabet, how its orbit should become a key stream, or which visible boundary should reset the state. The missing input is an author/source-selected mapping from the visible layout to the 28-state key/clock and its initial phase. A different independently sourced key or a different cipher family remains possible; this result does not reject every no-repeat transducer, every use of 15, or the non-GP/variable-width route assigned elsewhere.

No change to the authoritative `results/README.md` is warranted: this is a rejected intermediate hypothesis, not an established decryption.

## Reproduction and related work

Run from repository root:

```sh
node sims/lp2_root15_wordclock_no_repeat_gate.cjs
```

The script asserts the original stream counts, all 86 event coordinates, the large-mark adjacency result, the order-28 root, the source-native exact roundtrip, and emits all 12 candidate scores plus the held-out split.

This is distinct from the already documented linear progressive EA clock (which tests (K_i=\phi+i\)), the stationary predecessor-row gates, the plaintext-feedback inverses, and the LP1 Möbius/projective rank-difference register. The present test uses the multiplicative orbit of the source-derived F29 root 15 as a deterministic word/page/line clock. Relevant prior context:

- `im-results/red-span-triangle.md`
- `im-results/red-triangle-progressive-ea-clock.md`
- `im-results/ea-successor-allsecret-plainstate-gate.md`
- `im-results/field-unit-differential.md`
- `im-results/lp1-mobius-rank-differential-register.md`
- `im-results/lp2-doublet-boundary-audit.md`
- `im-results/cross-word-anti-repeat-constraint.md`
- `im-results/lp2-punctuation-solved-clock.md`
