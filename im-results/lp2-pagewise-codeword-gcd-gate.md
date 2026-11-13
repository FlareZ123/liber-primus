# Complete pairwise GP29 page-polynomial common-factor gate

**Scope:** original 55 rune-bearing unsolved LP2 pages, physical pages 0–55 with runeless page 50 excluded. **Status: bounded original-source negative, 13 November 2026, Agent 43.** It does not yield plaintext, a key, or a historical decipherment rule.

## Decision

Interpreting every **complete, unedited, printed-order** physical page as a polynomial over GF(29), with the leftmost first rune as its highest coefficient, produces the following exact result for every one of the **1,485 unordered page pairs**:

| Degree of their monic polynomial GCD | Number of page pairs |
| --- | ---: |
| 0 (coprime) | **1,399** |
| 1 | **85** |
| 2 | **1** |
| 3 or greater | **0** |

The **only quadratic overlap** is physical pp27 and 48: **gcd = X²+6X = X(X+6)**, ascending coefficients `[0,6,1]`. Both original pages **end in rune F/GP0**, directly explaining the factor `X`. The other shared root is `X=23` (since 23+6 ≡ 0 mod 29), with no source instruction selecting it. Replacing only p48's terminal F/GP0 by GP1 makes the pair coprime; this is a deliberately wrong-source control and **not** a correction to the manuscript.

There is thus **no shared degree≥3 polynomial generator between any pair of complete original pages** in this fixed, source-natural GP29 coefficient convention, and no nonconstant factor divides *every* page. The observation strongly constrains a literal common-generator cyclic-code construction on full physical pages. It does **not** address chapter-wise reblocking, per-page unknown masks, symbol transformations, generator factors applied before encryption, or non-GP registers.

This analysis is separate from the existing special relation between the 256-cell table polynomial and physical p29, both divisible by `(X+5)²` under the canonical table's conditional base60 reading. This page-to-table factor relation was previously documented in `im-results/lp2-grid-complete-gf29-factorization.md`; the current test covers only pairs among the 55 ciphertext pages. It introduces no additional table-radix assumption.

## Reproduce and controls

Run the self-contained [original-corpus CommonJS SFT](../sims/lp2_pagewise_polynomial_gcd_sft.cjs). It reads the checked-in canonical GP29 rune indices, reports all 1,485 polynomial GCD degrees, verifies the unique quadratic pair and the wrong-terminal-rune control, and confirms an independent **degree-three common-generator planted positive control** survives exactly under the same algorithm.

The source coefficients are each original page's rune indices 0–28 with no inserted punctuation or page joins. There are 12,956 original runes in total. Results have no fitted cipher parameter, plaintext selection, or random seed.

**Next research choice:** a fixed higher-degree shared generator on complete page polynomials lacks the necessary exact factor. Further field-codeword proposals require a genuine source-selected different register or segmentation; the p29/table double-root coincidence alone is insufficient to generalize an all-page code.
