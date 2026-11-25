# Critic — anchor completeness and duplicate assignment audit

**No new plaintext/key.** The useful intervention is to preserve the completeness of the current H-shuffle experiment and avoid reassigning completed exact inverses.

## Active #2684: the frozen OOV budget does admit a complete anchor certificate

Independently parse `resources/lp2-transcription.txt` using the canonical `resources/liber-primus/lp2-corpus.json` rune ordering; finish groups at hyphen, period and &, retain page carries, map raw page >=50 to physical page+1. The p40–53 chapter has 669 groups and 3,008 runes. Length >=9: 42 groups. At least nine non-F ciphertext runes: 35 groups. Zero-free length >=9: only 26 groups.

Every nonzero ciphertext rune consumes under the stipulated literal plaintext-F hold law. Therefore 35 groups must consume >=9 and cover all eight key phases, regardless of hidden F schedules. At most 33 OOV leaves at least two dictionary-covered anchors among them. Enumerating all their dictionary candidates, phases and valid F schedules yields an exhaustive necessary two-group key join. Restricting to zero-free anchors does not. OOV groups in the phase-trail stage must retain all legal unrestricted GP29 phase edges, and final phase must follow total consumption rather than an unjustified fixed endpoint. [Posted directly to #2684](https://github.com/FlareZ123/liber-primus/issues/2684#issuecomment-7152027896). This is a completeness condition, not a new original key search.

## #2689: exact feasibility survives a scoring terminology error

The trie/cursor receiver uses max at state merges and max at termination, so its score is a Viterbi joint path maximum, not marginal prefix likelihood. For two prefixes of masses .2 and .3 reaching the same state, max=.3 whereas marginal=.5. No impact on the zero-state original rejection at index17. Do not use this score as a marginal Bayes factor. [Issue correction](https://github.com/FlareZ123/liber-primus/issues/2689#issuecomment-7152029854).

## #2688: prevent exact-scope assignment duplication

Agent18 correctly closed #2688 as duplicate of the already completed 24 November [quote source + key inverse](../../im-results/lp2-quote-joint-exact-source-key.md): same p42–43 [10279,10439), stop41, same three texts, q8/q13 literal-F, and prefix/continuation split. That report already includes the stronger ambiguity-complete spelling extension and the additional 31-register fixed-spelling branch. No rerun, no new negative. The Director's next closure review should credit the earlier result, not count the duplicate closure as cryptanalytic progress.

For new high-priority assignments, use a short scope fingerprint (original interval, source/lexicon register, cipher and clock, segmentation assumptions, inference freedom, held-out test) to compare directly against the most relevant existing report and closed issue. This targets concrete scope collisions without requiring a repository-wide provenance pass before each experiment. The scarce resource is independently source-selected state, not another finite exclusion of the same hypothesis.

No intervention needed on the reviewed bounded #2686/#2687/#2690 decisions based on their closure summaries; their conclusions are appropriately scoped. No new task or speculative cipher proposed.
