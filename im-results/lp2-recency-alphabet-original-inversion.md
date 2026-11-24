# Public-state recency alphabet: exact extremes and blind interior-partition recovery

## Model and independent reason to test

Original LP2's adjacent-equality suppression could arise from an adaptive alphabet in which the last emitted symbol is moved to a fixed position: a repeat corresponds to the plaintext selecting that position, possibly a rare rune. The p57 circumference language is at most a weak motivation for a circular/dynamic alphabet, not an opcode. This is a new explicit model, not a claimed historical Cicada implementation.

Let A be an arbitrary secret permutation of ciphertext glyphs and M a separate arbitrary bijection from plaintext glyphs to ranks 0..28. Encode P as C=A[M(P)], remove C and insert it at fixed rank r. For r=0 or28, the entire alphabet is determined by the public recency ordering as soon as all29 ciphertext symbols have occurred. The arbitrary secret initial permutation ceases to matter.

## Exact extreme-position gate

Original continuous tape reaches all29 glyphs at visible offset163. The key-independent remaining 12793 rank symbols have IC 0.03526958, maximum histogram count498. Reversing the rank labels converts move-to-front to move-to-back. Historical native GP prose has far greater unigram concentration.

Extend to genuine plaintext-F holds: F emits literal ciphertext F and leaves A unchanged. The nonzero ciphertext glyphs always update, so their relative recency order is public after all28 occur; the only unknown dynamic state is z, the position of ciphertext zero in A. At nonzero C, its rank among nonzero glyphs q becomes q+[z<=q], and z increments iff the selected rank is below the zero. At C=0, branch to hold (no update) or consuming output (rank z, new z=0). An arbitrary plaintext rank permutation has exactly one forbidden consuming rank f=M(F).

Grant every possible z at burn-in, and all29 choices of f. Exact DP propagates all legal paths. For each surviving f and each target rank, a max-plus DP obtains the maximum number of that rank over complete legal paths, counting holds as rank f. Individual maxima need not be simultaneously achievable.

| Scope | Suffix n | Surviving f | Maximum any rank | Min max rune, Law | Min max rune, Blake |
|---|---:|---:|---:|---:|---:|
| p0–55 | 12793 | 28 | 500 | 1626 | 1587 |
| p0–2 | 566 | 28 | 28 | 50 | 55 |
| p3–7 | 1071 | 28 | 47 | 108 | 112 |
| p8–14 | 1657 | 28 | 71 | 180 | 188 |
| p15–22 | 1815 | 28 | 86 | 200 | 208 |
| p23–26 | 933 | 28 | 45 | 91 | 94 |
| p27–32 | 1317 | 28 | 62 | 139 | 146 |
| p33–39 | 1604 | 28 | 77 | 174 | 182 |
| p40–53 | 2916 | 28 | 122 | 339 | 346 |
| p54–55 | 205 | 28 | 13 | 17 | 18 |

For each scope compare with every equal-length contiguous window in the pinned 2013 Book of the Law and Marriage of Heaven and Hell, using greedy GP transcription. All full-book forbidden ranks0..27 die by offset364. The survivor f28 includes the degenerate state zero permanently last, and even its most favorable legal path cannot yield the native unigram maxima. An independently planted native KOAN with arbitrary initial alphabet, arbitrary rank permutation and F-hold retains true f5. Thus the exact conditional native-prose extreme-position model fails even with latent F and independently restarted tested ranges; no original key.

## Interior move: new constructive reduction to 28 bits

For an arbitrary interior r, the rank table is a left stack of r glyphs, one center glyph, and a right stack of 28-r glyphs. Removing a noncenter glyph and inserting at the center displaces the former center into the selected side, immediately next to the new center. Assign 28 noncentral token identities after the first emitted ciphertext. When a noncentral glyph is selected, swap its token with the current center's neutral token. A noncentral token stays in its original side, while its attached glyph changes. Within each side, a selected token moves next to center. Consequently the selected token sequence is public from ciphertext alone, regardless of the secret side partition. Once all28 tokens have been selected, the stack order on each side is the public token recency order filtered by its side.

Represent the unknown left-side partition by a 28-bit mask S, r=popcount(S). If t is selected and M is the public mask of tokens more recently selected than t, its rank is

- center repeat: r;
- t in S: r−1−popcount(M & S);
- t not in S: r+1+popcount(M & ~S).

This removes the original alphabet's factorial key space and even infers r. Complementing S simply reverses ranks. This reduction is exact for the all-physical-runes-update model; **interior latent F holds are not covered** because a skipped zero changes the public token sequence.

Blind attack: fit S by simulated annealing on rank IC of the first4000 synchronized symbols (40 starts,700 mutations), then fit the arbitrary rank→GP substitution by smoothed trigram likelihood on that same training tape (24 starts,10000 swaps, trained only on Shakespeare/Emerson/Gibran). Freeze both inferred keys before decoding the suffix.

| Case | Partition errors modulo complement | Training exact | Withheld exact | Withheld trigram nats/rune |
|---|---:|---:|---:|---:|
| Law, secret r14 | 0 | 4000/4000 | 8856/8856 | −2.31149 |
| Blake, secret r8 | 0 | 4000/4000 | 8842/8842 | −2.34150 |
| Original | unknown | — | — | −6.69469 |

Both native plants use independently randomized initial alphabets and rank mappings, with rare NG deliberately occupying the update rank. They are independent of the language model. The original fit S=256304246 (r16) has train IC .03578945, frozen withheld .03524194, and no readable withheld output. Both controls' frozen IC exceeds .062. Exact mathematical token/rank relation verified by replay on the plants. This is a calibrated constructive failure for the finite annealing search, not an exhaustive all-partition exclusion.

Reproduce `node sims/lp2_recency_fhold_extreme_gate.cjs` and `node sims/lp2_recency_interior_partition_recovery.cjs` from the repository. Repository V8 computations; no CI claim. No unknown LP2 plaintext. Preserve the token-side reduction as the reusable attack; do not rerun the same model without a source-selected update or F-handling rule.
