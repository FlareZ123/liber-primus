# Explicit encrypted delimiter: all-phase count and latent-clock inverse gate

**Decision (25 November 2026, Agent15).** Under the tested H-decoy receiver, one plaintext symbol is SPACE, every consuming phase is an arbitrary permutation of the 29-symbol alphabet, and every visible ciphertext F independently may be literal plaintext F with no advance or an ordinary consuming symbol. There is no shared alphabet constraint between chapters. On each of the nine physical chapters, periods **8 and 13 both fail** the necessary SPACE-frequency condition against the frozen Latin29 literary register. All periods 1–32 fail the ordinary consuming model on eight chapters and the complete p0–55 tape. Whole-book arbitrary F-hold histories fail every period 1–14. No new plaintext/key. This is a finite-reference constraint on a specific receiver, not an all-language impossibility result.

## Motivation and scope

The independent Round45 word-order result motivates H-decoy (printed groups need not delimit plaintext words); the genuine LP1 WELCOME/KOAN clocks motivate q8/q13 and transparent F. [Agent31's exact Latin29 q8 inverse](lp2-explicit-latin29-q8-exact.md) fits one additive alphabet and the terminal chapter; this investigation asks whether **any** phase permutations, any delimiter index and any transparent-F schedule can produce ordinary numbers of explicitly encrypted spaces. No candidate key or literal plaintext is assumed; printed separators are ignored, and the upper bounds also apply if letter order is permuted before encipherment but actual explicit spaces remain as single symbols. The terminal no-adjacent-space refinement requires plaintext adjacency to be retained at encryption time.

A consuming permutation maps the single space symbol to exactly one ciphertext label at each phase. The model grants independently chosen labels, unrestricted bijections, arbitrary chapter-specific keys and arbitrary phase origin (equivalent to rotating phase labels). Held F is a letter, not a space. We relax the genuine F convention by allowing all consuming outputs at visible F; no need to enforce that a consuming plaintext F is forbidden. The receiver does not cover multiple homophonic delimiters, delimiter insertion/deletion, irregular clocks other than visible-F holds, or unencrypted spaces, and a surviving long-period hypothesis is not evidence of its authenticity.

## Frozen inputs and control floor

Canonical physical rune tape: `resources/liber-primus/lp2-corpus.json` blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; 12,956 runes including 458 visible F; p50 empty. Nine chapter boundaries are the established p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. The LP1 reference and three existing literary files are frozen by their blob IDs in the [raw output](lp2-explicit-space-allphase-holdcap.json). Normalize to the prior Latin29 alphabet A–Z, SPACE, period, apostrophe; use its adjacent grammar and collapse redundant whitespace. The LP1 reference is editor-normalized Latin text and includes p56/p57; retain uppercase prose lines, excluding markup and numeric material. The four normalized sources contain respectively 3362, 83025, 421826, 287011 characters (LP1, Gibran, Emerson, Shakespeare). Every contiguous length-matched window is counted without selection by ciphertext. The minimum number of SPACE symbols across all eligible windows is the conservative finite-register floor. Source-authentication of a particular window is not implied.

## Necessary count bound

With every symbol consuming, let H[r,c] be the number of ciphertext label c at phase r. The exact maximum possible number of spaces over arbitrary phase permutations is sum_r max_c H[r,c]. No language model or key search is required.

For latent F, at physical index i with s held symbols so far modulo q, consuming phase is (i-s) mod q. For each fixed phase r and output label c, compute exact max-plus DP over s in 0..q-1. Nonzero symbols consume, rewarding one iff c matches the observed rune and the phase is r. Visible zero allows either a consuming branch (same s, reward where appropriate) or a no-reward hold branch (s+1 mod q). Sum the independent per-phase maxima, relaxing the requirement that all phases share a single hold history. This is a rigorous upper bound, not an exact joint optimum.

For the surviving q8/q13 chapter cases, repeat the exact DP for each phase pair and candidate output-label pair. Prune only where the independently calculated singleton maxima cannot beat the incumbent. A partition into disjoint pairs and (odd q) one singleton produces a valid upper bound by adding their joint maxima; the minimum-weight partition is computed exactly with subset DP. The floor of sum of all pair maxima divided by q-1 is another valid bound. Use the smaller bound. For opening q13, fix every possible prefix hold history through the first 16 visible zeros. Preserve the exact prefix counts and phase and use the same fixed pair partition for the suffix, taking max over output labels jointly across prefix and suffix for each pair. This reduces the relaxation without requiring shared suffix masks between pairs.

For terminal q13, all 64 hold masks are feasible to enumerate. Each mask defines phase/rune counts and forbidden pairs of output-space labels on physically adjacent consuming positions; a held F breaks a space adjacency. For each fixed first-phase label, cyclic max-sum DP over the 29 labels in successive phases with closing forbidden-pair check gives the **exact** maximum space count subject to no adjacent spaces. This constraint is already required by the frozen plaintext normalization and does not assert any word-length order.

## Original results

| Physical scope | Runes | Finite floor | q8 consuming | q8 all-mask upper | q13 consuming | q13 all-mask upper |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 729 | 106 | 59 | 96 | 69 | 104 |
| p3–7 | 1145 | 170 | 77 | 148 | 92 | 148 |
| p8–14 | 1729 | 260 | 109 | 226 | 128 | 243 |
| p15–22 | 1903 | 286 | 128 | 267 | 131 | 256 |
| p23–26 | 1021 | 149 | 75 | 142 | 84 | 147 |
| p27–32 | 1433 | 215 | 89 | 198 | 123 | 208 |
| p33–39 | 1680 | 252 | 103 | 206 | 114 | 245 |
| p40–53 | 3008 | 456 | 176 | 402 | 184 | 419 |
| p54–55 | 308 | 42 | 34 | 41 | 42 | 40* |
| p0–55 | 12956 | 2119 | 602 | 1557 | 616 | 1939 |

*Exact over all masks and phase-label assignments **with the no-adjacent-space constraint**; the exact unrestricted count is 43 (mask 2). All other all-mask columns use valid relaxed upper bounds, not exact maxima. The opening q13 singleton/pair/8-/12-/16-prefix-hold bounds are 134/112/109/107/104; conditioning enumerates respectively 256, 4096, 65536 histories. The full-book maximum upper at q14 is still below the reference floor; q15 survives the singleton relaxation, which is not evidence of an actual key.

Thus a common short-period explicit-space alphabet is untenable even without ordered word assumptions, and independent chapter q8/q13 keys do not rescue this receiver. The small q13 terminal gap is a finite-register result; prose outside the register could be sparser in spaces. No further language fitting on the repeatedly used p54–55 seam is justified for these specific clocks. An explicitly encrypted separator route would require a materially different mechanism (e.g. a genuinely source-selected changing clock or a different representation) rather than more additive-key trials.

## Calibration and reproducibility

- Singleton DP: 200 exhaustive toy mask checks comparing every phase/label optimum, and six 1,000-character Shakespeare-derived independently keyed phase-permutation plants (q8/13/29, ordinary and latent F). All true SPACE counts retained.
- Pair bound: 96 exhaustive toy mask comparisons of every pair optimum and joint upper bound; two constructed 1,000-symbol F-hold plants retained (space counts 190/217; upper 217/259).
- Conditioned prefix: 12 exhaustive toy comparisons with exact all-mask optimum; no cap violation.
- Terminal grammar: 72 complete small-alphabet label enumerations agree with cyclic DP, and one constructed 308-symbol F-hold plant has 61 true spaces and exact optimum 61. All 64 original masks examined. These test the inference machinery; no original receiver is authenticated.

Run sequentially from the repository root:
1. `node sims/lp2_explicit_space_allphase_holdcap_sft.cjs`
2. `node sims/lp2_explicit_space_phasepair_holdcap_sft.cjs`
3. `node sims/lp2_explicit_space_q13_conditioned_holdcap_sft.cjs`
4. `node sims/lp2_explicit_space_q13_terminal_grammar_sft.cjs`

The latter SFTs read the preserved prior JSON where indicated. All four cores executed against actual repository inputs in connected JS; standalone Node execution and CI are not claimed. Raw results: [singleton](lp2-explicit-space-allphase-holdcap.json), [pairs](lp2-explicit-space-phasepair-holdcap.json), [conditioned](lp2-explicit-space-q13-conditioned-holdcap.json), [terminal](lp2-explicit-space-q13-terminal-grammar.json). Code/output commits: 42345cc, 4eef813, 489a826, bfd46a4, 5b1ad7f, d75d8a4, 484992f, 4f527c2.

No unknown plaintext, actual key, or final destination recovered. Do not generalize this finite count gate to encrypted whitespace with multiple encodings, unbounded periods, arbitrary transposition after encoding, or H-decoy in general.
