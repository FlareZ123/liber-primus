# Signed-DH six-back echo: all-29 plaintext-marker inverse and held-out word morphology

**Agent9, 15 November 2026. Evidence level: original-cipher, source-conditional negative.** An exact reversible cipher test on **all 12,956 unknown LP2 runes** finds **no fixed GP29 plaintext marker** supported by the original six-back echo positions. The best letter under three independent GP-English source models loses to an unconstrained constant echo-rate baseline in both the original training section and the unseen floral section. **No genuine unknown plaintext, historical encryption key or final destination was recovered.**

## Why this is a distinct attempt at recovering actual letters

The original LP2 ciphertext has the previously discovered word-local recurrence candidate

    T(x) = (24 − 2x) mod 29,
    C[word,j] = T(C[word,j−6])  at j >= 6.

The exact affine map is reconstructible retrospectively from Cicada's signed January 2013 toy Diffie–Hellman example: server exponent **6**, public share **8**, shared secret **2**, and final BASE29 3301 digit **24**. The original p39 red three-rune factor and the independently observed lag-five S echo are further established conditional associations, but no signed instruction says to turn this match into a cipher. The [historical relation and original statistical tests](lp2-2013-signed-dh6-lag6-original-source-bridge.md) already reported **80 matches among 1,290 eligible original word-internal positions**, including a split **60/953** at original pp0–39 versus **20/337** at pp40–55. This study neither rediscovers that arithmetic nor re-runs its large collision null.

A potentially useful *new plaintext-extraction hypothesis* is that exactly matching T identifies **one reserved plaintext rune** in a 29-way, six-step self-synchronizing symbol code. If so, the **80 original sites would supply 80 definite plaintext-symbol locations**, regardless of the remaining secret output alphabets. We tested all 29 possible reserved symbols, including the known solved-p56 special F, the T fixed point H, and p39's S, rather than assuming any one.

## Explicit bijective original-cipher inverse

For each original complete printed word, take its first six ciphertext runes as an unconstrained initialization; short words are unchanged by this conditional model. At each local offset j >= 6 let **e = T(C[j−6])**. Reserve the ciphertext output e for plaintext symbol r. The other **28** plaintext symbols are mapped bijectively in canonical GP29 rank order onto the remaining **28** ciphertext outputs. Precisely:

    if P[j] = r: C[j] = e
    else:
      q = P[j] - 1(P[j] > r)
      C[j] = q + 1(q >= e)

This is invertible using the public prior ciphertext six-back state:

    if C[j] = e: P[j] = r
    else:
      q = C[j] - 1(C[j] > e)
      P[j] = q + 1(q >= r)

The key-independent *necessary and sufficient* marker condition is therefore:

    C[j] = T(C[j−6])  iff  P[j] = r.

Even granting any **unknown position-dependent bijection** of the 28 nonmarker plaintext/output symbols cannot affect these exact 80 event sites. The rank mapping is one complete explicit inverse and roundtrip control, not an inference that the book uses that mapping.

## Exact original and withheld result

The original inputs are the canonical 55 rune-bearing physical LP2 pages, including all page/line-spanning words, from [the source corpus](../resources/liber-primus/lp2-corpus.json) and [word parser](../sims/lp2_word_pages.cjs). Frozen split: physical pp0–39 train the unknown marker symbol; pp40–55 are held out. The native GP29 reference probabilities for **every exact word-length and within-word offset** are estimated from separately pinned Shakespeare, Gibran and Emerson prose using the established longest-match GP transliteration and historical spelling folds, smoothed with max(15, slot size/10) times the pooled unigram prior. The same fixed probabilities score both original halves.

For a hypothesized marker r and every eligible original position, score the Bernoulli log likelihood of the observed match/nonmatch using the reference probability of r in precisely that word position. Compare it with a *separately fitted constant Bernoulli echo rate* for each half (this permissive baseline ignores word morphology). All 29 marker assignments were evaluated on train, with no cipher key or new page reordering. The best train marker was then frozen on withheld pages.

| GP plaintext marker hypothesis | Train expected echo count / 953 | Actual train echoes | Train log-likelihood minus flat-rate baseline | Withheld log-likelihood minus flat-rate baseline |
|---|---:|---:|---:|---:|
| **L**, best of all 29 on train | **44.454** | **60** | **−1.90148** | **−3.72314** |
| R, second-best on train | 55.765 | 60 | −6.65525 | −0.82103 |
| N, third-best on train | 88.554 | 60 | −9.21102 | −2.57100 |
| **F**, p56 transparent-rule candidate | 8.129 | 60 | **−94.17543** | **−29.77958** |
| **S**, p39 lag-five-rune association | 134.255 | 60 | **−53.57136** | **−13.96153** |

**Every one of the 29 fixed-symbol assignments has a negative training advantage.** Even the least-disfavored letter **L** loses on withheld original pages where the same source prior expects ~15.792 L events but the actual **20** T6 echoes occur at poorly matched word positions. This is a conditional model comparison; it does not supply a discovery-wide p-value or a theorem about arbitrary English, constructed vocabulary, different word boundaries or a changing plaintext symbol.

The previous [H-specific two-marker cipher](lp2-lag6-fixedpoint-h-two-marker-original-gate.md) had separately noted **31 forced word-final H** sites with extreme source-native lexical incompatibility. This new all-29 single-marker test extends the question beyond H, without retesting its two-marker/AES-table design.

## Reversible positive and direct original checks

The [single-file CommonJS SFT](../sims/lp2_dh6_all29_reserved_rune_heldout_sft.cjs) asserts every original rune and word, 1,290/80 echo locations and the 953/60 + 337/20 split, then computes the exact native control model and full 29-marker ranking. For **each of 29 candidate markers**, it decodes and forwards all **2,896 original complete words**, exactly recovering the original **12,956/12,956 source runes** under its own rank convention. This roundtrip is a cipher algebra check, never evidence that a chosen key is authentic.

A separate source-native positive uses Gibran GP words with the **same lengths as all 559 original words of at least seven runes**, planted independently under the exact reversible encoder for three reserved runes F, S and L. For every eligible position the artificial marker equivalence holds exactly, and inverse/forward decoding recovers every planted rune. This verifies that native-language plaintext *can* be represented by the proposed code with the stated event semantics.

## Cryptanalytic decision

**Retire “every original DH6 affine echo means the same fixed GP29 plaintext rune” for intact native-GP English word morphology**, including arbitrary secret bijections on all other outputs. The original 80 matches do not yield 80 defensible plaintext cribs. A genuinely new attempt should identify an **external key, source-selected nonliteral echo meaning, or reversible site-selection/update law** that predicts nonmatching original ciphertext sites. The current signed-DH arithmetic, p39 red-factor relation and lag-five S motif remain potentially interesting original clues, with no established decryptor.

No source-native symbol has been recovered from the unknown pages; no further expansion of lag-six affine-operator searches is justified by this finite marker result.
