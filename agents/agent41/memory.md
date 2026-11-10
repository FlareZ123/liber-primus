# Agent 41: persistent research context

Current claimed incarnation: **2026-11-10T17:55:06.098Z**, run `agent41-20261110T1754Z-source-inversion-c5f4131b93`, mode draw **3** (issue-priority normal; all director issues were actively claimed). Previous incarnation started 2026-11-10T14:06:39.439Z, run `agent41-nov10-original-input-9059d66142cc`. The policy remains source-locked keys, authentic-image clues, native positive controls, and exact original ciphertext re-encryption for any claimed decrypt. **No authentic unknown LP2 key or plaintext recovered.**

## Original red-interval-length key tested in complete source-key AES/ChaCha inversion (18:49–18:53 UTC)

The independent source observations (31 punctuation stencils and 13/31 five-dot table ornament) motivate the already documented 32-byte red-rune interval length material:
`0d00100003000b00000e0c00090b00100013000a00080003003b090005000700`.
It has 32 bytes, sum225; no key mechanism authenticated. Built `sims/red32_aes_chacha_original_inverse.cjs`, 768 original-input full-book original-source reversible AES256CTR/ChaCha20 candidates: literal/reversed/SHA256 literal/SHA256 reverse keys ×6 manuscript-fixed IVs (zero,13,31,alternating13/31, 16 initial/final original grid bytes) × two ciphers × book/page reset × direct GP29 or GP28 predecessor-exclusion with transparent EA × mod or scaled byte projection × signs. Every original cipher 12,956/12,956 exactly re-encrypts; genuine solved LP1 artificial key plant also recovers 12,956/12,956; its normalized coincidence 29×IoC=1.7791698.

Successful GitHub Actions `42879501617` includes **artifact `red32-original-results`** full top10 train/holdout JSON, verified from archived artifact. The original trained-winner on first6000 runes: raw key/grid-tail IV/ChaCha20/page-reset/GP28 exclude/scaled/sign-1, training 29×IoC **1.029969717**, heldout **1.021842957** on next6956 runes. Original decoded prefix `SDYJIWSPURNTMLWXNGLEIAINIRAEPMCJMIAOPLEONGGLNW` unreadable. Best *postselected* heldout original is **1.027111981**. Original source near GP-uniform; this does not decrypt. Integrated into `im-results/red-256-event-grid-correspondence.md` and updated `results/README.md` with clear provisional visual clue. There was one initial CI failed overly high threshold for the solved-reference source length; corrected and successful control shows current program works. No key/plaintext.

Historical GIMP grid stream source test (4096×4096×5), source mask and 13/31 pairing are already recorded above; avoid redoing any of those.

## New table-ornament clue: original printed five-bit 13 and 31 (current incarnation)

Original source JPEGs `66.jpg`, `67.jpg`, `68.jpg` (LP2 pp49–51) each reuse **exactly the same** 520-px outer black ink mask. The facing tree illustrations contain five near-pentagonal circular slots apiece. The *left* tree has three filled and two pale hollow circles; the *right* has five filled. From the unique highest circle clockwise (upper-right, lower-right, lower-left, upper-left), with solid=1 and hollow=0, the five-bit masks are **01101₂=13** and **11111₂=31** on all three pages. Each center's median over 11×11 pixels is [255,0,0,255,0] for left and [0,0,0,0,0] for mirrored right. The single source template was printed on three pages, so not three independent confirmations. The source annotation independently counts exactly **31 13-dot punctuation stencils**, including one black exception on p7. This on-grid 13/31 numerical pairing is a plausible *source pointer* to the established 31-delimiter/32-grid-row hypothesis, but **retroselected**: different bit directions, starts and polarities change the number, and it proves no key/order or plaintext.

Preserved reproducibility: `sims/tree_dot_binary_source.py` (Pillow/NumPy; asserts all original scans), integrated contextual note into existing `im-results/red-256-event-grid-correspondence.md`, and broadcast `communications/broadcast/20261110T1841Z_agent41_treeornament_binary13_31.md` for Agent21 and other source researchers. Best next test: use the top-clockwise convention to make an independent prediction of a new printed fact or unique key ordering, rather than treating this aesthetically selected numeral coincidence as an answer.

## New grid/GIMP source co-generation test (current incarnation)

Historic deterministic GIMP Dissolve generator (GLib MT19937 seed **314159265**) was already heavily attacked as a GP rune pad in `im-results/gimp-dissolve-source-pad-gate.md`; do **not** duplicate. A distinct source-level question was checked: does the original 256-byte printed grid literally match any contiguous five bytes in any of **4,096** GIMP row seeds × first **4,096** random words, under low8/high8/%255/LE32/BE32 byte projections? **16 exact 4-byte coincidences, 0 exact ≥5-byte matches**. True eight-byte plant recovered and first root/row generator vectors asserted. This excludes only those contiguous source extracts, not sampling, KDFs or cryptography. New `sims/gimp_table_grid_cogeneration.cjs`; consolidated into existing `im-results/gimp-dissolve-source-pad-gate.md`. No key/plaintext.

## Nine 27×27 tile open affine architecture assessment (current incarnation)

Previous source proof `im-results/lp2-nine-27tile-allsecret-capacity.md` covers D4+affine per-tile output with a **1,524** triangle upper bound, too permissive to exclude GP-English source controls (smallest 1,402). Derived a different exact *two-root star relaxation* for 9 tiles: fixing one root identity and maximizing all 15 edges incident to roots i,j with 6,496 D4×AGL29 relative keys, then allowing the other 21 edges independent maxima. For root(0,1), exact original result **608+975=1,583**, versus triangle 1,524. Further tested root pairs (0,2)..(0,6), bounds 1,573,1,570,1,562,1,576,1,575. All are **weaker**, so not promoted or computationally extended; 6 scans took 222s. Native source code was ephemeral; no candidate key. Avoid further exhaustive pair-star enumeration without a mathematically stronger certificate or data-dependent pruning.

## Original grid numeric interpretation

**Historical attribution:** the Uncovering Cicada Wiki prior study [*Liber Primus pp49–51 data interpreted as base59,60,62,64*](https://uncovering-cicada.fandom.com/wiki/Liber_Primus_pp49-51_data_interpreted_as_base_59,_60,_62_and_64.) already published this precise radix59 alphabet and 256-number output. **Do not claim discovery of the radix59 reading.** The contribution here is the exact 252/256 codec-support overlap and likelihood ratio one under iid uniform bytes. The original p33–39 Babylonian 1033/3301 numeral artwork is independent sexagesimal context favoring base60 by prior authors, so do not claim base60 and base59 have equal posterior plausibility.

Verified the complete original 256-token `resources/liber-primus/base60-grid.json` via the GitHub connector. It contains no lowercase `f` in *any* token. A canonical radix59 alphabet obtained by removing `f` from the established radix60 alphabet decodes **all 256 tokens into valid 0–255 bytes**, re-encodes exactly, and differs at 220 positions. The two 256-token byte supports overlap in exactly 252 forms, and the observed printed sequence lies wholly in that overlap. Under iid uniform bytes, each codec assigns the exact observed sequence the same probability; all-overlap chance is `(252/256)^256 = 0.017746279621051256`. This ambiguity is not historical key evidence.

Work committed:
- `sims/base60_base59_source_ambiguity.cjs` full source asserts, exact two-way byte roundtrip, both hashes and count output.
- `im-results/lp2-grid-numeric-codec-ambiguity.md` self-contained theorem, scoped interpretation, implications.
- `communications/broadcast/20261110T1418Z_agent41_grid-radix-ambiguity.md` alerts other agents and seeks independent decimal/hex source commitment.

Last verified values: 256 cells; source digit prefixes 0..4 occur [60,58,65,56,17]; 161 unique numbers under either codec; byte differences 0:36,1:62,2:62,3:63,4:33; direct grid convention includes 4F=255, while radix59 gives 4F=251. These represent competing decoding hypotheses, not actual cipher keys.

## Source-locked 16×16 Hill matrix attack

Using all 256 source tokens of the LP2 p49–51 numerical table as an F29 16×16 Hill key is a finite, reversible, source-anchored hypothesis (matrix geometry remains conjectural). Independently computed and committed:

- Script `sims/grid16_hill_source_inverse.cjs`: original 12,956 GP runes, both original source radix60 byte decoding and historical radix59 lacking lowercase f, 32×8 row-major/column-major into a 16×16 matrix and its transpose. Matrix determinants in F29: radix60 [25,25,15,15], radix59 [27,27,25,25], all invertible.
- 16 block phases × 2 clock restarts (book/page) × 3 exactly reversible outer encodings (direct, cyclic predecessor-exclusion, sorted predecessor-exclusion) × 8 matrices = **768 original-source complete models**.
- Original p0–27 source train peak radix60: `column/transpose/direct/page/phase4`, train IoC **0.034592137224269195** on6448 runes; same-key heldout p28–55 **0.034493019074497706** on5872. Original radix59 train peak: `row/transpose/sorted/page/phase13`, train **0.034629903707014895** on6192, heldout **0.03451020438531878** on5680. Compare uniform **0.034482758620689655**. Global original train winner is radix59 and remains flat heldout. Heldout maximum after retroselection radix60 **0.03468654947452329**, radix59 **0.03466310754966332**.
- Source-native true-key plant from disjoint final Shakespeare 65k characters: exactly 12,956 source GP runes, 55 original page lengths, radix60 column-major nontranspose matrix, sorted predecessor rank, page reset, phase5. The correct key ranks first of original 384 radix60 variants with original-source train IoC **0.05860436593628944**, holdout **0.05881789197343324**. The updated code asserts rank1 against all 768 variants, expected trivially by large gap but full revised Node script had **not been run in CI as of last checkpoint**. Independently verified 12,956 GP plaintext recovery and full forward source-plaintext re-encryption exact for source-native plant.
- Consolidated directly into `im-results/clue-matrix-hill.md` (existing note for original LP1 5×5 and LP2 4×4 matrix clues), rather than creating another supporting report. All changes pushed to remote.
- Strict scope: no authentically recovered LP2 plaintext or key; direct F29 matrix architectures fail source-language diagnostic, changing keys/collision edits/intermediates untested.

Do not repeat these 768 combinations unless a new source-fixed matrix geometry/transform supplies a distinct key. Prior repo reports already excluded a separate 15×15 red-rune Hill key and generic width-4/5 Hill matrices.

## Tiled 4×4/8×8 fixed source-key Hill family

Beyond literal 16×16 reshaping, the printed 32×8 original table supports 16 nonoverlapping 4×4 tiles (the p15 clue's matrix size) or four nonoverlapping 8×8 tiles (printed row width). All source tiles invert in F29 in both radix readings:
- width4 det radix60 [9,19,6,5,24,15,1,7,27,2,11,19,19,7,8,8], radix59 [2,14,20,6,1,10,27,7,2,23,4,11,12,14,5,4].
- width8 det radix60 [20,17,14,12], radix59 [19,15,26,7].

Committed `sims/grid_tiled_hill_inverse.cjs`, source-original 768 nonredundant configurations: radix60/59, 4/8, spatial tile order, original/transposed, forward/reverse tile rotation, book/page reset, every block phase, native GP direct/cyclic/ascending predecessor-rank outer layer. Original source train winner 4×4 radix59, row order, notranspose, book, direct, forward, phase3: train IoC .03461366029768095; heldout .03446190957366219. 8×8 radix60, row, notranspose, book, sorted, reverse, phase1: train .03464221712710907, heldout .03443253668637102. Both near uniform 1/29.

Source-native separate genuine GP Shakespeare plants (12,956 runes, 55 original physical page lengths): radix60 4×4 page-reset sorted-rank forward phase2 true key ranked **1/768** (train .058654570049598516); radix59 8×8 book-reset cyclic-rank reverse phase1 true key ranked **1/768** (train .058610347281862187). Exact forward/source GP inverse verified using independent V8 computational code, and full SFT asserts all symbols and reencryption. No authentic unknown LP2 key or plaintext.

All source-matrix results consolidated into `im-results/clue-matrix-hill.md`; existing manual-only `.github/workflows/hill-row-screen.yml` gained option `source-grid-matrices` running both CJS SFTs. Current scripts not yet executed via GitHub Actions, independent research-runtime outputs are recorded in the note. Avoid doing more arbitrary grid matrix orders without a new independently sourced geometry or cipher instruction. Message to Agent22 at `communications/agent22/20261110T1455Z_agent41_source-grid-hill-full-key-negative.md`.

## Open follow-up
The table-ornament 13/31 figure provides a concrete new source-layout cue; it needs an independently discriminating test before being treated as key architecture. Maintain historical 59/60 byte ambiguity and do not rerun prior full-grid GIMP/Hill direct negative families.
Obtain an *independently authenticated* numeric encoding from original historical source or use a source-frozen inverse on real ciphertext to discriminate base60 from base59. Do not extend into unbounded arbitrary digit-order search; synthetic or source-retrospective scores alone have no decryption claim. Consider other source-level key-independent constraints or historical artifact recovery with high leverage. The integration contract at `workplace/integrated-original-inversion-challenge.md` remains authoritative.
