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

The source locator has now been run against **four** checked-in references. The two added sources were chosen independently of the ciphertext: the author's own historically solved LP1/LP2 text and Emerson's *Essays* (which includes *Self-Reliance*, cited in historical Cicada material). Both are especially useful necessary-condition challenges because their hypothesized plaintext is source-locked before any nonzero-step cipher-key search. The original LP1 reference is editor-normalized and contains headers, omissions and some repeated explanatory lines; the checked-in Emerson fixture includes its edition's extra text. Therefore the tests apply to **contiguous GP-tokenized windows in these exact checked-in texts**, without proving that a source-edited or rearranged excerpt was excluded.

| GP-tokenized reference | Runes | GP-EA sites | Best complete-book EA anchor matches | Sections with every observed marker |
| --- | ---: | ---: | --- | ---: |
| Shakespeare (checked-in first 300k characters) | 218,800 | 1,633 | **7/86** | **0/9** |
| Gibran, *The Prophet* | 63,114 | 606 | **7/86** | **0/9** |
| Solved Cicada LP1/LP2 editor-normalized reference | **3,736** | **30** | Too short for a 12,956-rune book | **0/9** |
| Emerson, *Essays: First Series* | **324,630** | **2,224** | **6/86** (15 tied best offsets) | **0/9** |

The two large reference books have 205,845 and 50,159 possible full-book windows, respectively. Emerson has **311,675**; its best whole-book window begins at GP offset **3,217**. All 86 mandatory marker positions must match for an authentic exact source quotation under the stated reversible hypothesis, so 6 or 7 matches are far from identification.

The section-by-section scan resets the candidate source offset independently in each of the nine physical LP2 sections. The table gives the **maximum satisfied original equality anchors**, not the number of inferred plaintext letters, and maximizes over every legal source offset:

| LP2 physical section | Original runes | Original markers | Shakespeare | Gibran | Solved-Cicada reference | Emerson |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| p0–2 | 729 | 4 | 2 | 3 | 2 | 2 |
| p3–7 | 1,145 | 6 | 3 | 2 | 2 | 3 |
| p8–14 | 1,729 | 9 | 3 | 3 | 2 | 3 |
| p15–22 | 1,903 | 10 | 3 | 3 | 2 | 3 |
| p23–26 | 1,021 | 11 | 3 | 3 | 3 | 3 |
| p27–32 | 1,433 | 13 | 4 | 3 | 2 | 4 |
| p33–39 | 1,680 | 12 | 3 | 3 | 3 | 3 |
| p40–53 | 3,008 | 18 | 4 | 4 | 2 | 3 |
| p54–55 | 308 | 3 | 2 | 2 | 2 | 2 |

The first two source runs gave Shakespeare's best full-book offset **169,582** and Gibran's **5,472**; the added native-text and Emerson tests find no complete section match even though the matching rule is intentionally permissive: additional EA runes at nonmarker sites are accepted. No authentic original quote, unknown plaintext, secret key or encryption mechanism is recovered.

**Instrument correction:** The original locator skipped every source shorter than 12,956 runes, preventing any section scan on the solved-Cicada source despite its sufficient length for all nine individual sections. The same exact counted-offset algorithm now handles independent section scans even when the whole book cannot be searched. No new workflow, ciphertext-fit parameter or original-data split was introduced.

## Full-cipher positive controls

The SFT generates a **bijective** position-keyed original-page-format cipher for any GP source window:

- At each original physical page start, transmit `C[0]=(P[0]+pageIndex) mod29`.
- On subsequent positions, transmit step zero if and only if `P[j]=28`; otherwise transmit a nonzero step `1+(P[j]+(7*globalIndex+11) mod28) mod28`, cumulatively adding that step modulo29.
- The exact inverse recovers the original source GP index at every position, and the locator is given only the observable zero-step marker geometry and the reference corpus.

Independent Shakespeare source offsets 1,000, 10,000 and 20,000 generated **85, 85 and 80** marker sites respectively; all three offsets were recovered **uniquely**, with **12,956/12,956** GP runes exactly inverted in each plant. Gibran offsets 1,000, 10,000 and 20,000 generated **150, 143 and 148** markers respectively; all three offsets were also uniquely recovered and the full plaintext exactly inverted. These planted controls demonstrate that the tool finds a *true candidate book source* despite unrelated position-dependent nonzero pads when the transparent-EA assumption and source overlap are correct.

The original negative means specifically that **neither checked-in work can be copied verbatim as a whole LP2 plaintext or one of these nine contiguous section plaintexts** under this exact mapping. Both references were independently chosen project language controls. Their failure is a finite conditional exclusion, with no general inference about unknown text, unknown source books, or the actual author's cipher.

## Reproduction

Run `node sims/ea_marker_source_locator.cjs` from the repository with Node 18+; optional additional plain-text file paths can be supplied to scan new candidate books. The script reads the source-exact JSON corpus, ignores physical page 50, checks all nine physical section bounds, generates exact inversion plants, and prints all complete-book and section maximum scores with source offsets and tie counts. Its published implementation was executed against the exact remote corpus and both controls, with all six positive recovery asserts passing. No new scheduled or per-commit CI workflow is required.
