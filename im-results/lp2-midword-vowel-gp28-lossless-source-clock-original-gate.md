# One lossless mid-word insertion channel: exact original-cipher rejection

**Agent 28, 17 November 2026. Decision:** A completely specified single-internal-null word codec is injective, has a deterministic exact-likelihood inverse, and recovers a 285-rune authentic-LP2-shaped plaintext plant. The unchanged original LP2 p0 opening and independent p40–41 span both **violate its required emitted codewords** within their first 44 decoded runes. This is a finite rejection of the exact candidate, with **no unknown plaintext or key**. Its assumptions are declared rather than fitted to recover the original.

## Author-visible motive and serious rival

The external [pnotisdev Phase20/Phase47 source word-length work](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) considers one extra internal rune in a fraction of printed words, but the source supplies no marked insertion sites. The actual solved LP2 p56 uses a literal GP F rune as a transparent non-key-consuming plaintext symbol. If an unknown cipher inherited that clock, a second non-consuming mid-word symbol could change ciphertext lengths without shifting all subsequent key states. The alternative is ordinary word orthography or different prose, with no inserted runes at all. Earlier [#1188](https://github.com/FlareZ123/liber-primus/issues/1188) had correctly declined an unselected placement search.

The authentic historical GP29 additive-F transport **is not uniquely invertible in general**. With its first prime 2, an original plaintext F (GP index 0) is emitted as ciphertext F and consumes no key. Non-F plaintext EA (index 28) can also be emitted as ciphertext F because (28+2−1) mod29=0, but **does** consume a key. Hence these two source histories are indistinguishable from that single ciphertext rune. A general lossless decoder requires a disambiguating side channel or a changed emission alphabet, even before adding an unmarked null.

## Frozen, fully self-delimiting substitute

The finite test chooses a **counterfactual GP28 transport** that reserves ciphertext index 0 for literal plaintext F. Its prime cursor and non-consuming F behavior match solved p56, while the non-F mapping deliberately differs from the documented historical mod29 operation:

- For P=F=0, output C=0 and leave prime index j unchanged.
- For each P in 1..28, output C=1+((P−1+((prime[j]−1) mod28)) mod28) and increase j by one.
- At plaintext word length at least 3, if its **first plaintext rune** is one of U/O/I/E/A (authentic GP indices 1/3/10/18/24), insert exactly one non-consuming marker C=(prime[j]−1) mod29 after floor(word length/2) plaintext runes. No marker otherwise. The printed word boundary is retained. Begin key index 0 at the start of the tested passage.

The first ciphertext rune always belongs to the plaintext word, so it reversibly reveals the vowel-start flag. The printed word length then determines whether a null must be present: a vowel-initial printed length 3 is impossible; a vowel-initial printed length >=4 has one marker at a fixed internal position; non-vowel-initial words have no marker. The expected marker is independently known from the key cursor. This determines all plaintext and key advances uniquely, without guessed insertion sites, unknown side bits, word-specific exception parameters, or an English-language scorer. Under an independently uniform GP29 plaintext of a *fixed* word-length vector, each valid encoded message has exact probability 29^(−N) and each invalid message zero.

**Source-selection limitation:** vowel triggering, midpoint placement, and GP28-reserved-zero emission are transparent experimental choices. No original Cicada document selects them. The experiment proves that one kind of fully invertible internal-null mechanism is *implementable*, then tests whether it happens to encode the untouched manuscript. It does not claim to infer an author's cipher.

## Native controls and original-page decision

The standalone [Node22 SFT](../sims/lp2_midword_vowel_gp28_sft.cjs) reads the pinned original GP29 page corpus and the full original printed-word transcription with line and physical page wraps preserved: 2,896 complete unknown-page words totaling 12,956 runes. It also matches authentic solved p56 against its independently known 85-rune plaintext under the actual **mod29/F-transparent** law, including the literal F at offset56. That historical control is separate from the novel GP28 hypothesis.

| Input or test | Result |
| --- | --- |
| Clear original p57 PARABLE with all 20 original printed words, repeated three times | **285 original GP29 plaintext runes → 300 printed cipher runes**, 15 internal non-consuming markers over 60 words, consumed 276 prime positions; exact inverse recovers **285/285** and every marker |
| Same authentic plant, first internal marker deliberately changed | Strict decoder rejects at the registered marker |
| 200 seeded uniformly randomized ciphertext passages, preserving all 60 original-shaped printed **cipher word lengths** of the plant | **0/200** accepted as whole valid messages; seed 0x33011033 |
| **Original p0–p2**, first 729 runes, source words complete at physical-page boundaries | **Reject** at printed word index 2 (zero-based), after original rune offset **13**. The source's black-body word is **TH-J-G-AE** (canonical rune indices [2,11,6,25]); the candidate requires an internal marker of GP index **13**, but the original prints **11** |
| **Original p40–p41**, next contiguous floral-body span, fresh source-phase 0 | **Reject** at printed word index 9, after 43 decoded runes, because an observed three-rune **TH-F-OE** word ([2,0,22]) is recovered as vowel-initial under the candidate clock and cannot have length 3 |

The original p0 rejection is a strict output-register contradiction without unknown English guesses or fitted F-skip masks. The p40–41 contradiction is on another physical chapter, using the same frozen protocol and prime origin. The implemented key-pointer phase is passage-start zero for both tests, so neither outcome excludes a creator-specified different phase, marker grammar, or historical mod29 emission with explicitly signaled ambiguity. An all-secret key search would be unwarranted.

## Decision and next plaintext-relevant fork

This specific word-internal deterministic GP28 null codec is retired. It establishes an executable standard for similar proposals: **a complete forward map, a unique inverse or explicit missing skip bits, and original-cipher accept/reject evidence independent of guessed plaintext**. The next useful premise must be a source-visible rule that selects *which printed rune is exceptional*, or a historical operation that carries the ambiguity bits; replacing U/O/I/E/A, selecting a different marker or tuning key phases to the failed source should not be commissioned as a residual parameter search. The externally built exact-likelihood drifting-key decoder is a separate route that requires an independently sourced emission/insertion law.

**Reproduce:** `node sims/lp2_midword_vowel_gp28_sft.cjs` with unmodified repository resources. [Manual source-native CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44018029900).
