# Original LP2: five-step feedback reset and independently keyed word-local additive models

**14–17 November 2026; Agent 15's chapter/page/shared-word gate (#887), Agent 23's independently keyed complete-word original-cipher gate, Agent13's arbitrary-IV exact extension, and Agent45's original-source φ(prime) lag-five clock decision.** These are finite, native-GP-English exclusions of explicit additive five-step models and a separate direct source-key clock perturbation. No unknown LP2 plaintext, authentic key or destination has been recovered.

## Source premise, candidate rule and unfitted invariant

The 2014 original pp0–55 contain **12,956 rune indices** across **55 rune-bearing pages**, **2,896 complete printed words**, and **nine source-visible illustrated top-level chapters** of lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`. Independent original-cipher research found **104 within-word five-apart equal-rune events** among 2,105 eligible positions and a conditional enrichment of five-apart echoes at printed word boundaries. That is a reason to consider a five-step state, but the author has supplied **no** instruction selecting the following model.

Freeze exactly one hypothetical ciphertext-feedback additive generator: within every segment chosen by the reset scope, for local `t≥5`,

```text
C[t] = (P[t] + K[segment,t mod 5] + C[t-5]) mod 29
```

The first five ciphertext runes of each segment are unconstrained initialization symbols. Every `K[segment,phase]` is a completely **unknown** GP29 constant. For all eligible sites, the observable delta `D[t]=(C[t]-C[t-5]) mod29` is just `P[t]` plus its class's constant rotation. This preserves the **exact pairwise equal-rune counts within every (segment, five-phase) class for every choice of all secret keys**, irrespective of the numbers' values. The model is bijective given a key and the initial five plaintext symbols; no collision-repair parameter, fitted prime phase, implicit F mask or guessed plaintext occurs.

For chapter- and page-reset candidates, grant **separate unrestricted five-symbol keys for every segment**. For word reset distinguish (i) one shared five-phase key reused on all words and (ii) separate completely secret five-phase key for each word. These are different key-equality assumptions.

## Full original and source-native positive comparison

The standalone [source-locked CommonJS test](../sims/lp2_lag5_cipher_feedback_reset_invariant_sft.cjs) asserts the complete original GP indices and all 2,896 words in their exact order, including every joined page carry. It encrypts **16 disjoint Shakespeare GP29 English windows**, each exactly 12,956 source-native rune indices, with deterministic prime-valued five-key plants `[2,3,5,7,11]`. These are positive checks, **not** trial keys for original LP2. The established source-calibrated encoder preserves the GP `ING`/`IO` orthography known from solved LP1. All planted ciphertexts re-decrypt exactly; every key-invariant class collision count exactly matches the original control plaintext count.

| State-reset/key model | Original eligible deltas | Comparable class pairs | Original GP29 class IoC | Minimum of 16 independently sourced English-plant IoCs |
| --- | ---: | ---: | ---: | ---: |
| **Nine illustrated chapters**, separate unknown 5-key per chapter | 12,911 | 2,332,072 | **0.034420035** | **0.058304375** |
| **55 physical pages**, separate unknown 5-key per page | 12,681 | 302,016 | **0.034438573** | **0.058953830** |
| **2,896 printed words**, one five-key shared across all words | 2,105 | 634,908 | **0.034362459** | **0.057017710** |
| **2,896 printed words**, independently unknown five-key per word | 2,105 | **92** | **0.065217391** | **0.021739130** |

All three sufficiently constrained original variants are essentially at the random GP29 baseline `1/29≈0.03448` and below every native-language control by a large gap. Their true synthetically generated controls remain recognizably nonuniform. Thus **no choice of any of their secret five-phase offsets can make their full original class distributions GP-native-English-like**. This is a necessary-condition rejection of the tested direct ciphertext-feedback mechanism for chapter/page resets and a common-key word reset, not an extrapolation to a different cipher.

The **independently keyed word-reset case is not excluded by this particular pairwise statistic**: only 92 comparable within-word five-phase pairs survive, with 6 equal pairs. Worse, 10,851/12,956 original rune sites fall in the first five positions of their respective words and are unconstrained IV sites in this model. Recovering their plaintext would demand genuinely source-selected per-word initialization and keys, not another fitted phase search. The control row spans a very broad expected range (0.0217–0.1087), so its single original IoC is not evidence for a word-reset mechanism.

## Independently keyed five-back zero-IV feedback: new exact difference-vector gate

**Prior-art boundary:** a previous [109-word all-secret period-five affine exclusion](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs), subsequently strengthened by an [authentic F-skip and exact 244-rune repair budget](lp2_word5_affine_allsecret_gate.md), already rejected the **direct additive** case, including arbitrary independent slopes and five word-specific shifts. The distinct decision here is whether adding the *previous ciphertext rune five positions back* with a zero first-block predecessor changes that result. The direct model is included only as a matched algebraic control and should not be counted as an independent new discovery.


The previous pairwise-IoC test deliberately left an entire five-symbol starting block **unconstrained** at each printed word. Two tighter, fully defined and individually reversible hypotheses are now tested without guessing even one key: the direct word-reset additive cipher
`C[w,j] = P[w,j] + K[w,j mod 5] (mod 29)`, and a five-back feedback cipher with the **same five secret word-specific keys** at all positions and a zero predecessor on the first five runes,
`C[w,j] = P[w,j] + K[w,j mod 5] + (j>=5 ? C[w,j-5] : 0) (mod 29)`.
Each of the 2,896 printed words receives **five entirely independent unknown shifts**, so no key is shared between two words, chapters or pages.

Define `D=C` for the direct model. For feedback, `D[w,j]=C[w,j]` at `j<5` and `D[w,j]=C[w,j]-C[w,j-5]` at `j>=5`. Both models necessarily satisfy the identical **key-independent original-to-plaintext constraint**
`D[w,j+5]-D[w,j] = P[w,j+5]-P[w,j] (mod 29)` for all within-word eligible positions. This is stronger than the earlier collision rate: it fixes the *actual sequence of differences*, granting every word its own secret five-symbol key.

The standalone [all-secret complete-word SFT](../sims/lp2_wordlocal_fivephase_allkey_lexicon_sft.cjs) checks the untouched **12,956 original runes in 2,896 joined printed words** against the unchanged GP29 corpus. Its **29,157-word** English lexicon is the pinned TextBlob frequency source, converted to native Gematria Primus (including the solved-page `ING→NG` and `IO→IA` single-rune orthography). Each source word of length at least six is compared with *every* dictionary token of the same GP-rune length using its exact difference-vector fingerprint. The dictionary includes uncommon proper names and technical vocabulary and is deliberately generous; it remains a **finite English register**, not every possible constructed word or every historical language.

| Original GP-rune word length | Words | Direct compatible with any native-English word | Zero-IV feedback compatible |
| --- | ---: | ---: | ---: |
| 6 | 256 | 256 | 256 |
| 7 | 216 | 207 | 205 |
| 8 | 156 | 24 | 22 |
| 9 | 78 | 1 | 1 |
| 10 | 52 | **0** | **0** |
| 11 | 32 | **0** | **0** |
| 12 | 18 | **0** | **0** |
| 13 | 4 | **0** | **0** |
| 14 | 3 | **0** | **0** |
| **Total 6–14** | **815** | **488** | **484** |

Thus **all 109 unchanged original words of GP length 10–14 contradict both complete five-phase additive models**, independently extending the prior direct-key result to the specific zero-state five-back feedback cipher under the entire native-English lexicon, for **every choice of all 14,480 unknown word-specific additive shifts**. Of these, **73 source words contain no literal ᚠ (F)**. Under the authenticated solved-page *plaintext-F-transparent* rule, a plaintext F must appear as ciphertext F and must not advance the key clock; none of those 73 words can contain a hidden F or an F-related clock interruption. Their difference-vector contradictions therefore survive the **literal-F-transparent variant** of either defined additive scheme. One such 10+-rune F-free word suffices as a finite-lexicon contradiction. The script separately encrypts a full **2,896-word native-English plant** preserving all original word lengths with an independently selected five-shift key for *every* word, under each mode; it recovers the exact plaintext and all **815/815** eligible planted dictionary fingerprints in both models. The syntax, original-source assertions and both positives passed the [isolated manual GitHub Actions run 43649315130](https://github.com/FlareZ123/liber-primus/actions/runs/43649315130).

**Decision:** retire any **exact five-phase additive key reused at offsets j and j+5 within each printed word**, including the independently keyed direct model and the specified zero-state five-back feedback variant, **even with source-authenticated literal-F-transparent key-clock skips on 73 F-free long words**, as an English decoder under intact word boundaries. The earlier zero-IV test alone could not exclude a five-back feedback cipher with **five arbitrary, unshared first-block initialization runes**, as in Agent15's model. The separate exact length-12–14 original-word test below now excludes this *additive* arbitrary-IV branch under the native-English register. Arbitrary per-word substitution permutations, changing clocks, nonlinear key states, different languages and transformed word boundaries remain separate families. A planted inverse establishes correct implementation, while the original provides **no recovered plaintext or key**.


## Arbitrary first-five-IV completion: exact original long-word certificate (16 November, Agent13)

This closes the narrower *independently word-keyed GP29 additive five-back* variant previously left unresolved by the chapter/page collision and zero-IV screens. Every original printed word may choose its own five completely free shifts K[0..4] and its own five arbitrary starting ciphertext positions C[0..4]. For j>=5, the proposed encoding is:

~~~text
C[j] = (P[j] + K[j mod 5] + C[j-5]) mod 29
~~~

For any secret shifts and any initial values, two successive same-phase steps cancel both unknown quantities, giving a **necessary exact plaintext equation** at every j>=10:

~~~text
(C[j] - 2*C[j-5] + C[j-10]) mod29 = (P[j] - P[j-5]) mod29.
~~~

This uses no guessed key, fitted shift, source word choice or plaintext score. Original inputs are the 2,896 complete printed words and 12,956 GP runes from the existing page-carry-aware transcription, with the unchanged 29,157-term TextBlob word-frequency lexicon and independently solved LP1/p57-calibrated English→GP spelling. The [standalone full-corpus CommonJS SFT](../sims/lp2_wordlocal_fiveback_arbitrary_iv_exact_sft.cjs) asserts every original scope and tests all eligible words. It is a **finite English-register exclusion**; unsupported English spellings, another language and changed word divisions remain possibilities.

| Original rune word length | Original count | At least one native-English exact signature match | No match | No match and no ciphertext F |
|---|---:|---:|---:|---:|
| 11 | 32 | 32 | 0 | 0 |
| 12 | 18 | 11 | 7 | 7 |
| 13 | 4 | 0 | 4 | 2 |
| 14 | 3 | 0 | 3 | 1 |
| **11–14** | **57** | **43** | **14** | **10** |

The shortest original-word counterexample is physical p22 rune offset35 (global original offset5410), 12 GP runes with invariant (28,24); no same-length native-lexicon word matches. The longer **F-free** p13:211 length14 word has signature (9,1,9,0), with no exact matching native word. All 14 rejected words, their physical locations, GP runes and signatures are printed by the SFT. In the fixed 29,157-entry dictionary, the 29^(L−10) possible signatures have distinct native coverages 29/29 at length11, 408/841 at length12, 346/24,389 at length13 and 151/707,281 at length14. Thus trivial length11 compatibility is expected, and the sparse longer-word incompatibilities are discriminatory. Ten rejected original ciphertext words contain no F at all; the authenticated plaintext-F passthrough from solved pages could not hide an additional F within them under this length-preserving mechanism.

**Positive controls:** the SFT encrypts, decodes and signature-matches one independent native English word for every original eligible length-11–14 slot, **57/57 exact**, using nonzero independent five-phase shifts and five arbitrary first-block offsets. Hence the original failures reflect incompatibility with the proposed model and finite native lexicon rather than an invalid inverse. The resulting classification is: the *additive* independent-word five-back with arbitrary first-five ciphertext initialization is ruled out for ordinary native-English plaintext at intact original word breaks. The much broader **five independent arbitrary nonlinear alphabets per word**, source changes and altered segmentation are untouched; no unknown plaintext/key is recovered.


## Word-specific affine multiplier and feedback: exact all-secret long-word obstruction (16 November, Agent13)

Extend the independently word-keyed additive model above to the much broader GP29 recurrence with **an arbitrary nonzero scalar A**, **any feedback B∈GF(29)**, five independent phase shifts K[0..4] and five arbitrary initial ciphertext values, **fresh for each original printed word**:

~~~text
C[j] = A*P[j] + K[j mod 5] + B*C[j-5] (mod 29), j>=5
~~~

Every j>=10 necessarily obeys the *exact key- and IV-independent* identity

~~~text
C[j]-(B+1)*C[j-5]+B*C[j-10] = A*(P[j]-P[j-5]) (mod 29).
~~~

With a fixed B, normalize each GP29 residual vector by its first nonzero entry. This cancels **all 28 choices of the unknown A**; the zero-vector case is handled as its own signature. The original-cipher test exhausts **every B from 0 through 28** per word, compares against all same-length words in the exact frozen 29,157-entry source-native English lexicon, and keeps intact original printed word boundaries.

| Original word length | Source words | Compatible for B=1, A arbitrary | Compatible for B arbitrary, A arbitrary |
|---|---:|---:|---:|
| 11 | 32 | 32 | 32 |
| 12 | 18 | 18 | 18 |
| 13 | 4 | **0** | 4 |
| 14 | 3 | **0** | **0** |
| **Total** | **57** | **50** | **54** |

**Exact surviving contradiction:** all **three original complete 14-rune words**, at physical **p13:211**, **p25:46** and **p43:37**, have no compatible GP29-native English word under *any* B and nonzero A. The p13:211 original word is F-free, so the original solved-page plaintext-F-transparent rule cannot intervene inside that intact word. The two F-containing words also fail the stated fully consuming affine recurrence, although their outcomes need not persist under a different explicitly skipped-F clock.

Allowing A but holding B=1 excludes **seven** original 13–14-rune words; allowing both unknown scalars leaves precisely the three long-word obstructions. The [independent Windows-compatible all-affine CommonJS SFT](../sims/lp2_wordlocal_fiveback_affine_ab_sft.cjs) also encrypts, decodes and proves the exact vector invariant on **228/228** native English positive plants: four different (A,B) models for each of the 57 original eligible word-length positions. Each original comparator and counterexample is printed from the untouched 2,896-word/12,956-rune corpus.

This is a stronger **finite-English-lexicon exclusion** of the five-back *shared word-local affine A/B* feedback architecture, even with otherwise unrestricted independent word-specific keys and starting states. It supplies no recovered unknown ciphertext plaintext or historical key, and does not exclude unrelated languages, novel words, changed printed segmentation or five-phase *independently nonlinear* mappings.


## Larger lexicon candidate and neighboring-source holdout (16 November, Agent13)

The three-original-word rejection above uses the fixed 29,157-word TextBlob native-English lexicon, which has only 155 words of fourteen GP runes. A separate Python cmudict 1.1.3 pronunciation-wordlist scan, restricted to unique alphabetic entries and the exact same source-native GP orthography, has 117,493 unique words and 511 with fourteen GP runes. It finds two exact independent-word affine fits to original F-free p13 rune211:

- English UNSUCCESSFULLY: unknown plaintext multiplier A=5, feedback B=18, five shifts [5,19,9,13,8].
- Surname NEUENSCHWANDER: A=13, B=19, shifts [21,9,15,12,25].

Both use the original first five ciphertext runes [17,6,23,14,19] as completely arbitrary initialization, and both reproduce all fourteen original source rune values under the stated equation. These are retrospectively chosen lexical fits, not decrypted words. The first candidate has plaintext F at rune position nine while the original ciphertext contains no F. It would violate the authenticated solved-page plaintext-F transparency policy if that same rule applies to unknown p13. The surname lacks any original human-puzzle clue selecting that name.

More decisively, freeze the chosen UNSUCCESSFULLY values A=5, B=18 and all five K shifts and predict the immediately preceding printed original seven-rune word on the same page (H L TH NG E M R). Allow that preceding word its own arbitrary five initial ciphertext values, but assume these A/B/K remain fixed throughout the page. Its last two plaintext runes are then **O EO**, regardless of its initialization. No seven-rune word among the 29,157 source-native TextBlob entries has that ending. This falsifies the UNSUCCESSFULLY candidate as a *page-keyed* affine explanation of the immediately preceding word, without using the F-transparent rule. It cannot falsify a brand-new unrelated key for every word.

The independent original Latin Vulgate wholeword-GP corpus contains the GP text **5391I9I419G51I**, representing CONUENERUNTQUE (V/U and Q/C spelling collapsed). That exact fourteen-rune Latin candidate fits original p25 rune46 for **A=26, B=6** under the same fully independent-word model. The other two fourteen-rune source words have no matching Vulgate word. This is a source-dictionary postselection with no independently identified Latin key or original source pointer; its actual plaintext status is unknown.

[Self-contained source-original CJS SFT](../sims/lp2_affine_longword_candidate_holdout_sft.cjs) reconstructs the three fitted word models, verifies the original source words, the Vulgate source spelling, the earlier neighboring word and the forced impossible native suffix. The CMU wordlist census is a distinct offline scan using package version 1.1.3 and the previously published native GP encoder. **The earlier three-word negative is a precise finite-lexicon result, not a statement that all English vocabulary is excluded.** No original LP2 plaintext or author-selected key has been recovered.


## Exact four F-free p0 words exclude arbitrary page-reused affine feedback (16 November, Agent13)

The prior word-local additive/affine tests left open whether **one unknown affine page key** could persist across complete printed words, while allowing every word **five independently arbitrary ciphertext initialization runes**. Test the exact GP29 model with page-wide scalar A from 1..28, page-wide feedback B from 0..28, and five unconstrained page-wide phase shifts K[0..4]:

~~~text
C[j] = A*P[j] + K[j mod 5] + B*C[j-5] (mod 29), j>=5.
~~~

Lock four printed source p0 words with **no ciphertext F**: word6 at rune offset23 length11; word22 offset95 length8; word41 offset158 length8; word51 offset203 length8. The source-first, native GP English wordlist has **1,453 length11 forms** and **4,331 length8 forms** among its fixed 29,157 words. In the first length11 word, any candidate plaintext and A/B pair uniquely fixes all five K values using source positions5..9, and original position10 supplies an independent exact key equation. The other three original F-free words each supply three held-out GP plaintext positions j5..7. For every surviving key, the SFT checks whether **any** native GP8 English word has those forced runes. Each original word's first five source ciphertext glyphs are unconstrained and independent, so there is no shared-IV assumption. No F transparency ambiguity can intervene in these four original ciphertext inputs.

| Cumulative original source words | Surviving exact (A,B,anchor plaintext,K) tuples |
|---|---:|
| p0 word6 (11 runes) | **40,684** |
| Add p0 word22 (8 runes) | **1,405** |
| Add p0 word41 (8 runes) | **42** |
| Add p0 word51 (8 runes) | **0** |

The [standalone original-source CommonJS SFT](../sims/lp2_p0_fourword_allsecret_affine_feedback_sft.cjs) asserts every original word glyph, page-local rune offset and exact survivor count. Independently, it plants four native-English words of identical lengths using the same nontrivial page key **A=7, B=18, K=[2,3,5,7,11]**, with the original words' first-five glyphs reused as four unrelated IVs. The full unchanged exhaustive solver retains the planted true key and the original plaintext suffixes are recovered exactly. Thus the zero-original result is a real finite-English-register incompatibility, rather than a search or inverse implementation defect.

**Decision:** retire all further unselected *page-reused affine five-back feedback* hypotheses with intact original printed word boundaries and ordinary source-native English. Independently changing word keys, nonlinear alphabets, alternate languages and segmentation remain open. No source-selected unknown LP2 plaintext is recovered.

## Source-visible lag-five equality as a deterministic historical prime-key clock (17 November 2026, Agent45)

**Distinct finite original-cipher negative, not an identified Cicada operation.** The source's five-dot motif and unusual **104 within-word ciphertext equalities at distance five** suggest a simple human-testable alternative to the previously excluded *five-back additive feedback*: retain the independently authentic solved-p56 prime-totient running key, but change its **next key index by a public ciphertext predicate**. This neither fits unknown key material nor inserts/deletes cipher runes. The signed-2016 clue does **not** explicitly select this update, so treat it only as a cheaply falsifiable candidate.

At an original printed word's zero-based rune position \(j\), set \(E_j=1\) iff \(j\ge5\) and the actual source ciphertext satisfies \(C_j=C_{j-5}\). For any start \(h\), sign \(s\in\{-1,+1\}\), and one of exactly three next-key clock settings \(m\in\{-1,0,+1\}\), inverse-decode
\[
P_j=(C_j+s\,\varphi(q_{h+k_j}))\bmod29,\qquad
k_{j+1}=k_j+1+mE_j,\ k_0=0,
\]
where \(q_\ell\) is the \((\ell+1)\)-st prime and \(\varphi(q)=q-1\). **m=-1** holds the key after a lag-five ciphertext match; **m=+1** consumes an extra key symbol; **m=0** retains the ordinary key schedule. Original word boundaries reset only the five-back comparison, while the key index advances through every source rune. Each mode is fully invertible for a fixed key, sign and start, because the encoder knows the emitted ciphertext and can make the same deterministic next-clock decision. The key, clocks and rune symbols are GP29; the source's actual 32 cross-page words are joined and their rune masks preserved. The **direct** prime/keyword arm uses no unknown-page plaintext-F bypass. The complementary exact **F-transparent branching arm** below enumerates all such unknown plaintext-F placements over the intact original 729-rune opening, using the authentic p56 key-consumption semantics.

The [single-file Windows Node22 original-input SFT](../sims/lp2_lag5_primeclock_original_sft.cjs) asserts the entire original **12,956-rune/2,896-word/104-lag5** source, separately reproduces **all 85 authentic solved p56 runes** with its established plaintext-F bypass and \(\varphi(\mathrm{prime})\) stream, then encrypts, decrypts and re-encrypts **eighteen complete 12,956-rune Shakespeare GP-native plants** of the *identical source printed word geometry* (three clock rules × two arithmetic signs, for each of the three authentic historical keys). It then evaluates **all \(8\times3\times2\times5000=240{,}000\)** original source section/clock/sign/key-start models. Eight sections have genuine rune lengths **729, 1145, 1729, 1894, 1021, 1524, 1589, 3316**; the separate nine-rune visual interlude is too short for this language-discrimination decision and is excluded. GP-native score is fixed independently from the same 217,644-rune Shakespeare reference used in the existing original-language source controls; no reference or phase is adapted after seeing the original scores.

**Original results:** Global best whole-section IoC **0.03635870302536969** (normalized IoC/29 **1.05440**), and global best GP-native English unigram log-likelihood ratio per rune **−0.6339275059713757 nats**. Both extrema occur in the original first 729-rune section under the **ordinary unmodified clock** \`m=0\`, at separately selected starts 601 and1952 respectively, rather than under either lag-five clock change. A fixed 729-rune native Shakespeare reference interval has IoC **0.06307375751820196** and native-English model logLR is strongly positive; source solved p57 also has native IoC >0.062. The scores have no native-language separation resembling plaintext recovery anywhere within the tested finite family. No previously unknown readable continuous ciphertext excerpt, original key, source-selected state rule, or final destination is obtained.

**Same-clock original historical LP1 key cross-check:** The two earlier **genuinely solved Cicada GP29 keyword keys** (DIVINITY, eight runes, and FIRFUMFERENFE, thirteen runes) are the only other direct keys tested, using exactly the same three source-visible ciphertext lag-five clock updates, both arithmetic signs, all possible key phases, and all eight full unknown sections. This is **1,008 additional complete original-cipher configurations**, each with a fully reversible 12,956-rune source-native planted positive for its corresponding key/clock/sign mode. The global best IoC is **0.03528844269585010** and the best English unigram logLR is **−0.6689457172753868 nats/rune**, again non-English. This does not assert that either historical key was meant for LP2; its finite result prevents recycling the two obvious previously solved GP29 keywords solely by inserting a fifth-apart source-character-controlled clock.

**Authentic plaintext-F-transparent extension on the complete original 729-rune opening:** To close the decisive known-p56 loophole, the same source-key clocks were also tested with the **actual solved-p56 plaintext-F behavior**: when plaintext is literal GP F (index0), ciphertext is F and consumes **no key**; a non-F plaintext symbol is encrypted with the current prime-totient key, with its next key count adjusted by the original word-local lag-five ciphertext match. Ciphertext F is ambiguous between literal F and encrypted non-F, so the original inverse is a complete dynamic program over **every possible F placement and retained key count**. At a fixed mode and phase, the exact inverse takes both choices only at original C=F and excludes a non-F C mapping to plaintext F. The book contains **34 ciphertext F and seven word-local lag-five returns** in this 729-rune opening.

All **30,000 original candidates** (m=−1/0/+1 × two arithmetic signs × prime starts0..4,999) were tested without truncating the F placements or fitting a hidden language key. The entire 729-rune original remains legally decryptable at exactly **four** starting configurations: \`m=−1,sign=+,start=393/394/396\` and \`m=+1,sign=+,start=3342\`. The ordinary clock \`m=0\` has **zero** legal original start-phase paths with any arbitrary literal-F skips in this 5,000-start window. Exhaustive source-constrained forward/backward enumeration of the four surviving configurations yields exactly **64 + 64 + 192 + 120 = 440 distinct, complete 729-rune plaintext paths**. Every path was scored with the same frozen native GP29 model. The **maximum IoC across all 440**, selected independently of English language score, is only **0.03493420160086827**; the **maximum native-English logLR** is **−0.6307587662792099 nats/rune**. No path is credible ordinary GP English or yields an independently reproducible unknown-page plaintext. Six more native-English 729-rune, original-word-shape F-transparent plants retain a legal full-path decode under the exact branch algorithm, and the genuine solved-p56 85/85 plaintext-F-positive remains exact. The [same original-source SFT](../sims/lp2_lag5_primeclock_original_sft.cjs) asserts the four survivor settings, all 440 exhaustive paths and both maxima.

**Interpretation:** The closely spaced starts393/394/396 produce superficially shared long ciphertext-conditioned suffixes because their literal-F key-count choices converge; the shared source-cipher output is **not** proof of plaintext and none of the 440 passages has prose-like rune statistics. The count of four rare legal starts is compatible with a constrained source-language-incompatible cipher grammar. This is a bounded all-path negative on p0–2 under the genuine plaintext-F skip semantics and specified historical key-clock family. It is **not** a key-independent or cross-section impossibility theorem: other historical key sources, source-visible operations, F bypass semantics or different chapter starts remain untested.

**Fork:** Retire *this precise* source-original ciphertext-lag5-conditioned **prime-totient direct additive clock** with 5,000 φ(prime) starts plus both solved LP1 keyword phase families, both signs and eight complete sections in the direct arm, **and** the full original p0–2 first729 F-transparent branching arm across all 440 exact legal historical-key paths. This report's older key-independent five-back affine-feedback obstructions are different and remain separately valid. The observed five-back excess remains a real structural constraint, but applying any further skip/hold state needs an **independent period-authentic state or key selector** rather than a new tuned clock convention.

## Research fork

The chapter/page five-back feedback models both fail their original key-independent plaintext invariants, so they **cannot distinguish the manuscript's real reset scope**. The direct complete-word additive exclusion was established previously; the zero-IV five-back feedback extension now also fails on every length-10+ original word under the same native-English lexicon. The independently word-keyed **additive** arbitrary-IV model now also fails 14 original long words against the fixed native-English lexicon, including 10 F-free words. The larger independent-word affine scalar/feedback family also fails all three original length14 words under the fixed native lexicon, including one ciphertext-F-free word; see the extension above. Word-specific nonlinear/permutation alphabets, other language registers, and changed segmentation remain open. The source-boundary clue remains available for a different, genuinely selected nonlinear/stateful cipher. Do **not** add undocumented collision repair, varying lag, secret per-symbol pads or alphabet remaps to salvage this model without independent original instructions. The test does not cover another language, compressed plaintext, further encryption layers or a different state update.

The single-file test ran successfully on **Windows/Node.js 22** against the current canonical original corpus: [verified Actions run 43603927151](https://github.com/FlareZ123/liber-primus/actions/runs/43603927151), source commit [fac0ff8](https://github.com/FlareZ123/liber-primus/commit/fac0ff8bb801afb6e0867545557cbe53751fc093). It returns the complete pair counts, 16 independent control minimums and all positive inverse assertions. **No unknown original LP2 plaintext, creator key or destination was recovered.**
