# An anti-repeat emitter followed by word-local five-phase pads still fails the original long words

**Agent 5, 15 November 2026. Classification: exact finite two-layer cipher-family exclusion.** **No authentic unknown Liber Primus plaintext, creator-selected key, cipher instruction or destination is recovered.** The strongest result here is a direct inverse of two independently observed original-cipher phenomena *together*, with a 12,956-rune native-English positive that preserves all **86** original same-page adjacent-repeat sites.

## Why this pair of mechanisms is plausible enough to discriminate

The 56 encrypted physical LP2 pages (p0–55, with rune-free p50) have **12,956** canonical GP29 runes in **2,896** actual printed words. Only **86** non-page-initial runes equal their previous ciphertext rune. Separately, the manuscript has an excess of exact five-back matches *inside printed words*, and original five-dot artwork motivates a possible word-local five-step clock. A readable-language intermediate masked by a **29-state anti-repeat emitter** and a **period-five word pad** is a compact candidate for two anomalies that simple stationary ciphers fail to explain. The signed 2016 “words…numbers” hint makes printed-word restarts at least plausible.

Neither Cicada nor a recovered historical solver actually instructs the following composition. We test it because, if it worked, the inverse is cheap, reversible and could reveal many whole words, including a plaintext/key mechanism:

1. For each printed word independently, allow an arbitrary **nonzero affine slope** a in GF29 and five arbitrary GP29 additive shifts b0…b4: intermediate symbol **T[j] = a·P[j] + b[j mod5] mod29**. This is more permissive than one shared key: *every word gets six independent secrets*, with no requirement that different words share a key.
2. Emit an original rune **C[i]** from T[i], conditioned on the **previous emitted ciphertext**. Choose one reserved intermediate rune r. If T[i]=r, repeat C[i−1]. Otherwise, remove r from the GP29 sorted alphabet to get rank d=0…27 and map d to one of the 28 symbols **excluding C[i−1]**. Test both source-natural maps: **sorted exclusion** and **cyclic forward offset**. At page/book starts transmit the first intermediate rune literally. The mark r may be any of 29 GP29 symbols.
3. Invert on the **unchanged original 12,956-rune ciphertext**. For every nonrepeat C[i], recover d and insert r back into the alphabet; for each repeat recover T[i]=r. At word boundaries, preserve the actual original lengths, punctuation and page wraps.
4. For each original complete word with length **10–14**, test whether its inverse T could be *any* independently attested source-native GP-English spelling under **any** permitted a,b0…b4. The TextBlob spelling list has **29,157** words; its **5,154** length-10–14 GP-encoded entries have **5,133** distinct affine-invariant signatures. The source-native spelling folds **ING→NG rune** and **IO→IA rune** are fixed from the solved original material, not adjusted to fit the ciphertext.

### An all-key test, no brute force over six secrets

For a word of unchanged length L, the five-phase shifts disappear from **lag-five differences**:

\[
\Delta_5 T_j=T_j-T_{j-5}=a(P_j-P_{j-5})=a\Delta_5 P_j\pmod {29}.
\]

Because GP29 is a field, the entire vector \(\Delta_5 T\), normalized by its first nonzero coordinate (with the all-zero case handled separately), is identical to that for P **if and only if** some nonzero a and five independent b values exist. Thus matching this exact signature against the entire fixed English lexicon tests *all* 28 slopes and all 29⁵ word pads without estimating them, and without any plaintext chosen to make a decryption look plausible.

The original count of complete long words by length 10, 11, 12, 13 and 14 is **52, 32, 18, 4, 3**: **109 total**. The independent tested emitter choices are sorted/cyclic rank and book/physical-page initial state. Each of their **29** possible repeat markers is exhausted.

## Original-cipher result

| Emitter order | Predecessor reset | Matched original long words across all 29 marker choices | Distinct compatible original long words |
| --- | --- | ---: | ---: |
| Sorted GP rank | Physical page | **1** | **1** |
| Sorted GP rank | Whole book | **1** | **1** |
| Cyclic successor rank | Physical page | **7** | **3** |
| Cyclic successor rank | Whole book | **7** | **3** |

*Specific conditional source assignments, not plaintext recoveries:* sorted-rank marker **U** admits only the **10-rune** original word at global zero-based index **10244** (word #2297), as the possible spelling **INNERVATION**. Cyclic-rank marker **S** admits **REFERENCES** at 8442 (#1898); marker **IA** admits **UNILATERAL** at 5257 (#1181); and markers **M, L, NG, OE or D** each admit **RESTRAINED** at 12708 (#2844). Every one is a *retrospectively dictionary-compatible* individual word whose six independent secret word-key parameters are not derived from the manuscript. No neighboring plaintext or shared key follows. The apparent duplicates for RESTRAINED are five secret-marker choices on *one* original word.

**Strongest bound:** granting a separate choice of **both the emitter orientation and its repeat marker on every printed word**, at most **4 of 109** original long words have *any* dictionary-compatible native-GP plaintext. **At least 105/109 are impossible** under this exact two-layer family, regardless of all word-specific affine factors and additive pads. With one fixed marker/orientation for the book, at most one whole long word could be ordinary TextBlob-register English. Different page and book predecessor starts produce identical eligible long-word sets.

This is a deterministic original-input necessary-condition failure, not a tail probability or a claim to all languages. It uses the original complete word breaks; it does not assume period-five padding shares the same key between any two words.

## Matched original doublet geometry: a strong positive

The [single CommonJS original-source test](../sims/lp2_predecessor_rank_word5_affine_joint_sft.cjs) independently constructs **2,896 real GP-English dictionary words** of the **exact 2,896 original printed lengths**, totaling **12,956 native GP runes**. It selects each planted word from the same frozen lexicon *without* consulting an original plaintext or fitted English phrase. Then it chooses a nonzero slope and five pad symbols **independently for each planted word** so the reserved intermediate marker occurs at *exactly the same 86 rune sites* as all 86 original within-page ciphertext doublets. Every source-word length has at least one compatible English spelling; no original site needs deletion, insertion, moving or exemption.

The test encrypts that native GP source with **both** canonical rank orders and both initial-state conventions, exactly recovers the 12,956 intermediate symbols, reverses every planted word pad and recovers **12,956/12,956** original planted plaintext runes. All **109/109** planted long words satisfy the same affine dictionary signature, while every simulated page-local adjacent-repeat site matches the original **86-site mask**. This matters: the failure on authentic unsolved ciphertext cannot be blamed on an inherently too restrictive 86-doublet geometry or a broken decoder that also rejects its own English plants.

The result does **not** prove such a planted text would preserve all source-native unigram/trigram/syntax statistics; the positive is designed to validate the specified cipher family and the very same original page/word/repeat geometry.

## What changes in the next research decision

The attractive conjunction “five-step per-word affine cipher + one-step no-repeat transport” is **not** the missing original decoder when interpreted in the canonical GP29 register and exact printed-word geometry, **even under independent keys and marker choices per word**. No further slope/phase/initial-state sweeps within that class can recover more than the four source-compatible long words.

Surviving explanations require a genuinely different structure, such as a source-selected non-affine or longer-memory state update, a second changing output alphabet, transformed word boundaries, a non-GP-English plaintext register, or an independently recovered high-entropy key. The original material provides no rule selecting any of those extensions. The sparse isolated word matches above should **not** be promoted to plaintext or used to fit additional key guesses. Existing independent single-layer gates remain complementary: [period-five all-secret word cipher](word-period5-unknown-key-exact-inverse.md), [five-phase affine source-word test](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs), [predecessor rank source test](lp2-predecessor-exclusion-5to3-original-gate.md), and [reserved marker heldout](lp2-wordphase-predecessor-marker-heldout-gate.md).

**Reproduction:** The original-input SFT and full synthetic source-native planted checks **passed [Windows Node.js 22 GitHub Actions run 43724203115](https://github.com/FlareZ123/liber-primus/actions/runs/43724203115)**. From the repository root, run the linked CommonJS SFT with no parameters. It reads the same three files already in the repo (canonical original LP2 index corpus, original punctuation-bearing rune transcription and pinned TextBlob lexicon), creates no files and throws on any original count or positive-control discrepancy.
