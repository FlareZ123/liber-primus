# GP29 bookend: an all-secret equality invariant rejects synchronized alphabet reuse

**Agent11, 22 November 2026. Original-source conditional rejection. No new unknown plaintext, authentic key or authored cipher recovered.**

## Why this particular cryptanalytic decision

The 2014 LP2 manuscript repeats one complete six-rune word pair, `DJU BEI` (GP indices `[23,11,1,17,18,10]`), at global original rune offsets **6,555–6,560** and **12,950–12,955**. The first28 physical pages p0–27 contain **6,761** runes; the last28 p28–55 contain **6,195**. Aligning the first phrase to the last fixes a **6,195-rune** pair: source A=full-book original positions366..6560, source B=6761..12955. Remove the six phrase runes used to choose this alignment, leaving **6,189** independent compared sites. The earlier [original bookend two-time-pad gate](lp2-28page-bookend-gp28-two-time-pad-gate.md) tested additive GP28 ciphertext-predecessor steps, and the older [direct GP29 comparison](../sims/2016_28page_bookend_ratio_inverse.cjs) tested additive and multiplicative fixed formulations. Those variants leave a materially larger class unresolved: reuse of a completely unknown, independently evolving **29! substitution alphabet at every aligned position**, rather than an additive or multiplicative pad.

A second author-visible but interpretatively speculative alignment comes from the authentic 2016 563×569 image: its dimension mean **566** exactly equals 6,761−6,195, selecting first-half suffix position566 against all of the second half. A third page-native clock aligns p0 with p28, p1 with p29, and so forth, taking complete local rune overlap for each pair, excluding the p22/p50 runeless pair. These are **three pre-existing bookend hypotheses**, charged together here; the image dimension match is numerical motivation, not a first-party instruction.

## Exact key-free theorem

Suppose for each aligned position i the same arbitrary secret **bijective** GP29 mapping `S_i` encrypts both underlying plaintext runes, with no assumption that `S_i` repeats, has small key size, respects additive arithmetic or is known to the solver:

    C_A[i] = S_i(P_A[i]);    C_B[i] = S_i(P_B[i]).

Since every `S_i` is a permutation of 29 GP symbols,

    C_A[i] = C_B[i]   if and only if   P_A[i] = P_B[i].

Thus the number and exact locations of equal runes **cannot change under any choice of the 6,189 unknown secret alphabets**. This is a necessary condition for synchronized reused per-site substitution, including arbitrary source-selected polyalphabetic ciphers and every synchronized per-site affine/keyword mask. The theorem is independent of the secret alphabet's entropy. It does not cover separate alphabet state evolution driven by each message's previous ciphertext, positional transposition, varying word boundaries, homophonic/nonbijective encoders, different independent keys or an intermediate binary register.

## Original-source equality and word-shape-matched native controls

| Frozen alignment | Original equal sites | English-source 400/400 controls: minimum–maximum | English-source mean | Controls no greater than original |
| --- | ---: | ---: | ---: | ---: |
| Exact repeated phrase (six selection runes held out) | **183/6,189 (2.9569%)** | **306–421** | **362.512** | **0/400** |
| 2016-image dimension 566 source offset | **215/6,195 (3.4705%)** | **307–433** | **367.975** | **0/400** |
| 27 nonempty physical page pairs | **195/5,663 (3.4434%)** | **294–386** | **337.757** | **0/400** |

Each calibrated control preserves **every one of the 2,896 authentic original word lengths**, including the 32 whole words carried over page boundaries. Its first-half GP29 source words are sampled by exact rune length and original token frequency from the checked-in **300,000-character Shakespeare** witness; second-half words are independently sampled by the same rule from the checked-in **Gibran Prophet** witness. Source-native spelling uses the already solved LP1/LP2 GP conventions, including ING→NG, IO→IA and TH contraction. Fixed xorshift32 seed is `0x33011192`; **400** complete 12,956-rune length-preserving original-shape controls are scored under the identical three pre-fixed alignments. These are empirical genre-conditioned comparisons, **not** a proof covering every possible plaintext language or a calibrated p-value for the retrospectively selected bookend mechanism.

**Strong native positive:** take two generated native English GP29 streams and generate a new, completely secret 29-symbol Fisher–Yates permutation at every one of the 6,189 aligned positions; encrypt both with the **same** local permutation. The original plant has **377** plaintext equalities and retains exactly **377/6,189** encrypted equalities, while every one of the 12,378 source runes decrypts exactly under the inverted secret permutations. A second plant uses a **different local secret permutation** on the other stream: its output has **220/6,189** equalities, near the random 1/29 expectation, demonstrating precisely why the same-alphabet premise matters. The full implementation and native plant were executed on original source bytes with a Windows Node22 PASS, [run 45029791696](https://github.com/FlareZ123/liber-primus/actions/runs/45029791696).

Reproducer: [read-only single runnable test](../sims/lp2_bookend_allsecret_samealphabet_collision_sft.cjs). It pins original total12,956 GP rune indices to FNV-1a32 `fe63c4ed`, authentic phrase boundaries, original word inventory, all original equal-site counts and the 400 controls. No original files are changed.

## Cryptanalytic consequence

Even when granted **all 29! arbitrary secret bijections at every synchronized site**, each of three obvious original-source reuse clocks preserves equality at about 3%, while length-matched English plaintext under that exact key class would preserve about 5.9–6%. The mismatch has the *wrong sign* for any synchronized-per-site reused-alphabet explanation of the bookend phrase. This exact necessary invariant excludes a much broader reuse class than fixed GP29 addition or GP28 step differencing. It does **not** tell us what `DJU BEI` means: it might be a visible delimiter, a repeated word encrypted under different state, a coincident collision, or a clue to another operation.

**Decision:** stop treating the repeated phrase by itself as evidence that the book has one synchronized reused plaintext-to-rune alphabet across its halves. Keep the phrase and physical separation as input evidence. Reopen direct two-text key cancellation only on a new original instruction showing common state/clock, a different intermediate register, or a successful full original plaintext inversion. More arbitrary relative phase/key searches are not warranted by the terminal echo alone.
