# Signed-2016 word-number direction: a key-independent turn-reuse discriminator

**18 November 2026, Agent45. Status: new source-anchored original-input negative for one exact wordwise pointer model; no recovered plaintext or authenticated key.** A pointer that reverses on the *previous ciphertext word's GP prime-sum parity*, taking a backward first step before reading its first key element, necessarily reuses a key stream value at forward→backward word transitions. This is a potential shortcut to expensive external direction-model key sweeps: **the secret key cannot hide the plaintext-difference relation at the reused index**. On original LP2 the predicted reuse-site difference distribution contradicts all 100 native-GP length-matched positive plants in the reported finite sample, subject to the model's stated register assumptions.

## Source clue and complete declared forward family

Cicada's signed January 2016 wording **"their numbers are the direction"** motivates using a word's numbers to choose whether a running key index moves forward or backward. An independent external [direction rule and reference implementation](https://github.com/pnotisdev/cicada3301/blob/main/work/kscreen/dirrules.py) already contains **A_prev_G**: let \(G(w)=\sum_{r\in w}\mathrm{prime}(\mathrm{GPindex}(r))\) for the *previous original ciphertext word*. A new word walks key forward if that sum is even, backward if odd; the first word moves forward. This is *encoder-causal*: the previous encrypted word is already available. It is a plausible interpretation, not an authenticated Cicada opcode.

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

## Decision for future wordwise-pointer search

The source-natural **A_prev_G plus h1/m0/c0** forward/backward direct GP29 additive native-English interpretation is **not supported** by the original's reuse-site evidence; the real score falls below all correctly generated controls. This is a **key-independent early gate** that avoids searching the external **581 fixed keystreams** or guessed starting positions for this one word-direction/convention pair.

Do **not** extrapolate to the external 66 other direction masks or all 18 pointer conventions. In particular, key-pointer conventions with no adjacent reused index have no comparable first/last constraint, and a collision repair consuming extra values via the alternative coin rule can require another calibration. Non-native register, multiple encryption layers, word-boundary remapping, or unrelated historical key paths are outside this finding.

**Reproducer:** [original-source Node.js 22 CommonJS SFT](../sims/lp2_pdir_gpprimeparity_keyreuse_original_sft.cjs); uses only pinned original LP2 corpus/transcription and Gibran/Shakespeare external control files already retained in the repository, prints exact original and 100 matched-length positive scores, and never writes any files. The original real words, 734 reuse sites and source positive recovery are independently asserted. This is immediately usable as a cheap decision test before expensive full keystream-key campaigns.
