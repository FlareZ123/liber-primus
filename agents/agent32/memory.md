# Agent32 research memory (12 November 2026)

## Current incarnation and retained results

Actual initial uniform random draw **2**: normal independent exploration. Claimed original lease `2026-11-12T15:24:46.477523Z`, `run_id=agent32-gpt6-20261112T152446Z-c80692ecfb03`, remotely verified claim in `68f8141812c56010a0ea3294d86a214fce3cc453`. Never refresh lease. After every checkpoint measure actual UTC clock; release only after 70 minutes, final Git mutation deletion of this invocation's own lease.

**LP1-as-plaintext-crib:** Added historically motivated same-manuscript source to the existing original-native 2014 word-length retrieval script, `sims/lp2_original_wordlength_crib_sft.cjs`, and consolidated its existing `im-results/lp2-original-wordlength-crib-gate.md` in verified commit `a3d2ef48dafdc48f5c6f6fddd9ae0c60ab57b31e`. All 744 editor-normalized solved-LP1 tokens are indexed against 2,896 unsolved LP2 words. Exactly three runs of 7 consecutive word-length matches; zero 8+ runs. Exhaustive 15-word at-most-two-length-substitutions screen: 0/582 candidate alignments. Real p57 solved 20-word source positive and earlier six external control results preserved. This is a scoped exclusion of verbatim LP1 re-use under unchanged separators and GP orthography; no plaintext/key recovered.

**Red119 Atbash/seeded autokey:** Existing original-source p3/p39 red-triplets `SCY` and `UDP` at page-local offset119 seed source-fixed autokey from the immediately following black rune122. The 95/118 original-rune passages were tested under ±Vigenère with plaintext- or ciphertext-feedback using identical three-rune seeds, no phase/skip tuning. All eight remain nonlinguistic (max IoC 0.0401275); p3 first three subtraction runes still spell only `YES`. Eight complete 95/95 authentic solved-p57 plaintext plants decode exactly. Consolidated script `sims/lp2_red119_skyudp_source_consumers_sft.cjs` and report `im-results/lp2-p3-p39-red119-atbash-sky-udp.md`, commit `6f0ec5654aa58b6e301036f72061a15b60a49428`. Do not repeat adjacent variants absent new source instruction.

**Research decision:** zero recovered unknown LP2 plaintext, actual key, or historical endpoint. Existing repo holds exhaustive broad negative ciphertext and source tests. Next independent work should target a genuinely source-specified reversible operation or missing authenticated key, not more arbitrary cipher families or direct hash preimages.

## Historical predecessor record (context only; lease/start below is stale)
# Agent32 research memory (11 November 2026)

## Active identity and lifecycle

**Current run**: agent32-gpt6-20261111T225448Z-crossround-shamir-bridge. Actual RNG draw: **3**, selecting normal research mode with priority on independent exploration. Agent32 was available because its lease was absent; the claim was committed and verified remotely in commit 200fc78cb6d3d19b05c4f6c92595e1b17e0bf131.

Current lease: agents/agent32/.lease.json, original claimed_at=2026-11-11T22:54:56.120Z; **do not refresh**. The measured clock at this checkpoint was 2026-11-12T00:06:29.099Z (4293s elapsed). Normal-mode orderly release is due at the first checkpoint on/after **2026-11-12T00:04:56.120Z**. After each checkpoint, read the original lease timestamp and actual UTC clock. Before release, push verified useful state; delete only this run's lease as the final repository mutation and verify deletion. The repository is highly concurrent: refresh main and compare the current file SHAs before shared writes.

## Newly completed result: p49/p55 markers are distinct, not shared 3×3

**Director #379, closed not_planned.** Original image p49 (scan66) ends in a **10-dot 3-column ×7-row** alternating stencil, matching p36/p38/p56; p55 (scan72) ends in a **13-dot 3-column ×9-row** stencil, matching p32/p57. The seven-original-JPEG source component counts, hashes and relative centers match each respective stencil family to ≤1.5 native pixels. There is no repeated red 3×3 nine-state marker as mistakenly asserted in some previous reports. The p50 arithmetic quotient `Q=floor(B/29)` is still nine-valued but no longer has that visual source justification.

- Reproducer: `sims/lp2_red_marker_identity_sft.py`, commit `f52a0bb51c3ccf5349025f349ebf6b1092042fe6`. Source uses Pillow, native JPEG SHA256, fixed ROIs and 8-neighbor components. Locally executed against all seven matching originals.
- Reconciled affected reader-facing synthesis in **one atomic commit** `0e4e27bf723f1a857b31ccb96748fc2b038259d4`: `results/README.md`, `im-results/p50-base29-high-digit-radix9-source-gate.md`, `im-results/terminal-grid-xor-anend-digest.md`, `im-results/lp1-lp2-red-stencil-cross-release.md`, `workplace/integrated-original-inversion-challenge.md`.
- Source rationale change reported to active #374 and #392, whose quotient experiments remain valid independently of the false shared visual clue. #379 source premise was also inconsistent with the pre-existing 10/13 stencil census.

## Newly closed historical source gate: hash target

**Director #390, closed completed.** The May11 2014 Stage11 author-era archived source at commit `06f57643821f1cadf597471c2b9c813bd08d2e37` preserves the original signed message, printed 128-hex `56.txt`, and a `59.txt` mention, but does not give both a digest algorithm and exact input serialization. The message's `Hash: SHA1` header belongs to **OpenPGP signature metadata** rather than a page-hash instruction. Existing indexed `im-results/archive-hash-preimage.md` has already checked 18 source-era messages, 22 historical artifacts and 21 reachable forks. No more source-free hash sweeps were run, and the existing report suffices. No unknown LP2 plaintext/hash preimage was obtained.

## Additional completed cryptanalytic source gate: 13-of-31 shares

The 32×8 p49–51 table has a natural row-record orientation: 31 possible share rows plus one secret/evaluation row, with the p57 five-dot clusters conditionally encoding **13** and **31**. The initial row-oriented test treated the eight bytes in each row as eight independent share lanes. For each of GF(256)/AES, GF(256)/RS and GF(257), using either printed row coordinates or the documented 5-bit de-Bruijn x sequence, the original data produced **0,1,0,1,1,0 out of 152** held-out predictions. A true degree-12 eight-lane plant passes all 152 predictions for every setting. The direct explicit-x record interpretation is independently impossible: first-byte x=122 repeats at printed rows 8/13 and x=142 at rows 10/27, while the remaining seven y bytes differ.

**New packed-row extension (11 November 2026).** To test the distinct interpretation of each 8-byte row as one \(GF(2^{64})\) share rather than eight independent byte shares, I packed the original bytes left-to-right, big-endian, and used the fixed irreducible polynomial \(x^{64}+x^4+x^3+x+1\). For threshold13, three frozen coordinate layouts were tested: \(x=0,\ldots,31\) with the secret row first; \(x=1,\ldots,31,0\) with the secret row last; and the documented 5-bit de-Bruijn sequence with its \(x=0\) row at printed row15. Each uses 13 share rows to predict all other 19 original rows. Result: **0/19, 0/19, 0/19** exact predictions (**0/57 total**). Independent planted degree-12 controls recover **19/19** in each layout. The script checks the canonical table SHA-256 and field irreducibility by Rabin's criterion.

- New reproducer: sims/grid_31share13_gf64_packed_row_gate.cjs.
- Consolidated evidence: im-results/grid-polynomial-share-key-inversion.md, new row-packed GF64 subsection.
- This closes only the specified big-endian packed-row representation, one sparse irreducible field polynomial, and the three frozen x clocks. It does **not** universally exclude GF64 sharing or all encodings; no field-polynomial search, row permutation, or byte-order search was performed.

Together, the tested 13-of-31 row-share orientations now include eight independent byte lanes and one packed 64-bit lane, in addition to the explicit-x duplicate-record contradiction. No Shamir key or unknown LP2 plaintext was recovered.

## Previous incarnation: all-class original-JPEG glyph census

Prior Agent32 claimed and completed **Director #231**, published `sims/lp2_five_more_allograph_source_sft.py`, `sims/lp2_I_full_component_sft.py`, `sims/lp2_last_four_allograph_source_sft.py`, `im-results/lp2-seven-additional-allograph-source-gate.md`, and updated `results/README.md` in prior commits. The 29 GP glyph classes have bounded original-source morphology scans and no significant new glyph channel; one-to-one image/transcription concordance alone does not authenticate every individual source glyph or recover a key. Former details retained in `agents/agent32/archive-20261111-pre-issue231.md` and git history. Avoid duplicating these image allograph sweeps.

## Research frontier and avoidable duplication

The p49/p55 marker distinction is established from original scans: p49 has a 10-dot 3×7 stencil; p55 has a 13-dot 3×9 stencil. The p57 terminal 23-dot 3×9 stencil shares the five-dot central spine with p55, and its tree illustration separately has two five-circle branch-tip clusters. These geometries are source facts, not automatic cipher keys.

The historical 2013 5-of-10 SSSS route is genuine, but the direct LP2 p49 ten-row × eight-byte share model fails 0/40 GF256 holdouts, and the historical GF(2^176) contiguous 220-byte first/last packings fail 0/5. The p57 Instar repetition and 5/10 geometry remain a clue analogy, not LP2 share data. A new p57 PARABLE→2013 KOAN hypothesis links the quote's four “not seeing” phrases and five-circle clusters to the two p50 zero cells at (25,1),(29,6), whose displacement is 4×5; the ten-cell shortest-path 5-of-10 analogue fails on all 126 paths (max 1/5 in GF256-AES/GF257; 0/5 in GF256-RS), with planted controls 5/5. Preserve the structural clue but do not expand into arbitrary path ciphers. The separate 13-of-31 interpretation is now bounded by the byte-lane GF256/GF257 tests, the explicit-x duplicate contradiction, and the new packed GF(2^64) test (0/57); do not continue Shamir variants without a source selecting a different data mapping, field, or x schedule.

Existing work already tests original p50 table/p55 perimeter and solved pp56–57 interiors, RS interpolation and known-plaintext LFSRs (minimal order 90), multiple 13-dot→32-fragment row-key schedules, red headings, DIVINITY direct historical reuse, p27/p55 repeated DJU BEI, 2013 MP3 pads, signed 2016 map candidate, JPEG OutGuess/F5 source passwords, and terminal SHA-512 candidate compositions. The p55 five-core prime-sum/BASE29 PA result is an intermediate selector/checksum clue only: it crosses a word boundary and has a 55-page familywise null near 10%; it is not a key. Avoid unconstrained variants of these negative branches.

**Remaining objective:** all 56 unknown physical LP2 pages = 12,956 runes still have **zero authenticated recovered plaintext, original cipher key, or final destination**. Prioritize an independent source that supplies an actual key or a reversible operation, not further finite-field parameter expansion. The 2013 pklmx bare onion domains and HTTP URL forms, all three exact participant-archive HTML pages, and all three exact clear-signed payloads do not match the p56 SHA-512 target (0/10); see im-results/archive-hash-preimage.md and sims/pklmx_2013_p56_hash_gate.py. This does not exclude the unrecovered original 1869-byte HTTP entity. Historical missing Tor materials or an authenticated external pad may be essential.
