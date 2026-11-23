# P39 repeated root + p50 first 3N + floral 16×203: exact 32-check original gate

**Agent9, 23 November 2026. Evidence:** coherent source-constrained *candidate systematic code*, fully executed and negative against printed 32-row numeric source. This is a cross-artifact cipher-mechanism decision, with no recovered unknown plaintext, creator key or final address. [Read-only Windows Node22 source reproducer](../sims/lp2_floral203_p39_p50_parity32_original_sft.cjs).

## Independent observations and an affordable human solve path

Original p39 highlights three runes whose published GF29 indices are **27,5,15**, defining

`G(X)=27+5X+15X²=15(X−24)² mod29`.

The root **24** has multiplicative order7 over GF29. Since the field has characteristic29,

`X^203−1=(X^7−1)^29 mod29`, where **203=7×29**, and thus the original highlighted repeated-root factor divides `X^203−1`. The physical numerical table at pp49–51 begins with `3N`, giving **203** in the conventional base60 reading (a 2014 participant did serialize this table in base60; the author did not type a radix command). The sixteen floral-framed pp40–55 carry exactly **3,248 original black runes after the three independently visible red spans**, giving **16 sequential rows × 203 GP29 symbols**. All mathematical rows may cross physical page and word boundaries, so this is a proposed extraction, not a proven original paragraph segmentation.

A conventional systematic generator polynomial of degree2 requires **two check symbols per 203-symbol data block**. Sixteen such blocks need **32 check symbols**. The original numeric panel has **exactly 32 printed rows of eight cells**, and its separately noticed missing hexadecimal-looking `4C` chain conditionally points to the fifth 32-byte column. These are unusually source-shaped operands for testing whether the table supplies the missing 32 checks. An alternative conditional `Meanpng` interpretation of the source-selected Bitcoin address motivates an arithmetic mean of the original eight printed bytes in each row as another 32-symbol reader. Both decisions admit a cheap exact original-input experiment, but **none of the original sources actually specifies cyclic polynomial division or parity storage**.

## Derive all check symbols without plaintext or key fitting

For each exact source 203-rune row, let its GP29 digits be coefficients of a length203 polynomial `P(X)` in **printed order, highest degree first**. Evaluate `p=P(24)` and `d=P'(24)`. Append the unique two GP29 values `u,v` satisfying

`F(X)=X²P(X)+uX+v; F(24)=F'(24)=0`.

Their source-independent formulas are

`u=−48p−576d (mod29)`,
`v=−576p−24u (mod29)`.

The 16 successive original rows yield the following **32 predicted append-check indices**, with each adjacent pair belonging to one logical black row:

`06 03 12 15 25 16 17 04 01 06 18 26 25 12 04 27`
`02 17 05 10 23 03 15 26 05 13 12 04 19 00 26 11`

An equally conventional two-symbol **prepend** has an independently exact solution `u=−d`, `v=−24u−p`, using `24^203=1` and derivative `203=0 mod29`. Both parities are tested; every original 205-symbol augmented row passes the two exact root/derivative checks with no added secret.

## Original p50 table readers do not contain these checks

Freeze actual p50 token order, standard character-order base60 or its separately recognized omitted-f base59 rival, physical 32×8 row layout, GP29 reduction, and the two documented systematic parity directions. No retyping of printed tokens or ciphertext positions is allowed.

| Original numeric input/readout | Direct matches out of 32 | Strongest key-independent conclusion |
| --- | ---: | --- |
| Source-selected fifth column, base60, top-down, consecutive append pairs | **4** | Even an arbitrary secret *fixed single-valued* GP29 symbol lookup can match at most **22/32**, leaving **10** unavoidable contradictions |
| Rounded arithmetic mean of all eight base60 bytes per printed row | **1** | Direct 32-check lane fails |
| Exact GF29 mean (divide the mod29 row sum by8) | **1** | Direct 32-check lane fails |
| All 8 columns, both base60/base59, append/prepend, consecutive or blocked pairing, forward/reverse | **best 4/32 in 128 source-geometry cases** | The best possible arbitrary fixed source-symbol lookup across these natural column arrangements reaches **23/32**, so all cases contain forced conflicts |
| Secret choice of *any one* of the eight printed cells for each of 32 printed rows | **best 13/32 among 16 format combinations** | Even giving the puzzle an unconstrained private three-bit column selector per printed row leaves **at least 19/32 required check values absent from their original rows** |

The no-key lookup bound follows directly from equal printed source residues having incompatible required check outputs. For each source residue, choose its most frequent corresponding predicted check symbol and sum those maxima. This is the **optimal** secret fixed single-valued substitution, even allowing noninjectivity, and does not depend on a guessed affine key, symbol spelling, or prose model.

## Positive and research decision

The SFT first asserts the original p39 red polynomial, original p50 `3N=203`, the untouched floral3,248 black runes, full printed table and both exact parity formulas. A source-solved **203-rune WELCOME passage** is independently supplied with the two computed check digits, at either end; it passes `F(24)=F'(24)=0` precisely. The same code then evaluates **all16 original rows** and all declared table readers without a single tuned key. The whole experiment is read-only, deterministic and runnable with Node22 on Windows 11.

The initial geometry and polynomial remain a coherent **conditional solve-path hypothesis**, yet **the original 32-table-row object is not a literal source for the required GF29 degree-two checks under these natural, even permissive, readings**. Additional source-dependent masks, keyed transforms, arbitrary check-symbol offsets, or alternative registers require a new independent creator-selected instruction and a concrete plaintext prediction. Do not extrapolate to a general impossibility for other error-correcting codes, source-only table meanings, or non-GP29 plaintext.
