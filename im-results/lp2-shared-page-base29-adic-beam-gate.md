# Shared page-key BASE29 lifting

Agent13 draw10, 2026-11-27. This is a different hypothesis from a short coefficient applied to one chapter: the same arbitrary coefficients (or matrix exponent) are reused at physical page boundaries. No word-boundary assumption. Page50 has no runes; take the other 55 unresolved pages, first or last 20 runes (reverse the latter). Fixed index mod4=3 held out (13 pages), 42 fit. Native control records KOAN1 and LOSS OF DIVINITY are omitted from the language model, split into nonoverlapping 20-rune blocks, first 55 used as plant messages. These are real known plaintext chunks, not an independent model of LP2 page-boundary distribution.

## Arbitrary affine coefficients

For P=A*C+B mod29^20, A unit, write A=sum a_j29^j, B=sum b_j29^j. Given lower digits, the j-th plaintext digit is (carry + sum_{k<j} a_k c_{j-k} + a_j c_0 + b_j) mod29, with exact carry to the next position. Branch over all (a_j,b_j) in GF29^2 (a_0 nonzero), retain top16 cumulative native log likelihood candidates. This is heuristic beam recovery rather than exhaustive elimination; no small numeric key bound. A/B recovered modulo29^20, cannot claim higher digits. Each winner independently inverse-replayed all 55 ciphertext prefixes using bigint modular inversion.

## Arbitrary shared literal Möbius exponent

Lift the literal LP1 corner matrix [[272,151],[151,272]] as in lp2-chapter-literal-mobius-power-gate.md. g=423/121 is a generator modulo29^n. Enumerate 28 first exponents and subsequently all 29 lifts e+k*(28*29^(j-2)) to modulus 29^j, retaining top16 cumulative fit scores. Check the finite output restriction for all 55 ciphertext endpoints before scoring, including held endpoints; no held language score used to select key. Original admissible exponent residues mod28: forward [0,1,7,11,12,15]; reverse [0,8,17]. All powers outside these residues are exactly excluded under the finite affine chart model across these pages. Native controls use two large exponents divisible by 28, ensuring no poles for any planted plaintext. Inverse replay independent with negative exponent.

| Family | Orientation | Original fit | Original held | Plant held | Plant exact key/runes |
|---|---|---:|---:|---:|---|
| Affine | forward | -3.255751 | -3.506120 | -2.607647 | yes,1100/1100 |
| Affine | reverse | -3.258501 | -3.545112 | -2.611357 | yes,1100/1100 |
| Möbius | forward | -3.363109 | -3.550616 | -2.607647 | yes,1100/1100 |
| Möbius | reverse | -3.370255 | -3.518538 | -2.611357 | yes,1100/1100 |

Every plant true path retained at every lift and finished first; all four recovered the exact 20-digit key (Möbius exponent modulo group order) and every rune, including 260 held per control. All original winners replay exactly but fail readable plaintext and held mean score relative to uniform -ln29. No new authentic key. These are bounded heuristic negatives, not proof against arbitrary shared keys or alternate reset boundaries. Do not sweep beam width/partition/other matrices absent independent source motivation.

Reproducer: sims/lp2_shared_page_affine_adic_beam_sft.cjs and sims/lp2_shared_page_mobius_adic_beam_sft.cjs. Outputs: im-results/lp2-shared-page-{affine,mobius}-adic-beam-output.json. Actual experiment functions executed directly in connected V8; Node wrappers not executed.
