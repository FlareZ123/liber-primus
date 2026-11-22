# Full LP2 GP29+printed-hyphen difference as a resegmentation cipher

**Agent23, 16 November 2026. Director #1208. Complete original-source negative; no unknown plaintext or key.**

The 29-symbol historical GP alphabet and one explicit hyphen word delimiter can be represented by a 30-state alphabet. The 2016 signed message's reference to words, numbers, and direction motivates asking whether a 2014 player would treat the physical hyphen as part of a reversible number stream. No source tells us to use modulus 30 or predecessor differencing; this is the critical unsupported premise, tested as the simplest finite original-cipher model rather than an open key search.

The exact cipher is \`plain[i]=(cipher[i]-cipher[i-1]) mod 30\`, and its forward inverse is \`cipher[i]=(plain[i]+cipher[i-1]) mod 30\`. GP rune symbols occupy 0–28; hyphen occupies 29. The preceding ciphertext symbol resets to literal 29 at the beginning of a punctuation span. A decoded token 29 becomes a *new plaintext space*, so original word breaks are free to move in the decoded language. The unchanged punctuation outer marks are transmitted separately. The complete original rune order, original hyphens and cross-page word carries are recovered byte-for-byte at the symbolic level when decoding and re-encoding.

The source inputs are \`resources/liber-primus/lp2-corpus.json\` and the existing \`lp2-transcription.txt\`: all 12,956 unknown runes, 2,896 original printed words, 175 transcription-defined punctuation spans, and 2,721 explicit within-span word hyphens. The existing transcription has disputed editorial p15 periods and a separate p37 missing full stop, so the 175 resets represent **one frozen derivative grammar**, not a verified original-ink punctuation register.

| Original-inverse measurement | Value |
| --- | ---: |
| Whole 30-state cipher tape | 15,677 symbols |
| New decoded spaces | **513** |
| New GP29 rune tokens | **15,164** |
| Decoded symbol IoC | 0.0354345089 |
| Punctuation spans without one decoded space | **40 of 175** |
| New decoded word lengths exceeding 14 GP runes | **348** |
| Maximum decoded word length | **130 GP runes** |
| p0–2 original rune-carrier positions / new spaces | **729 / 28** |
| Untouched pp40–53 original rune-carrier positions / new spaces | **3,008 / 92** |

No output span of at least 150 original positions formed intelligible GP-native English with reconstructed spacing. These measured spacing rates, maximal word runs and nearly uniform GP rune IoC reject ordinary prose under this exact operation, before language-model key fitting. Original p57 PARABLE supplies an independently readable 95-rune, twenty-word positive input; the exact forward/inverse returns every symbol and literal space. A full-length 12,956-rune native-GP plant built from only the authentic p57 words and GP A, respecting every original punctuation-span rune total, also round-trips exactly. A deliberate wrong reset state produces a wrong first original token in **175/175** spans.

**Decision:** Retire the frozen Z/30 predecessor-difference full-token model. This does not exclude a different historically selected cipher mixing word boundaries with runes, but provides no grounds for an ad hoc secret order or shift search. The source-visible alphabet count alone cannot select a genuine 30-ary opcode. Maintain #1208 as open until a different independently clue-driven full inverse exists.

[Read-only Windows Node22 original and solved-page source SFT](../sims/lp2_fulltoken_mod30_difference_source_sft.cjs).
