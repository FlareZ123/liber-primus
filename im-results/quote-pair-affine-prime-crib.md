# LP2 quoted-pair structural clue and million-phase affine prime-key inverse

**Status, 10 November 2026:** a provisional quote-channel relationship, key-independent constraints on a hypothetical shared phrase, and a bounded negative test of a source-motivated cipher family. No unknown LP2 plaintext, historical key, actual mechanism, or final destination has been recovered.

## Original-source relationship

The ordinary GP-rune corpus omits printed double-quotation marks. An independent richer transcription marks **seven quoted spans containing 405 original runes**, all retained with physically correct page indices in [the compact punctuation resource](../resources/liber-primus/lp2-quote-punctuation-spans.json). Two of those quotations each contain **14 printed words**:

| Physical LP2 page (original JPEG) | Original global rune interval | Page-local interval | Complete 14-word ciphertext length sequence |
| --- | --- | --- | --- |
| **40** (57.jpg) | [9811, 9869) | [171, 229) | **5,7,2,3,4**,6,4,3,3,4,4,4,5,4 |
| **53** (70.jpg) | [12522, 12592) | [53, 123) | **5,7,2,3,4**,10,3,9,7,3,7,4,3,3 |

The common five-word prefix comprises **21 runes**. Exact word lengths **5,7,2,3,4** start at exactly these two positions among all 2,896 original unsolved LP2 words. Physical page **53** is sometimes labelled solver page 52 because the number-only physical page 50 has no rune transcript. The 70-rune quote on physical page 53 ends five black runes before the 51-rune red verse begins at local offset 128.

The relation was noticed after examining seven quotation spans. Among **five** complete fourteen-word windows of exactly 58 runes on physical page 40 and **five** of exactly 70 runes on page 53, the observed pair is the only pair with an identical five-word length prefix, **1 of 25** fixed-page/length-conditioned comparisons. This is a descriptive count, not a prospective p-value or proof of repeated plaintext.

## Key-independent constraints on a hypothetical repeated phrase

**Agent 7 extension, 10 November 2026.** The source has two 14-word printed quotations with shared five-word length prefix [5,7,2,3,4]. The shared *lengths* do not establish that their first 21 GP plaintext symbols are identical. The following are exact **necessary conditions conditional on that hypothesis**, with no authentic key or recovered unknown text.

**Any independently chosen fixed substitution alphabet.** Use the source ciphertext positions [9811,9832) and [12522,12543), retaining all 21 original GP symbols in each. A single bijection of 29 runes in each quotation preserves within-quotation equal-symbol positions, regardless of which substitution alphabet is secret. The two originals have **eight** and **four** equal-position pairs respectively, with **zero pairs shared**. Exhaustively constructing the largest subset of positions with identical equality partitions yields a maximum **14/21**. Consequently, if the two quotations really encode a common 21-rune phrase, then **at least seven underlying plaintext positions must differ** under any two independent fixed bijections. This subsumes simple monoalphabetic, Caesar and affine substitution tests for the *specific fixed-per-quote transformation* and permits every possible secret alphabet. It does not constrain word-specific or evolving substitutions.

**Any secret repeating additive GP29 pad.** Without assuming a prime generator, an actual key, or an English plaintext, a common plaintext requires the difference equation

    K[(a+i) mod T] - K[(b+i) mod T] + Delta = C_A[i] - C_B[i] (mod 29).

The script performs exact Gaussian elimination over F29 while allowing **every** unknown period-T pad symbol to vary freely, and scans T=1..29. Two clocks are checked: continuous original global offsets (a=9811,b=12522), and physical-page-local reset offsets (a=171,b=53). Delta=0 represents the same quote-wise Caesar offset; a free Delta permits independent arbitrary quote offsets.

| Pad clock | Minimum T, same Caesar offset | Minimum T, independent Caesar offsets |
| --- | ---: | ---: |
| Global rune stream | **22** | **21** |
| Physical-page reset | **23** | **21** |

For both clocks and both shift policies, **all T <= 18 are inconsistent even after deleting any two of the 21 equality equations**, which allows two genuine underlying plaintext differences at arbitrary positions. With this two-error allowance, period 19 can be made consistent in the globally continuous case, and the SFT prints minimum alterations for all candidate periods. These are exact finite modular obstructions to a *specified repeated-phrase interpretation*, not statistical evidence for such a phrase.

[The source-corpus SFT](../sims/quote_pair_generic_invariants.cjs) checks coordinates against the committed original transcription, solves the full arbitrary-bijection equality-compatibility graph, exhausts zero/one/two altered positions for each pad period, and passes separately constructed hidden-alphabet and secret-period-seven positive controls. Its source arrays and full per-period results are printed as JSON. The existing manual-only quote workflow can run it by setting mode=generic.

**Decision:** treat these quoted windows as two potentially different plaintexts until external evidence identifies a common phrase. Additional recovered-text claims based on this five-length coincidence must satisfy these necessary constraints before seeking a historical pad.

## Explicit conditional cipher challenge

If the two passages encode the same 21 GP plaintext runes up to **two arbitrary substitutions**, could they use independent offsets into the original prime-totient key present in solved LP2? Test a generous family with an unknown common invertible affine GP multiplier and arbitrary independent per-quote Caesar offsets.

In \(\mathbb F_{29}\), let \(A_i\) and \(B_i\) be the two original ciphertext prefixes and \(K_j=(p_j-1)\bmod29\), where \(p_j\) denotes the one-based \(j\)-th ordinary prime. The model requires that, for some arbitrary nonzero \(a\), constant \(\Delta\), and independent phase starts \(u,v\),

\[
a(A_i-B_i)-(K_{u+i}-K_{v+i})=\Delta\pmod{29}
\]

holds in **at least 19 of 21** positions \(i=0,\ldots,20\).

Every \(a\in1,\ldots,28\), every \(\Delta\in0,\ldots,28\), and all \(1\leq u,v\leq1{,}000{,}000\) are searched. Reversing the two phases while negating \(a,\Delta\) also covers the opposite sign of the prime key. Independent constant Caesar shifts have already been absorbed into \(\Delta\). The source's plaintext language and any conjectural quote wording are irrelevant to the search.

## Exhaustive quotient-space algorithm

Split the 21 runes into **three seven-rune blocks**. With at most two differing plaintext runes, at least one block is entirely unchanged. Remove the free \(\Delta\) by subtracting the first observation within each block. This yields an observed six-vector \(d\) and two six-vectors \(T_u,T_v\) of consecutive prime-key differences. A clean block must satisfy \(T_u-T_v=a\,d\).

Choose any nonzero component \(d_h\) and define the five-coordinate fingerprint

\[
\Pi_d(T)_j=T_j-d_j d_h^{-1}T_h,\qquad j\ne h.
\]

This exactly eliminates the unknown multiplier \(a\), as well as the additive shifts already removed. Every valid original-cipher model necessarily causes equal fingerprints of \(T_u\) and \(T_v\) in **at least one** of the three blocks. Hash all one million left starts and probe all one million right starts for each block; check every fingerprint collision directly against all 21 symbols. Recover the implied \(a\) from the pivot, and count the most frequent \(\Delta\) across 21 positions. This evaluates the full declared search space without checking its trillion phase pairs individually. All three original blocks possess a nonzero pivot.

## Original and planted outputs

| Input | Full source-phase pairs examined after fingerprint matching, including duplicate block hits | Largest agreement among 21 runes | Pairs with at least 19 matches |
| --- | ---: | ---: | ---: |
| **Original quoted prefixes** | **5,931,168** | **12** | **0** |
| **Two-error affine prime-key plant** | **6,132,066** | **19** | **2 algebraically equivalent** |

The planted cipher uses secret-to-search starts **3301** and **7900**, affine multiplier **17**, additive constants **8** and **13**, an additional seven-rune Caesar shift on the second plaintext, and unequal plaintext symbols at offsets **4** and **17**. Its recovered representations are (startA 3301, startB 7900, multiplier 17, \(\Delta=27\), **19/21**) and the equivalent swapped-sign representation (7900, 3301, multiplier 12, \(\Delta=2\), **19/21**). The source-control forward encryption is checked before search.

**Original conclusion:** no key starts within the first million primes, common invertible affine map, or arbitrary quote-wise Caesar offsets can explain these two 21-rune prefixes as the same plaintext except at two or fewer positions under this uninterrupted prime-totient schedule. The maximum original agreement is only **12/21**. This exact rejection has no multiple-testing p-value or statistical language assumption.

**Reproduction:** [Single-file CommonJS inverse with hard-coded source and plant assertions](../sims/quote_pair_affine_prime_crib.cjs); [successful manual GitHub Actions run 42831714249](https://github.com/FlareZ123/liber-primus/actions/runs/42831714249) on Node 22.

## Limits and next steps

The co-occurring word lengths are an interesting possible repeated-phrase crib; their original plaintext identity is unproven. This experiment excludes the conditional continuous prime-ordinal schedule with an arbitrary common affine output map and two plaintext exceptions. It leaves open changing/nonlinear alphabet transforms, different plaintext quotations, key-skip or feedback state, other source-derived or externally supplied keys, and unrestricted random pads. Future quote-linked decryption attempts need a separately motivated, source-fixed key generator and a new original-symbol prediction.
