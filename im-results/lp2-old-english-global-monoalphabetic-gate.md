# Old English global monoalphabetic substitution: original-input decision

**Agent 3 · Director #802 · 14 November 2026. No unknown plaintext or authentic key was recovered.**

## Discriminating test

The exact 29-symbol GP inventory and a previously proposed p14 Old English Rune Poem illustration link motivated the hypothesis that LP2 p0–55 is **Old English under one global GP29 bijective substitution preserving printed word boundaries**. A fixed permutation must preserve both rune index of coincidence and the number of distinct one-rune printed words, whatever its hidden key.

From the original LP2 corpus and the [full original-ink audit](lp2-original-ink-critical-site-audit.md), the 55 rune-bearing unknown physical pages contain **12,956 runes** and **83 complete singleton printed words representing 28 distinct GP runes**. Their IoC is **0.0344783978645**. No ciphertext-to-plaintext mapping was fitted.

Five independently sourced Old English inputs were frozen at [old-english-learner-texts/old-english-texts](https://github.com/old-english-learner-texts/old-english-texts), upstream commit **117a910ab47b74b9b1964a589c044ab5fd59a307**. Source-specific immutable blob SHA values are in the accompanying executable. Its Beowulf is original-language verse; the Chronicle and three prose texts are ISWOC source-form treebank records. Their repository grants CC BY-NC-SA 3.0 for the treebank; only citations and computed statistics are preserved here.

| Old English input | GP runes | Distinct one-rune words | Full IoC | Lowest exact 12,956-rune window IoC |
|---|---:|---:|---:|---:|
| Beowulf | 82,780 | 1 | 0.0543726206 | 0.0535338144 |
| Anglo-Saxon Chronicle A | 23,551 | 6 | 0.0566173370 | 0.0567865062 |
| Ælfric's Lives of Saints | 13,953 | 2 | 0.0543299503 | 0.0541363823 |
| Apollonius of Tyre | 22,589 | 3 | 0.0558566860 | 0.0556406870 |
| West-Saxon Gospels | 48,285 | 1 | 0.0570127085 | 0.0561361680 |
| **Original LP2** | **12,956** | **28** | **0.0344783979** | **0.0344783979** |

**All five Old English sources combined use only eight different one-rune GP word types: A, C, E, EA, I, L, N, U.** Across **126,383** exact-length contiguous rune windows, the smallest native Old English IoC remains 0.0535338144. A secret alphabet permutation cannot alter either finding, so a constrained substitution solver or held-out Old English language model would have no consistent plaintext in this finite normalized reference register.

Normalization: Unicode NFD, remove combining marks, lowercase; ð/þ→TH, æ→AE, œ→OE, ƿ→W, ȝ→G, ſ→S, K→C, V→U. The digraphs TH, NG, EO, OE, AE, IA, EA consume a single GP rune, greedily ahead of single characters. Unsupported words are rejected, including one foreign-name token in Apollonius and 13 in Gospel; none are rejected in the first three books. Treebank editorial decisions remain limitations of this register.

## Positive and independent controls

The [single runnable Node.js test](../sims/lp2_old_english_monoalphabetic_original_sft.cjs) retrieves each corpus at an immutable Git commit, verifies its Git blob SHA, checks the 169-site source-ink manifest, recomputes all finite Old English windows, and plants/reverses a fixed affine 29-symbol permutation on each native input exactly. It also reports existing modern English Shakespeare, Latin Vulgate, and seeded uniform-random controls. These show why a random-looking original is distinct from source-normal Old English, while the planted positive demonstrates the fixed-cipher implementation's competence.

For 83 independent uniformly drawn GP runes, the expected number of distinct symbols is **27.42427**, and the exact chance of at least 28 distinct symbols is **0.51207**. The 28 observed original singleton symbols are ordinary under the uniform-rune null. This is descriptive, not a key or historical encoder.

**Outcome:** Retire only the word-preserving, one-global-substitution Old English reading under the five independent Old English registers. Other Old English literature or spellings, per-page or changing-state ciphers, transposition, word resegmentation and nonlinguistic content are outside the tested model. No genuine plaintext interval has been recovered.
