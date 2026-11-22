# LP2 arbitrary per-word affine ramps: exact finite-English inverse obstruction

**14 November 2026, Agent 9.** A new original-cipher, **all-secret-key necessary-condition** result for a word-local position-dependent affine family. The unmodified 12,956-rune LP2 original is inconsistent with assigning ordinary GP-native words from the pinned 29,154-word English lexicon to **764 of its 815 printed words with six or more runes** under *any* secret affine ramp chosen independently for each word. This is a bounded finite-dictionary rejection, **not** recovered unknown plaintext, a historical cipher or key.

## Distinct proposed inverse and its actual premise

The original's marked word boundaries and 2016 signed phrase “Its words are the map, their meaning is the road, and their numbers are the direction” motivate a word-local key clock. An individually changing key could suppress ordinary letter frequencies while retaining exact printed word lengths. The strongest unsupported premise is that the original separators preserve true English GP words; the source supplies no ramp operation, nor a secret-slope schedule.

Here each printed word w has its **own completely arbitrary** secret triple (a_w,b_w,t_w), a_w∈GF(29)× and b_w,t_w∈GF(29):

\`\`\`text
C[w,j] = a_w · P[w,j] + b_w + j · t_w  (mod 29)
\`\`\`

The key can vary across successive words with no relation whatsoever. This includes a distinct Caesar shift, a distinct affine alphabet and an independent linear positional key ramp **for every single word**, without a global or chapter phase. The equation is fully reversible with those word keys: P[w,j]=a_w⁻¹(C[w,j]−b_w−j t_w) mod29. It is therefore substantially more permissive than the existing direct wordwise-affine source gate, which lacks j t_w, and different from plaintext-word-derived GP-prime slopes, which constrain t_w by each word's plaintext sum.

No keys need be searched. Write \`d_j(W) = W[j+2] - 2W[j+1] + W[j] mod29\`. Because second differences annihilate the constant b and the linear j t, the proposed cipher necessarily satisfies

\`\`\`text
d_j(C) = a_w · d_j(P)  (mod 29).
\`\`\`

For length at least three, normalize the entire second-difference vector by its **first nonzero** component; if every component is zero, give the vector a separate all-zero signature. This vector is exactly **invariant under every permitted secret (a_w,b_w,t_w)**. It is a complete classification of word sequences under the family: a given source word and ciphertext word share a signature iff some allowed triple converts one to the other.

## Exact original-cipher and independent English lexicon

- Original input: \`resources/liber-primus/lp2-transcription.txt\` and rune map \`resources/liber-primus/lp2-corpus.json\`; physical p0–55, with runeless p50, 12,956 GP runes, 2,896 *complete* printed words (joining page carries and line wraps, retaining real punctuation breaks).
- Reference: existing \`resources/control/english_wordfreq_textblob.txt\`, **29,154 representable entries** after omitting source words that cannot be spelled in the native GP29 register (e.g. an isolated Q). Canonical \`QU→CW\`, \`V→U\`, \`K→C\`, \`Z→S\` spellings and greedy longest matches include single-rune \`ING→NG\`, \`IO→IA\`; token frequency counts and English guesses play no part.
- For each original printed word of length ≥4, compute its complete key-independent signature and look up whether *any* dictionary entry of identical GP-rune length has that signature. The exact set membership is an all-keys inverse existence test. It is not a statistical English-likelihood score and contains no tuned key or cipher-text-derived dictionary.

| Original GP rune-word length | Original word count | Any English word in reference compatible with any word-local ramp | Incompatible |
| ---: | ---: | ---: | ---: |
| 4 | 513 | 513 | 0 |
| 5 | 317 | 312 | 5 |
| 6 | 256 | **48** | **208** |
| 7 | 216 | **3** | **213** |
| 8 | 156 | **0** | **156** |
| 9 | 78 | **0** | **78** |
| 10 | 52 | **0** | **52** |
| 11 | 32 | **0** | **32** |
| 12 | 18 | **0** | **18** |
| 13 | 4 | **0** | **4** |
| 14 | 3 | **0** | **3** |

Across word length six or longer, exactly **51/815** target words admit any dictionary-plaintext preimage, leaving **764/815 impossible for the chosen finite 29,154-word lexicon under every individual key**. In the longest bracket, **343/343** source words with length eight or greater have no such preimage. For length seven or more, only **3/559** do. The test intentionally gives each original word an independent key, eliminating objections about an incorrect global key, phase, word order or periodic key.

The 513 four-rune slots are uninformative because a two-entry normalized second-difference vector has only 30 classes; they all occur in the lexicon. The five-rune near-coverage is likewise a reminder that this is a **long-word architectural obstruction** rather than a global cipher-breaker.

## Exact positive control, execution and limits

The [one-file original-input Node22/CommonJS reproducer](../sims/lp2_word_affine_ramp_dictionary_sft.cjs) plants **all 2,896** original-shaped word slots from independently selected *actual dictionary GP words*, with one independently generated secret nonzero a, b and t for each slot. It encrypts and inverse-recovers **all 12,956 runes exactly**, and asserts signature invariance and lexicon compatibility for all **1,645** planted words of length at least four. It also asserts the complete original-length row census and target match counts above. The actual original ciphertext is never changed to produce the negative.

**Passing manual GitHub Actions run [43624558856](https://github.com/FlareZ123/liber-primus/actions/runs/43624558856)** validates the complete script after a Q-encoding input fix; the existing \`.github/workflows/word-affine.yml\` remains manual-only. This is independently reproducible from committed original corpus and lexicon.

**Decision and causal implication:** A separately guessed linear time/position ramp at each preserved word boundary cannot produce ordinary GP29 English lexicon words in most of the manuscript's long word slots, regardless of the many secret keys. Additional fitting of a,b,t within this architecture cannot help. The single-user language register, dictionary completeness, word-boundary correctness, and cipher equation remain assumptions; a changed number of underlying plaintext symbols, cross-word mixing, nonlinear hidden alphabet, state changing within words, a binary intermediate or unusual source language can escape. This result neither establishes a real cipher nor supplies any recovered LP2 plaintext. The next candidate needs an independent source selecting a **different reversible operation** or authentic external key; a new free-slope hunt would be repeating an exhausted exact mathematical branch.

Related and **distinct** reports: [static word-affine three-rune shape](lp2-three-rune-word-affine-invariant-gate.md), [direct wordwise secret-alphabet and phase gates](lp2-wordwise-bijection-pattern-gate.md), [source-word self-prime-slope](lp2_plaintext_wordsum_progressive_gate.md).
