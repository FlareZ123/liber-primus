# The printed 32×8 numerical table's 76-cell circumference and terminal p55–57

**15 November 2026, Agent49; Agent14 source-known-key extension. Exact original geometry and two bounded all-secret decoder obstructions. No unknown LP2 plaintext, authenticated key or destination.**

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

## Direct byte-plaintext alternative on the 76 aligned source pairs

The table's numbers represent actual **0–255 bytes**, so the 76 aligned outer-ring values may alternatively act as *byte ciphertext* rather than GP29 key shifts. Use each of the 76 original p55 runes as either its GP index (0–28) or its first-party assigned prime weight (2–109), retaining the exact four physical corners and two ring directions. Apply historical direct byte XOR, byte-minus-rune, byte-plus-rune and rune-minus-byte modulo256, producing a literal **76-byte candidate plaintext** for each of **64** frozen versions. A valid straightforward ASCII message should be printable throughout.

Original-source outcome: the best candidate has only **37/76 printable ASCII bytes**, with a longest consecutive printable run of **5** bytes; the complete model range is **21–37/76 printable**. The apparent fragments are mixed with nonprinting bytes and no candidate reveals a readable URL, instruction or other source-identifiable plaintext. This separately retires direct bytewise XOR/addition between the exact p55 ribbon and the table's printed perimeter. The test counts all bytes, uses no adjustable text boundary and is included in the same runnable SFT.

## The 180-cell interior and independently solved text

The untouched table's remaining **180 inner cells** also exactly match p56 and p57's known **85+95** GP29 plaintext symbols. Those original p56 plaintext symbols were independently authenticated by the known prime-totient cipher; p57 is printed clear. To test a stronger, entirely **key-independent** hypothesis that the inner bytes encode the solved rune labels via one fixed byte→GP29 alphabet, form their printed row-major, reversed row-major, column-major and reversed column-major orders.

For each fixed register, assign every observed numeric byte to its associated *known p56/p57 plaintext* and count the minimum number of mismatching assignments across **all possible 256→29 symbol lookup functions**. An exact deterministic encoding requires **zero** mismatches, regardless of how complex the fixed codebook is. The observed minimum conflicts are respectively **47, 49, 48 and 49 of 180**. In printed row-major order, only **6/180** source byte residues modulo29 agree with their aligned known GP29 runes. Every source alternative contradicts a fixed byte→rune map at dozens of independently known positions. A planted deterministic byte→rune mapping has zero conflicts.

Consequently the appealing 76+180 geometry supplies **no direct key** and cannot explain the known inner plaintext through a static value codebook. It neither excludes a stateful/position-dependent numerical method nor proves that the inner bytes should contain GP29 plaintext. If the 32×8 table is genuinely relevant to the terminal pages, its use needs an additional source-authenticated operation that changes symbols, specifies a clock or route, and predicts original p55 plaintext.

## All-secret byte-to-keystream lookup calibrated on authentic p56 and p57 (Agent14, 15 November)

This separately tests a **key-recovery interpretation**, while the preceding 180-cell report tested a fixed byte→*plaintext* codebook. The geometric receiver hypothesis is that the table's 76-cell perimeter acts as an enciphering key for the 76 unresolved p55 runes, and that its 180-cell interior provides an adjacent known-plaintext training set, precisely the original p56 (85 GP29 runes) and clear p57 (95 GP29 runes). A human solver could plausibly use an independently solved page as a crib to learn a fixed secret table-byte→GP29 **key shift** and then decipher p55 from the outer 76 bytes.

The strongest unsupported premise is that the independently established *AN END* prime-totient cipher and the unencrypted *PARABLE* belong to a single hidden byte-to-shift table. In fact their real cipher treatments differ, and no first-party instruction equates them to the p50 table. We therefore test **every possible 256-entry unknown key lookup at once**, an optimal consistency calculation rather than a guessed decoding alphabet or wordlist.

For the 85 original p56 ciphertext runes, independently reconstruct the authenticated known plaintext by `P_i=(C_i-(prime_clock−1)) mod29`, with its **single literal F at index56** consumed without advancing the prime clock. The recovered original text romanizes exactly as `ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE`. This produces 85 known cipher shifts, one for each rune, including zero at the authentic F interruption. The next 95 p57 runes are printed clear, and therefore have known zero shifts. These are **180 original-source known byte-aligned shifts**, without any hypothesized p55 plaintext.

Read the 30×6 physical table interior in its printed row-major, reverse row-major, column-major and reverse column-major orders. For each table byte `b`, the unknown key lookup `K(b)` is unconstrained in GP29. It must nevertheless give the **same value every time the exact same byte repeats**. Minimize the number of incompatible positions over all possible 256-entry functions by choosing the most frequent observed shift independently for each distinct byte. This is the globally optimal lookup, with no search over `29^256` key tables.

| Original inner180 traversal | Minimum incompatible of all 180 | Minimum incompatible of first 85 p56 alone | p57-only conflicts |
| --- | ---: | ---: | ---: |
| Printed rows | **37** | **16** | 0 |
| Reversed rows | **29** | **12** | 0 |
| Columns | **32** | **10** | 0 |
| Reversed columns | **35** | **13** | 0 |

Every natural orientation **already contradicts a stationary byte→key mapping inside p56 alone**. In printed row order, the original inner byte 59 appears at aligned offsets11 and32 but the independently known p56 prime cipher requires shifts **7 and20**. The corresponding source witnesses for reversed rows, columns and reversed columns are bytes **52, 156 and32**, respectively, each appearing at two p56 positions with unequal required key shifts. The p57-only result is automatically zero because that page is unencrypted; it supplies no independent evidence for this table model.

**Decision:** the source's real inner180 cannot be a fixed 256-byte→GP29 additive keystream lookup giving the genuine p56 and p57 plaintext, under any of these four natural source orders. Consequently that decoder cannot transfer a recovered lookup to the original 76-rune p55 perimeter and produce authentic plaintext. The input-dependent arbitrary lookup family is excluded **without assuming** a particular byte-to-rune map, AES key, prime clock inside the table, or linguistic frequencies. A change of key per page, position-wise state, modified byte mapping, or use of p50 for a different purpose remains open only with an independent source clue.

[Original-input standalone Node22 SFT](../sims/lp2_p50_inner180_p56_phi_allsecret_keylookup_sft.cjs) asserts the byte-table SHA-256, physical 76/180 geometry, authentic p56 prime-decipherment and F skip, all four exact optimal conflicts and their contradictory byte witnesses. It plants actual known p56/p57 GP plaintext into the unchanged interior label topology under a genuine fixed secret shift lookup, and recovers **180/180** symbols. Tampering one repeated-byte key shift produces a nonzero failure. This positive demonstrates that the all-secret test can identify a true stationary lookup when present. No unknown LP2 plaintext recovered.

## Reproduce

[Original-source CommonJS SFT](../sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs) reads the checked-in 256 numerical bytes, the original GP29 ciphertext p55, original p56 original-cipher source, and solved original p57. It independently encodes the historically established p56 plaintext, asserts all five source lengths, constructs exact physical ring indices and corners, enumerates 32 fixed GP29 key paths and 64 directly plaintext-byte-producing paths, runs exact reciphering and source-positive controls, and tests the four 180-symbol unrestricted lookup hypotheses. **The complete SFT passed** against the remote repository's original sources in the connected JavaScript runtime on 15 November 2026. This is a newly recorded terminal geometry and its decisive simplest inverse gate, with **no recovered unknown page**.
