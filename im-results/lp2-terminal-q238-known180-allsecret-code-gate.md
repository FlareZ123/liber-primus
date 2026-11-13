# Q238 cannot complete LP2's terminal 76-symbol circumference from the 180 solved runes

**Agent 28, 13 November 2026.** Original-cipher all-secret finite-field exclusion of one source-driven completion mechanism. **No unknown LP2 plaintext, key or destination recovered.** Standalone original-input [Node22 reproducer](../sims/lp2_terminal_q238_180_76_codeword_sft.cjs).

## A concrete path from an existing table factor to unknown plaintext

The 32×8 numerical table printed on physical LP2 pp49–51 has **256 cells**. Its original rectangular circumference contains **76 cells** and its 30×6 interior has **180**. The manuscript ends with **76 encrypted p55 runes**, then **85 p56 runes already solved by prime-totient subtraction**, and finally **95 directly readable p57 runes**. The solved p57 text also explicitly says to shed one's circumferences and find what lies within. This suggests a fully source-sized 180-to-76 code completion problem if the numerical table actually describes the last pages. This suggested correspondence remains unconfirmed.

The [previous exact GF29 table factorization](lp2-grid-complete-gf29-factorization.md) identifies the **monic irreducible factor Q238 of degree 238** in the canonical polynomial whose 256 high-to-low coefficients are the table bytes modulo29. In exact arithmetic,

\[
\begin{aligned}
P(X)={}&28(X+5)^2(X^2+18X+11)\\
&\cdot(X^3+14X^2+16X+24)\\
&\cdot(X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11)Q_{238}(X)
\quad (\bmod 29).
\end{aligned}
\]

The original first byte is 203, which equals zero modulo29; the formal coefficient array retains its first zero. The new SFT divides the **actual unchanged 256 table bytes** by all non-Q238 factors and reconstructs Q238 independently from the returned quotient. Full polynomial multiplication must reproduce all 256 original byte residues. A different divisor or a language-selected generator is never introduced.

A codeword divisible by Q238 whose total length is 256 can be written **T(X)=Q238(X)A(X)** with **deg A at most17**. Only **18 unknown GF29 coefficients** exist in A. If the final 256 GP29 runes were a systematic codeword of this kind, knowing 180 interior runes would overdetermine those 18 secrets and thereby **predict all 76 outer runes**, without inspecting their ciphertext. That would provide a direct reusable mechanism for recovering p55 rather than another speculative numerical alignment.

## Natural original-source inversion and held-out failure

The 180 fixed inputs are the **real solved p56 plaintext** followed by the **real clear p57 plaintext**. The p56 inverse must include the documented single literal F interruption at local rune offset56. The SFT asserts its exact complete 85-rune output:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

It also checks p55=76, p56=85, p57=95, the 32×8 table shape, and source-byte SHA256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

Assign those 180 known GP indices, in their printed order, to table rows 1–30, columns 1–6 (both zero-based). Leave the first/last row and first/last column, exactly **76 unknown positions**, entirely unfilled. Construct the exact GF29 180×18 coefficient matrix for every possible A and perform Gaussian elimination, with no cipher key, English score or unknown p55 text used to select parameters.

| Exact original-cipher diagnostic | Result |
| --- | ---: |
| Independent GF29 variables | **18** |
| Rank of the 180×18 matrix | **18** |
| Original positions used to fit all 18 variables | **18** |
| Immediately following original known position | **Fails at zero-based interior index 18** |
| Matches among all 180 original known positions | **21/180** |
| Contradictions in the remaining 162 source-known positions | **159/162** |

The first 18 actual source positions uniquely determine A. The resulting **single possible** degree-17 multiplier gets only three further known symbols right. Therefore **no choice** of its 18 secret coefficients can turn the authentic 180 solved GP29 terminal runes into the source-Q238 codeword in this geometry. This rejects the mechanism **before looking at any p55 ciphertext**.

A positive control uses the *same actual table-derived Q238* multiplied by a separately fixed vector **A[j]=(j²+7j+3) mod29**, yielding a valid 256-symbol codeword. Applying the identical 180-input decoder recovers all 18 coefficients and all **76/76** hidden outer symbols exactly. The test distinguishes an actual codeword from the original incompatible data. No planted control symbols enter the original verdict.

## Research consequence

**Retire direct GF29 Q238 systematic coding with inner180 source-solved runes and outer76 unknown p55 runes in natural table row-major orientation.** This result tests all secret degree-17 multipliers and gives a complete original-known contradiction. Previous four-check H·G tests left 72 unknown GP symbols; unrelated GF(29²) Reed–Solomon interpolation uses different field operations, and the earlier full-terminal polynomial GCD test includes original p55 ciphertext rather than permitting an arbitrary p55 plaintext. This exact known-only all-secret gate closes a different proposed route to completing p55.

The book does not authenticate a Q238 polynomial code, a different interior orientation, a nonlinear stage or any key schedule that would rescue this false architecture. The proven full factorization of the table remains a genuine numerical observation. Future effort should prioritize an independently prescribed decoding operation or original ciphertext plaintext candidate rather than adjusting this code after its contradiction.

**Reproduce:** From repository root, run the linked self-contained **CommonJS SFT** on Node.js22. It reads only canonical repository source resources, checks the factorization and known p56 plaintext, computes exact 180-position field elimination, and verifies the 256-symbol positive control. The complete [manual-only original-source CI run succeeded on GitHub Actions, run 43380182912](https://github.com/FlareZ123/liber-primus/actions/runs/43380182912).
