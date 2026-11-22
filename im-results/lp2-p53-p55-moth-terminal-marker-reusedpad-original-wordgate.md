# Repeated moth pages p53/p55: no shared additive or XOR key under the intact word layout

**Agent24, 22 November 2026. Original-rune conditional exclusion.** No unknown plaintext was recovered. Both a repeated source image and an end-of-page thirteen-dot ornament nominate p53 and p55 for a **same-key** test. The original page numeration, word boundaries and punctuation were left unchanged, including the real p54→p55 one-rune continuation.

## Why test this pair?

The same cicada/moth engraving and bilateral vines frame physical p53 (scan70) and physical p55 (scan72), and p55 additionally contains a drawn pale tree. Both printed text passages terminate beside a red thirteen-dot mark. Their art relationship has already been registered as an original-image fact in [the source-image gate](lp2-moth-art-coordinate-registration-source-gate.md), and the identical terminal ornaments offer a concrete, if speculative, key-clock reset or stop. The known 2013 Cicada reconstruction used bytewise XOR, while native GP29 Vigenère-style addition is a basic possible cipher. They are therefore independently motivated, inexpensive hypotheses.

The meaningful rival is that the common art instead identifies a section, source reference, or operation other than literal shared keystream. Shared pictures and markers alone do not prescribe key reuse. A true same-pad model must decode **both** original ciphertext streams to viable words without solving for the pad itself.

## Exact all-secret test

Inputs: [canonical 29-symbol original runes](../resources/liber-primus/lp2-corpus.json) and [the original printed separators](../resources/lp2-transcription.txt). Original p53 contains **179 runes in 40 printed fragments**; p55 contains **76 runes in 17 fragments**, of which its first, one-rune fragment continues a word begun on p54. The remaining p55 text comprises 16 complete words, 75 runes.

For aligned position i, suppose both pages use exactly the same unknown additive GP29 pad \(K_i\). If \(C_{53}=P_{53}+K\pmod{29}\) and \(C_{55}=P_{55}+K\pmod{29}\), then \(P_{55}=P_{53}-(C_{53}-C_{55})\pmod{29}\). Every key value cancels, with no guess about key length, key values or cipher entropy. The parallel historical XOR model \(C=P\oplus K\) yields \(P_{55}=P_{53}\oplus C_{53}\oplus C_{55}\). This is tested independently, allowing the effective XOR pad to vary **arbitrarily at every position**. Its planted control restricts produced cipher runes to the original 0..28 GP domain.

Four source-motivated, fixed alignments are checked for **each** operator:

| Alignment | P53 physical indices | P55 physical indices | Source reason |
| --- | ---: | ---: | --- |
| Page start | 0..75 | 0..75 | Same image-framed page starts |
| First complete word | 0..74 | 1..75 | Skip the known p54 continuation |
| Terminal red13 stop | 103..178 | 0..75 | Match the marked final rune on both pages |
| Terminal stop, complete p55 body | 104..178 | 1..75 | Same stop, skip the known carry |

There is **no phase optimization** and no fitted relative shift. The printed p53 words overlapping an alignment endpoint are constrained as complete source-length words; only their common part is compared. The one-rune p55 carry is allowed to stand for any GP symbol, rather than being falsely forced into an English one-letter word.

A finite, high-recall GP lexicon is built only from the repository's preexisting English-frequency reference, Shakespeare, Gibran, Emerson, Blake and already-solved LP1 plaintext. For every source word the decoder admits **all** applicable legacy single-letter spellings plus optional GP ligatures ING, TH, NG, EO, OE, AE, EA, IA and the source-calibrated IO→IA. This avoids excluding a message merely because a greedy transliteration chose a different rune length. The full GP candidate inventory is keyed by each original printed word length, preserving original spaces.

Every overlap between a p53 printed word and p55 printed word creates a constraint on their possible GP strings, independent of the pad. Constraint-support filtering has at least one **empty domain on both pages** in every one of the **eight** original operator×alignment cases. Thus there is no complete pair of English native-GP word assignments under those specific constant shared-pad clocks, even granting completely free secret key material and all admitted alternate spellings.

## Controls and reproduction

[Source-exact, read-only CommonJS SFT](../sims/lp2_p53_p55_reusedpad_fullword_allkey_sft.cjs) regenerates the source word boundaries from the original transcript and checks every rune against the canonical page indices before the tests. It performs the complete overlap-constraint elimination and logs all empty word domains. The SFT plants separate genuine English native-GP plaintext streams with **the same nonconstant additive or XOR pad** under each of the four alignments. All eight planted positives preserve the source word sizes and remain viable, establishing that the constraint solver can distinguish an actual shared-pad solution from independent random texts. The initial two-alignment additive-only version passed [Windows Node22 Actions run 44980318911](https://github.com/FlareZ123/liber-primus/actions/runs/44980318911); the additive+XOR page-start and first-word variants passed [run 44980406382](https://github.com/FlareZ123/liber-primus/actions/runs/44980406382). The terminal-marker cases were subsequently tested in direct runtime with the same original sources; the final eight-case CI run should be checked when available.

Independent **broader-lexicon sensitivity:** A local source-reproduction against a 132,020-word CMU/TextBlob union with all optional native GP spellings yields 149,991 distinct rune-string candidates across the involved word lengths. The terminal mark aligned additive and XOR variants each still produce multiple empty word domains after the first propagation pass, as do both page-start variants. This is supporting robustness evidence; the committed SFT relies exclusively on repository-pinned text to remain runnable without a live dictionary dependency.

## Decision and boundaries

The identical illustrations plus thirteen-dot stops do **not** suffice to transfer a repeated additive or XOR key over the original 75/76-rune receiver while preserving ordinary English word shapes. A separate key per page, non-additive state machine, altered segmentation, different alignment or non-lexical payload remains possible. English wordlist membership is a finite model of plausible author text, so this does not logically exclude an unusual vocabulary, names, code words or an arbitrary artificial plaintext. The shared art remains a visual clue but no authenticated textual key or ciphertext inverse is recovered.

**Research change:** deprioritize same-image⇒same-keystream conjectures for this specific pair. Future work should seek a first-party mechanism or key that acts independently on unknown ciphertext, or a readable source-selected visual instruction.