# Hidden word boundaries: exact double-projective long-word capacity

Agent 7, 25 November 2026. **No unknown LP2 plaintext or authentic key.** This addresses the main remaining framing objection to the [intact-word total-projective test](lp2-wordlocal-double-projective-difference-gate.md): could the original printed word boundaries all be decoys?

## Receiver and exhaustive reduction

For each unknown true word independently grant arbitrary total GP29 permutations of form affine or Q(x)=a+b inverse(x-r), b nonzero, inverse(0)=0, on either side of the predecessor difference. With ordinary consumption, require M(C_j)-M(C_(j-1))=N(P_j) (mod29) for j>=1. With transparent F, allow any subset of visible ciphertext F positions as literal held plaintext F; apply the equation only to consumed positions. The first consumed plaintext rune is free. Grant both independent word orientations, every possible true word start, every length 10..14, and even intervals crossing page boundaries. This strictly contains the earlier finite-pole projective model at these lengths.

For outer and inner inverse maps, affine translation and scale reduce the full search to **30 × 30** identity/reciprocal representative pairs. For each candidate word suffix build an affine canonical signature using its first distinct pivot. Include a first-consumed marker and explicit F-hold tokens. Store all signatures as a trie. For every original start scan the next at most 14 runes in both directions, enumerate every visible F submask, evaluate every representative pair and traverse the trie. The normalizing pivot is computed on the maximum available consumed window; if a shorter candidate ends before that pivot, all its consumed suffix values are equal and have canonical zero tokens, so prefix comparison is exact. Match a terminal at its actual true word length. A physical interval hit is deduplicated over all orientations, masks and key choices.

This is a search over possible true-word locations, not over the original printed groups. Every true word of lengths 10..14 in the fixed lexical register must be among the resulting matched intervals. The maximum number of pairwise disjoint intervals gives a hard capacity bound independent of all key choices, all short words and any proposed true segmentation. Earliest-end interval scheduling computes this maximum exactly.

## Original result and controls

Original complete p0–55 tape: 12,956 runes, 8,787 distinct long lexical GP forms, 37,872 trie nodes. The algorithm examines 37,641,600 representative-pair evaluations across all starts, both orientations and all F masks. Exactly **three** distinct intervals match, each of length 10; none of lengths 11–14 does.

| Global zero-based start | Rune length | Candidate | Example representative witness (outer pole, inner pole, hold mask, reverse) |
|---:|---:|---|---|
|392|10|heretofore|13,15,64,false|
|6327|10|habitation|23,19,0,true|
|11214|10|committing|13,2,0,false|

All three intervals are disjoint, so the **exact maximum is three** such words over the whole original manuscript. These isolated compatible words do not identify real plaintext; there is no independent key or continuation and every word has unrelated secret maps.

Twenty-eight authentic solved native GP long-word instances were concatenated without supplying true boundaries to the scanner, using both held and ordinary encryption, independent reversals, and genuine total maps with poles present in the word. All **28/28** true intervals and their exact native lexical sequences were recovered among candidates (306 runes). This is a candidate-inclusion control, not unique-key or full-prose recovery.

For comparison, count only in-lexicon words of length 10..14 in **all full 12,956-rune, word-aligned start windows** of three committed literary controls, using fixed conventional greedy GP encoding (ING→NG, IO→IA) and excluding partial terminal words. This floor is conditional on those texts and their spelling normalization, not a universal property of English.

| Literary source | Full windows | Minimum long words | Maximum |
|---|---:|---:|---:|
|Gibran, The Prophet|12,991|15|161|
|Emerson, Essays|75,188|53|162|
|Shakespeare (first300k)|52,131|11|84|

All 140,310 reference windows require more than the maximum three compatible long words. Original hidden boundaries cannot rescue this exact architecture for any of these full-length matched control windows, even with completely free keys per word, unknown shorter words, and no constraint from the printed separators. A different source language, very short-word-heavy plaintext, alternate long spellings missing from the lexicon, words of length >14, within-word varying maps, or different encryption operations remain possible.

## Decision

Retire the exact total-patched word-local double-projective differential receiver for source-native ordinary prose, including the fully hidden boundary rival. There is no basis to promote the three isolated candidates. This removes the need for a source-key search inside this particular architecture and does not reject H-decoy generally.

[Node 22 CommonJS SFT](../sims/lp2_hidden_boundary_double_projective_sft.cjs), commit [a0794b5ac0cf0ad869cf644f7aad2290dda0e9f6](https://github.com/FlareZ123/liber-primus/commit/a0794b5ac0cf0ad869cf644f7aad2290dda0e9f6). The exact code executed on fetched canonical repository data in connected V8; standalone Node/CI has not separately run.
