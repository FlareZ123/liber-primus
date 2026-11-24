# Prior-plaintext-word prime-minus-one autokey: original-cipher decision

## Mechanism and decision

A concrete combination of known operations is to use the previous recovered plaintext word as a repeated next-word key, replacing its GP ordinals by the corresponding Gematria primes minus one, exactly the shift representation established on p56 AN END. This differs from #2503's ordinal prior-word Vigenère and the previously tested scalar previous-word prime sums or word-stride clocks. The signed 2016 emphasis on words and numbers motivates testing the bridge, but does not authenticate it. Preserve printed complete word boundaries and carry across physical pages. Reset the within-word key cursor at each word. For plaintext F (ordinal zero), emit literal zero and hold the cursor; otherwise emit (P + prime(previous_word[t mod length]) − 1) mod29 and advance. No unknown global shift, adjustable key, per-word exception or dictionary assumption is admitted. The initial seed word itself is not decoded.

**Result:** the exact recurrence cannot generate the original full LP2 tape, even with arbitrary singleton plaintext anchors. Three authentic solved-GP plants retain their true trajectory, but original reachability dies from 82/83 singleton anchors. The shortest contradiction is from complete word205 (zero-based rune967) through word218 inclusive, 46 source runes including the seed. The sole surviving terminal anchor is word2856, rune12770, covering 186 runes including seed. Its 16 distinct full trajectories merge into one final word; the best finite-lexicon-weighted trajectory contains only six matched words among 39 non-seed words and no connected English. No recovered unknown plaintext or authentic key.

## Exact inverse

Given a previous plaintext word, enumerate both valid possibilities at ciphertext zero: literal F with no advancement, and ordinary nonzero plaintext residue with advancement if legal. At nonzero ciphertext a derived plaintext zero is impossible. Deduplicate exact resulting plaintext words; since the next step depends only on the previous plaintext word, this preserves all reachable continuations. A singleton anchor has only 29 possibilities, so an empty set is a proof of impossibility for that interval independent of any vocabulary. The terminal path count is an exact integer; language ranking uses the pinned native-GP normalization of the repository's TextBlob frequency vocabulary only after reachability.

| Native plant | words | runes | peak states | final states |
|---|---:|---:|---:|---:|
| 1 | 150 | 613 | 16 | 1 |
| 2 | 150 | 601 | 8 | 2 |
| 3 | 150 | 615 | 12 | 2 |

Every true plant state was retained. These are synthetic encryptions of authentic solved-native text, not a historical demonstration of the proposed combined cipher. Best original terminal trajectory (first word is seed, not decoded):

```
U THAN CJTHIH AEGWTHG OENE MTSI ET XHRNCT JRWTHD EAXD BETHYOEAEX AMEYL IOEXT BAETEOEONGY EOI IAETH XCIG BDFOEBU NGBGHIL BUG SP XSUNGTGLIAAEC THY THBEOTIOAETHJB NGBEAW AS CAE OEADIMEO FNGOTRE GP USPUDGXNGYACWAE BNGIAEEOF SBJNG ET LETHGGGW RWHSSTHY NGR XEMNXR GOE UEOTH
```

Exact forward replay of the 185 non-seed runes succeeds as expected for any valid branch; this does not identify a key. The first anchor contradiction excludes a continuous full-tape law; 82 failures also sharply constrain resets, but arbitrary hidden resets, changed spacing and other key representations are outside scope. Retire this particular combination rather than vary offsets or exceptions absent independent author evidence.

## Reproduction

[single-file Node SFT](../sims/lp2_prev_plainword_prime_minus_one_fhold_sft.cjs), using canonical transcription/corpus, pinned solved-native reference and pinned dictionary. Executed equivalent algorithm against those files directly via repository connector and JavaScript runtime on 24 November 2026; no CI run claimed. Related ordinal-key [#2503](https://github.com/FlareZ123/liber-primus/issues/2503), [ordinal preceding-word script](../sims/lp2_preceding_plaintext_word_autokey_fhold_sft.cjs).
