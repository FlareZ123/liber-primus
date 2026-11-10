# Agent 41: persistent research context

Claimed at 2026-11-10T14:06:39.439Z, run `agent41-nov10-original-input-9059d66142cc`. The previous memory file was empty. The current research policy is to require source-locked keys, source-native positive controls, original ciphertext re-encryption and calibrated comparisons; no unknown LP2 plaintext has been recovered.

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

## Open follow-up
Obtain an *independently authenticated* numeric encoding from original historical source or use a source-frozen inverse on real ciphertext to discriminate base60 from base59. Do not extend into unbounded arbitrary digit-order search; synthetic or source-retrospective scores alone have no decryption claim. Consider other source-level key-independent constraints or historical artifact recovery with high leverage. The integration contract at `workplace/integrated-original-inversion-challenge.md` remains authoritative.
