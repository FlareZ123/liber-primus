# Prime-exponent GP29 field-power cipher: a key-independent language obstruction

**22 November 2026, Agent6. Classification:** original-source, complete-secret-family necessary-condition exclusion for *direct* power permutations over GF(29). No unknown-page plaintext, authentic key, author-selected cipher or final destination recovered.

## Actual manuscript clue and a reversible hypothesis

First-party LP1 p5 explicitly states **THE PRIMES ARE SACRED** and **THE TOTIENT FUNCTION IS SACRED**. The 29-symbol Gematria Primus alphabet identifies an unusual prime field in which `29−1=28` is the multiplicative group order. This motivates one very economical *hypothesis* that had not been subject to a whole-source key-independent order-class decision: treat a plaintext GP rune's canonical zero-based value as a field element, exponentiate by a successive prime, and print the field element at the resulting GP index.

For a candidate position-dependent exponent `e_i`, the reversible direct operation is

```text
C[i] = P[i] ^ e_i (mod 29)
P[i] = C[i] ^ (e_i^(-1) mod 28) (mod 29)
gcd(e_i, 28) = 1.
```

All primes at least 11 satisfy the invertibility requirement; primes 3 and 5 also do. The visible prime/totient words do not explicitly select exponentiation, an initial prime, a running clock or this output register. The test below is stronger than any guessed prime offset: **it gives the exponent at every original rune to the adversary, completely freely**, including individually selected secret exponents, arbitrary page resets and plaintext-dependent clocks, as long as each symbol is encoded by a power permutation on the *unchanged* canonical GP29 numeric register.

## Exact invariant independent of every secret exponent

Any invertible exponent `e` permutes each multiplicative-order class of GF(29) **within its own class**, with no exception. This follows from `ord(x^e)=ord(x)/gcd(ord(x),e)=ord(x)` because `ord(x)` divides28 and `gcd(e,28)=1`. Zero also maps to zero.

| Order in GF(29)× | Literal GP29 symbol indices and graphemes | Original p0–p55 rune count |
| --- | --- | ---: |
| 0 | 0 F | 458 |
| 1 | 1 U | 450 |
| 2 | 28 EA | **460** |
| 4 | 12 EO, 17 B | **844** |
| 7 | 7 W, 16 T, 20 L, 23 D, 24 A, 25 AE | 2,669 |
| 14 | 4 R, 5 C, 6 G, 9 N, 13 P, 22 OE | 2,688 |
| 28 | 2 TH, 3 O, 8 H, 10 I, 11 J, 14 X, 15 S, 18 E, 19 M, 21 NG, 26 Y, 27 IA | 5,387 |

These **12,956** ciphertext symbols are original unedited runes on physical p0–p55. For *every possible* direct field-power cipher in this family, the unknown plaintext must therefore contain **exactly 460 EA runes and 844 EO-or-B runes**. In particular, an invertible field power cannot introduce an EA from any non-EA plaintext symbol; odd exponents fix `28` identically. The two-value class `{EO,B}` cannot receive any symbol from outside that pair.

All nine original illustrated sections independently have the elevated EO/B requirement: opening p0–2 40/729; p3–7 80/1,145; p8–14 107/1,729; p15–22 115/1,903; p23–26 58/1,021; p27–32 109/1,433; p33–39 102/1,680; p40–53 211/3,008; p54–55 22/308. This is a whole-book property, not an artifact of one vocabulary-heavy page.

## Author-native plaintext and independent language controls

| Actual corpus, GP29 normalized | Number of runes | Required EA class (order2) | Required EO/B class (order4) |
| --- | ---: | ---: | ---: |
| **Original undeciphered LP2** | **12,956** | **460 (3.5505%)** | **844 (6.5144%)** |
| Original solved LP2 p56 prime-totient plaintext + printed p57 | 180 | 0 (0.0000%) | 2 (1.1111%) |
| Solved LP1 primary reference prose, with continuation duplicates removed | 2,617 | 17 (0.6496%) | 32 (1.2228%) |
| Shakespeare, independently authored source-native GP29 control | 217,106 | 1,633 (0.7522%) | 3,904 (1.7982%) |
| Old English *Beowulf*, corrected independent GP29 source profile | 48,012 | 1,036 (2.1578%) | 1,458 (3.0367%) |

The known 2014 book and solved 2014 LP2 tail have extremely few EA and EO/B symbols; the unknown original has both special field classes near the uniform-random expected rates (1/29 and 2/29 respectively). Under the natural assumption of ordinary GP29 English in the author's established spelling, such a drastic and consistent shift is incompatible with simple direct field-power encryption, independently of **all** potential key streams, primes, starts, jumps and F transparency clocks. The comparison is a **language-model necessary-condition rejection**, not a proof that every conceivable plaintext language is impossible. An unknown source could in principle use an artificial register abnormally rich in EA/EO/B.

The exact source LP1 comparison selects nonduplicated substantive primary sections of the checked-in solved reference, avoiding editorial cross-page repeats, numbered magic-square cells and annotation-only lines. Source p56 is encoded from its authenticated 85-rune English phrase; p57 is taken directly as its 95 printed GP indices. Shakespeare uses the first 300k-character corpus with the project's conventional GP-native K/Q/V/Z and ING/IO rules. The Old English benchmark uses the independently corrected 48,012-rune profile. These are comparators, not fitted plaintext or assumed keys.

## Extension: every fixed secret output alphabet, with page-wise bounds

Even if the field-power output is followed by a **completely arbitrary, unknown, fixed bijection** `σ` of all 29 rune values, the singleton original field value `EA=28` remains locked:

```text
C[i] = σ(P[i]^e_i mod29)
P[i]=EA  iff  C[i]=σ(EA)
```

No key or language scoring is needed for this equivalence. Exactly one of the **29 original ciphertext rune labels** is the designated image of plaintext EA. The untouched complete original manuscript's per-rune counts lie in the narrow range **399 through 492**. Therefore any plaintext of this secret-postpermuted direct-power family must contain **at least399 literal EA GP runes** out of 12,956, independent of which of the 29! possible secret alphabets is chosen. The author's solved LP1 native GP control has 17 EA out of2,617, equivalent to about84 at the unknown manuscript's full length. The GP Shakespeare source has 0.75% EA; the Old English source 2.16%. A 399-symbol forced minimum is therefore still exceptionally high for the source-supported plaintext register.

Allowing an entirely **new, independently secret output alphabet for every one of the nine actual illustrated sections**, the minimum possible EA count is the sum of the nine separate ciphertext least-frequent symbol counts:

```text
section minima = [17,26,44,50,21,39,40,83,4]
total ≥ 324 plaintext EA GP runes
```

Even allowing **55 independently secret output alphabets, one on each rune-bearing physical page**, requires at least **180 plaintext EA runes**. These are exact pigeonhole lower bounds, computed solely from the physical ciphertext and the field-power singleton property, with no assumed key, phase, permutation or plaintext. The nine-section and 55-page bounds are weaker than the full-book fixed-alphabet bound because they allow many secret resets. They still exceed the GP-native LP1 and Shakespeare EA rates when scaled to the original 12,956 rune length. The latter is a style comparison; 180 is **not** a mathematical contradiction for every possible underlying message.

A separately planted solved-GP source stream is encrypted under distinct prime exponents and a fixed **unknown affine output permutation** `σ(x)=3x+5 mod29`. Reversing that permutation and the exponents recovers all180 source runes. Because the singleton argument holds for *every* bijection, this plant checks the inverse but no factorial search is needed.

**Boundary:** this extension permits completely arbitrary output relabeling but keeps the **canonical GP29 plaintext symbols** directly entering the field power. A secret *pre-power* substitution could assign different English letters to the singleton fixed points, defeating this specific EA-language obstruction; the independent singleton-support extension below constrains that larger family. Per-rune changing output substitutions would similarly defeat the bounds. Such additional layers require independent original evidence.

## Complete positive and bounded decision

The [standalone Node22 original-source SFT](../sims/lp2_prime_field_power_order_invariant_original_sft.cjs) checks every rune's order class against the finite multiplicative group, exhaustively checks every one of **12** legal exponent residues modulo28 and all **29** original rune values, proves bijective round-trip and class retention for each, and synthesizes a **180-rune genuine solved-GP** source plant under a distinct consecutive prime exponent starting at11. Inversion retrieves every original control rune without loss and exactly preserves the seven class counts. The same program compares the entire unknown original, real p56–p57 control, LP1 reference and two independent text models. **Windows/Node22 CI PASS:** [initial run 45007299945](https://github.com/FlareZ123/liber-primus/actions/runs/45007299945) and [expanded secret-output-alphabet PASS 45007572199](https://github.com/FlareZ123/liber-primus/actions/runs/45007572199).

**Decision:** retire direct, canonical-value GF(29) prime exponentiation, including *any* position-dependent coprime secret exponent, prime-index key clock and up to one arbitrary post-power secret alphabet per physical page, as a plausible author-native English GP29 decoder for LP2 p0–p55. This substantially constrains an otherwise immense exponent-key search space at negligible compute cost. It **does not exclude** an additive layer before the exponent, a secret plaintext-side rune permutation, an evolving output permutation, a nonlinear field encoding before power, a second cipher layer, a different plaintext register, or a genuinely non-English underlying text. None of those extra operations is explicitly supplied by this original prime/totient clue. A new decryption effort should seek an independently visible key or operation selecting such an additional layer, rather than rescue the defeated direct family with arbitrary parameters.

## Extension: arbitrary fixed plaintext/output alphabets, followed by an actual hidden-key inverse (Agent47, 24 November)

The earlier EA fixed-point argument does not cover a secret pre-power alphabet. A different **exact key-independent invariant** does. Every invertible exponent preserves one of seven multiplicative-order classes, of sizes 12, 6, 6, 2, 1, 1, 1. Let the actual cipher be `C_i = sigma((tau(P_i))^e_i mod29)`, where tau and sigma are any two independently secret fixed 29-symbol bijections and every e_i is any unit modulo28. This includes arbitrary affine maps, arbitrary adaptive exponents, all prime origins, and arbitrary clocks. If F is literal-transparent, the bound below still holds for an allowed plaintext singleton set excluding F.

If plaintext singleton groups use k distinct symbols, they can enter at most k order classes. Their ciphertext values therefore occupy at most the sum of the k largest class sizes, regardless of key. The original carry-joined source has 83 singleton printed groups, using **28 distinct ciphertext symbols**. Thus at least **six distinct plaintext singleton symbols** are necessary for every globally shared pre/post alphabet in this entire family (unless the printed groups do not retain plaintext singleton boundaries).

| Allowed number of distinct singleton plaintext runes | Maximum distinct ciphertext values | Minimum original singleton occurrences outside the allowed set |
|---:|---:|---:|
| 1 | 12 | 33 |
| 2 | 18 | 15 |
| 3 | 24 | 4 |
| 4 | 26 | 2 |
| 5 | 27 | 1 |
| 6 | 28 | 0 |

The occurrence bound takes the largest possible allowed-label frequency sum from the actual original singleton histogram, so it is conservative and does not assume an affine alphabet. The target-excluded canonical solved-Cicada register contains singleton A, I, N (including contraction fragments), and T; the additional O is a deliberately generous sensitivity allowance. Even granting all five A/I/N/O/T, the original shared-alphabet model cannot retain all singleton boundaries. This is exact conditional on the allowed set and global stationary alphabets; **it does not exclude arbitrary boundary changes or chapter-private alphabets**. Every individual chapter has at most 12 distinct ciphertext singleton labels, so the global support argument alone is not a chapter-private rejection.

### Constructive attack on the bounded chapter-private affine prime-power case

Instead of sweeping arbitrary exponent tables, use the consecutive invertible prime exponents from 11 onward (the same sequence as the earlier field-power control) and independent, invertible affine pre/post maps. The source-motivating ingredients are the genuine p56 prime sequence, historical DH modular exponentiation, and the actual p15 Fibonacci-indexed-prime plate. No source authenticates the affine wrappers, the ordinary consuming clock, this particular exponent sequence, or the origin bound; this is an explicit exploratory completion of the prior pre-power alphabet loophole. The original p15–22 chapter is independently private. Its final physical p22 is reserved for prediction.

`C_i = d * (a*P_i + b)^(prime[s+i]) + e (mod29)`, with primes starting at 11, s=0..3300, a,d nonzero, b,e arbitrary. All positions consume a prime; F is ordinary in this concrete inverse. Since every exponent is odd, simultaneously negating a,b,d is exactly equivalent, so canonicalize a to 1..14. This leaves 406*812*3301 = 1,088,247,272 canonical keys before anchor reduction. For each of the 2,680,412 origin/output-map pairs, invert the power at the first two distinct intermediate singleton values, then enumerate **all** compatible affine input maps using the five allowed singleton symbols. The all-identical degenerate branch is retained. Check all remaining prefix singleton values without language fitting. Only then rank the full prefix by a target-excluded smoothed native GP trigram model. Freeze the winner before decoding withheld ciphertext.

| Input | Prefix / withheld | Fit singleton anchors | Compatible canonical keys | Frozen result |
|---|---:|---:|---:|---|
| Native 0_koan_1, hidden s137 a9 b11 d7 e18 | 622 / 156 | 11 | 36 | exact key; 622/622 fit, 156/156 withheld |
| Native jpg107-167, hidden s1033 a13 b4 d21 e8 | 255 / 64 | 9 | 116 | exact key; 255/255 fit, 64/64 withheld |
| Original p15–22, prefix p15–21 | 1772 / 131 | 18 | **0** | no original key; p22 not decoded or scored |

Each experiment explicitly checked 26,804,120 two-anchor-compatible canonical candidates, with all 2,680,412 intermediate pairs having a distinct second value. Both controls forward-replay the complete ciphertext exactly. Their fit/withheld log scores (nats/rune) are −2.413167/−2.726399 and −2.519008/−2.659640; the runner-up fit scores are −4.676569 and −5.051850. The original failure precedes language scoring, so it is an exact finite key-space exclusion **under intact singleton groups and the five-symbol register**. It does not cover transparent-F clocks, other exponent generators, nonlinear or independently varying alphabets, or singleton exceptions.

Source blobs: canonical corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; native donors 1b064ef6d85819b7d96adaff31a82d1ec551598f. Reproduce using [standalone CommonJS SFT](../sims/lp2_affine_wrapped_prime_power_inverse_sft.cjs), `node sims/lp2_affine_wrapped_prime_power_inverse_sft.cjs`. Executed algorithm against actual repository inputs in the connected JS runtime; no CI execution is claimed.

The global shared-alphabet power family has a stronger exact singleton-support obstruction even with completely secret pre/post bijections. The specific chapter-private affine/consecutive-prime/ordinary-clock candidate also fails independently on the original. The following stronger gate removes the need to choose an exponent schedule.

### All independently secret exponents, with both literal-F conventions

The previous constructive attack uses one prime exponent clock. It is unnecessary to guess a clock to test the independently private affine-map case more strongly. In GF(29), two field elements of the same order are connected by **some** exponent coprime to 28; the SFT exhaustively checks all 29² element pairs against all 12 units. Thus, for fixed pre-map and inverse post-map, equality of their seven-valued order-class signatures is equivalent to the existence of a legal independent exponent at every rune. This grants arbitrary adaptive exponents without fitting or selecting them.

Use the six longest complete zero-free original printed groups entirely inside the p15–21 fit interval, tie-breaking by first original offset: `(159,13),(322,12),(341,12),(1522,11),(1571,11),(834,10)` relative to the beginning of p15. Test all 812² independent affine-map pairs. In the ordinary-clock case any of the 32,131 distinct GP dictionary spellings is eligible. In the authentic literal-F-hold case, a zero-free ciphertext group cannot contain any plaintext F, so the dictionary excludes F-bearing words for these anchors. The test is independent of consumption phase, origin, exponent period and whether the ciphertext F generated by a consuming event is permitted elsewhere. It does not presume plaintext spaces outside these selected groups.

| Model | Zero of six anchors compatible | One | Two | Three or more | Maximum |
|---|---:|---:|---:|---:|---:|
| Ordinary | 656,134 | 3,208 | 2 | 0 | 2 |
| Literal F-hold | 656,508 | 2,834 | 2 | 0 | 2 |

The two maximizing pairs are sign-equivalent `(a,b,d,e)=(3,28,3,2),(26,1,26,2)`. They both match only the fifth and sixth anchors. Thus **at least four of six long printed groups must be outside this finite native GP register** for *any* chapter-private affine wraps and any unit-exponent schedule, including authentic F holds. No attempt to choose an exponent schedule or decrypt p22 is warranted.

Positive calibration: the target-excluded dictionary includes five checked-in independent literary/lexical sources plus non-target native sections, with standard Q/CW, V/U, K/Q→C, Z/S, ING/NG and IO/IA spelling conventions. Two native controls use independent per-rune secret unit exponents from the frozen xorshift32 seed 0x47c1a55e. In each, choose the six longest zero-free **known in-register** source words; this intentional positive-only selection tests exact support/key recovery, not arbitrary-donor vocabulary coverage. With the target section excluded from the dictionary, the ordinary 778-rune KOAN and literal-F 746-rune LOSS OF DIVINITY controls both retain exactly two sign-equivalent affine-map pairs satisfying all six anchors, including the planted pair. Their known exponent/hold-mask inverses recover 778/778 and 746/746 native runes. This does not claim ciphertext-only recovery of arbitrary exponents or F masks.

Reproduction: [all-affine class lexical SFT](../sims/lp2_affine_wrapped_power_class_lexical_sft.cjs), run with Node from the repository root. The exact original and control computations were executed against the repository inputs in connected JS; no CI run claimed. The dictionary blobs are TextBlob 140e1d22b5f8c45deddd2e8b25549d9d6307d938, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85, Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a, Blake c8d8afda002f2585ce64a959c26c20d24a5c990b.

**Consolidated decision:** for shared global stationary arbitrary bijections, the singleton-support theorem holds. For chapter-private affine maps, both the ordinary consecutive-prime hidden-key inverse and the completely arbitrary-exponent long-anchor compatibility gate fail on p15–21; the latter also covers literal F holds. Retire these precise families under the stated singleton/lexicon assumptions. No unknown original plaintext, key, or authentic operation. Other pre/post substitutions or altered word boundaries require a new independent source selector, not further clock tuning.
