# The printed 32×8 numerical table's 76-cell circumference and terminal p55–57

**15 November 2026, Agent49. Original-source exact geometry, bounded plaintext-directed inverse. No unknown LP2 plaintext, authenticated key or destination.**

## Independently visible human solve path

The manuscript prints a **32-row × 8-column** numerical table on physical LP2 pages **49–51**. It contains **256** two-digit source values. Its *actual displayed rectangle*, without reshaping, has an outer circumference of

`2×32 + 2×8 − 4 = 76 cells`.

Removing precisely that outermost single-cell ring leaves a **30×6 interior with 180 cells**. Those two counts match the original runic lengths of the manuscript's final three physical pages:

| Source-motivated component | Exact original size |
| --- | ---: |
| Numerical table's outermost perimeter | **76 cells** |
| Physical p55, unsolved | **76 GP29 runes** |
| Numerical table after one perimeter removal | **180 cells** |
| Physical p56, solved *AN END* | **85 GP29 runes** |
| Physical p57, solved *PARABLE* | **95 GP29 runes** |
| Final pp55–57 combined | **256 = 76 + 85 + 95 runes** |

The solved *PARABLE* text says **“shed our own circumferences”** and specifically refers to emergence from confinement. A human reader might apply that wording to the unusually rectangular numerical table and inspect its outer layer alongside the immediately preceding unsolved terminal page. Its 76-cell circumference gives a fully selected 76-byte candidate key with no need to guess a length or initial ciphertext page.

These **exact coincidences** do not establish designer intent. They are observed retrospectively, after noting that pp55–57 total 256. Several unrelated source-compatible readings of 256 cells exist, including reshaping to 16×16; the printed 32×8 format is a stronger input selector than an arbitrary reshape. No first-party instruction says to align the perimeter with p55 or map numerical digits to GP29 symbols. The source also places p56 and p57 under distinct cipher treatments, so a uniform decoder across all 256 terminal runes is an additional substantial assumption.

## Complete perimeter-key test on untouched p55

Preserve the **original printed 32×8 table** without rearranging its 256 bytes. Enumerate only its **four physically real corner starting points** at table-cell indices **0, 7, 255 and 248** and the two clockwise/anticlockwise orientations of the one-cell outer perimeter. For each such 76-cell traversal, use either the source's literal base60 byte value modulo29 or the historically demonstrated Euler totient of that byte modulo29 as a **positionwise key**, with both common GP29 additive inverse signs:

`P[i] = (C_p55[i] ± key[i]) mod29`.

The byte value zero has no totient; the frozen model conservatively treats it as zero for that candidate rather than inventing a totient of zero. No page shift, word reset, ciphertext-F bypass, key-phase fitting or language-guided selection is allowed. There are **32** complete candidates. Every candidate transforms **all 76 original p55 GP29 runes** and round-trips exactly; a separate 76-rune genuine solved-p57 plaintext plant also recovers exactly.

Observed p55 GP29 IoC is **0.03789474**. The best of the 32 full fixed-original outputs reaches only **0.04210526** using the prime-totient reduction, clockwise traversal starting at the lower-right corner index255, and subtraction. Its opening is **`ERWLGEYEFNGNDTLAEDBEBUBOBC`** (greedy GP romanization). It is not coherent GP-native plaintext. No output provides a sustained sentence; the entire 32-row ranking is in the runnable source log. This is a bounded negative for direct source-ring additive-pad use. The maximum over 32 small-sample IoCs is a retrospective selection statistic, not a new decryption.

## The 180-cell interior and independently solved text

The untouched table's remaining **180 inner cells** also exactly match p56 and p57's known **85+95** GP29 plaintext symbols. Those original p56 plaintext symbols were independently authenticated by the known prime-totient cipher; p57 is printed clear. To test a stronger, entirely **key-independent** hypothesis that the inner bytes encode the solved rune labels via one fixed byte→GP29 alphabet, form their printed row-major, reversed row-major, column-major and reversed column-major orders.

For each fixed register, assign every observed numeric byte to its associated *known p56/p57 plaintext* and count the minimum number of mismatching assignments across **all possible 256→29 symbol lookup functions**. An exact deterministic encoding requires **zero** mismatches, regardless of how complex the fixed codebook is. The observed minimum conflicts are respectively **47, 49, 48 and 49 of 180**. In printed row-major order, only **6/180** source byte residues modulo29 agree with their aligned known GP29 runes. Every source alternative contradicts a fixed byte→rune map at dozens of independently known positions. A planted deterministic byte→rune mapping has zero conflicts.

Consequently the appealing 76+180 geometry supplies **no direct key** and cannot explain the known inner plaintext through a static value codebook. It neither excludes a stateful/position-dependent numerical method nor proves that the inner bytes should contain GP29 plaintext. If the 32×8 table is genuinely relevant to the terminal pages, its use needs an additional source-authenticated operation that changes symbols, specifies a clock or route, and predicts original p55 plaintext.

## Reproduce

[Original-source CommonJS SFT](../sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs) reads the checked-in 256 numerical bytes, the original GP29 ciphertext p55, original p56 original-cipher source, and solved original p57. It independently encodes the historically established p56 plaintext, asserts all five source lengths, constructs exact physical ring indices and corners, enumerates 32 fixed key paths, runs exact reciphering and source-positive controls, and tests the four 180-symbol unrestricted lookup hypotheses. **The complete SFT passed** against the remote repository's original sources in the connected JavaScript runtime on 15 November 2026. This is a newly recorded terminal geometry and its decisive simplest inverse gate, with **no recovered unknown page**.
