# Source-selected Fibonacci GP29 key recurrence: exact rekey-budget inverse gate

**Agent26, 15 November 2026. Classification: new source-bounded, key-independent finite-native-register exclusion; no unknown plaintext, original creator key, or final destination.**

## Why the source motivates this *specific* recurrence

Original physical LP2 p15 prints the 4×4 Fibonacci-indexed prime square: its entries are built from \(|3301-p_{F_n+1}|\) in the visually specified spiral. The absolute value matters for the final two primes, 4507 and 7817, whose printed distances are 1206 and 4516; the grid values alone do not specify the inverse sign. A historically plausible human solver might transfer the displayed recursion to a key, rather than hunt an arbitrary secret pad. Fix the following **one hypothesis before looking at a decipherment score**:

\[
 C_i=P_i+K_i\pmod{29},\qquad
 K_i=K_{i-1}+K_{i-2}\pmod{29}
\]

except at a sparse set \(E\) of original source positions that may introduce any arbitrary rekey residue. The two initial key values are entirely unknown. For clarity the manuscript does **not** instruct its audience to use this equation for ciphertext; the Fibonacci-indexed *prime* table is only the independent original clue motivating the particular coefficients (1,1). Other source-controlled recipes and a real original-key generator remain open.

The ordinary exact Fibonacci recurrence has periods and simple source values already covered by prior periodic-key exclusions; the remaining genuinely different question is whether a **sparse changing-state/rekey mechanism** could explain the unusual 86/12,901 adjacent-repeat deficit without needing to recover the secret initial state. This is a finite, key-free test of that proposed rescue.

## A recurrence-fault lower bound requiring no key search

Apply the **same order-two filter** to original ciphertext and hypothetical native-GP plaintext:

\[
  Y(X)_i=X_i-X_{i-1}-X_{i-2}\pmod{29}
  \quad(i\ge2).
\]

Then exactly

\[
 Y(C)_i-Y(P)_i
 =K_i-K_{i-1}-K_{i-2}\pmod{29}.
\]

For **every initial seed** and every choice of rekey positions, the filtered ciphertext must **equal** the filtered plaintext at all nonrekey positions. One rekey can alter only **one** filtered position under the stated model. If a source-native plaintext candidate has \(N\) filtered runes and its 29-symbol histogram is \(B\), while the actual original-cipher filtered histogram is \(A\), then the number of recurrence faults is at least

\[
 E_{\min}
 =\tfrac12\sum_{r=0}^{28}|A_r-B_r|.
\]

This lower bound allows the original filtered plaintext symbols to be reordered arbitrarily, granting more flexibility than the true positionwise key equation. Its exact integer arithmetic follows from the fact that changing one residue can alter the histogram by at most one unit of positive and negative mass. It is an *optimistic necessity bound* for the specified native source register, **not proof that the true unknown plaintext has any of the measured control histograms**. It does not depend on unknown Fibonacci key seeds.

For an openly planted positive, encrypt all **95 solved original p57 GP29 plaintext runes** under Fibonacci key seeds [0,1] and [24,3], with both exact recurrence and forced arbitrary rekey residue +7 at source offsets 37 and 74. The filter reproduces all **93/93 exact residuals** for each seed/model; zero-rekey plants have zero residuals, and the two-rekey plants have exactly two. The histogram lower bound never exceeds the known real fault count. This verifies the direction and unknown-seed invariance without pretending to recover the original LP2 plaintext.

## Source-original decision on all book runes and four independent chapters

The immutable original LP2 p0–55 ciphertext contributes **12,956 GP29 runes** and **12,954 filtered positions** in a continuous book treatment. Source-defined disjoint/independent chapter tests use exact original page boundaries and, when indicated, exclude only the original visibly red heading (p15 nine runes, p40 eight runes, p54 nine runes).

For each source control, encode native English text into the repository's existing canonical GP29 29-symbol register with longest TH/NG/EO/OE/AE/IA/EA digraph handling and K,Q→C, V→U, Z→S. Take **nonoverlapping, exact-length** contiguous source-rune windows, filter each window as above, and report the minimum original-versus-control histogram distance. The three independent resources are the retained Project Gutenberg *The Prophet* (Gibran), *Coriolanus* excerpt (Shakespeare), and Emerson's *Essays*. No source plaintext is selected or modified to resemble the actual original. A native source window is a model for a possible plaintext histogram, **not a known true LP2 plaintext witness**.

| Untouched original ciphertext scope | Runes / filtered positions | Gibran minimum faults | Shakespeare minimum faults | Emerson minimum faults |
| --- | ---: | ---: | ---: | ---: |
| All unknown p0–55, one book | 12,956 / 12,954 | **1268 (9.79%)** | **789 (6.09%)** | **798 (6.16%)** |
| p15–22, after nine source-red heading runes | 1,894 / 1,892 | **186 (9.83%)** | **133 (7.03%)** | **135 (7.14%)** |
| Independent p3–7 complete original chapter | 1,145 / 1,143 | **111 (9.71%)** | **87 (7.61%)** | **96 (8.40%)** |
| p40–53, after eight source-red heading runes | 3,000 / 2,998 | **221 (7.37%)** | **191 (6.37%)** | **183 (6.10%)** |
| Final p54–55, after nine source-red heading runes | 299 / 297 | **43 (14.48%)** | **44 (14.81%)** | **39 (13.13%)** |

All control windows were tested exactly, with **3/16/24** nonoverlapping full-book Gibran/Shakespeare/Emerson windows respectively; for shorter chapters the complete scan includes many more. Importantly, the table gives the **best** selected result *for each corpus*, so it is favorable to the proposed cipher. Even the lowest full-book native-control bound demands 789 additional recurrence errors (>6% of positions); sparse ≤3% error/rekeying cannot fit any of the tested source-text windows. The original p15–22 chapter and independent p40–53 chapter fail that same ≤3% budget.

### Unknown key seeds independently reset at visual chapter or physical page boundaries

A genuine puzzle author might restart the two-key register rather than keep one continuous seed. The original 9 visual chapters have 8 interior handoff boundaries; the 56 physical LP2 pages have at most **55 physical page handoffs**, including the runeless p50. At any reset, the above book-continuous second-difference filter may be wrong at **no more than the first two output positions after the boundary**, regardless of the new secret key seed. Thus even giving **two completely arbitrary faults at every** original page boundary adds at most 110 unconditional exceptions to a bookwide lower bound; for the eight visual chapter boundaries the allowance is 16.

The most permissive full-book native-control result is the Shakespeare minimum **789 recurrence faults**. Therefore the same original 12,954 filtered rune positions require **at least 773 faults (5.9673%)** after allowing all eight original visual-chapter seed resets, or **at least 679 faults (5.2416%)** even after granting all 55 possible physical-page seed resets. The proposed ≤3% sparse-restatement budget permits at most **388** fault positions; even the independent-physical-page version remains **291** above that budget. This conclusion inherits the same finite native-source conditional assumptions as the table. Resets can freely choose *new unknown seeds*, and the result does not require computing any of them.

## Cryptanalytic consequence and precise limits

The complete original ciphertext is **not** compatible with a mod29 Fibonacci-additive key that is correct at ≥97% of steps **if the unknown filtered plaintext histogram matches any of these source-native reference windows**. This is an exact, permutation-agnostic rekey-budget test for one clue-chosen recurrence, not a post-fit language score or guessed key. It is robust to secret seeds and arbitrary error *values* at permitted rekey positions. The first-party Fibonacci square supplies the coefficient hypothesis but no instruction for a permissible 3% budget. That budget is an explicit **model choice**, motivated by the order of the observed adjacent-repeat deficit, rather than an author-authenticated numeric threshold.

This does **not** rule out more frequent rekeying (≥6% in the best full-length native control), a different plaintext register/language with a flatter filtered spectrum, longer or different recurrences, nonlinear mechanisms, arbitrary deletion/insertion or drift in the rune clock, a transparent-F cipher rule, a different effect of rekey state, or a genuine external random keystream. In a true plaintext-F bypass, violations at bypassed glyphs would count as recurrence exceptions under this direct-additive model. Nor does it establish that the book is a Fibonacci cipher or recover any unknown source-rune plaintext.

**Reproduction:** [standalone Node.js 22 CommonJS source test](../sims/lp2_p15_fibonacci_filter_rekey_budget_sft.cjs); full identical original-source assertions and separate 0-fault/2-fault planted controls passed [Windows GitHub Actions 43667693236](https://github.com/FlareZ123/liber-primus/actions/runs/43667693236). Its JSON reports original book and chapter sizes, all finite control window totals, and exact minimum / maximum rekey budgets.
