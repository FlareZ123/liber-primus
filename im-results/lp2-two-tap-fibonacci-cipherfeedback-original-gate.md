# Original-cipher two-tap GP29 ciphertext feedback: all-secret obstruction

**Agent 8, 13 November 2026.** This is an original-input *bounded negative*, not recovered LP2 plaintext or a creator-authenticated cipher. The full, independently runnable CommonJS test is [the two-tap SFT](../sims/lp2_two_tap_cipherfeedback_allsecret_sft.cjs).

## Human-plausible premise and strongest objection

LP2 physical p15 displays an independently reconstructed Fibonacci-indexed prime square. A two-term recurrence is an elementary operation a player could infer from that clue. One fully reversible GP29 reading extends the previously tested **single previous-ciphertext tap** to two feedback taps:

`Cᵢ = Pᵢ + a Cᵢ₋₁ + b Cᵢ₋₂ + k (mod 29)`,

with arbitrary secret coefficients `a,b,k ∈ GF(29)`. The original puzzle **does not explicitly select this cipher, its feedback signs or its register initialization**. The experiment deliberately grants every pair of coefficients rather than asserting a Fibonacci key. It tests a narrowly defined family and adds no speculative extra layers.

For each physical original page, regard the first two ciphertext runes as arbitrary initial output. Exclude them from the invariant. Every subsequent putative plaintext rune is exactly `Pᵢ=Cᵢ−aCᵢ₋₁−bCᵢ₋₂−k mod 29`. Any unknown constant `k` rotates the 29-symbol alphabet without changing monogram collision counts. With separately keyed pages, this is true *within each page*, so pool within-page collision-pair numerators rather than incorrectly pooling pagewise-shifted symbols.

## Original-input result

Read the exact unchanged `resources/liber-primus/lp2-corpus.json` indices for all 55 rune-bearing original p0–55 pages, including the original red runes. These supply **12,956 runes**, of which **12,846** remain after excluding two arbitrary-state symbols per page. Exhaust all **841** possibilities for `(a,b) ∈ GF(29)²` globally. Independently optimize all 841 choices on each of the 55 pages, granting an additional **46,255** page-coefficient trials, and report the most favorable GP29 index of coincidence in each envelope:

| Inverse envelope | Optimistic original GP29 collision IoC | Independently encoded English-control lower bound |
| --- | ---: | ---: |
| One secret `a,b,k` on all pages, arbitrary first two runes per page | **0.035326299**, at `a=1,b=0` | **0.058484803** |
| Completely free secret `a,b,k` *per physical page* | **0.039018664**, 122,794 / 3,147,058 within-page ordered rune pairs | **0.059098371** |

The native thresholds are *lower bounds* on how well any of the 44 unaltered held-out GP-English control windows can be fitted: the test takes their ordinary `a=b=0` scores, because maximizing over secret coefficients can only make a native control score higher. The controls are non-overlapping complete-size windows of Shakespeare, Gibran and Emerson, GP29-encoded with the project’s native transliteration including ING→NG, QU→CW, V→U, K→C and Z→S. Individual sources have 16, 4 and 24 windows respectively; the comparator is the minimum over all 44.

The entire original family’s most favorable score is well below **every** untransformed source control. In particular, even the most permissive *secret per-page two-tap coefficients and offsets* cannot explain the original as the tested GP-native ordinary English text under fixed page-local symbol counts. The best global pair is actually `(a,b)=(1,0)`, already covered by the direct one-tap ciphertext-difference test; no two-tap addition recovers a stronger candidate.

## Reversible control, exact scope and decision

A completely separate genuine GP-native English 12,956-rune source window is encrypted under different secret `a,b,k` per page, with its first two symbols left as literal initial conditions. The stated inverse recovers **all 12,956/12,956** original planted plaintext runes, and a wrong-key inverse fails. This verifies the candidate decoder; because the family is bijective for each key, exact reencryption alone does **not** identify the historical key.

This result *strictly limits* stationary two-tap affine feedback under the fixed GP29 register and original page clocks. It does not exclude variable-length plaintext, a different source language, externally mixed keystreams, changing coefficients **inside** pages, nonlinear memory, transpositions, other feedback clocks or additional encoded channels. Those require independent original-source selection. No unknown LP2 plaintext, genuine key or destination has been recovered. Prefer an author-fixed reader or key to further searches over nearby arbitrarily parametrized feedback models.

**Reproduce:** `node sims/lp2_two_tap_cipherfeedback_allsecret_sft.cjs` from the repository root. The script asserts exact source/page counts, coefficient maxima, control windows, algebraic original bounds and independently planted forward/inverse correctness. It prints all original scores and native comparator minima.
