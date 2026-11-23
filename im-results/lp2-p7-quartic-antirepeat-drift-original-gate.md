# P7 quartic with collision-driven key advances: original p8–14 decision

**23 November 2026, Agent16. Status: source-shaped original-cipher negative with independent native positives; no recovered unknown plaintext, key or destination.** The p7-derived fourth-order GP29 register does not explain the p8–14 ciphertext even after granting arbitrarily many collision-driven hidden key advances. In its full black-body receiver the **log likelihood ratio is −983.08910676 nats** versus an anti-repeat-matched flat source, whereas a genuine solved-Cicada GP29 plaintext encrypted under the exact same mechanism scores **+652.25718903**. The emission rule also fails unique reversibility without an additional side channel.

## Original clue and live alternative

The final five fully red word-products on original physical p7 are **[11,26,8,15,2]**, selecting the candidate GF29 quartic

    Q(X)=11+26X+8X²+15X³+2X⁴.

Adjacent physical p8 starts with exactly four red runes, **XIXM = [14,10,14,19]**, then an eight-rune red word and 1,717 black runes through p14. Dividing Q by its leading coefficient gives the candidate order-four register

    K[t]=7K[t−1]+25K[t−2]+16K[t−3]+9K[t−4] (mod 29),

with p8's original first four red runes as the state. The predicted next eight key values are **[15,24,16,21,22,20,10,9]**. The prior [source-seeded quartic investigation](lp2-p7-irreducible-quartic-lfsr4-allseed-original-gate.md) already excluded fixed-clock additive and integrated transforms, as well as all hidden IVs under a dictionary-constrained fixed clock. That work did not test a variable key clock from rejected equal-symbol proposals. The original p8–14 has **only nine adjacent equal-rune pairs in 1,729 runes**, motivating this distinct check.

No authenticated Cicada instruction selects a quartic LFSR or its IV as a cipher key. The collision-rejection rate **0.81** is selected to model the manuscript-wide low-doublet phenomenon; it is not independently supplied by the author.

## Exact mechanism and tested boundaries

At each rune, take a hypothetical native-GP29 plaintext symbol P and the next register symbol K[t]. Form tentative ciphertext x=(P+K[t]) mod29 and consume K[t]. If x equals the previously emitted ciphertext, reject with probability **0.81**, consume the *next* K symbol and retry the same P; otherwise output x. Equal ciphertext can still be emitted with probability0.19. The state runs continuously across original words, lines and page joins, with no secret page resets.

Original p8 has two physically marked, source-selected starts, both with unchanged four-rune key state: the receiver after the first red word (**1,725 ciphertext runes**, predecessor M=19) and the receiver after the complete p8 12-rune red heading (**1,717 black ciphertext runes**, predecessor B=17). No source symbols are changed or reordered. Starting after the four-rune word tests the following red eight plus black body; starting after the complete heading tests the black body alone.

A source-native emission prior is trained on the **2,979 GP29 runes in the nine exact solved Cicada source records** of the committed relikd corpus, using +0.5 smoothing per alphabet value. The forward algorithm sums all legal hidden key-clock paths with double-precision normalization; a rejected attempt is legal only when the *same latent plaintext* and each discarded K would output the preceding observed ciphertext. The actual generated source seed/register has **no four successive equal K values in the whole tested clock**, so any rejection run has length ≤3. Enumerating m=0,1,2,3 attempts is exact for this source-conditioned register.

The comparison model independently samples each GP29 symbol uniformly and applies the same **0.81** collision-rejection rule, yielding transition probabilities **0.19/(29−0.81)** for an adjacent repeat and **1/(29−0.81)** otherwise. The model is therefore judged on language/key evidence beyond the original suppression of repeated glyphs.

## Reproducible results

| Original or control register | GP29 positions | Log likelihood ratio vs matched anti-repeat null |
| --- | ---: | ---: |
| Original p8–14 from after red four-rune word | **1,725** | **−1040.23934021** |
| Original p8–14 black body only | **1,717** | **−983.08910676** |
| Authentic solved-Cicada GP29 native-text plant under this exact register and rejection rule | **1,717** | **+652.25718903** |
| Independent uniformly sampled GP29 and the same rejection rule | **1,717** | **−977.99697868** |

The original black-body result is already **−19.13315** after 64 runes, **−63.61149** after 128, and **−130.13674** at the end of the first page's 243 black runes. The 1,717-rune positive, drawn from the independently solved GP source, actually rejected **41** tentative keys, consuming **1,758** key symbols. It scores **+42.41367** after only 128 output runes. The uniformly sampled null scores **−50.50240** by 128. Both plants use deterministic xorshift32 seed **0x66013301**. The model distinguishes its exact solved-GP positive very strongly, yet the intact original follows the matched random-like null.

These ratios apply only to the fixed source key/clock hypothesis and the solved-native unigram language model. They are not proof against a different seed, alphabet, plaintext register, marked doublet rule, or multiple cipher layers. The empirical choice of the rejection rate also prevents interpreting the result as a fully independent hypothesis test.

## Direct ambiguity of the proposed decoder

The advancing-key-on-rejection rule is itself **non-injective** without a transmitted rejection count. Using the actual original p8 seed and terminal red-heading ciphertext predecessor **B=17**, take K[0]=14 and K[1]=10:

- Hypothetical plaintext **EA=28** immediately outputs (28+14) mod29 = **P=13**, consuming one key.
- Different hypothetical plaintext **O=3** first proposes (3+14) mod29 = **B=17**, an equal-symbol event that can be rejected, and next outputs (3+10) mod29 = the **same P=13**, consuming two keys.

Both outcomes have positive probability and produce the same visible B→P ciphertext transition, yet imply different plaintext and different future clock phase. This witness is a mathematical construction using original source seed symbols; it does not claim the printed first black rune is P. A separately conveyed reject mask or uniquely decodable state rule would be essential to construct a genuinely lossless historical cipher.

**Decision:** retire the fourth-order p7 quartic plus p8 red seed plus stochastic anti-repeat key advance as a standalone GP29 decryption of p8–14. It is contradicted by the original text under a strongly positive-calibrated likelihood test, and it cannot by itself furnish an unambiguous plaintext inverse. Preserve the quartic/source-clue arithmetic separately, without retuning a phase, rate or second layer to rescue this negative.

**Exact reproduction:** [read-only Node.js22 CommonJS SFT](../sims/lp2_p7_quartic_antirepeat_drift_original_sft.cjs), which asserts the original 1,729-rune source, both receiver starts, the original four-rune seed, derived register, 2,979 solved source runes, four complete likelihoods and source-native plants. Source files: resources/liber-primus/lp2-corpus.json and resources/external/relikd-solved-gp29-native-v1.json. The authoritative LP2 plaintext synthesis is unchanged.

**Independent runner:** The complete source-native test passed on GitHub Actions Windows Node.js 22, [run 45152651217](https://github.com/FlareZ123/liber-primus/actions/runs/45152651217), including every frozen original LR assertion and both planted controls.
