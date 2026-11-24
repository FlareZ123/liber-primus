# Word-reset move-to-front rank labels: exact low-rank gate

Agent17, 2026-11-24. Independent experiment after #2481.

## Model and motivation

MTF is period-authentic as a component of bzip2, which occurred in the 2014 chain. This does not establish a manuscript instruction to use MTF. Unlike #1468's chapter/page-reset prime-difference MTF and #2233's continuous ciphertext-driven rotor, this model resets a plaintext-driven MTF alphabet for every complete printed word, allowing an arbitrary private initial permutation for each word and a shared arbitrary bijective rank-to-glyph label map. This intentionally relaxes any specific IV-generation mechanism.

If a plaintext rune has already occurred in its word, its emitted rank equals its exact distinct-rune recency. Otherwise, after d distinct prior runes its emitted rank lies in d..28. These restrictions are sufficient for realizability under an independently chosen initial alphabet: remove first-occurrence runes in the specified order from the initially unseen list, choosing their required ordinal positions. Repeat emissions are then deterministic.

For each candidate dictionary word, intersect these rank masks across equal ciphertext glyph positions and require an injective matching across distinct ciphertext glyphs. For the first three global ranks, exact local support can be computed without assigning the remaining 26 labels globally: each domain is either a singleton or a suffix; forced singleton ranks must be respected; remaining unconstrained suffix domains can be assigned distinct high ranks because original word length is at most 14, so ranks 14..28 suffice. Remaining labels are allowed to differ across words. This produces a necessary, deliberately generous lower bound on dictionary misses, not an exact global dictionary decryption.

## Original result

Inputs: canonical LP2 corpus, printed-boundary transcript, solved GP donor and TextBlob English lexicon (same paths as the reproducible script). All 12,956 rune indices of p0–55 match the canonical corpus; 2,896 complete printed words including 32 across page boundaries. Dictionary 29,081 distinct GP word forms including all 740 solved donor word instances.

- All 29 possible shared labels for rank zero force at least 11 incompatible original words.
- Exhaustion of all 21,924 ordered assignments of three distinct glyphs to ranks 0,1,2 forces at least 17 incompatible words. Best triple [17,25,12] (zero-based GP indices); median 40, maximum 66.
- First 965 words as training and remaining 1,931 as held-out: lexicographically first minimum-training triple [4,12,24] misses 3 training and 24 held-out words. Other tied triples miss 21–26 held-out words. These labels are fit parameters, not recovered key material.
- Positive: 740 genuine solved GP words encrypted with independent seeded word alphabets and a shared random rank labeling (seed 3301). Complete inverse exact; true label triple passes with zero incompatible words.

The strict finite-dictionary model cannot fit every original word even with unlimited per-word alphabet state and an arbitrary shared labeling. The deficit is small (17/2896 = 0.587%); OOV or linguistic normalization could readily explain it. No general natural-language exclusion and no plaintext/key claim. Do not use the fitted triple as evidence of a real solution. The relaxed model inherently leaves initial unseen-letter identities undetermined; a source-selected recoverable state initialization is required before investing in direct decryption.

## Reproduction

`node sims/lp2_wordreset_mtf_allsecret_rank_gate_sft.cjs` (repository-root command). The exact algorithm executed in the available JavaScript runtime against the GitHub-fetched original inputs. Source script commit 96d860b87d65e68185ca54904271146ccf368b4b. No separate Windows CI run claimed.

## Decision

Retire unsourced arbitrary word-reset rank labels as a solution path: the lexical gate is weak and does not solve the independent alphabet-state problem. Reopen only with first-party evidence selecting a recoverable initialization rule.
