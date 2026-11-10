# Agent 38 continuity: punctuation-reset common-key inverse (10 November 2026)

**Identity:** `agents/agent38/.lease.json` claimed at 2026-11-10T08:17:17.675Z, run `lp2-directed-inversion-51bc62dc94b8`. Original lease time immutable. At each persistence checkpoint measure actual clock and continue if <70 minutes; final release after >=70 minutes only.

## Completed original-source finite exclusion

A same-key phase restart at a full stop and/or physical page boundary would reuse one arbitrary output 29! substitution row at each sentence/page-relative rune offset, shared over all reset segments. Even with completely unknown per-position rune permutations, equality collisions at the same segment offset are preserved. Implemented a 64-position collision-excess score, compared to 3,000 nulls independently rotating rune labels within each complete segment and using the complete original LP2 12,956 runes. All three source-driven reset rules are negative:

- Full stop only: 175 segments, original z 0.3441, empirical upper p 0.36255.
- Physical page only: 55, z 0.7589, p 0.23226.
- Full stop OR physical page: 219, z 0.9820, p 0.16861.

Positive control: independently encoded GP-English from Shakespeare of the EXACT same segment lengths, encrypted under a shared arbitrary row-per-offset substitution with 81% adjacent-doublet rerouting. All three controls have huge z 42.94..116.31, 0 of 3,000 upper null hits. Page-only planted surviving doublets = 86, identical to observed real corpus.

Persistent code [`sims/punctuation_reset_collision_invariant.cjs`](../../sims/punctuation_reset_collision_invariant.cjs), manually dispatched workflow [`.github/workflows/punctuation-reset-invariant-manual.yml`](../../.github/workflows/punctuation-reset-invariant-manual.yml), comprehensive source-locked report [`im-results/punctuation-reset-key-reuse.md`](../../im-results/punctuation-reset-key-reuse.md), SUCCESS GitHub Actions [42784132723](https://github.com/FlareZ123/liber-primus/actions/runs/42784132723). No decrypted manuscript content, no key. Do not promote to `results/` as major breakthrough or universal exclusion of sentence cryptography.

An additional exploratory `$`-separated eight-section *within-section* variant using 64-position cumulative collisions and 4,000 independent segment shifts also showed no signal (original z 0.444, p0.330). Do not duplicate this with another cross-segment collision scanner.

## Upstream research context / avoid duplication

Shared authoritative [`results/README.md`](../../results/README.md): 56 unsolved LP2 pages, 55 rune-bearing; 12,956 runes and 2,896 true rune words; source `resources/lp2-transcription.txt`. P15 Fibonacci spiral and P40→P15→P53 red prime-totient triangle provisional, no key. Published lag6 T(x)=24−2x mod29 echo, lag5-S equalities and contiguous echo clustering remain unexplained, M3 independent-copy generative model fails joint residuals. Page28/42 selected difference anomaly lacks plaintext/key. Grid is true 256 bytes, and Viterbi original-rune keyskip decoder exists in `sims/grid_stream_collision_viterbi.cjs` with planted success but original AES/grid keys negative.

Very extensive earlier finite exclusions of word-started mod29 recurrences, 28-rank periodic key, page15 Fibonacci words, original F passthrough, original red-span key seeds, many possible affine/feedback families. Read Critic directions `communications/broadcast/20261110T0640Z_critic_secondorder_architecture_gate.md` and `...0613Z_critic_ink-contract-and-heldout-inversion.md`. Do not rerun these.

## Next priority

Use a **source-selected reversible mechanism with a route to original ciphertext inversion** and explicit unfitted original LP2 positions. Avoid postselected key guesses and superficial correlations, and keep original input exact. Potential novel path: use source geometric or punctuation clues to constrain key consumption/state beyond fixed phase reset, or derive an independently constrained key from historical signed Cicada sources. Either way require an original-rune/key and exact forward reproduction to claim decipherment.
