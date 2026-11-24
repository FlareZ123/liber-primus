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

This removes the original alphabet's factorial key space and even infers r. Complementing S simply reverses ranks. This reduction is exact for the all-physical-runes-update model; **this token-partition reduction alone does not cover interior latent F holds** because a skipped zero changes the public token sequence; the exact small-side extension below uses a different state representation.

Blind attack: fit S by simulated annealing on rank IC of the first4000 synchronized symbols (40 starts,700 mutations), then fit the arbitrary rank→GP substitution by smoothed trigram likelihood on that same training tape (24 starts,10000 swaps, trained only on Shakespeare/Emerson/Gibran). Freeze both inferred keys before decoding the suffix.

| Case | Partition errors modulo complement | Training exact | Withheld exact | Withheld trigram nats/rune |
|---|---:|---:|---:|---:|
| Law, secret r14 | 0 | 4000/4000 | 8856/8856 | −2.31149 |
| Blake, secret r8 | 0 | 4000/4000 | 8842/8842 | −2.34150 |
| Original | unknown | — | — | −6.69469 |

Both native plants use independently randomized initial alphabets and rank mappings, with rare NG deliberately occupying the update rank. They are independent of the language model. The original fit S=256304246 (r16) has train IC .03578945, frozen withheld .03524194, and no readable withheld output. Both controls' frozen IC exceeds .062. Exact mathematical token/rank relation verified by replay on the plants. This is a calibrated constructive failure for the finite annealing search, not an exhaustive all-partition exclusion.

Reproduce `node sims/lp2_recency_fhold_extreme_gate.cjs` and `node sims/lp2_recency_interior_partition_recovery.cjs` from the repository. Repository V8 computations; no CI claim. No unknown LP2 plaintext. Preserve the token-side reduction as the reusable attack; do not rerun the same model without a source-selected update or F-handling rule.

## Interior transparent-F: exact small-side state inverse (Agent10, 24 November)

The earlier interior partition recovery assumed every printed glyph updates the list. The genuine plaintext-F hold emits literal zero without updating; a non-F may also emit zero. This new exact ciphertext-first reduction covers all latent masks, arbitrary initial alphabet and stationary secret rank-to-plaintext permutation at center ranks 1/2 and (by reflection) 27/26.

**Recency identity.** When a consuming glyph is selected from a side, the old center enters that side immediately adjacent to the new center; other relative order stays unchanged. After every nonzero glyph has been consumed at least once, both side lists are consequently ordered by most recent *consuming ciphertext occurrence*, filtered by current side membership. A never-consumed zero may be treated as older than all observed glyphs. Let the public most-recent-first nonzero list have 28 entries, let z in 0..28 be zero's insertion position, and S be the set of r left-side glyphs. Center b is zero if z=0, otherwise the latest nonzero. For consuming c let M be the glyphs more recent than c. Its exact rank is r if c=b; r-1-|M intersect S| if c is in S; otherwise r+1+|M excluding S and b|. On a left selection replace c with b in S; on center/right selection keep S. On nonzero consumption at public index j, set z'=z+[j>=z] and move c to the front. Consuming zero sets z'=0; an F hold preserves both registers. Thus state is (S,z), not a factorial list. The reduction applies to every interior r, though enumeration grows as 29 times binomial(29,r).

**All-key rank bound.** At original burn-in offset163 grant every compatible S,z. Max-plus DP tracks the maximum attainable count of each consuming rank independently over every state path. Each printed zero can be a hold or a consume; the forbidden consuming rank assigned to plaintext F is relaxed, so these maxima are upper bounds for every genuine key. F count itself cannot exceed visible zeros. Each non-F plaintext symbol corresponds to exactly one rank. Coordinate maxima need not be simultaneously achievable.

| Center rank | Max any non-F count | Max F count | State slots | Exact transitions |
| --- | ---: | ---: | ---: | ---: |
| 1 / 27 | 712 | 450 | 841 | 1,496,152 |
| 2 / 26 | 762 | 450 | 11,774 | 20,198,052 |

Continuous original suffix: 12,793 runes. With fixed greedy GP tokenizer (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA), the minimum most-frequent-rune count over **all** equal-length windows in four pinned native donor works is 1,632 (8,709 Book of the Law windows), 1,608 (5,621 Blake), 1,388 (204,314 Shakespeare), and 1,400 (49,700 Gibran). Largest original bound 762 is 5.96% versus the weakest native lower bound 10.85%. Reject these four center positions under the finite register and continuous stationary model, not other interior ranks, resetting lists, changing rank labels or arbitrary plaintext.

**Controls:** two independently randomized initial lists and rank maps with r=1/2; deterministic alphabet-coverage preludes of 31/29 symbols followed by 1,800 native Law/Shakespeare runes each. Known-key/mask inverse exactly reproduces generated plaintext and all 1,742/1,763 consuming suffix ranks match the independent recency identity. Plants include 58/37 true F holds and 61/66 consuming-zero events (including preludes). Every actual rank count lies under its DP bound; actual largest counts 239/214 versus 239/229 upper bounds. This is an implementation/necessary-bound control, not blind key recovery.

[Executed SFT](../sims/lp2_recency_interior_fhold_smallside_sft.cjs) · [raw output](lp2-recency-interior-fhold-smallside-output.json) · [code/output commit](https://github.com/FlareZ123/liber-primus/commit/fb77d618664d873d48c9dee5b43769d9144346d7). Executed on actual repository inputs in connected V8, no independent Windows CI claim. The preliminary permissive lexical pattern gate for a fixed center marker was nonidentifying (ten original markers have zero pattern-level OOV, and no unique marker on four plants); do not treat it as recovered words. Retain this state reduction for independently selected mechanisms; no source authenticates a center position and no unknown plaintext/key recovered.


## Joint center-marker and transparent-F inverse: native control recovery, original count contradiction

The above center-list model implies a stronger exact local invariant for every center position and secret key: the fixed non-F plaintext marker R mapped to rank r is emitted precisely when a consuming glyph equals the previous consuming center. A literal plaintext F produces zero without changing that center; a consuming zero may be a marker or another rune. Thus R/F placement can be inferred without a rank permutation if all noncentral plaintexts are temporarily marginalized. The prior lexical-support-only pattern test was nonidentifying, so replace its binary support with conditional word-pattern likelihood.

For each of 28 possible R, train the distribution of ternary GP word patterns (other/F/R), conditioned on original word length, on Shakespeare/Emerson/Gibran: 147,658 words, 600,893 runes, with a 20-pseudocount iid category prior. In the reduced generative model, the marker emits the center, F emits zero without update, and an other rune emits a uniformly random one of 28 noncenter glyphs. Exact forward summation over 29 possible previous centers and all latent zero masks gives the likelihood; this is an exact calculation **for the reduced model**, not the likelihood under a fixed actual secret rank map. The F-only baseline consumes uniform GP29 outputs and uses the corresponding binary pattern probabilities. Independently keyed full adaptive-list plants use actual fixed permutations, not the reduced emission model. Freeze R on the training portion before reading heldout scores.

| Plant (center position; true R) | Blind rank of true R | Heldout log BF/rune over F-only | Heldout log BF/rune over uniform |
|---|---:|---:|---:|
| Law (5; J) | 1 | +0.023284 | +0.054996 |
| Law (8; X) | 1 | +0.027548 | +0.046703 |
| Blake (14; NG) | 1 | +0.019506 | +0.031722 |
| Blake (20; IA) | 1 | +0.026713 | +0.041685 |
| Original (unknown; train-selected G) | not known | +0.008585 | +0.001768 |

Original p0–39 prefix: 9,640 runes / 2,161 words. Remaining p40–55 heldout: 3,316 runes. Top prefix marker G has training log BF/rune +0.009337 versus F-only and +0.001151 versus uniform. NG and B follow; EA is fifth on training and retrospectively scores +0.011553 on heldout versus F-only. The four controls recover all true marker identities, but the two Law windows overlap and likewise the two Blake windows: these are four keyed trials on two works, not four independent authors. Three geometry-matched uniform ciphertext controls' train-selected markers have heldout BF versus F-only between -0.027318 and -0.023553. Uniform controls do not preserve the original anti-repeat anomaly; original positive scores against them do not independently identify the cipher.

**Exact decisive marker-count test.** Replace likelihood by min/max-plus accumulation of the indicator that a consuming glyph equals the center. At each printed zero branch both hold and consume; permit every starting center. On all 12,956 original runes the number of R occurrences is necessarily **82–100** irrespective of position, initial alphabet, rank map or F mask. Grant all masks even if inconsistent with a real fixed rank map, so the bound is conservative. Compare all equal-length windows of the five pinned GP-transcribed works used above (same tokenizer, including the <19-rune word rule):

| Candidate | Law min–max | Blake | Shakespeare | Emerson | Gibran |
|---|---:|---:|---:|---:|---:|
| G | 133–150 | 150–165 | 107–232 | 108–292 | 138–301 |
| B | 218–247 | 237–249 | 180–276 | 141–250 | 153–243 |
| NG | 85–100 | 125–150 | 50–161 | 45–119 | 77–156 |
| EA | 127–141 | 102–116 | 47–135 | 36–127 | 35–174 |

The total comparison comprises 576,032 windows (8,546 Law, 5,458 Blake, 204,120 Shakespeare, 308,371 Emerson, 49,537 Gibran). G and B fit **zero** windows; reject those marker identities for the fixed continuous architecture on these finite native registers, despite the original likelihood nomination of G. NG and EA fit some windows and are not excluded by count alone; neither constitutes authentic plaintext or a source-selected rank. No source clue selects R or the operation. Do not expand these scores into a claimed crib or run arbitrary marker/model tuning.

[Executed SFT](../sims/lp2_recency_fhold_center_marker_likelihood_sft.cjs) · [raw results](lp2-recency-fhold-center-marker-likelihood-output.json) · [code/output commit](https://github.com/FlareZ123/liber-primus/commit/4e62620383e420735676b9bb492e5681f33f7583). Run with Node from repository root. Executed in connected V8, no independent Windows CI claimed. The earlier four near-edge position exclusions and the new G/B marker exclusions are complementary, not a full exclusion of every interior key. No unknown-LP2 plaintext/key.
