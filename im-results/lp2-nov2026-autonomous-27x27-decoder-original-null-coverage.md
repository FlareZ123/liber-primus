# November 2026 external 27×27 autonomous decoder: source replay, null controls and ciphertext coverage

**Classification: conditional reproducible English path, unverified plaintext recovery.** The November 2026 publicly released 27×27 C++ decoder reproduces its claimed 39-block English reading from the exact original LP2 p0–p2 GP29 matrix with no plaintext provided on the command line. An independently implemented replay checks each of the 118 reported rune subtractions against the canonical source corpus. The proposed path remains underdetermined as an author-intended solution: its transition grammar was developed after the candidate wording was known, it has no independently supplied 39-step selector, and it does not decrypt all the ciphertext in those pages.

## Frozen source and executable

- External source: [2retooz270703's public decoder](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/1f952dc948948bcd2bea4d5e5a61ba6175b501ec), pinned commit `1f952dc948948bcd2bea4d5e5a61ba6175b501ec`, distributed in `liber_primus_decoder_cpp.zip`. ZIP SHA-256: `39c6364e5f1a23d685690bbea40089c6837b76296cba6b333c2c80fb3312430d`.
- Exact external `matrix.txt` SHA-256: `6af045fd328a4cc17c177564b6fa7ad589d68d0916b04e8df35f9cd7a61e0c34`. Each one of its 729 symbols, after converting alias spellings S/Z, C/K, U/V and IA/IO to the canonical GP transliteration, equals the first 729 physical p0–p2 runes in [the original reference corpus](../resources/liber-primus/lp2-corpus.json) (262+266+201).
- GitHub Actions compiles the pinned unmodified `decode.cpp` under C++20 against its bundled English frequency dictionary, then executes `decoder-external matrix.txt --top 1 --trace`. [Controlled original/160-null run](https://github.com/FlareZ123/liber-primus/actions/runs/44950300807) · [full trace and independent canonical replay](https://github.com/FlareZ123/liber-primus/actions/runs/44950969529) · [frozen workflow](../.github/workflows/agent11-2026-autonomous-decoder-null.yml).

## What the program actually recovers

The original run reports **87,115 admissible openings with dictionary words** and a best-ranked **39-block, 118-GP-rune** reading (score −117.143145), beginning `AS I GO THE` and later proposing directions to the east of a map. The trace lists for each block a 3-rune node, a key triple, selected ciphertext coordinates and decoded runes. Independently rereading the canonical p0–p2 original corpus confirms **118/118 exact `(cipher−key) mod29` rune equations**, a concrete reversible mapping. For 28 of 39 blocks, the reported key follows the forward-order center-totient and Möbius/totient phase construction. Ten blocks use the unchanged center rune in the forward order. **Block36, “DO,” requires reversing the outer node ordering**; applying the forward-order construction alone does not yield its reported key. These are executable choices that an independently authored operation must select without inspecting English output.

The path has **118 ciphertext-cell uses across 106 distinct source positions**, so 12 uses revisit earlier ciphertext. The 39 key-source nodes have **97 distinct positions**, of which 21 overlap the 106 ciphertext positions. Thus only **182 distinct positions of the 729-rune original matrix are accessed at all (24.97%)**, and **623 original ciphertext positions are never decrypted**. The output is a proposed message along a sparse route through p0–p2; it is not a full plaintext of these three pages. The [self-contained trace verifier](../sims/agent11_2026_autonomous_decoder_trace_sft.cjs) checks every original subtraction, key mode, reversal, canonical source symbol, and count, with hashes of the ordered ciphertext and node coordinate lists.

## 160 token-inventory-preserving controls

The same binary, dictionary and decoding rules were executed without re-tuning on four separately seeded source permutations, all retaining exactly the **same 729 GP rune symbols**:

| Control family | Cases | Finished-search depth range | Cases reaching the default depth-128 ceiling without termination |
| --- | ---: | --- | ---: |
| Whole-matrix 729-cell shuffle | 64 | 11–21 (62 cases) | 2 |
| Row-order permutation | 32 | 12–26 | 0 |
| Independent cyclic shift of each row | 32 | 13–21 | 0 |
| Column-order permutation | 32 | 13–22 (31 cases) | 1 |
| **Total** | **160** | **157 terminate at depth ≤26** | **3** |

The actual original matrix terminates at depth **39**. All 157 normally terminating controls fall below this depth. The other three reach the program's default **depth128 limit with active branches still open** and exit status4, so their longer routes are censored, with no comparable final ranked English text. Treating those as successful meaningful 128-block readings would be incorrect; treating them as failures shorter than39 would also be incorrect. Because the word map, constraints and geometric rules were discovered on the original candidate path, these controls test the **frozen implementation's source selectivity**, not the chance that a solver would have independently discovered that implementation. The [fixed-seed SFT](../sims/agent11_2026_autonomous_decoder_null_sft.cjs) prints seeds, individual depths, censored statuses and family histograms.

## Decision for the research frontier

This candidate has stronger exact original-input substantiation than a hand-written word-crib transcript: the executable starts from the canonical matrix and its 118 rune equations independently replay. Its origin and completeness remain unresolved. Existing [temporal holdout](lp2-p0-reports07-19-temporal-holdout-audit.md) and [post-THEN selector](lp2-p0-current-postthen-selector-audit.md) audits show that the growing 27×27 transition grammar fails to choose unseen next words uniquely before language filtering; the new executable does not eliminate that limitation. The immediate decisive advance would be a **first-party instruction that uniquely selects a new, previously unexposed original node and ciphertext segment**, with predicted output, or a portable operation that decrypts a substantial untouched part of the manuscript. Do not treat a 39-block route across 106 distinct cells as a fully deciphered 729-cell chapter.
