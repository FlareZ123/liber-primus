# LP2 visual chapter map and the non-equivalent legacy nine-section cuts

**Decision, 12 November 2026, Director #461.** The original 2014 Stage11 publication specifies page files 0.jpg–57.jpg **in order**. The archived index and all 58 byte-identical original JPEGs anchor this physical order. In that order a human-visible rule identifies **nine top-level unknown chapter groups**, plus the two independently headed solved pages: **red rune heading at the start of a new physical page immediately after a red thirteen-dot terminal marker on the previous page**. Every such source-original transition conforms. This is a legitimate *candidate reading structure*, but **not an authenticated cipher key reset, plaintext or cipher inverse**.

The [source-exact CommonJS single-file reproducer](../sims/lp2_visual_chapter_boundary_sft.cjs) reads the 58-page canonical corpus and original-image-adjudicated ink annotations. It asserts all heading positions, terminal marks, 13,136 total GP runes, 12,956 unknown runes, and the precise cut discrepancies described below.

## One original-image atlas: visible order, boundaries and chapter starts

| Physical LP2 pages | Distinctive original printed features | Unknown runes | Global start |
| --- | --- | ---: | ---: |
| **p0–2** | Black cross/branch graphic, red p0 opening, p2 terminal red 13-dot | **729** | 0 |
| **p3–7** | Repeated side scrollwork; p3 opening, p6 red subheading, p7 terminal rubric/mark | **1,145** | 729 |
| **p8–14** | Repeated marginal saplings; p8 opening, p14 feather and terminal mark | **1,729** | 1,874 |
| **p15–22** | p15 nine-rune heading and 4×4 number spiral, infinity ornament, second eleven-rune red heading; p22 stave/root and terminal mark | **1,903** | 3,603 |
| **p23–26** | p23 five-dot graphic/red heading, p24–26 repeated side illustration, p26 terminal mark | **1,021** | 5,506 |
| **p27–32** | p27 red heading/leaf, unframed text pp28–31, p32 small dead tree and terminal mark | **1,433** | 6,527 |
| **p33–39** | p33 red heading, a distinct 91-rune introductory unit and second red heading; recurrent cuneiform-like symbols, p39 terminal mark | **1,680** | 7,960 |
| **p40–53** | Identical floral-border template, p40 red heading, pp49–51 256-cell numeric grid, p53 red 51-rune tail and terminal mark | **3,008** | 9,640 |
| **p54–55** | **Same floral border** but new red p54 heading immediately after p53's end marker; p55 tree/terminal mark | **308** | 12,648 |
| **p56** | Solved **AN END**, new red heading, red13 ending, no floral frame | **85 solved** | 12,956 |
| **p57** | Solved **PARABLE**, new red heading, bare tree, terminal red23 | **95 solved** | 13,041 |

Original archive images are numbered physical LP2 page + 17. For instance p32 is 49.jpg, p53 is 70.jpg and p54 is 71.jpg. Physical p50 is rune-free; its grid continues across pp49–51. No source selects an alternative page permutation.

### Frozen structural rule and retrospective held-out-page check

Training on the original pp0–53 yields **seven** source-visible page-break chapter starts: **p3, p8, p15, p23, p27, p33, p40**. They all begin with a red rubric at rune offset zero and the immediately prior physical page ends in a red 13-dot mark. Applying the same rule to later original pages selects **p54, p56, p57**, all three correctly, including the historically solved p56 and p57. This is a **retrospective structural cross-check**, since those pages were already in the corpus, not a prospective cryptanalytic prediction.

A border-change-only rule misses **p54**; the floral border is pixel-identical across physical pp40–55, yet p53 ends with red13 and p54 begins with a distinct red nine-rune rubric. A mark-only rule creates spurious top-level chapters at several intrapage red13 punctuation events. Original reading order and combined heading/terminal cues give a stronger human-solvable boundary criterion.

Important **lower-level subdivisions** are still source-visible. Physical p15 rune offset9 follows the isolated red nine-rune 4×4-grid heading and precedes the second red headed text. On p33, the first **91 runes** finish at a red13 marker and printed three-dot break; a second enlarged red heading begins at local rune91. These subdivisions are not new physical-page starts, so they are listed separately from the nine top-level chapters.

### An important nine-versus-nine ambiguity

The top-level visually selected unknown chapters have rune lengths

    729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308

and ending global offsets

    729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956

The derivative **nine text sections** used by some previous experiments have lengths

    729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316

and ending global offsets

    729, 1874, 3603, 3612, 5506, 6527, 8051, 9640, 12956

Thus the visible-chapter-only cuts are **7,960 and 12,648**; the text-partition-only cuts are **3,612 and 8,051**. The latter isolates p15's nine-rune heading, associates the first p33 91-rune unit with preceding p27–32 material across the p32 terminal and p33 rubric, and merges p40–55 across the unmistakable p53→p54 change.

**The numeral nine cannot identify these different clocks.** Previous entropy/codebook experiments using the textual nine-source sections retain their exact finite validity, but do not automatically exclude alternative operations that reset at the visually selected p54:0 boundary. Neither segmentation yet has an authenticated link to a cipher-state clock. Hypothesis testing should state which one is being used and why.

## A nine-visual-chapter shared-pad cancellation gate (Agent12, 12 November 2026)

A concrete historical use for the nine source-visible chapter starts would be restarting *the same modulo-29 additive keystream* at each red-heading chapter, as a solver might exploit key reuse to recover plaintext by crib-dragging. For any two chapters encrypted with the same key at aligned local offsets, `C_a[t]−C_b[t] ≡ P_a[t]−P_b[t] (mod29)`; in particular **ciphertext equality occurs at exactly those positions where original plaintext runes are equal**. A common unknown GP29 rune permutation also preserves this equality invariant. An independent whole-chapter constant Caesar offset changes the equality residue but cannot change the maximum over 29 pairwise residues. These are key-independent necessary conditions for the stated reused-key family.

The fixed inputs are the nine original-image chapter starts, with rune lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`, all **12,956** original GP29 rune positions, and the independently source-audited **2,896** printed full words. There are **36** start-aligned chapter pairs totaling **35,551** compared positions. On the untouched original, **1,161/35,551 = 0.03265731** positions show identical runes. Even granting every chapter pair its own favorable fixed shift, the highest achievable aggregate equality count is **1,649/35,551 = 0.04638407**.

Native-GP English controls draw complete GP-normalized words of exactly the *original* word lengths and original chapter allocation from previously pinned Shakespeare and Gibran. The 2,000 deterministic independent whole-book control tapes give **mean 0.06042218**, minimum **0.05544148**, with **zero** equal-or-lower than the original (add-one lower-tail **0.00049975**). Allowing an independently favorable fixed shift for every pair only widens the gap: control mean **0.06176697**, minimum **0.05791680**, also zero below actual original **0.04638407**. An independent random fresh GP29 key per chapter and rune recovers **mean 0.03444840** and 67/2,000 tests with equality at or below the original, showing the observed original resembles independent encrypted channels rather than reused native-English keystream. The shared-key controls and null samples preserve the coupled 36-pair dependence; treating 35,551 positions as independent Bernoulli trials would overstate significance.

A complete source-shaped positive control encrypts all **12,956** native-GP plaintext runes with one length-3,008 additive `φ(prime)` keystream restarted at each of the nine source-visible chapters. The longest known plaintext chapter recovers the full 3,008-key entries, and all nine ciphertext chapters decrypt and forward-reconstruct exactly. Thus the keyless equality gate genuinely detects the proposed shared-key construction, including long and short chapters and their original word segmentation. [Self-contained CommonJS SFT](../sims/lp2_visual_chapter_shared_pad_eq_sft.cjs) and [successful manual GitHub Actions run 43264556399](https://github.com/FlareZ123/liber-primus/actions/runs/43264556399).

**Decision:** retire the *same start-aligned additive GP29 keystream shared across all nine original visual chapters* as a route to direct native-GP English plaintext. The test cannot exclude independently keyed chapters, unknown unequal offsets, stateful cipher/key clocks, altered printed word boundaries or other language registers. The previously published [natural-section pad-reuse gate](lp2-natural-section-pad-reuse-gate.md) concerns distinct legacy text-section boundaries and one specific pair; its existing negative still stands. No authentic unknown-page plaintext/key is recovered.

## Consequence for research decisions

A contemporary human reader could locate nine physical-page chapter groups and two solved terminal units without decrypting the text. The original Stage11 link sequence fixes the 0–57 page order, and the visibly different chapter punctuation singles out **p54–55 as its own final unknown section**, with 308 GP runes, before solved p56. If a genuine historical cipher operation or key appears, this is a source-constrained candidate for where to reset it. It does **not** justify a free sweep of section-varying keys, since no chapter marker currently specifies an inverse.

### Solved-p56 prime-totient transfer to p54–55: complete literal-F gate (negative)

The source-visible p54 heading selects a natural 308-rune final unknown chapter (232 runes on p54 followed by 76 on p55). The established p56 cipher subtracts consecutive prime totients modulo29, advancing its prime counter on every rune except one literal ciphertext F at p56 local offset56. A first direct transfer to p54 local0, continuous across the p54→p55 word carry and with **no F exceptions**, scores **−7.42992633** English mean log10 quadgram, below raw **−7.36976466** and the wrong-prime control **−7.38339113**. Authentic p56 scores **−4.46164858** after exactly reproducing all 85 known plaintext runes with its one literal F.

To grant the direct transfer the same exceptional mechanism without choosing special sites post hoc, the [consolidated original-input SFT](../sims/p54_55_p56_totient_transfer_sft.cjs) now **exhausts all 64 possible literal/non-consuming F masks** on the complete 308-rune chapter's original six F positions **[41,65,195,247,257,273]**. Every mask uses the **same** original p54 local0 prime-start, subtractive sign, corpus and quadgram model, and exactly forward-reencrypts every original rune. The best quadgram output is mask7 (literal F at [41,65,195]), score **−7.26564647**, and the highest-IoC output is mask36 (literal F at [195,273]), IoC **0.03716316**. Every mask retains the identical nonlinguistic initial 41-rune prefix, beginning `DBBBBMIANGYEAOEGIBMUMXTN`, because its earliest possible skip is at offset41. The authentic solved p56 plaintext has IoC **0.07002801**.

As a separate physical-page-reset alternative, the **eight** possible masks for p55 alone (76 runes; F positions [15,25,41]) were exhaustively tested under a local prime-start at p55 offset0. Its best quadgram score is **−7.03622304** (mask0), and best IoC is **0.03859649** (mask2). Neither reveals plausible source-native prose. The page-local p55 transfer also begins with an ungrammatical prefix `LDSRYOUAEYTJEAEOE`.

**Decision:** The natural source-selected start points and **every** literal-F skip subset fail to recover plaintext under the direct solved-p56 additive prime-totient cipher. This is a finite gate on one cipher/key family with two exact start clocks; no source authenticates an F-mask selector for unknown pages, and other operators or independently supplied keys remain open. Stop expanding this family without a new author-visible key or instruction.

**Completion status (#461):** original published reading order and visible top-level chapter segmentation recovered; nontrivial page permutation unsupported; two non-equivalent top-level/derivative text clocks documented. The one fixed p56 transfer to the final unknown chapter is negative. Preserve both exact boundary sets and treat any other cryptographic application as pending an independent source-selected cipher rule.

### Sources

- [Recovered original 2014 Stage11 page index and full original JPEG manifest](lp2-stage11-original-release-index-envelope.md).
- [Source archive physical-page mapping](../resources/liber-primus/README.md).
- [Canonical 58-page rune corpus](../resources/liber-primus/lp2-corpus.json).
- [Original-image ink and punctuation annotations](../resources/liber-primus/lp2-ink-annotations.json).
- [Original LP2 visual-chapter single-file reproducer](../sims/lp2_visual_chapter_boundary_sft.cjs).
- [Exact historical derivative nine-source split used in previous anti-repeat tests](lp2-anti-repeat-lossless-capacity.md).
