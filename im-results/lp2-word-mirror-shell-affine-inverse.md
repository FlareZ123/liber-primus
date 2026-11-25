# Mirrored word-shell affine inverse and arbitrary pair-bijection invariant

**Agent48 · 25 November 2026. Decision:** no recovered unknown plaintext, authentic key or destination. The fixed shared affine pair receiver fails a blind original-cipher inverse despite exact recovery of two independently keyed literary controls. A stronger pair-equality obstruction applies to any stationary bijection per source chapter, printed word length and shell depth, conditional on the tested native-GP register. The distinct persistent, word-wise center-out q8 plaintext-autokey receiver also fails all nine original source ranges, for ordinary consumption and literal F-hold, with independent chapter primers under a finite intact-word vocabulary gate.

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


## Word-wise center-out plaintext autokey with persistent state (Agent48, 25 November 2026)

**Decision:** the exact lag-eight GP29 plaintext-autokey architecture, with word-local center-out reading and queue state carried between words, fails every source chapter for both tie conventions, even allowing a different arbitrary secret eight-rune primer per chapter. The ordinary-clock result is exhaustive over all (29^8) primers; the literal-F result is a stronger-initialization-relaxed local obstruction under the finite lexicon/OOV premise. The known DIUINITY primer also fails independent of language under the literal-F rule. No unknown plaintext or authored key is recovered.

The previous central-prefix bound requires occurrence-specific initial state for a center-out mechanism. Persistent plaintext autokey is a concrete way to supply that state without private per-word secrets. The clear p57 wording “find the divinity within and emerge” motivates visiting each printed word's center(s) first, then outward to its boundaries; solved LP1 supplies the eight-rune DIUINITY primer. Neither clue establishes the autokey law. This is **word-wise** traversal with cross-word plaintext feedback, not the previous [global depth-bucket periodic key](lp2-recursive-word-peel-keyclock.md), stationary shell-affine map, or recursive perimeter grid. The choice of q8 is fixed by the known primer, not fitted.

### Exact reversible model and independent input

For each printed group, visit center(s) and then concentric pairs, with the same left-first or right-first tie convention throughout each run. Reinsert outputs in physical slots. Across groups, retain the previous eight **consuming plaintext** runes in a FIFO queue initialized to an eight-rune primer. For each visited plaintext rune p, output c=p+queue[0] modulo 29, pop queue[0] and append p. The inverse subtracts queue[0] and appends the recovered p. In the separate historical literal-F variant, p=0 emits c=0 and leaves the queue unchanged; a consuming step must have p nonzero. Nonzero plaintext may also emit c=0. This distinction is mandatory.

Canonical source: all 2,896 printed groups and 12,956 runes checked rune-for-rune against physical p0–55. Source chapter cuts: 0,729,1874,3612,5506,6527,7960,9640,12648,12956. At the opening and terminal chapter, exclude the confirmed 13- and 9-rune red rubrics respectively (two complete groups each); other source ranges retain all groups, including their headings. Each chapter receives an independent primer, a relaxation of any globally shared initializer. All true page-carries are retained within the chapter. The finite lexicon is 38,938 distinct GP29 forms from TextBlob spelling entries with GP spelling variants plus native solved GP words. Allow floor(5% of tested groups) arbitrary out-of-vocabulary (OOV) groups separately in each range. Source blob hashes are pinned in the executable. No assumption of a historical key-delivery route is made.

### Exact ordinary-clock key nomination and F-aware interval obstruction

Ordinary-clock traversal is linear in the primer: at visited offset t, plaintext is b_t+s_t K_(t mod 8), with s_t=-1 and b_t=c_t for t<8; afterward s_t=-s_(t-8), b_t=c_t-b_(t-8) mod29. Each lexicon candidate for a complete group of length >=8 therefore determines all eight primer digits; reject inconsistent repeated lanes. Count **distinct group support** per nominated primer. If there are A long groups and budget B, any valid key must support >=A-B long groups. A key not nominated by any anchor cannot meet a positive threshold. This is an exact all-primer decision, including arbitrary OOV groups elsewhere.

For F-hold, a proposed dictionary word fixes which runes are holds; every such position must emit zero. Its consuming plaintext subsequence a determines the required input queue prefix u of length min(8,|a|) by c-p mod29; subsequent consuming positions require c_j=p_j+p_(j-8) in consuming order. The output queue's last min(8,|a|) digits v are the corresponding suffix of a. Thus a candidate transition is fully represented by the equal-length pair (u,v), with unconstrained incoming digits if fewer than eight runes consume. For adjacent candidate words of lengths l and r in this capped representation, compatibility is automatic if l+r<=8; otherwise their overlap has length h=l+r-8 and requires v_left[0:h]=u_right[r-h:r]. This is necessary and sufficient for an arbitrary starting queue to realize both words. Any impossible singleton or adjacent pair forces at least one OOV group in that interval even granting arbitrary incoming state. A greedy earliest-ending disjoint interval packing is a valid OOV lower bound (and is optimal for the tested intervals); it does not assert that a remaining feasible pair implies whole-chapter feasibility.

| Source range | Groups | OOV budget | Long groups | Ordinary required | Maximum support (either tie) | F-hold lower OOV left/right |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 after title |156|7|20|13|1|16/17|
| p3–7 |255|12|27|15|1|19/21|
| p8–14 |385|19|46|27|1|36/36|
| p15–22 |435|21|48|27|1|32/32|
| p23–26 |224|11|26|15|1|19/19|
| p27–32 |326|16|36|20|1|28/26|
| p33–39 |378|18|45|27|1|26/27|
| p40–53 |669|33|84|51|1|52/50|
| p54–55 after title |64|3|9|6|1|7/8|

Every ordinary key is excluded in all nine ranges for both tie conventions; the exact F-aware singleton/pair lower bound exceeds each budget independently in all 18 range/tie combinations. Literal DIUINITY [23,10,1,10,9,10,16,26] with exact F-state reachability also has no complete path in any of the 18 cases, first contradiction at traversal offset 0–552, without dictionary assumptions. The fixed ordinary primer replays all original runes but produces incoherent text, for example p0 body left-first begins `UBAES MTHG SEOG FEOAIANXLGAWI XMHSM IAINM IAIAA`. This replay is automatic for a bijective ordinary key and supplies no evidence of authenticity.

### Calibration and limits

WELCOME (515 runes), first KOAN (780), and LOSS OF DIVINITY (755) solved native controls re-encrypted with three independently chosen deterministic primers, both tie conventions, give six unique ordinary-key recoveries (4,100/4,100 plaintext runes with exact forward replay). All six F-hold controls have zero impossible-interval OOV lower bound and retain a legal path for the true primer; no claim of unique F-hold plaintext recovery. These controls are native source strings used as plants, not historical examples of this receiver; their words enter the finite register. The first attempted triple-interval expansion timed out before returning results. The completed reduced experiment intentionally uses only exact single/pair certificates; there is no need to run the larger join given the decisive pair bounds. Core JS executed in the connected V8 runtime; standalone Node wrapper not independently executed. No CI was used.

The theorem does not exclude alternative lag, traversal, queue update, changed word membership/order, non-native register, or arbitrary hidden state. It does exclude the specified full eight-rune persistent feedback receiver under the finite intact/ordered-group language premise, rather than merely one guessed primer. No additional lag/menu search follows without an independent clue.

[Read-only CommonJS SFT](../sims/lp2_wordwise_centerout_plaintext_autokey_sft.cjs) · [Raw exact outputs with disjoint obstruction witnesses](lp2-wordwise-centerout-plaintext-autokey-output.json).
