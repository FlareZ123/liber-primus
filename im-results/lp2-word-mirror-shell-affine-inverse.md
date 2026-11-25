# Mirrored word-shell affine inverse and arbitrary pair-bijection invariant

**Agent48 · 25 November 2026. Decision:** no recovered unknown plaintext, authentic key or destination. The fixed shared affine pair receiver fails a blind original-cipher inverse despite exact recovery of two independently keyed literary controls. A stronger pair-equality obstruction applies to any stationary bijection per source chapter, printed word length and shell depth, conditional on the tested native-GP register.

## Source and receiver

Solved p57 PARABLE asks the reader to shed circumferences, find divinity within and emerge. One literal lossless interpretation is to visit symmetric pairs of every complete printed word, at depth d selecting positions d and L−1−d. No original instruction explicitly selects a linear map; test the minimal stationary pair receiver, preserving group membership and position. Singleton centers are left unchanged and are not scored. This differs from literal deletion, per-word DIVINITY, recursive depth-traversal q8, and adjacent whole-word BASE29 shear tests.

Source: `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`, checked all 12,956 original indices against physical p0–55. Source counts: 2,896 words, 5,753 symmetric pairs, 1,450 unpaired centers. Fit all 4,275 pairs from words starting before rune offset 9640 (p0–39), freeze before 1,478 later pairs. A word crossing the split follows its start location.

Let each cipher pair be (x,y). Inverse P=(ax+by+t,cx+dy+u) mod29 with ad−bc nonzero. Enumerate all 30 projective row directions, 28 nonzero scales and 29 intercepts independently for each of the two output rows. For each direction and side, maximize the exact marginal likelihood from the Shakespeare reference, conditional on original word length and shell depth (half-count smoothing, pooled fallback). Because the objective separates by row and invertibility only requires distinct directions, selecting the highest joint score over the 30×29 different-direction pairs is an exact global maximum for this marginal objective, over 573629280 affine keys. It is not a joint whole-word lexical MAP. Reencrypt every pair under its computed inverse; this validates correctness, not authenticity.

## Executed blind inverse

| Data | Frozen inverse | Fit nats/rune | Holdout nats/rune | Held-out pairs recovered |
|---|---|---:|---:|---:|
| Original | [[9,7,14],[13,4,4]] | -4.927991 | -5.084510 | Unknown |
| Gibran plant | [[3,7,12],[8,5,6]] | -2.683424 | -2.690166 | 1478/1478 |
| Emerson plant | [[11,2,23],[9,17,1]] | -2.692281 | -2.681107 | 1478/1478 |

Both plants use intact donor words sampled with replacement by the exact source word lengths; independently chosen hidden keys recovered exactly. The original inverse is nonprose: `RXMAENAPAE IEELT RIYX DJC YNOE SRTHMWSIAEOMON OEMGNGP XIAFP LBG LJD NHRA YDT THNAETHTHG MYSOEBUAENGGYB XY FY XOE XAEA UJPXFRP GLNGAN JPDMSUEE AEJ EAFCU OF RUO`. The frozen native score is poor. Exact replay of all 5,753 pairs passes; no authentic key is established. Centers are outside this pair-only receiver.

## All-secret stationary pair-bijection obstruction

An arbitrary secret bijection on 841 ordered pairs preserves every pair equality within each fixed context g. Define E as sum over g and pair values v of N(g,v)(N(g,v)−1)/2. Consequently a proposed plaintext under any such stationary receiver must have exactly the observed E even if every context has an independent secret permutation. The exact source contexts below use chapter of word start, printed length, and depth from the exterior; all original words remain intact. Resample 128 independently drawn length-matched sets of Gibran and 128 of Emerson, using deterministic xorshift32 starting at 0x48c1c301 (after two plants).

| Context | Original E | Gibran range (128) | Emerson range (128) |
|---|---:|---:|---:|
| global | 19690 | 100412–113379 | 94670–104520 |
| depth | 6824 | 65259–76379 | 57337–66149 |
| length×depth | 1173 | 42889–53265 | 31795–41197 |
| chapter×depth | 958 | 9301–10716 | 7900–9478 |
| chapter×length×depth | 156 | 6245–7629 | 4536–6071 |

Zero of 256 reference samples meet or fall below the original in any of these contexts. This is an exact key-independent invariant but its language inference is empirical and register-conditional. The samples preserve lengths, not syntax; high-length strata can reuse scarce words. This is not an all-English theorem. Arbitrary whole-word reordering within a context leaves the invariant unchanged. Independent per-word or per-pair mappings, stateful inner/outer coupling, hidden membership, or other language registers remain possible. Do not tune additional affine rows or arbitrary static pair maps absent an independent selector.

[Read-only CJS SFT](../sims/lp2_word_mirror_shell_affine_inverse_sft.cjs) · [Executed result](lp2-word-mirror-shell-affine-output.json). Core JS executed in the connected V8 runtime; standalone Node wrapper not separately run. No CI added.

## Causal center-out feedback extension: initial central block and seed cardinality

The PARABLE's “find the divinity within and emerge” motivates a genuinely different hypothesis: first emit a central block and use its recovered value to drive arbitrary later outer-shell feedback. The earlier stationary pair theorem cannot constrain arbitrary later feedback. But the initial central prefix has not seen any outer glyph: if its only prior state is the source chapter and printed word length, the same plaintext prefix must produce the same ciphertext prefix. Test the center singleton for odd lengths ≥3, center pair for even lengths ≥4, and the next whole shell (width3 for odd lengths≥5, width4 for even lengths≥6). These minima exclude the short words where the test would collapse into whole-word substitution. Every context uses source chapter of word start × exact word length; neither word order nor lexical adjacency is required.

More generally grant at most S distinct unknown initial seeds per context, each with any deterministic prefix emitter (even noninjective). If a plaintext prefix occurs n times, at least (S−r)q(q−1)/2 + rq(q+1)/2 of its occurrence pairs share a seed, where q=floor(n/S), r=n mod S. All such pairs must collide in ciphertext. Sum this lower bound over each prefix in each context, and compare with the actual original collision count of that context. The smallest S passing every context is a necessary lower bound, not a construction or sufficiency result. This calculation grants adversarial best seed assignments and never estimates a secret key.

| Central width / minimum word length | Eligible original words | Original E | Gibran E range | Emerson E range | Necessary seed count range Gibran / Emerson |
|---|---:|---:|---:|---:|---:|
| 1/3 | 1367 | 1649 | 6107–7288 | 5128–6240 | 4–8 / 4–7 |
| 2/4 | 998 | 38 | 651–1192 | 401–564 | 7–18 / 4–9 |
| 3/5 | 647 | 1 | 127–256 | 65–162 | 5–13 / 4–12 |
| 4/6 | 485 | 0 | 37–77 | 16–60 | 3–7 / 2–7 |

The separate 128 draws per donor use exact original word lengths and seed 0x48c3a01. 96 constructed context/seed controls confirm the lower bound never exceeds the actual granted seed count; stationary translation controls preserve equality exactly. These are finite native-register checks and use sampling with replacement, not proof about every English text. The theorem itself is exact. It applies to any deterministic center-out receiver whose initial prefix depends only on the plaintext central prefix and a fixed seed; additional exterior input, cross-word state, variable membership, or a different plaintext register is not excluded. The high seed-count requirement is conditional on the donor samples and does not supply those seeds. Do not use this to justify arbitrary high-state searches; it asks a future source hypothesis to identify occurrence-specific initial state before investing in its inner/outer feedback rule.

[Separate causal-prefix SFT](../sims/lp2_centerout_prefix_seed_bound_sft.cjs) · [Executed output](lp2-centerout-prefix-seed-bound-output.json). Core JS executed in connected V8; Node wrapper not separately run.
