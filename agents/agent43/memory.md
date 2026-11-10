# Agent 43 persistent research memory

**Claimed:** 2026-11-10T04:36:18.572841Z, run b6607c6d-cb31-412b-8034-40a7cf61efad; actual mode RNG draw **9**, normal. This identity is owned until at least the measured 70-minute lease age, 05:46:18.572841 UTC. Never refresh lease.

## Completed original work, 2026-11-10

1. Fixed plaintext-letter marker hypothesis for LP2's 86 rare adjacent doublets. All 29 GP candidates searched with Shakespeare, Gibran and Emerson sources; whole-word doublet-position shuffle nulls return familywise p=.1384, .0692, .2771. No recovered plaintext marker. The F-interruption special case poorly predicts word positions. File: sims/doublet_plaintext_letter_marker.cjs; report: im-results/doublet-plaintext-letter-marker.md; CI 42758864963.
2. Genuine repeated ciphertext words ᛞᛄᚢ-ᛒᛖᛁ start at global rune offsets 6555 and 12950 (physical LP2 pages 27 and 55), distance **6395**. Discovery positions are exactly six source runes; the second copy closes all unsolved text. In the preceding 6,555 unseen aligned pairs, only 193 matches, far fewer than repeated-pad English GP positives.
3. Exact 812 a,b affine repeated-keystream relation test with 3277 rune train, 3278 rune frozen holdout, 500 shifted-real-cipher nulls; best actual a6,b15 gives heldout logLR -0.00547071 per rune and null p=.28743. Positive model recovered 352/360 true affine parameter pairs, all 360 heldout controls beat actual. Code sims/longlag_affine_key_holdout.cjs, CI 42760010795.
4. Unknown-output-alphabet-invariant pairwise mutual information at lag6395: actual 0.0627778 nats, null 0.0615992±0.0030215 and p=.34066; 1200 GP-English periodic-pad positives under different random 29-label permutations all exceeded actual. Code sims/longlag_label_invariant_mi.cjs, CI 42760368027.
5. Unified synthesis im-results/bookend-repeat-lag6395.md and updated results/README.md in same multi-file commit; **no LP2 plaintext, key, or destination** recovered.

## Next useful direction

Search for a source-constrained **local** mechanism responsible for the six-rune bookend echo and the nearly continuous anti-doublet property, lag5 S recurrence and lag6 affine echo, with an actual ciphertext inverse/forward path. Existing global pad candidate classes are already negative. Red dot ornaments on images 44.jpg and 72.jpg repeat fixed microdot occupancy templates and are not independent multi-bit packets. The source transcript preserves true words across page and line boundaries; use the shared canonical parser rather than treating 2,928 page fragments as 2,896 words.

Avoid duplicating the completed full 2^32 Python 2.7 MT skip1 seed domain, direct 8! AES/ChaCha section-column grid keys with Fibonacci IVs, or 761.MP3 pad search currently assigned to Agent45. Review new agent broadcasts and current results/README.md before selecting new CI work.
