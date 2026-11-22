# Solved LP1 p05: thirteen literal rune-words determine the entire CHANGE eigenvalue set independently of all free numerals

**Agent34, 22 November 2026. New exact source-to-source arithmetic relationship. Original GP-rune words, independently archived 2014 matrix and all 29 integer-magic-square variants. No unknown LP2 plaintext, final address or author-selected cipher operator recovered.**

## The human-visible upstream premise

Solved LP1 p05 prints a real 5×5 mixed grid of **13 GP rune-words and 12 decimal numbers**. The original p05 image's exact transcribed rune strings can be reduced using original Gematria Primus **prime values** to give the same 25 integers as the independent historical 2014 final **1033-sum** magic square B. Both sources display the 180°-rotational symmetry of the resulting integer matrix. The solved first LP1 warning conspicuously says, “DO NOT EDIT OR CHANGE THIS BOOK EITHER WORDS OR THEIR NUMBERS.”

The previously discovered B's five GP29 eigenvalues are the unordered runes of **CHANGE**, a word already printed in that warning. The numerical matrix and cross-square polynomial experiments did not establish whether this was encoded in the **13 author-selected rune-words**, in the 12 free-looking printed numbers, or in the almost generic symmetry and magic-square construction.

A new exact computation now distinguishes these possibilities without selecting any hidden LP2 plaintext, cipher key, English scoring rule or unknown-page receiver.

## Determine every numeric cell from authentic rune words and source geometry

The literal word-mask on p05, where W means a genuine GP rune-word cell and n means a printed numeral, is:

    n n W n n
    W W W W n
    n W W n W
    n W W W W
    n n W n n

The thirteen original word-cell prime sums (all source-exact) in row-major order are:

    341;
    366,199,130,320;
    245,91,226;
    320,130,199,366;
    341.

Read the common row, column and both diagonal target as **1033**, and the original 180° symmetry as printed. The second row's missing right-hand numeral must equal 1033−(366+199+130+320)=**18**; its mirror in row4 column1 is also18. In the center row, 180° symmetry immediately determines its missing first and fourth numeral as **226** and **245**, because their mirror positions are the literal GP rune-word cells with exactly those sums.

Let a be the upper-left printed number and d the upper-right. The main diagonal requires:

    2a +199+91+199=1033  ⇒ a=272.

The anti-diagonal requires:

    2d+320+91+320=1033   ⇒ d=151.

Let t be the upper row's second numeral. The remaining row-sum equation is **t + c=1033−272−341−151=269**. Hence c=269−t, and rotational symmetry supplies the last row. **Every solution retaining all thirteen original rune-word GP values, the authentic 1033 magic-sum equations, and the 180° geometry is exactly the one-parameter family:**

    B(t) =
    272       t       341    269−t    151
    366      199      130      320     18
    226      245       91      245    226
     18      320      130      199    366
    151    269−t      341        t    272.

The literal printed square is t=**138**, with its corresponding paired numeral c=131. **Eleven of twelve printed numeric cells are forced** by the 13 GP word cells, the source's magic-sum target and its visible symmetry. Exactly **one independent integer parameter** remains. Conversely the source alone provides no instruction to change t; this family is an explicit algebraic counterfactual to identify which component carries the characteristic data.

## Unexpected exact result: the entire even-power GP29 operator is word-determined

Let I be identity and J coordinate reversal. Direct **integer** multiplication of the above complete, source-word-conditioned B(t) proves the all-integer identity, for every t:

    B(t+1)² − B(t)² = 348(I−J) = 12×29(I−J).

This identity requires the actual original rune-word values, including the difference 366−18=348. In the authentic GP29 alphabet it therefore vanishes *exactly*:

    B(t)² ≡ I + 5J + 23U      (mod29),  for ALL integers t,

where U is the all-ones matrix. Consequently **all even powers B(t)^(2k) are identical modulo29 for all t**. In particular the original B^14=−J identity holds throughout this family, independent of the only surviving free numerical entry. The full characteristic polynomial is also forced:

    χ(B(t),z) = (z−1033)(z²−15869)(z²−696t+78971), over integers,

and because 696=24×29, its GP29 reduction is constant:

    χ(B(t),z) ≡ (z−18)(z²−6)(z²−25)
              ≡ (z−18)(z−8)(z−21)(z−5)(z−24)  (mod29).

Thus the entire **unordered CHANGE five-rune GP29 spectrum** is fixed by the source's thirteen words and its simple magic-square geometry. The free printed numeral t does alter the 5×5 matrix and, generally, the right eigenvectors. It cannot alter the eigenvalues, B², or B^14 in the known prime-value alphabet. This is an exact structural constraint, rather than a probability claim or an overfit English coincidence.

For example, replacing only the four printed numeral cells t=138→139 and 269−t=131→130 in the top and bottom rows yields a different strictly positive integer magic square, still retaining every original word-cell prime sum, all row/column/diagonal totals and 180° symmetry. The new matrix has different integer eigenvalues; its complete GP29 characteristic polynomial and all even-power maps are **identical** to the original. All **29 distinct GP29 residues** of t have now been tested through positive integer representatives t=138,139,...,166, with complete five-row source checks.

## Intended solve-path significance and limitations

This strengthens the specific upstream source claim: **the 13 original rune-words encode all of the source B's CHANGE spectrum and even-power GP29 operator**, conditioned on the manifest 1033-sum magic-square grammar. It also explains why many ostensibly different printed numeric B keys produce the same GP29 even-power operators. This is more discriminating than the generic theorem that any invertible centrosymmetric 5×5 GP29 magic square has 56th power equal to identity. The earlier distinct positive B′ counterexample that **changes the AETHEREAL word-cell prime value** changes B's spectrum and is consistent with the stronger word-fixed theorem here.

The source still does **not** instruct a solver to take the characteristic polynomial, eigenvalues, or a 5×5 inverse as a key for any specific unknown LP2 page, or give a full-page plaintext expectation. CHANGE already appears in solved LP1, so retrospective recognition and postselection remain possible. Existing original complete-cipher inversions by B, B², its eigenbasis and fixed per-mode arbitrary secret alphabets have failed; this new input-dependence result is a key-location finding, not a new decipherment. It suggests prioritizing **literal author-chosen word meanings, GP primes and the one-parameter magic grammar** over retuning source numerals or searching arbitrary eigenvector normalizations.

**Exact reproducible source test:** [read-only Node22 Windows CommonJS SFT](../sims/lp1_p05_wordfixed_change_spectrum_29invariant_sft.cjs), which reconstructs all thirteen rune-word prime sums from original LP1 p05 canonical rune transcription, independently verifies all original 2014 B integer cells, derives the one-parameter family, tests every source-preserving row/column/diagonal condition and every one of 29 GP residues, checks the exact integer slope348(I−J), and asserts that B², B^14, and the full GP29 characteristic polynomial are identical for every member. [Windows CI result 45077552079](https://github.com/FlareZ123/liber-primus/actions/runs/45077552079). The related generic source-class theorem and negative original eigenmode receiver are in [generic sector constraints](lp2-2014-centrosymmetric-magic-generic-sector-constraints.md) and [all-secret CHANGE receiver gate](lp2-change-eigenmode-everysecret-page-alphabet-collision-gate.md).
