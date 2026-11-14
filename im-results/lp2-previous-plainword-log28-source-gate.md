# Previous plaintext word GP-prime sum in the source-selected GP28 step register

**Decision (12 November 2026, Agent 1): bounded original-input negative, with a full original-cipher inverse and matched positive.** Four fixed, reversible previous-*plaintext*-word prime-sum feedback architectures remain ciphertext-like on the unmodified 12,956 unknown LP2 GP29 runes. Their GP29 IoCs are 0.035258–0.035329, versus 0.062710 for authentic clear p57. No unknown plaintext, authentic key, mechanism, or destination is recovered. Do not enlarge this into a free phase, dictionary, or key sweep.

## Why this new operation was worth a finite test

The independently authenticated 2016 continuation says the book's words are the map and their numbers the direction. The 2014 LP1 physical p05 / Stage04 *Some Wisdom* page and the original 2013 761.MP3 ID3 title/Parable contain separate GP-prime-sum arithmetic correspondences, but neither is a 2013 instruction for using a prior word's value as the next cipher key. The legacy `2013-0-wisdom` filename is not a 2013 source date. An earlier source-selected red arithmetic triangle makes 15 a primitive root modulo29, furnishing a reversible 28-way logarithm on every nonzero ciphertext step. The manuscript has an independently established anomalously rare 86/12,901 same-page repeated ciphertext runes, with 86 total among 12,955 contiguous unknown-rune steps.

Together, these suggest a sharply bounded candidate composition: use each completely deciphered word's GP-prime sum to direct the logarithm of the **next word's** ciphertext steps, keeping published word boundaries. Unlike preceding-*ciphertext*-word GP29 Caesar and additive-feedback constructions already tested elsewhere, this is a **previous-plaintext-word key** on the proposed **28-way log-difference register**, with a key that can be recovered causally while decoding. The original author did not explicitly prescribe this composition or the clock.

The exact shared 2,896-word parser includes 32 cross-page words and the 55 runic pp0–55. The numeral-only p50 is empty, so no invented glyph is inserted. The first rune transmits its initial state. For word w:

1. Set initial K=0. After each complete word, replace K with the sum of GP prime weights of **recovered plaintext** runes in that word, modulo28. This K directs the immediately following word.
2. For rune i after the first, with zero-based within-word position j, put d=(C_i−C_prev) mod29. If d=0, output EA (GP index28). Otherwise output P_i=[log-base15(d)+s*K*f(j)] mod28.
3. Four preselected models use s=−1 or +1, and f(j)=1 or j+1. No free phase, secret key, page reset or skip rule is fitted.

Each model has an exact forward encoder: for P_i=EA, emit the same previous ciphertext rune; otherwise emit C_i=C_prev+15^[P_i−s*K*f(j)] mod29. Thus the 86 actual ciphertext doublets correspond to 86 decoded EA symbols by construction. The full inverse is causal because the previous plaintext word is complete before the next key is needed.

## Unedited original and source-shaped control

The inputs are the indexed original corpus at resources/liber-primus/lp2-corpus.json and canonical word transcript at resources/lp2-transcription.txt, agreeing at every one of **12,956 original rune positions**. The planted plaintext cycles the **95 solved p57 runes** through the same 12,956 source-shaped positions, replacing exactly the original 86 adjacent-repeat sites with EA. It thereby exercises all observed collision locations while retaining an authentic GP-language control. The plant IoC is **0.071689912918**, and all four independently enciphered controls have ciphertext IoC 0.034466–0.034494 and precisely 86 adjacent doublets.

| Original full inverse | Decoded original IoC | Planted recovery | Wrong GP-ordinal in place of GP-prime key recovery |
| --- | ---: | ---: | ---: |
| Constant s=−1 | **0.035258069678** | **12,956/12,956** | 473/12,956 |
| Constant s=+1 | **0.035283676640** | **12,956/12,956** | 538/12,956 |
| Progressive (j+1), s=−1 | **0.035318577893** | **12,956/12,956** | 926/12,956 |
| Progressive (j+1), s=+1 | **0.035328015172** | **12,956/12,956** | 1,105/12,956 |

All four original decryptions exactly re-encrypt the source corpus (12,956/12,956) and yield 86 reserved EA symbols. The remaining 28 GP runes have near-uniform full-book frequencies. The progressive +1 decoded source begins STHCSDIAEIACJDJTHOETOSRSNGHFJOETHWUEEOTHJJWFWTWICDLXNGNXWGHNSWBODOEMAEFFWOEISPNIAWEGGTH... . Incidental short wordlike substrings in the prefix do not extend to coherent plaintext.

The full-length positive is important: it confirms that genuine solved-Cicada language, with exactly the manuscript's original 86 repeat positions, can be encrypted and completely recovered by the candidate architecture. Cycling p57 alters its natural word boundaries, so this is an **engineering control**, not a claim that unknown LP2 repeats solved text. Original re-encryption is likewise a correctness check for any bijection, with no evidential power to identify its real historical key.

## Scope and next decision

This disfavors the **four source-bounded previous-plaintext-word shifts in the mod28 exponent register** as direct native-GP English decryptions. It does not reject the prime-number clue, the EA marker hypothesis, non-GP intermediates, independently sourced hidden keys or other historic instructions. No actual original unknown plaintext was recovered.

Do not enlarge this particular model into a free word-state sweep. The next useful step needs an independently evidenced operation or recoverable key/state and a frozen original decoder that predicts untouched original text.

**Reproducer:** [single-file CommonJS source and plant SFT](../sims/lp2_previous_plainword_log28_sft.cjs) (Node.js 22, built-ins only). The four source IoCs, the 86 repeat placements, all original round trips and all source-shaped native plants were computed from the exact GitHub source bytes during this invocation. The test has detailed assertions and preserves its numeric checks. No new GitHub Actions workflow or automatic trigger was added.

**Related grounded work:** [GP28 red-triangle representation](red-span-triangle.md) · [previous ciphertext-word nonce](lp2-previous-word-prime-nonce-original-gate.md) · [prime plaintext feedback all-multiplier](lp2-prime-plaintext-feedback-allmultiplier-gate.md) · [lossless anti-repeat capacity](lp2-anti-repeat-lossless-capacity.md).
