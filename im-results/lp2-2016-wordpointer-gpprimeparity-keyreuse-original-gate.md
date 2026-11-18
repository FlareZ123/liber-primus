# Signed-2016 word-number direction: key-independent turn-reuse discriminators

**18 November 2026, Agent45. Status: new source-anchored original-input negative for one exact wordwise pointer model; no recovered plaintext or authenticated key.** A pointer whose direction follows the *previous ciphertext word's GP prime-sum parity* necessarily reuses key symbols at word-direction changes under three source-defined read/movement conventions. These produce key-independent ciphertext-to-plaintext difference relations. The exact original LP2 is inconsistent with all 300 full-original-length native-English forward plants across those conventions. This is a potential shortcut to expensive external direction-model key sweeps: **the secret key cannot hide the plaintext-difference relation at the reused index**. On original LP2 the predicted reuse-site difference distribution contradicts all 100 native-GP length-matched positive plants in the reported finite sample, subject to the model's stated register assumptions.

## Source clue and complete declared forward family

Cicada's signed January 2016 wording **"their numbers are the direction"** motivates using a word's numbers to choose whether a running key index moves forward or backward. An independent external [direction rule and reference implementation](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/dirrules.py) already contains **A_prev_G**: let \(G(w)=\sum_{r\in w}\mathrm{prime}(\mathrm{GPindex}(r))\) for the *previous original ciphertext word*. A new word walks key forward if that sum is even, backward if odd; the first word moves forward. This is *encoder-causal*: the previous encrypted word is already available. It is a plausible interpretation, not an authenticated Cicada opcode.

**Important simplification of this particular numerical selector:** among all 29 Gematria primes, **F has the only even value (2)**; every other GP prime is odd. Therefore the previous word's GP-prime-sum parity has the *exact* cipher-source identity \(\mathrm{parity}(G)=\mathrm{parity}(\text{rune length}-\#F)\), independent of the other 28 rune identities. In the original 2,896 printed words, **2,508** have the same GP-sum parity as word length; **388** have an odd F count and reverse it (458 total original ciphertext F glyphs). This exact source fact weakens the proposition that a rich prime-number semantic rule was selected by the author: most directional choices coincide with a simple printed word-length parity rule. It does not invalidate the finite numeric-index cancellation test, because the 388 F-parity-flipped word decisions are included.

The exact tested external pointer convention is **h=1, m=0, c=0** from [pdir_ref.py](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/pdir_ref.py). On starting a backward word, take one key-index step backward before reading the first key symbol, and make no additional movement between words; the collision comparator is the previously emitted rune. For the associated additive GP29 cipher, the previous forward word's final key element is then *identical* to the next backward word's first attempted key element.

Let previous last/current first ciphertext GP values be \(C_{-},C_{+}\) and corresponding native plaintext \(P_{-},P_{+}\). On an actual reused-key pair, regardless of the 29-symbol unknown key source:

\[
 C_+-C_-\equiv P_+-P_-\pmod{29}.
\]

The external antirepeat option retries a tentative repeated ciphertext with probability **0.81**, consuming further values along the chosen pointer direction. Such retries can break an individual predicted reused pair, so the study measures them in a correct forward planter instead of falsely claiming a perfect identity at every selected original site. No fixed key, pointer offset, per-rune sign, page key stream or original plaintext is guessed.

## Original direct observation

Both canonical repository source inputs produce **12,956 ciphertext runes**, **2,896 whole original words**, and their exact original page/word ordering. **734** original word boundaries exhibit the fixed forward→backward parity-rule reversal and therefore predict immediate key reuse before any retry. For those source-defined boundaries take the modulo29 residue \((C_{+}-C_{-})\). An independent source-native control distribution is trained from GP29-encoded original **300k-character Shakespeare** text: 55,407 English words, including TH/NG/EO/OE/AE/IA/EA digraph representation with the repository's historical rune normalizations; use add-one smoothing over 29 possible residues.

The fixed, key-independent per-residue score is the sum of log-likelihood ratios of **native English word-boundary first-minus-last GP values versus a flat 29-way cipher distribution**:

| Dataset | Predicted reuse boundaries | Shakespeare-native vs uniform log-likelihood ratio |
|---|---:|---:|
| **Unmodified original LP2 p0–55** | **734** | **−22.130215** |
| Matched native GP planted controls, 100 independent seeded runs | 717–760 each | **minimum −3.249479**, median **+14.943411**, maximum **+35.033728** |

The deterministic original residue histogram (index0 through index28) is:

    [7,26,37,19,25,26,25,26,18,32,26,23,25,28,31,
     26,25,22,28,28,20,29,21,23,33,29,21,29,26]

No favorable named key or output letter string was fitted to that histogram.

## Original word-length-matched forward calibration

For each of **100** determinstic seed choices, take exactly 2,896 GP29 words from the independent **Gibran Prophet** corpus **with the identical original sequence of 2,896 printed word lengths** (every original length1–14 has matched native controls). Generate a separate secret 50k-rune GP29 random key tape with an independent deterministic xorshift state; begin at a large pointer offset; apply *the exact previous-ciphertext-word GP prime parity*, the h1/m0/c0 backward-step convention and a collision-retry rule of probability 0.81 with at most five retries. The source-based decision rule is evaluated on the **generated ciphertext**, ensuring the method is actually forward-encodable. Every emitted synthetic rune is checked against its true planted plaintext and actual key index.

On these planted ciphertexts the predicted turn pairs reuse the actual emitted keystream index in **96.428522966%** of cases. This quantifies the small repair-induced identity loss under the declared model, rather than treating a first-key-attempt pointer match as guaranteed. Each full synthetic source-shaped plant is scored by the *unchanged* Shakespeare-trained distribution. **0/100** planted native control scores are as low as original LP2's −22.130215. An earlier independent genuine **contiguous Gibran prose** plant also yielded all100 scores above original (minimum −5.07084), but the matched-original-word-length result is the better documented, more restrictive comparison.

This is a finite empirical source-native-language discrimination, not a universal p-value across all possible English text or a proof about the cipher's true unknown register. The 100 length-matched controls are samples from a common source and are not 100 independent manuscripts. No arbitrary null or another alphabet can make the observed numerical key-reuse law disappear *if the cipher and key equality premise are actually correct*, but altered plaintext representation or different emission law can remove native-English significance.


## Expanded full key-reuse convention coverage (18 November, same original source)

The external pointer family has two independent controls: h, whether a backward word takes one step before its first read, and m, interword pointer movement (0 none, 1 previous direction, 2 new direction). If a word's preceding direction is \(d_{\mathrm{old}}\) and its new direction is \(d_{\mathrm{new}}\), the last emitted key index of the previous word is one old-direction step behind its post-word pointer. The new word's first attempted key position is the post-word pointer plus \(m_{\mathrm{move}}-(h\land d_{\mathrm{new}}<0)\), where \(m_{\mathrm{move}}\) is 0, old direction, or new direction. Therefore **the two adjacent rune positions use exactly the same hidden key symbol if and only if the first-read interword move equals \(-d_{\mathrm{old}}\)**, before optional collision retries.

This fixes **all convention classes that can immediately reuse a key index at a direction change** within the external six h/m choices, assuming comparator c0: h0/m2 reuses at both direction changes; h1/m0 reuses at forward→backward turns; h1/m2 reuses at backward→forward turns. h0/m0, h0/m1 and h1/m1 have **no** direct neighbor key-index reuse from the defined pointer movements, so this exact *adjacent-pair* discriminator cannot screen them. Comparator c2 and the c1 coin-retry model still require separately modeled retry evidence. The c1 skip-retry case is classified exactly below because a backward word's first rune has no collision comparator.

Run 100 **separately keyed** 2,896-word Gibran-GP **original word-length-preserving** complete forward plants for each newly checked convention, with the previously frozen independent Shakespeare GP-native log-likelihood weights, a new hidden 50k-GP pad per control, and the previous-emitted-rune comparator c0 with retry probability 0.81. The ciphertext-driven direction is recomputed after encoding each word. The actual emitted key-index pairs are tracked, and the exact same algebraic cancellation is applied to the original source and the controls.

| External pointer h/m/c | Original predicted reused boundaries | Original native-vs-flat LLR | Planted LLR minimum | Planted median | Planted maximum | True emitted key-index reuse |
|---|---:|---:|---:|---:|---:|---:|
| **0/2/0** | **1,467** (both turns) | **−38.229415** | +13.950885 | +30.627442 | +55.234907 | **96.8442%** |
| **1/0/0** | **734** (forward→backward) | **−22.130215** | −3.249479 | +14.943411 | +35.033728 | **96.4285%** |
| **1/2/0** | **733** (backward→forward) | **−16.099200** | +5.882729 | +17.488313 | +33.628124 | **97.0555%** |

**0/100** correctly encrypted native full-length controls in each convention score as unfavorably as source LP2. The distinction from a guessed key is crucial: these scores require no arbitrary secret key or source-stream search; the key vanishes algebraically at true repeated key indexes. The 96%–97% observed planted key reuse calibrates the unavoidable collision retry desynchronization.

The original third result for h1/m0 remains unchanged; the new two conventions extend the possible key-cancellation exposure to **1,467 of the original 2,895 word boundaries** and show the same contradictory native-GP behavior even when the adjacent-word direction reverses the other way. Both extra cases are included and separately asserted in the updated same-file CommonJS source SFT.

**Limit:** No authentic plaintext is available for the unsolved pages, so this is a *finite source-native-English incompatibility*, not a logical theorem that a ciphertext cannot be constructed under arbitrary non-English or encoded registers. The original source's key-reuse premise also depends on the actual collision-retry law, which may differ from the calibrated c0 0.81 hypothesis. The campaign's other 66 direction rules and pointer cases with no reused adjacent index remain separate questions.



## Exact c=1 skip-retry extension: conventions 021 and 101

The external reference defines comparator **c=1** so that the first rune of a backward word has **no collision comparator**. Under the **skip retry model**, the pointer after a forward word's final emitted rune is exactly one forward step beyond the key index that actually emitted that rune, even if earlier candidate keys at that rune were skipped. This makes two further pointer conventions algebraically key-free on every forward→backward turn:

- **021**: m=2 moves one step in the new backward direction before the first read.
- **101**: h=1 performs the backward pre-read step with no interword movement.

For either convention, the new word's first rune therefore reads the **exact same emitted key index** as the preceding forward word's last rune. Because c=1 disables collision checking on that first backward rune, no retry can alter the new read. The key cancels exactly:

\[
 C_+-C_-\equiv P_+-P_-\pmod{29}.
\]

This result is independent of the 581 candidate key streams, key pointer start, and additive multiplier/sign. It is exact for the external **skip** model. For the alternative **coin** model, a kept collision on the preceding forward rune can spend an extra hidden value and break adjacent emitted-index reuse. That exceptional state is source-visible whenever the preceding final ciphertext equals its previous emitted comparator, allowing an exact clean subset to be selected without a key.

The untouched original source has the same **734** A_prev_G forward→backward turn sites and the same fixed Shakespeare-native-vs-flat LLR **−22.130215**. A dedicated source SFT generated 100 complete, independently keyed, original-word-length-matched Gibran GP29 plants for each convention. The generated ciphertext itself determines every subsequent direction, and the SFT asserts exact emitted key-index equality at every selected turn:

| External convention | Original exact sites | Original LLR | Plant minimum | Plant median | Plant maximum | Plants at/below original | Exact emitted-key reuse |
|---|---:|---:|---:|---:|---:|---:|---:|
| **021, c1 skip** | 734 | −22.130215 | −5.144944 | +11.186735 | +23.092016 | **0/100** | **100%** |
| **101, c1 skip** | 734 | −22.130215 | −1.097824 | +12.298737 | +27.158536 | **0/100** | **100%** |

This is a stronger key-independence statement than the c0 calibration above for these two skip-model branches: the selected source sites do not merely *usually* reuse a key index; they do so exactly under the declared external mechanics. The native-GP language inference remains conditional on the plaintext register. No unknown plaintext or historical key is recovered.

**Reproducer:** [`sims/lp2_pdir_c1_skip_exact_keyreuse_sft.cjs`](../sims/lp2_pdir_c1_skip_exact_keyreuse_sft.cjs). Windows Node 22 run [44383033911](https://github.com/FlareZ123/liber-primus/actions/runs/44383033911) passed all original-source, exact-reuse, and matched-control assertions.

For the **coin** retry model, discard a forward→backward boundary when the preceding forward rune equals its immediately preceding emitted ciphertext comparator. On every remaining boundary, either no coin collision occurred or a replacement rune was emitted from the post-coin key index; in both cases the post-rune pointer is exactly one step beyond the key index that actually emitted the visible rune. The first c1 backward rune then reuses that exact key index. The unmodified original retains **725/734** exact sites and scores **−21.968853**. In 100 complete native plants per convention, exact emitted-key reuse remained **100%** and **0/100** controls scored as low as the original:

| External convention | Original exact coin-safe sites | Original LLR | Plant minimum | Plant median | Plant maximum | Plants at/below original |
|---|---:|---:|---:|---:|---:|---:|
| **021, c1 coin** | 725 | −21.968853 | −4.971314 | +11.793384 | +25.993652 | **0/100** |
| **101, c1 coin** | 725 | −21.968853 | −3.766957 | +11.898234 | +23.108798 | **0/100** |

The same SFT now asserts the coin-safe emitted-index identity directly. Windows Node 22 run [44383568781](https://github.com/FlareZ123/liber-primus/actions/runs/44383568781) passed. Therefore both external retry models are key-independently incompatible with the tested native-GP register for A_prev_G under conventions 021 and 101. Comparator c2 and other direction rules remain outside this result.

## Decision for future wordwise-pointer search

The source-natural **A_prev_G** rule is unsupported by the original reuse-site evidence across all three adjacent-key-reusing h/m conventions with c0, and the c1 branches 021 and 101 are now independently rejected for **both skip and coin retry models** by exact emitted-key cancellation gates. The real score falls below every correctly generated native control in each tested branch. These are key-independent early gates that avoid searching the external **581 fixed keystreams** or guessed starting positions for those declared branches.

Do **not** extrapolate to the external 66 other direction masks or all 18 pointer conventions. In particular, key-pointer conventions with no adjacent reused index have no comparable first/last constraint, and a collision repair consuming extra values via the alternative coin rule can require another calibration. Non-native register, multiple encryption layers, word-boundary remapping, or unrelated historical key paths are outside this finding.

**Reproducer:** [original-source Node.js 22 CommonJS SFT](../sims/lp2_pdir_gpprimeparity_keyreuse_original_sft.cjs); uses only pinned original LP2 corpus/transcription and Gibran/Shakespeare external control files already retained in the repository, prints exact original and 100 matched-length positive scores, and never writes any files. The original real words, 734 reuse sites and source positive recovery are independently asserted. This is immediately usable as a cheap decision test before expensive full keystream-key campaigns.
