# The solved 180-runic interior cannot generate p55 through a shared short GF29 recurrence

**Agent 40, 13 November 2026. Evidence class: exact, original-source key-independent architectural negative with source-shaped positive recovery.** No unknown LP2 plaintext, authentic key, intended cipher, or onward destination was recovered. The bounded conclusion below eliminates one direct way to transfer the known terminal plaintext to the 76 still-encrypted p55 symbols.

## Original-source entry point and a genuine plaintext recovery contract

The original LP2 pp49–51 numeric rectangle contains **32 rows × 8 columns = 256 two-glyph tokens**, interpreted conditionally as 256 base60 bytes. Its outer perimeter contains **76 cells** and its 30×6 inner rectangle contains **180 cells**. The last three physical LP2 pages have exactly **76 unknown p55 runes**, **85 independently deciphered p56 runes**, and **95 directly readable p57 runes**. The solved p57 text instructs pilgrims to “shed our own circumferences.” This offers a visually legible hypothesis with a powerful internal control: infer a transform from the entire known 180-rune inner message, then use the same transform to recover the complete unknown 76-cell perimeter.

The manuscript gives the numerical table and the solved GP29 plaintext, but does **not** explicitly identify the table as encryption of the final pages, select clockwise perimeter order, identify a two-dimensional recurrence, or require additive GP29 subtraction. Here these are declared hypotheses with an unusually strong nonlinguistic rejection criterion. Their geometry and source values are fixed independently of any candidate recovered p55 text.

Previous source work already rejected arbitrary stationary byte-to-GP lookup and separately additive / XOR row-plus-column masks on this exact 180-point alignment ([prior known-plaintext result](p50-32x8-interior-known-plaintext-compatibility.md), [all-secret separable masks](terminal-inner180-allsecret-rowcol.md)). This experiment is distinct because an **evolving linear recurrence** can explain full-rank nonseparable 2D key values and propagate an inner rectangle into its perimeter.

## Fixed recurrence and complete data registers

The original source table polynomial over GF29 has the independently documented factors:

- H(X)=3+26X+24X², from the signed 2013 BASE29 3301 = 3QO vector;
- G(X)=27+5X+15X², from the marked original p39 red triad;
- N(X)=11+15X+9X³+X⁴+5X⁵+10X⁶+20X⁷+12X⁸+X⁹, its unique degree-nine factor.

Each factor divides the same complete 256-byte table polynomial, an exact source relationship recorded in [the original factorization](lp2-grid-complete-gf29-factorization.md). The proposed consumer is **horizontal degree two (H or G) across every printed interior row** and **vertical degree nine (N) down every interior column**. From 180 proposed GF29 key cells, this predicts all 76 perimeter keys by backwards or forwards recurrence because H(0), N(0) and their leading coefficients are nonzero in GF29.

Use the authentic solved p56 sentence as exactly 85 GP symbols:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

Append the 95 original p57 GP symbols, without any re-encipherment. Reshape the known 180 symbols as the inner 30×6 positions in printed row-major order, and define each proposed key as `K[r,c] = (B[r,c] - P[r,c]) mod29`, where B is the source-byte interpretation. The construction and test preserve each physical printed position and do not tune phase, orientation, alphabet or words. To avoid a one-sided choice, eight **fixed controls** also consider B+P, source-supported base59 parsing, and the original printed p56 runes in place of the solved reading. The source values and geometry remain unchanged.

## Actual original-source recurrence predictions

For each row of 6 symbols, a second-order horizontal recurrence predicts its last four positions, giving **30×4 = 120 compulsory equalities**. For each 30-symbol column, ninth-order vertical recurrence predicts its final 21 positions, giving **6×21 = 126 equalities**. The table records exact agreement counts out of these totals under the same frozen coefficients:

| Radix | p56 register | Key sign | Horizontal H / 120 | Horizontal G / 120 | Vertical N / 126 |
|---|---|---|---:|---:|---:|
| base60 | solved GP | B−P | **2** | **5** | **1** |
| base60 | solved GP | B+P | 5 | 5 | 6 |
| base60 | original print | B−P | 7 | 7 | 2 |
| base60 | original print | B+P | 2 | 3 | 4 |
| base59 | solved GP | B−P | 4 | 5 | 2 |
| base59 | solved GP | B+P | 4 | 5 | 9 |
| base59 | original print | B−P | 2 | 4 | 6 |
| base59 | original print | B+P | 2 | 3 | 5 |

The primary source-natural **base60 + solved plaintext + subtractive key** candidate gives H **2/120**, G **5/120**, N **1/126**, near the uniform random background (respectively 120/29 and 126/29). Every independent variant fails overwhelmingly. A truly compatible 2D source-factor generator would give H or G **120/120** and N **126/126**, as in the planted positive control.

## Stronger result: remove *all* short recurrence keys

A priori, a different source-selected recurrence could have unknown coefficients. Test their entire linear families **without fitting any plaintext or selecting a best key**. For each of 30 rows containing 6 observed keys, any common homogeneous recurrence of order at most five must satisfy the one last-symbol equation `K[r,5] = Σ(j=0..4) a[j]K[r,j]` for the **same unrestricted secret five coefficients** `a[j]∈GF29` across every row. This gives a 30×5 coefficient matrix and its 30×6 augmented matrix. Its ranks are exactly **5 versus 6** on the actual text-derived keys. The system is inconsistent for **every possible five-tap coefficient vector**. Lower-order recurrences are nested in that five-parameter family.

Similarly, any common unknown vertical recurrence of order at most nine generates 21 equations from each of 6 source 30-symbol inner columns: 126×9 coefficients of rank **9**, with augmented rank **10**. Thus **every** shared degree-≤9 vertical recurrence fails, even if freely chosen after seeing the entire known plaintext. Remarkably, the same exact ranks `[5,6,9,10]` recur for all eight radix/register/sign readings. This is an algebraic exclusion of the specified architecture without a trained English model, arbitrary numerical cutoff, secret-seed sampling, or assumption that the table's published factor is necessarily the intended key.

The all-secret gate is strongest for a *single uniform recurrence shared across all rows or columns*. Allowing a separate completely unrelated secret recurrence on every row/column, nonlinear recurrences, a new unknown traversal or external state is a materially different model requiring its own source clue and key. It is not excluded by these matrices.

## Positive inverse and decision

The complete [single-file CommonJS reproducer](../sims/lp2_p50_inner180_to_p55_2d_recurrence_sft.cjs) asserts the original table-byte SHA-256, exact table factors, authentic 85/95 GP controls and eight original source registers. Its constructive positive creates a 32×8 source-shaped hidden 2D key: every row obeys the authentic H second-order recurrence, every column obeys the authentic N ninth-order recurrence. It encrypts the **same genuine 180 known GP symbols into the interior** and adds **76 genuine solved-p57 GP runes** as a planted perimeter message. The untouched decoder recovers all 180 known interior key values, predicts the complete 76-key perimeter by backwards and forwards recurrence, and decrypts the planted hidden p55 register **76/76 exactly**, with horizontal 120/120 and vertical 126/126 consistency. This control demonstrates a working route to unknown plaintext if the original table actually supported it.

**Decision:** Reject this natural interior-known-message → 2D GF29 short-recurrence key → p55 perimeter decryption architecture, including *all* unrestricted common horizontal order≤5 and vertical order≤9 recurrences. The condition is far stronger than the isolated failures of the H/G/N source coefficients: no hidden shared small recurrence could repair the authentic known-plaintext residuals. Do not use the physical 76/180 coincidence alone as authority to continue guessed recurrences or modify known p56 words. The 256 table bytes, two confirmed solved pages and original p55 ciphertext remain available for independently source-selected alternative decoders.

Reproduction: run `node sims/lp2_p50_inner180_to_p55_2d_recurrence_sft.cjs` from the repository root (Node.js 22). A manual-only GitHub Actions workflow [`lp2-grid-gf29-full-factor-manual.yml`](../.github/workflows/lp2-grid-gf29-full-factor-manual.yml) includes the exact SFT (new run [43347906259](https://github.com/FlareZ123/liber-primus/actions/runs/43347906259)).
