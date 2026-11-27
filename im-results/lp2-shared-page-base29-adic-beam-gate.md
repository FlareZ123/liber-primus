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

## Shared valuation-preserving unit power (Agent13, 27 November, later invocation)

This distinct third receiver uses the historical 2013 BASE29 and modular-exponentiation operations as a motivation, with physical-page reset and a common exponent as hypotheses. [Earlier short chapter-power gate](lp2-chapter-base29-short-exponent-exact.md) is conditional on a lexical endpoint and a bounded exponent; [four-rune power gate](lp2-base29-power-keyfree-invariant.md) uses frequent protected digits. Neither tests the arbitrary shared physical-page exponent directly.

Let (x=29^v u) with unit (u). Set (T_e(x)=29^v(u^e\bmod 29^{N-v})), with zero fixed, and require gcd(e,28*29^(N-1))=1. This lossless extension is explicitly a modeling decision rather than an authenticated source instruction. Literal encryption (C=P^e\bmod29^N), for any positive integer e>1, is exactly impossible across the fixed pages in either common orientation: valuation-one ciphertext occurs on physical pages 15 and 40 (first rune low), and 17, 27, 48 and 51 (last rune low). A nonzero output valuation of a literal power must be a multiple of e. This does not rule out a unit-only input encoding, an added layer or a different clock.

For the valuation-preserving map, recover all legal exponent residues modulo 28 at depth 1, then branch over all 29 lifts at each subsequent depth through 20 GP digits, using the same 42 fit / 13 held physical pages and independent native records as above. Each branch updates the next decoded digit exactly; retain the top16 by cumulative interpolated native GP trigram likelihood. This is a heuristic search over arbitrary key residues, not exhaustive full-depth ranking. The 13 held pages are never scored during selection. Inverse replay is checked on all original prefixes. Exhaustive mod29² control for e=3, 1033 and 3301 covers all 841 residues each, including zero and nonunits.

| Orientation | Original fit | Original held | Native held | Native exact key and runes |
|---|---:|---:|---:|---|
| First rune low | -3.358236 | -3.512274 | -2.607647 | yes, 1100/1100 |
| Last rune low | -3.363600 | -3.522923 | -2.611357 | yes, 1100/1100 |

Both true planted exponents survived every lift and finished first. Each plant's 260 withheld runes is recovered exactly. Original decoded prefixes remain nonprose. Separately, full-page powers and reciprocal powers of 3 (DH23 inverse exponent), 1033 and 3301 (historical magic-square sums), in both orientations, all replay all 12,956 original runes exactly; held mean log likelihood ranges from -3.499593 to -3.480813, and no coherent plaintext is evident. No source binds those values to this receiver. No original authentic exponent recovered. The finite 20-digit heuristic negative does not cover arbitrary per-page exponents, other boundaries, or nonnative plaintext.

Reproduce with `node sims/lp2_shared_page_unit_power_adic_sft.cjs` ([SFT](../sims/lp2_shared_page_unit_power_adic_sft.cjs), [raw](lp2-shared-page-unit-power-adic-output.json)). Experiment core executed in connected V8 against fetched repository data; the Node filesystem wrapper has not been run. No new workflow. Do not extend the power/affine/Möbius shared-page search by merely tuning beam width or page partitions: a new source selector or qualitatively distinct operation is needed.

## General fractional-linear shared key (Agent41, 27 November)

The affine and fixed-matrix-power models above are proper subfamilies of the arbitrary fractional-linear map `P=(A C+B)/(1+D C) mod29^N`. This follow-up is exploratory: the historical BASE29 operation and the original LP1 MOBIUS word motivate the form but neither selects physical page resets or its three parameters. In each of the two common orientations take the 12 low runes of all 55 rune-bearing unknown pages, 42 fitting and 13 fixed index-mod4=3 withheld pages. The normal form requires nonzero determinant `A-BD mod29` and a unit denominator on every observed frame. Because both original endpoint sets contain zero, the original denominator's constant term must be a unit, so normalization to 1 loses no admissible integral projective matrix with unit determinant. A nonzero D mod29 is allowed if its pole is absent from every observed frame; for an all-residue GP29 bijection, D must be 0 mod29.

At lift j, let m=29^j and let lower coefficients and plaintext residue p satisfy A C+B-(1+D C)p = 0 mod m. For new coefficient digits a,b,d, the next plaintext digit is

    t = ((A C+B-(1+D C)p)/m + a C+b-d C p) / (1+D C) mod29.

Thus every one of 29^3 extensions is enumerated for each retained prefix, scoring the next digit against the frozen native trigram model. At each lift retain the best 16 across all parents. Group the score contributions by the low ciphertext rune: all pages with the same residue have the same shift from the new coefficient digits, and the grouped table is exact. All retained lifts are explicitly checked; independently apply the full fractional-linear inverse to every returned plaintext prefix. All legal first-digit triples are enumerated (4,872 forward and 3,248 reverse original); high-digit search remains a beam, not an all-key decision. Both original orientations allow D0=0 and nonzero D0 whenever the pole is absent; held ciphertext is used only for this algebraic legality check, never for language-based selection.

Native positive plants use **disjoint** sets of 55 nonoverlapping length-12 chunks from the KOAN1 and LOSS OF DIVINITY records excluded from language training. Two separate 12-digit coefficient triples, one globally pole-free and one valid on the finite sampled affine chart, are inverted to create ciphertext. Both exact key triples survive every lift and finish first; all 1,320 planted runes, including 312 withheld, recover exactly.

| Orientation | Original fit | Original held | Native held | Plant exact key/runes |
|---|---:|---:|---:|---|
| First rune low | -3.175884 | -3.567296 | -2.647006 | yes, 660/660 |
| Last rune low | -3.186596 | -3.561328 | -2.702293 | yes, 660/660 |

Original winners are nonprose, held scores worse than uniform -ln29; inverse replay succeeds as expected for legal keys. The apparent improved fit relative to the simpler families is not predictive. No authentic plaintext/key. This is a calibrated, bounded shared-page key-recovery negative, not an all-key impossibility or exclusion of a nonlinear transform in a different register. Do not increase beam width or change framing without new independent source evidence.

[SFT](../sims/lp2_shared_page_general_mobius_adic_beam_sft.cjs) · [raw output](lp2-shared-page-general-mobius-adic-beam-output.json). Executed the experiment function directly in connected V8; standalone Node wrapper not independently executed. No CI run.
