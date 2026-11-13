# Ciphertext-only F-clock disambiguation with a known original key and English word grammar

**13 November 2026, Agent1. Evidence class: reproducible positive solver on three independently solved historical Cicada ciphertexts; an original-key-dependent method with no newly recovered unknown LP2 plaintext or key.**

## The actual cryptographic obstacle

The solved LP1 WELCOME/DIVINITY and LP2 p56 prime-totient ciphers share an unusual *plaintext-dependent* rule. Plaintext GP rune **ᚠ (F, numeric index 0)** is transmitted verbatim as ciphertext F and consumes **no** key symbol. Any other plaintext GP rune consumes one key symbol and is enciphered using addition modulo29. Therefore a ciphertext F has two possible origins: literal plaintext F without advancing the clock, or an ordinary non-F plaintext letter that encrypts to F. A strict decoder must reject any key-consuming branch that would yield plaintext F, since the forward encoder would have bypassed that symbol.

The known solved LP2 p56 provides an explicit ambiguity certificate. Its original ciphertext Fs at page-local positions `[35,47,51,56,74]` represent plaintext `[A,I,D,F,C]`. Under its **correct, already-known** first-primes Euler-totient key, 22 of the 32 raw five-F branch assignments reconstruct a full 85-rune plaintext which strictly re-encrypts to precisely the **same original ciphertext**. Ten assignments are prohibited by plaintext-F transparency. Hence the original ciphertext, authentic key and perfect forward re-encryption cannot uniquely determine the F clock. See the separate [32-mask original-source certificate](../sims/lp2_p56_plaintext_fehu_ambiguity_sft.cjs).

A source-relevant additional constraint is that authentic Cicada messages are legible English and the original typesetting preserves complete printed word boundaries. Given the **known key**, these constraints can choose a clock path efficiently without supplying its F mask or any original plaintext crib. The key's source must still be established independently: an English-scored inverse under freely hunted keys proves nothing.

## Exact original-data decoder

The [CommonJS Node22 SFT](../sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs) reads the original rune-index corpus, original LP1 and LP2 page transcriptions and a **pre-existing independent English spelling-frequency fixture**, `resources/control/english_wordfreq_textblob.txt` (TextBlob project's Gutenberg-derived English counts, copied to the repository on 10 November). The test neither modifies a source rune nor feeds the authentic F skip positions to the decoder.

1. Recover source printed GP29 word boundaries. Hyphens and sentence periods terminate words; slash/newline is a visual wrap and **does not** terminate a word. Use exactly the historical original source rune sequence and known page-local cipher key.
2. At each ciphertext rune, maintain two candidate transitions only when its numeric value is zero: literal plaintext zero with no key consumption; or normal plaintext `(ciphertext - current_key) mod29`, with key consumption. For other ciphertext symbols use only the normal transition. Reject any normal transition which decodes to plaintext zero; it is incompatible with the historical *plaintext*-F forward rule.
3. Fold general English dictionary words to source-calibrated GP29 runes (`QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA`). The independently supplied fixture provides **29,058 distinct encoded GP29 words**. Score each complete decoded source word with `ln(1 + frequency)` if present, and fixed `-8` otherwise. Unseen words remain **permitted**, so a proper name or historical spelling is no automatic failure.
4. Run an **exact word-by-word Viterbi dynamic program**. At each printed word boundary, retain only the best-scoring prior path for each number of already consumed key symbols, which completely determines all subsequent key shifts. Keep the entire recovered plaintext and F positions of the best path; every lower-scoring path reaching the same clock state may be discarded without affecting the optimum. The key clock counts **consumed** symbols, rather than printed glyph positions.
5. Validate the result by checking exact original plaintext rune identities against separately known historical solutions and independently applying the **strict plaintext-F** forward encoder. The authentic plaintext and F masks are used only in these assertions, after the scorer's decisions.

The dictionary, score, orthographic normalization, boundaries and DP all remain **unchanged between the three authentic controls**. No fitted skip mask, retroactive word segmentation, source-cipher runic edit, language-model prompted completion, or manually patched unknown token is admitted. The original punctuation is inherited only as word boundaries, not as a cipher-symbol guessing aid.

## Executed blind-selection results

| Untouched historical source and actual cipher key | Original ciphertext | Original printed words | Exact historically solved GP runes recovered | Authentic F masks recovered without providing them | Dictionary-supported decoded words | Winner / runner-up score gap |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| LP1 WELCOME/DIVINITY, genuine 8-symbol GP key | **515** | **124** | **515/515** | **all 11**: positions 48,74,84,132,159,160,250,421,443,465,514 | **121/124** | **13.3891** |
| LP2 p56 AN END, genuine initial Euler prime-totient stream | **85** | **25** | **85/85** | **the sole literal F** at page-local56 | **24/25** | **55.6627** |
| Separate LP1 second-koan, genuine 13-symbol key, complete first 30 original words | **110** | **30** | **110/110** | **both**: positions 49 and58 | Independently scored | One surviving terminal clock path |

The third trial uses **different historical key material** and intact original **110-rune/30-word** prefix of a second koan. Its two exact authenticated bypass indices `[49,58]` are independent of the other trials and were not supplied to the decoder.

All **710/710** original historically solved ciphertext runes are recovered as the correct historical plaintext, and **14/14** actual plaintext-F bypasses are selected without any supplied mask. The exact legitimate forward encoder regenerates every one of the **710** original source ciphertext symbols. The two longer tests possess wrong branches which *also* re-encrypt exactly, so the result arises from the externally sourced lexical constraint rather than an implementation identity. The p56 original source has 22 forward-valid masks; the Viterbi chooses the authentic mask 8.

**Original-source CI**: [passing GitHub Actions run43430982155](https://github.com/FlareZ123/liber-primus/actions/runs/43430982155) executes the [single-file test](../sims/lp2_ftransparent_original_lexical_viterbi_sft.cjs) with Node22 and the checked-in source documents. It outputs complete mask positions, scores, word counts, peak Viterbi state widths, and the independent koan plaintext equality.

## What this enables and what remains unknown

The recovered decryptions demonstrate that for these genuine Cicada ciphers, the F-clock ambiguity is manageable once an **authentic known key stream** is available and printed word boundaries reflect the plaintext. Thus an investigator who recovers a candidate original-author-selected key for unknown LP2 pages can apply **one exact reversible parser with a tested lexical clock**, rather than tuning (2^{N_F}) skip masks by brute force. The Viterbi is particularly useful when many F runes make naive mask enumeration expensive. Its word prior is deliberately modest, so it may fail on non-English text, unusual proper names, changed word segmentation or adversarially constructed alternative English messages.

This positive control **does not supply a key** for any of pp0–55, nor prove that the unknown pages use the same plaintext-F cipher or that an arbitrary high-scoring output is authentic. In particular the [failed direct p56 totient transfer to p55](lp2-p55-moth-crib-totient-alloffset-gate.md) and the original 12,956-rune frequency/anti-doublet constraints remain unchanged. A genuine unknown-page success still needs a source-selected key/operation plus coherent untouched original plaintext, forward replay and independent corroboration.

**Decision:** Use the fixed, exact lexical Viterbi as an appropriate final decoder for a **source-justified F-transparent GP29 key**, keeping source discovery upstream. Retire unconstrained F-clock mask sweeps and cipher-only wordshape bypass heuristics. No pending unknown plaintext is claimed.
