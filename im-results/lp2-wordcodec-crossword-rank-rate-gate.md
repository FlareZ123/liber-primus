# Original LP2 word-framing and entropy-codec source gates

**Status (17 November 2026): bounded original-cipher negatives and a necessary-state/capacity constraint. No recovered unknown plaintext, authentic key, source-selected ANS algorithm or final destination.** The exact experiment is [this read-only CommonJS SFT](../sims/lp2_wordcodec_gp29_crossword_rank_gate_sft.cjs), independently executed on the committed original source under [successful Windows Node.js 22 Actions run 43767401111](https://github.com/FlareZ123/liber-primus/actions/runs/43767401111). This report integrates bounded [Director #1166](https://github.com/FlareZ123/liber-primus/issues/1166) entropy/rate tests and [Director #1326](https://github.com/FlareZ123/liber-primus/issues/1326) word-leading explicit nonce framing. It does **not** settle nonstationary word framing or cross-word arithmetic/ANS streams.

## Source facts and a word-reset impossibility

The canonical \`resources/liber-primus/lp2-corpus.json\` alphabet and the physical-page-aware parser \`sims/lp2_word_pages.cjs\` join genuine page-carried words. The 55 rune-bearing unsolved physical pages contain exactly **2,896 printed whole words / 12,956 runes**. The unchanged printed ciphertext has these length-conditioned type counts:

| GP-rune word length | Tokens | Different ciphertext word types |
| --- | ---: | ---: |
| 1 | 83 | **28** |
| 2 | 448 | **354** |
| 3 | 720 | **704** |
| 4 | 513 | **513** |
| 5–14 combined | 1,132 | **1,132** |

There are **1,645** words of length ≥4; **every one is distinct**. This is a stronger decision constraint than a global rune IoC alone.

**Exact invariant.** Suppose a deterministic, lossless, plaintext-word-to-ciphertext-word transformation fixes its initial state at *every printed word boundary*, preserves each word's GP-rune length, and has no carried code digits, changing key, or other auxiliary information. It is injective on words of a fixed length. Thus it **preserves the number of distinct word types at each length**, whatever Markov model, arithmetic cumulative frequencies, ranking, ANS table, or permutation it uses. To decode the authentic source into ordinary GP-native English under these premises, the 83 source singletons must become 28 distinct one-rune plaintext words. A source-native GP rendering of the complete project Gibran reference has only **9** distinct singleton types; the larger first-300k-character Shakespeare sample has **11**, even including nonprose/editorial one-character tokens. Their complete length-2 inventories have 45 and 59 types respectively, also far below the source's 354 different two-rune ciphertext types. These are conditional finite-corpus controls, not an assertion that every conceivable English vocabulary is limited to them. Ordinary single-letter English prose typically uses A and I, with occasional O.

Consequently, **a purely word-reset codec cannot plausibly be the sought original prose decoder** unless the original printed segmentation is not the plaintext segmentation, the plaintext register is nonstandard, or a cross-word/tweak/side state survives each boundary. This excludes that specific mechanism class independent of a secret fixed word substitution. A *streaming* ANS/range coder with state crossing words is outside the theorem.

A narrower source-only state check strengthens the implementation requirement. Among **82** one-rune words with a preceding word on the same physical page, group each single-rune ciphertext by the immediately preceding ciphertext rune. The 82 observations occupy **28** predecessor contexts; **16** contexts contain more than two different singleton outputs and **9** contain more than three, with a maximum of **six**. Any deterministic emitter whose entire boundary state is the last ciphertext rune needs at least six different plaintext singleton possibilities in one such context. This is conditional on intact printed breaks and a full state limited to that predecessor rune. Agent30's [stronger all-secret whole-book one-back frequency exclusion](lp2-previouscipher-rowperm-allsecret-frequency-gate.md) already rules out its corresponding book-static row-bijective family on normal GP-English frequency grounds. Do not duplicate that older key-family sweep.

## Word-leading GP prime-salt framing on the full original book (Agent9, 17 November 2026)

**Different from a fixed word-length codec:** Here each printed ciphertext word begins with one explicit public nonce rune that has no corresponding plaintext rune. This could explain 83 printed singleton words using 28 distinct GP glyphs: they might be empty plaintext/control records. The original 2013 prime chart supplies numbers and the signed 2016 message mentions words and direction. Its specific nonce consumer remains **investigator-proposed**, not author-authenticated.

Freeze this one lossless rule: for every complete original ciphertext word including a physical page-carry, read its first rune index n as a nonce. Each later ciphertext rune c decodes to p = (c − GPprime[n]) mod 29; re-encode by prepending n and emitting (p + GPprime[n]) mod29. Preserve every original word delimiter and punctuation symbol verbatim as external frame information. A one-rune ciphertext word yields an empty plaintext control word. No secret nonce, padding repair or fitted key is needed to execute this candidate.

**Source-predicted zero-key crib:** index9 in the Gematria alphabet has printed prime value 29, so its public salt is zero modulo29. Every word whose first rune is GP9 must therefore display its remaining plaintext *literally unchanged*. There are **101** such original words, with **28** containing at least five subsequent GP runes; **none** of those 28 body strings matches a complete word in the pinned GP-native Shakespeare/Gibran vocabulary. This is a source-selected direct plaintext prediction, more discriminating than postselected whole-book frequency tuning.

| Original-source measurement | Locked result | Genuine GP-native positive |
| --- | --- | --- |
| Untouched source inputs | **12,956 rune ciphertext, 2,896 printed words, 32 actual page carries** | Synthetic test uses the same 2,896 original word lengths and exact source typography |
| Ciphertext/decoded lengths | 2,896 public salt runes + **10,060 decoded candidate runes**, including 83 empty records | **10,060/10,060** independently chosen Shakespeare/Gibran GP-native runes recovered |
| Normalized GP29 IoC (29×IoC) | **1.00076046356** | **1.76484002833** for exact same ciphertext-word lengths |
| Full-word vocabulary hits | **280/2,813** nonempty original candidate records, all short matches | Every 2,813 positive source-native content word is drawn from the same pinned vocabulary |
| Content words of length ≥5 runes | **0/815** original candidates match vocabulary | Every matching-length positive content word is a genuine corpus word |
| Transparent GP index9 source words | **28** content bodies of length ≥5, with **0/28** native vocabulary matches | Public zero-shift identity is exact by construction |
| Independent native clear p57 plant | The actual **95** clear GP source runes were encoded with explicit first-rune salt and recovered **95/95** | Substituting the wrong GP-index-as-salt rule changes **9,363/10,060** native plant runes |

The full original 12,956-rune source, including layout and punctuation, re-encodes exactly under this explicit invertible model. That is a correctness control, rather than evidence of an authentic cipher. The original plaintext remains near-uniform and contains no complete five-rune source-native vocabulary words. Thus **retire this particular source-prime-value word-IV architecture** without tuning nonce offsets, trying additional keys, or adding speculative layers. A differently located nonce or genuine changed word boundaries requires a separate first-party instruction. This negative does not exclude all self-describing word frames, compressed text or independent secret-key systems.

[Single-run CommonJS original-source SFT](../sims/lp2_wordlead_primesalt_framed_original_sft.cjs) · [passing Windows Node22 original plus native controls run 44000217166](https://github.com/FlareZ123/liber-primus/actions/runs/44000217166) · [Director #1326](https://github.com/FlareZ123/liber-primus/issues/1326).

## An exact output-capacity bound for a universal anti-repeat encoder

A **new unconditional combinatorial calculation under a clearly conditional encoder premise** fixes the side-channel size. On a 29-symbol alphabet, the equality indicator at each adjacent pair is an independent Bernoulli event of probability 1/29 when the underlying rune string ranges uniformly over all possible strings. This follows by choosing the first rune on each page freely and then choosing each successor as either its single equal option or one of 28 unequal options. The printed word/page boundaries are treated as fixed public data, so they do not themselves communicate independent bits.

The original 55 rune-bearing pages have exactly **10,028 same-page within-word opportunities, with 63 equal pairs**, plus **2,873 same-page cross-word opportunities, with 23 equal pairs**. Suppose a *universal* lossless GP29 encoder of the same fixed rune length and same fixed word breaks were required to emit at most those counts in **both** strata for **every** possible plaintext. The proportion of all possible same-length GP29 outputs satisfying that restriction is the product of exact binomial lower tails:
  
\[
q=\Pr\{\operatorname{Bin}(10028,1/29)\le63\}\,
  \Pr\{\operatorname{Bin}(2873,1/29)\le23\}.
\]

A reproducible log-domain calculation gives separate capacity deficits **263.15832404** and **66.00189416** bits, totaling **329.16021820 bits**. To inject all `29^12956` arbitrary plaintexts into this restricted output set would require at least **330 independent extra side-information bits**, or at least **68 additional GP29 symbols** of output capacity, even ignoring the further constraints of their own adjacency positions. Pooling the 86 repeats instead of preserving their within/cross classification yields the weaker **325.45025418-bit** bound. A universally **zero-repeat** fixed-break scheme would need **653.12696868 bits** of additional capacity at this length.

This is a cardinality theorem, **not** a conclusion that Cicada necessarily used a 330-bit escape tape. The only known output is one historically fixed LP2 ciphertext. A bijection on all GP29 strings can output one such rare string while allowing many repeats on other inputs. English prose also occupies a restricted subset of all GP29 strings, allowing a source model to exploit redundancy. Consequently, the calculation tests the storage budget of any proposed encoder claiming a *guaranteed* repeat cap on **arbitrary** GP29 input, and exposes the missing state/escape budget in such a proposal. The original displayed punctuation is externally given here; attributing 330 hidden bits to its positions would require a separate author-supplied interpretation.

[Source-aware exact-binomial CommonJS SFT](../sims/lp2_wordcodec_doublet_channel_capacity_sft.cjs) · [passing original-source Windows Node22 run 43768598782](https://github.com/FlareZ123/liber-primus/actions/runs/43768598782).

## One fixed, fully reversible cross-word rank transport

A deliberately narrow, **length-preserving 29-symbol finite-state rank codec** tests whether an English-conditioned low-probability rune escape could explain the output repeat budget. It is a fixed-radix entropy-rank **surrogate**, not a variable-rate rANS compressor and not an operation authenticated by Cicada. The entire choice was frozen before observing the candidate plaintext:

1. Source-native Gibran GP29 words train a Laplace-\`+1\` order-one frequency model, with a distinct beginning-of-word context; ties resolve by canonical GP ordinal. Assign rank \`r=0..28\` by descending frequency.
2. Retain the last two ciphertext runes \`a,b\` **continuously across words and printed pages**, seeded \`(13,5)\`; only the *plaintext model context* resets at a word break. This state can distinguish repeated A/I singleton plaintext tokens.
3. For rank \`r=28\`, emit \`c=b\` (a repeat). For ranks \`0..27\`, emit \`c = (b + 1 + (5r + 5a + 13b) mod 28) mod 29\`. The 28 nonzero steps are a bijection because \`5\` is invertible modulo28.
4. The inverse obtains \`d=(c-b) mod 29\`; if \`d=0\`, \`r=28\`, otherwise \`r=17(d-1-5a-13b) mod28\`, then looks up the context-ranked plaintext GP symbol. State updates \`(a,b)←(b,c)\`. Every GP29 symbol, including F, IO/IA and ING/NG, remains represented exactly.

The 5/13 choices are exploratory integer constants suggested by GP primes and visible small numerals, **not a historical instruction selecting this cipher**. No parameters are fitted to LP2. The implementation is a total bijection on arbitrary GP29 words, requires no lossy projection or side bits, and its arbitrary GP29 and exact-length English controls successfully invert. A planted 2,896-word/12,956-rune GP-native Gibran book decodes **12,956/12,956** exactly. A wrong Shakespeare-trained decoder also re-encrypts its wrong output exactly: this is an expected mathematical invariant, not evidence of a correct key.

## A distinct genuine base29 rANS stream inverse: exact framing negative

A second original-input branch replaces the fixed-radix surrogate with **actual integer range asymmetric numeral systems (rANS)**, using original GP29 word lengths as the *external* printed boundary channel. This is an **un-padded, directly serialized** reversible compressor, and therefore its source-rate conclusion is distinct from the word-reset and fixed-rank tests. It has no independently authenticated LP2 model/header selector.

The public model uses source-native Gibran GP29 one-back frequencies, with reset context at each printed word, frequency quantization by largest remainder to a total of **841**, and every GP rune assigned positive frequency. The rANS state is held continuously across all words and normalized with output radix **29**, integer floor **707,281 = 29⁴** and canonical five-GP-rune terminal-state header. Encode plaintext in reverse under its forward word-context table, emitting radix29 digits as needed; decode in natural reading order using the supplied word lengths and require **every** printed source digit to be consumed and the initial state restored. This is exact and handles all 29 symbols, including F, NG and IA. [Code with full forward/inverse and fixed original-input tests](../sims/lp2_wordcodec_real_rans_stream_original_sft.cjs) · [passing original-source Windows Node22 run 43768951158](https://github.com/FlareZ123/liber-primus/actions/runs/43768951158).

An arbitrary GP29 suite in source length1–14 and a separate full length-profile-matched GP-native Gibran plant round-trip **exactly**, including terminal-state and byte/rune-for-rune input exhaustion. The **12,956-rune native plaintext plant compresses to 9,377 transmitted GP29 symbols**, including its five-rune state header, and produces **289** adjacent equalities in that resulting shorter compressed stream. This calibrated length and ordinary uniform-like repeat rate already differ substantially from source's 12,956 runes and rare 86 same-page repeats; a separate output transport, padding or escape state would be needed to bridge them.

The first five authentic original rune digits do yield a numerically acceptable rANS state under this particular model. However, demanding the externally printed **full 2,896-word/12,956-rune plaintext length contract** causes the decoder to consume only **9,445 original ciphertext digits**, leaving **3,511 unused**. The reconstructed decoder state is **5,923,633**, not the requisite initial state 707,281; it is a hard **frame-invalid inverse**. The independently printed first original chapter p0–2 consumes **537/729** cipher runes and leaves 192; the blind p3–7 chapter consumes **843/1,145** and leaves 302. Their final states also fail the exact end-state condition. No original chapter matches the frozen rANS packet grammar.

The unconstrained 12,956-symbol candidate from arbitrary source bytes has normalized GP29 IoC **1.7214362** and **258** Gibran training-lexicon whole-word hits. Such artificial language-frequency enrichment is **expected**: the rANS decoder selects symbols through its language-trained frequency table, even when fed random digits. It cannot establish recovered English; its word strings are incoherent and, decisively, the unused digits and wrong terminal state invalidate the packet. A wrong-model decoder likewise fails the native plant's frame check. **The correct decision is to reject this direct, unpadded GP29 rANS serialization**, without claiming to exclude an ANS method with an authentic extra channel, very different plaintext lengths or author-specified normalization. Any attempt to force a 3,511-digit remainder into an unsourced padding field would change the mechanism after seeing the answer.

## Original-input failure and native rate budget

The original remains **86** adjacent repeat runes and **104/2,105** word-interior fiveback echoes. On the fixed rank model's original plaintext candidate:

- **p0–2 (729 authentic runes, 158 words):** normalized GP29 IoC **1.01199897496**; only **3/158** whole decoded words occur in the training lexicon. No contiguous source-language sentence.
- **Blind p3–7 (1,145 authentic runes, 255 words):** normalized GP29 IoC **1.01403029285**; only **3/255** training-lexicon hits. This separately held-out chapter confirms failure rather than local overfitting.
- **All 12,956 original runes:** normalized GP29 IoC **1.00724150344**, **48/2,896** native-lexicon hits. Forward re-encryption is 12,956/12,956 by the defined bijection, but conveys no historical identity.

On an exact native-GP length-matched planted corpus, the fixed output produced **zero adjacent repeated runes** and **68/2,105** word-interior fiveback echoes. With **256** independently seeded, length-matched Gibran plaintext plants using the *same frozen model*, **all 256** produced zero adjacent repeats. The simulated fiveback count averaged **73.26953125** with SD **7.98543654**, ranged **53–95**, and **none** reached the source's 104. This is a model-and-control-specific incompatibility, not an unconditional p-value for Cicada's unknown language or encryption architecture. The model's rank-28 repeat branch is never activated on these Gibran native plants, so the original's 86 escape-like repeats alone decisively show an inadequate source-rate model for that registered plain-language control.

**Decision:** retire this particular two-back fixed-radix rank transducer. Neither its exact reciphering nor its fitted-free state update produced authentic unknown plaintext. A genuinely viable arithmetic/ANS model would need a source-selected, reversible **cross-word normalization/escape/spillover operation**, an explicit clock and starting state, a way to account for all 86 repeats while preserving the observed singleton diversity, and a locked p0–2 decryption that predicts untouched p3–7. Do not simply retune the rare rank, state multipliers, or input corpus to imitate these outputs. The independent source-selected decoder/key is still missing; #1166 remains an open, broader research decision.
