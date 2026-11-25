# Inner alphabet followed by the authentic consuming prime clock

**Agent 3, 25 November 2026.** No unknown LP2 plaintext or authentic key recovered. This is an exact original-input rejection of a distinct layer order, with a conditional lexical rejection for the two short surviving chapters.

## Mechanism and source premise

Known p56 uses consecutive prime-minus-one shifts with literal plaintext F bypass. Earlier solved LP1 uses alphabet transformations. Test an arbitrary fixed secret GP29 permutation **before** the known arithmetic, distinct from the previously tested [outer alphabet](lp2-outer-alphabet-prime-fhold-spacingfree.md), [permuted shift residues](lp2-prime-residue-permutation-fhold-spacingfree.md), and [direct twig-TH clock](lp2-p0-thorn-transparent-prime-origin-gate.md). A literal TH replacement marker is additionally tested only on the opening chapter because of the independent 3|3 twig-to-thorn observation. No original instruction is established selecting this secret inner alphabet; the rival is that p56's clock is local and earlier chapters have unrelated mechanisms.

Let S be any permutation of GP29, b the plaintext bypass rune (0=F or 2=TH), m=S(b), j the consuming prime ordinal, and s_j=(prime_j−1) mod 29. For P=b, emit C=b and leave j unchanged. Otherwise emit C=S(P)+sign*s_j (mod 29), advancing j once. Both signs, all 29 values of m, all 3,302 initial ordinals 0..3301, and the existing complete/post-rubric chapter starts are granted. For a consuming step the intermediate Z=C−sign*s_j mod 29 cannot equal m. At a literal hold Z=m. This gives an exact reachability recurrence independent of the remaining 28! secret assignments.

For each observed c, the set R of reachable prime cursors evolves as
```
R' = ((R \ {j : s_j = sign*(c-m) mod29}) + 1) ∪ (R if c=b else ∅)
```
Backwards reachability determines every valid initial cursor; summing counts in the pruned directed acyclic graph counts every legal (origin, hold mask) path exactly. Printed word boundaries are not used in this gate.

## Exact full-region results

| Original chapter | Complete / post-rubric length | Literal F legal (origin, marker-image, sign) models | Best feasible prefix, complete / post-rubric |
|---|---:|---:|---:|
| p0–2 | 729 / 716 | 69 / 69 | 729 / 716 |
| p3–7 | 1145 / 1129 | 0 / 0 | 783 / 767 |
| p8–14 | 1729 / 1717 | 0 / 0 | 747 / 742 |
| p15–22 | 1903 / 1894 | 0 / 0 | 1245 / 1236 |
| p23–26 | 1021 / 1005 | 0 / 0 | 783 / 771 |
| p27–32 | 1433 / 1414 | 0 / 0 | 829 / 810 |
| p33–39 | 1680 / 1670 | 0 / 0 | 611 / 601 |
| p40–53 | 3008 / 3000 | 0 / 0 | 963 / 955 |
| p54–55 | 308 / 299 | 111 / 140 | 308 / 299 |
| Entire p0–55 | 12956 / 12943 | 0 / 0 | 888 / 875 |

For the opening chapter with literal TH instead, 7 / 11 origin-model pairs survive, with 338 / 1186 full paths respectively. The literal-F opening path counts are 32,215 / 22,514; terminal 251 / 306. Distinct origin-model pairs and distinct hold paths are different quantities. No model, origin or hold path is removed using a language score.

Authentic p56 identity-alphabet replay is 85/85. Three separate native planted mappings (WELCOME, KOAN1, LOSS) preserve their true clock origins and forward-replay 515,780,755 runes respectively. The controls confirm feasibility, not blind alphabet recovery.

## Exact shared-alphabet recovery attempt on surviving chapters

For any full legal path, Z is now a monoalphabetic ciphertext of P. Select the six longest complete printed groups, with physical order as tie-break, before fitting. A shared inverse must map Z to a GP form with the same equality pattern and exact marker positions. Form a finite 29,081-spelling register from the checked-in TextBlob lexicon with conventional GP digraph conversion, plus exact native solved rune forms. For each path, enumerate the dictionary candidates and join their partial bijections, pinning S(b)→b. This directly attempts a shared secret alphabet, instead of trying random permutations. The original canonical word parse contains 2,896 groups and reproduces all 12,956 source runes.

| Receiver | Bypass | Legal full paths | Distinct six-anchor states | Full six-anchor shared alphabet |
|---|---|---:|---:|---:|
| p0–2 complete | F | 32215 | 136 | 0 |
| p0–2 after red13 | F | 22514 | 144 | 0 |
| p0–2 complete | TH | 338 | 7 | 0 |
| p0–2 after red13 | TH | 1186 | 11 | 0 |
| p54–55 complete | F | 251 | 209 | 0 |
| p54–55 after rubric | F | 306 | 258 | 0 |

All six models can make six anchors individually lexical on at least one path; none can satisfy them jointly under one alphabet. Thus for each of these bounded original models, at least one of six selected groups must lie outside the fixed register or fail the intact-group assumption. This is not a universal language-independent contradiction for the short chapters. The exact native-path lexical controls preserve true mapping projections: WELCOME first join 17/17 assignments correct, LOSS 15/15; both re-encipher all native runes with their planted complete keys. The dictionary includes the native donor forms, and the controls use the true clock path, so they do not establish blind all-origin full-key recovery or a withheld prediction.

## Disposition

Retire the manuscript-wide and independently chapter-reset inner-permutation prime clock on seven complete chapters under the stated origins/starts. The opening and final chapters retain mathematically legal short paths but fail the stated six-long-group lexical receiver. A spacing-free partial substitution solver is a different follow-through, not evidence of an authentic mechanism. No original plaintext, key, or destination. Do not expand origins or marker sets without an independent clue.

[Reachability SFT](../sims/lp2_inner_alphabet_prime_fhold_exact_sft.cjs) · [Raw exact counts](lp2-inner-alphabet-prime-fhold-exact-output.json) · [Lexical SFT](../sims/lp2_inner_alphabet_prime_fhold_lexical_sft.cjs) · [Raw lexical result](lp2-inner-alphabet-prime-fhold-lexical-output.json). Both experiment cores executed in the connected JavaScript runtime. Standalone CommonJS wrappers were assembled from the executed functions, not separately executed in Node. No CI workflow created. An initial combined full-origin control enumerator timed out; its results are not used. Exact reachability counts and the original lexical enumeration subsequently completed separately. The raw JSON files pin input blob hashes.
