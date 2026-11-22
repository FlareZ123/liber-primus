# CHANGE eigencoordinates: every-secret mode-alphabet collision obstruction on original LP2

**Agent34, 22 November 2026. Original-input, reproducible, conditional exclusion. No unknown LP2 plaintext, authentic author key, or final destination recovered.**

## Plausible source-led route and the missing instruction

The authentic 2014 1033-sum five-by-five square B is independently embedded in the original solved LP1 p05 as a numeric/rune grid and byte-reversed JPEG hex trailer. Its five distinct GP29 eigenvalues are the *unordered* rune values for CHANGE, which is already printed in solved LP1's warning. See the [source square extraction](../results/lp1-p05-embedded-matrix.md), [matrix spectrum](lp1-p16-order56-pagepower-gate.md), and [seven-to-five historical matrix relation](lp2-2014-two1033-squares-frobenius-trace-change-original-gate.md).

Earlier direct change-of-basis attempts with one canonical eigenvector normalization gave ciphertext-like outputs. A serious rival is that the original five eigenmodes carry **independently substituted alphabets**, possibly one new set per physical page. Rather than pick another secret ordering or guess a normalization from apparent English, this experiment eliminates *every possible alphabet bijection within that architecture* with one key-independent statistic.

Historically, the Stage10 squares were to be submitted as numerical answers along with a participant-owned hidden-service URL. The surviving first-party instruction does not prescribe a CHANGE eigenmode inverse, five-symbol reading order, or LP2 receiver. The test therefore treats this as a **conditional architecture**, not an authenticated creator operation.

## Complete source algebra and exact theorem

Read the full original B1033 5×5 integer matrix and reduce it mod29. Use the first-solved LP1 word CHANGE only to name the five eigenmodes [5,8,24,21,18]. Normalize each right eigenvector at its first nonzero coordinate, resulting in:

    V = 1  1  1  1  1      V^-1 = 15 25  0  4 14
        0 24 11 18  1              1  5 17  5  1
        0  8  0 20  1              0  4  0 25  0
        0 24 18 18  1              8 18  6 18  8
       28  1 28  1  1              6  6  6  6  6

The SFT reconstructs both matrices from B's original integers using GF29 elimination, checks B times each eigenvector, and checks the inverse exactly. For each consecutive original five-rune ciphertext block C, define the five eigenmode coordinates X = V^-1 C mod29.

Grant **every possible secret bijection on 29 symbols** separately for each mode, and a different set of those five bijections for **every original physical page**. Also grant an arbitrary fixed ordering of the five modes per page. This contains all 29! monoalphabetic substitutions per mode, including all unknown eigenvector scales, GP29 affine shifts, and original-word-anagram orders. For chapter-continuous reading grant one set per whole chapter instead.

For each source group g (page or chapter) and each mode k, let h(g,k,x) count occurrences of rune index x among that group's mode coordinates. Define:

    T = SUM over groups g and modes k and values x=0..28
        of h(g,k,x)*(h(g,k,x)-1)/2

**Theorem.** A bijection on the 29 symbols merely relabels the 29 frequency bins, so it leaves every term sum over x unchanged. Permuting the five mode columns in a whole group only reorders those five sums. Thus **T is invariant under every secret alphabet bijection and mode-order key in the declared model**, regardless of how those keys were selected. Any genuine GP29 plaintext in this model must have exactly the original ciphertext's T. No secret keys are enumerated or learned.

The two physically reasonable original clocks are frozen: (i) reset every page and use complete five-rune blocks starting from each page's literal first rune, leaving fewer than five trailing symbols outside the statistic; (ii) use complete five-rune blocks over each intact illustrated chapter. The source physical page p50 is genuinely rune-free.

## Original-source and native-GP evidence

Source inputs: the three genuine squares in the repository's historical 2014 OpenPuff file; canonical original LP2 page-index corpus; and source-independent Shakespeare, Gibran and Emerson literary plaintext controls. The controls use the same published GP29 transliterator as earlier original-vs-English gates, including QU to CW, K/Q to C, V to U, Z to S and greedy original digraphs.

The first original receiver is **p33–39**, the 1,680-rune cuneiform chapter. A wholly disjoint botanical **p40–53**, 3,008 runes over 13 nonempty pages, is the holdout. Take native GP donor windows at original lengths and offsets 0,137,274,...; the page-reset control preserves each exact original page length.

| Complete receiver / reset | Source runes counted | **Actual source T** | Gibran native minimum | Shakespeare native minimum | Emerson native minimum |
|---|---:|---:|---:|---:|---:|
| p33–39, per-page independent mode keys | 1,665 | **1,398** | 2,232 | **2,087** | 2,229 |
| p40–53, per-page independent mode keys | 2,980 | **2,511** | 4,256 | **4,068** | 4,298 |
| p33–39, chapter-continuous mode keys | 1,680 | **9,756** | 16,288 | **15,607** | 16,481 |
| p40–53, chapter-continuous mode keys | 3,005 | **31,187** | 52,897 | **50,765** | 53,826 |

Sample sizes for p33–39 were 449 Gibran, 1,585 Shakespeare, 2,358 Emerson windows; for p40–53 they were 439, 1,576, 2,348. **Every independently sourced native window has more within-mode same-rune pairs than the original eigencoordinate stream**, even with page-by-page keys. These are finite, overlapping literary controls, **not** a proof excluding all imaginable ordinary English passages. The exact source measurements and the all-secret invariance theorem are independent of the native corpus selection.

### Complete native positive plant

For both original source page-size registers, the SFT takes genuine Shakespeare GP plaintext, applies a separately seeded nonzero affine rune bijection for each source page and each mode plus an independently changing cyclic fixed-mode permutation on every page, and encrypts it through the actual historical B eigenbasis. The complete source-length planted plaintext is recovered **exactly**, including every partially filled page tail. The key-independent T of planted ciphertext's eigencoordinates equals the original donor plaintext T **exactly**. This checks the intended key family, state resets, matrix arithmetic, exact forward replay, and alphabet collision theorem without fitting unknown manuscript text.

**Reproducer:** [standalone Windows 11 / Node.js 22 CommonJS SFT](../sims/lp2_change_eigenmode_allsecret_collision_sft.cjs), no external dependencies. [Original-source full-run Windows CI PASS 45075404513](https://github.com/FlareZ123/liber-primus/actions/runs/45075404513). Manual dispatch only, at .github/workflows/lp2-change-eigenmode-allsecret-collision-sft.yml.

## Research decision and scope

**Retire** ordinary GP29 plaintext readings of five physical B1033 eigenmodes under independently fixed per-mode single-rune bijections, even with an unlimited secret monoalphabet per mode and per page and an arbitrary ordering of modes per page. Fitting another eigenvector scale, CHANGE-anagram, or arbitrary alphabet cannot change the observed deficits. This materially narrows which alleged CHANGE mechanisms could unlock the book.

The theorem does **not** exclude: a mode permutation that changes *within* a page; cross-mode mixing; plaintext-symbol insert/delete/transparent-F skip; nonlinear feedback; compression or a different plaintext language; five-rune packets whose phase changes; or a distinct role for the historical square. These require an independent source clue and a new executable state/mixing operation. No current first-party text selects such an operator or a target section. The historically documented Stage10 square-submission exercise is an independent adequate explanation for B's presence.

**Missing authored step:** identify a genuinely source-selected operation that turns this source square into a typed LP2 decoder or key, rather than merely another reversible mathematical factorization. Direct pagewise eigenmode substitution cannot produce the tested class of native prose, regardless of its secret alphabets.
