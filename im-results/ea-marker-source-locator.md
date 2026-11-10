# Exact source-text search from transparent-EA LP2 marker locations

**Classification:** original-input, conditional source-identification negative with source-native full-inversion positive controls. **No unknown Liber Primus plaintext, key, cipher mechanism, or destination is recovered.** This is a search instrument for candidates of a known-text plaintext, conditional on the proposed zero-step EA mapping; it does not establish that mapping.

## Reversible hypothesis and necessary condition

For each physical LP2 page, define a ciphertext marker at local rune index (j>0) when the published rune equals the immediately preceding rune. The canonical 55 rune-bearing unsolved pages contain **86 markers among 12,956 runes**. Under the specific hypothesis

```text
C[j] == C[j-1]  <=>  P[j] == GP-EA (index 28), within a physical page.
```

every authentic contiguous source-text copy of length (N) must have GP-EA at **all** of those marker offsets. This test is independent of how the other 28 plaintext symbols are keyed, the secret output alphabet and the nonzero ciphertext steps. Physical page initials are excluded because they have no within-page predecessor. A negative result cannot reject another plaintext/ciphertext marker mapping, an authored or unknown text, insertions/deletions, an alternate GP tokenizer, or a source assembled from noncontiguous excerpts.

The [original-input source locator](../sims/ea_marker_source_locator.cjs) converts candidate books using the established [repository GP tokenizer](../sims/previous_cipher_sbox_invariant.cjs), exhaustively enumerates every available contiguous window, and reports the **maximum number of mandatory EA markers** satisfied. Each reference's EA positions are inverted into possible window offsets, so the search cost is proportional to reference EA count times observed markers, with no fitted key. Extra reference EA sites do not incur a penalty, making this strictly a *necessary-condition* screen.

## Original-input results

| Scope | Original equality markers | Shakespeare max matched | Gibran max matched |
| --- | ---: | ---: | ---: |
| All 55 rune pages, 12,956 GP runes | **86** | **7** | **7** |
| p0–2, 729 runes | 4 | 2 | 3 |
| p3–7, 1,145 runes | 6 | 3 | 2 |
| p8–14, 1,729 runes | 9 | 3 | 3 |
| p15–22, 1,903 runes | 10 | 3 | 3 |
| p23–26, 1,021 runes | 11 | 3 | 3 |
| p27–32, 1,433 runes | 13 | 4 | 3 |
| p33–39, 1,680 runes | 12 | 3 | 3 |
| p40–53, 3,008 runes (page50 rune-free) | 18 | 4 | 4 |
| p54–55, 308 runes | 3 | 2 | 2 |

The full checked-in Shakespeare source has **218,800** GP runes (1,633 EA). Its best complete-book offset is **169,582**, with 7/86 mandatory matches. The checked-in Gibran *Prophet* source has **63,114** GP runes (606 EA); its best complete-book offset is **5,472**, also 7/86. These maximizations consider all **205,845** and **50,159** possible full-book windows respectively. All nine section searches restart the source offset independently, which makes them a stronger, more permissive test than demanding one passage for the whole book. There is no section with all its mandatory markers.

The Gibran 3/4 near-match at p0–2 is too weak to identify a passage; it was selected from tens of thousands of source offsets and still fails one required marker. No source copy is inferred from it.

## Full-cipher positive controls

The SFT generates a **bijective** position-keyed original-page-format cipher for any GP source window:

- At each original physical page start, transmit `C[0]=(P[0]+pageIndex) mod29`.
- On subsequent positions, transmit step zero if and only if `P[j]=28`; otherwise transmit a nonzero step `1+(P[j]+(7*globalIndex+11) mod28) mod28`, cumulatively adding that step modulo29.
- The exact inverse recovers the original source GP index at every position, and the locator is given only the observable zero-step marker geometry and the reference corpus.

Independent Shakespeare source offsets 1,000, 10,000 and 20,000 generated **85, 85 and 80** marker sites respectively; all three offsets were recovered **uniquely**, with **12,956/12,956** GP runes exactly inverted in each plant. Gibran offsets 1,000, 10,000 and 20,000 generated **150, 143 and 148** markers respectively; all three offsets were also uniquely recovered and the full plaintext exactly inverted. These planted controls demonstrate that the tool finds a *true candidate book source* despite unrelated position-dependent nonzero pads when the transparent-EA assumption and source overlap are correct.

The original negative means specifically that **neither checked-in work can be copied verbatim as a whole LP2 plaintext or one of these nine contiguous section plaintexts** under this exact mapping. Both references were independently chosen project language controls. Their failure is a finite conditional exclusion, with no general inference about unknown text, unknown source books, or the actual author's cipher.

## Reproduction

Run `node sims/ea_marker_source_locator.cjs` from the repository with Node 18+; optional additional plain-text file paths can be supplied to scan new candidate books. The script reads the source-exact JSON corpus, ignores physical page 50, checks all nine physical section bounds, generates exact inversion plants, and prints all complete-book and section maximum scores with source offsets and tie counts. Its published implementation was executed against the exact remote corpus and both controls, with all six positive recovery asserts passing. No new scheduled or per-commit CI workflow is required.
