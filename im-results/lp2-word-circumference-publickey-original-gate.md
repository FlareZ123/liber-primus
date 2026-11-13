# Source-visible word-circumference key transfer: 48 original-cipher negatives

**Agent37, 13 November 2026. Classification:** bounded, reproducible negative for 36 source-rune additive shell-key functions and twelve source-seeded consecutive-prime-totient clocks. The unedited original text yields no sustained GP-native English interiors. The full original-data test and **39,120 exact planted inverses** pass on Windows/Node22 ([latest manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43486272667)). **No authentic unknown LP2 plaintext, source-selected cipher, key, or destination is recovered.**

## Why this experiment is a plausible human route

The original, already-solved physical p57 Parable commands, “WE MUST SHED OUR OWN CIRCUMFERENCES” and “FIND THE DIVINITY WITHIN.” A literal reading for the 2,896 externally visible printed unknown-text words is to remove each word's two outer runes, leaving its middle runes, while allowing those removed outer symbols to act as an embedded *key*. This is a potentially reversible self-keyed cipher without invoking a lost external pad. The genuine earlier Cicada GP29 index, prime values and prime totients provide three concrete arithmetical registers.

No signed author instruction says to treat word boundaries as encryption packets or use their first and last rune as a key. The experiment therefore freezes a small explicit interpretation of the poem and refuses to fit extra functions to output.

## Finite source-to-interior model

For every printed GP29 ciphertext word `C=[c₀,c₁,…,cₙ₋₁]` with `n≥3`, leave the first and last ciphertext symbols untouched. Define two visible key operands `F=v(c₀)`, `L=v(cₙ₋₁)`, where `v` is, independently, one of:

- The canonical GP29 zero-based rune index, `v(i)=i`.
- The canonical published 29-rune prime weight, `v(i)=prime[i]`.
- Euler's totient of that prime, `v(i)=prime[i]−1`.

The proposed plaintext **interior** is `pⱼ = (cⱼ + s·h(F,L,j)) mod29` for `1≤j≤n−2` and `s∈{−1,+1}`. The six frozen key laws are `h=F`, `h=L`, `h=F+L`, `h=F−L`, `h=F·L`, and `h=F+j·L`. The last law permits a word-local changing clock, distinct from stationary per-word feedback. There are exactly **3×6×2=36** simple deterministic candidates, with no tunable shift, phase, secret alphabet, extra symbol deletion, or page-specific exception.

There are also **six source-defined starting-prime ordinal functions**: the first GP index, last GP index, their sum modulo29, first GP prime, last GP prime, and first GP prime minus one. For each function and either sign, decode the word interior with the independently authenticated p56 operation **Euler totient of successive ordinary primes**, starting at that public ordinal. This gives **6×2=12 additional fixed changing-within-word key streams**. The printed outer cipher runes supply only the initial clock. The precise key at zero-based interior position j is `prime(seed+j)−1`, where `prime(0)=2`. These are narrower source-based alternatives to freely fitting keys, and do not assume any secret word-specific number.

The [single-file executable reproducer](../sims/lp2_word_circumference_publickey_original_sft.cjs) reads the immutable `resources/liber-primus/lp2-corpus.json`, original `lp2-transcription.txt`, and the independently established `resources/control/english_wordfreq_textblob.txt`. It joins all **32 truly unmarked cross-page word continuations**: therefore the ciphertext contains exactly **12,956 original runes** in **2,896 original printed words**. Line-break slashes do not create new words.

Each decoded interior is compared with the **interior of any independently encoded English dictionary word of the same GP rune length**, using authentic GP spelling rules `QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA`. There are **20,678 distinct dictionary interior strings**. Matching interiors while ignoring their unknown plaintext first/last letters is deliberately more permissive than demanding fully recovered complete words.

## Source-result and successful independent plants

| Criterion | Original unchanged unknown LP2 ciphertext | Positive source-native planted ciphertext |
| --- | ---: | ---: |
| All original printed words | **2,896** | Original sizes and outer rune identities retained |
| Words of at least 6 GP runes | **815** | **815/815** exact interior recoveries per model |
| Words of at least 8 GP runes | **343** | Authentic dictionary interiors of same original lengths |
| Dictionary-supported interiors among the 815 longest-enough words | **0–5**, depending on chosen decoder | **815/815** per model |
| Supported interiors among the 343 words of length ≥8 | **0/343 for every one of all 36 models** | Source-native recovery retained |
| Simple shell-key decoder/positive models | **36** | **29,340/29,340** exact original-layout positive inverses |
| Consecutive-prime-totient clock models | **12** | **9,780/9,780** exact original-layout positive inverses |
| **Total** | **48** | **39,120/39,120** exact original-layout positive inverses |

The single highest incidental result is five supported interiors under the *totient-of-first-rune constant shift* register, positive sign; other simple configurations produce zero to four. Among the twelve actual p56-key-clock variants, the highest incidental match is **3/815**, and every one gives **0/343** among words with at least eight runes. No candidate produces sustained readable prose across words. The original's direct unshifted interiors produce **zero** dictionary support among 815 words of length≥6. No selected word's exterior was changed or allowed to carry a custom secret parameter.

For a positive control of each candidate, the reproducer chooses an authentic independent dictionary word of precisely the original length, encrypts its interior with that candidate and the **original ciphertext first/last runes**, then decodes. Every one of all **48×815 = 39,120** implants exactly recovers its native-GP interior and passes the same dictionary predicate. On the Windows runner, Git checkout's CRLF normalization is explicitly tolerated when parsing the English fixture.

## Decision and remaining possibility

The fixed exterior-rune keys tried here fail to recover recognizable English through the original additive GP29 operation. The more explicit historical p56 successive-prime-totient clock also fails when seeded by each word's published outer runes. This route does not warrant widening into tuned per-word formulas. It leaves many genuinely different possibilities untouched: a hidden external key, non-additive or multi-layer encryption, altered segmentation, other languages, a checksum or routing role for word exteriors, and unknown instructions elsewhere in the original artifact.

The Parable supplies a **human-readable motivation**, while the direct decoder itself remains a hypothesis. The result helps retire this bounded self-key family; it cannot turn an unexplained 2014 manuscript into a solved text.
