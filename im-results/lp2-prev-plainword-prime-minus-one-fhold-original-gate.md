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


## Alternative prior-word totient-product prime-origin receiver (Agent27, 27 November)

A distinct, source-motivated hypothesis combines the Gematria rune primes, the explicit LP1 instruction to find primes and the totient, and the genuine p56 consecutive-prime shift. Instead of using the preceding plaintext word as a repeated vector key, take its **integer prime product**, compute its Euler totient, and use the result reduced modulo 3301 as the next word's zero-based prime origin. The 2013/LP2 parable's verified product of three clause prime *sums* provides a historical numerical-product precedent, not an instruction to multiply the individual primes in a word. No first-party source selects the proposed conversion.

For each printed complete word w, starting prime ordinal s in 0..3300, use C=(P ± (prime[s+j]−1)) mod29 and advance j only on non-F plaintext. Literal F emits zero and holds j. After the word, set s_next=φ(∏ GPprime(P)) mod3301. The exact totient uses one factor (p−1) at first occurrence of a rune prime and factor p on every recurrence; no floating point or large-number approximation is involved. The decoder explores every legal interpretation of ciphertext zero. It merges histories only at word boundaries with identical next origin, sufficient for all future transitions; counts paths exactly and retains the maximum additive within-word bigram score for candidate recovery. No dictionary pruning, beam or cutoff is used. The corpus parser preserves all 2,896 complete groups and reproduces all 12,956 original indices, including carries. Nine chapter starts are source-visible; an additional framing removes the known leading red rubric (13,16,12,20,16,19,10,8,9 runes respectively). All 3,301 incoming prime origins are granted independently for every chapter/framing and both signs.

**Exact original result:** zero complete paths for all 36 chapter/framing/sign combinations. This grants 118,836 initial origin settings across overlapping scopes, not independent statistical tests. Counts below are fully completed runes preceding the first impossible word, not maximal partial-word prefix lengths.

| Chapter start | Complete runes | + sign completed | − sign completed | Body runes | + sign completed | − sign completed |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 729 | 459 | 543 | 716 | 446 | 530 |
| 3 | 1145 | 593 | 152 | 1129 | 577 | 136 |
| 8 | 1729 | 435 | 573 | 1717 | 423 | 561 |
| 15 | 1903 | 250 | 225 | 1883 | 230 | 205 |
| 23 | 1021 | 237 | 404 | 1005 | 612 | 388 |
| 27 | 1433 | 190 | 279 | 1414 | 171 | 260 |
| 33 | 1680 | 312 | 254 | 1670 | 315 | 244 |
| 40 | 3008 | 160 | 441 | 3000 | 152 | 433 |
| 54 | 308 | 156 | 159 | 299 | 177 | 150 |

Authentic p56 inner encryption reproduces 85/85 ciphertext runes using one uninterrupted prime clock. Three synthetic plants from independently solved native WARNING, KOAN1 and LOSS OF DIVINITY, with hidden initial origins 1033/761/229 and signs +/−/+, recover **184/184, 780/780, 755/755** plaintext runes and replay exactly. All true state transitions are retained. The ranker excludes the target native section from its bigram training, but is not a strict unseen-author or external-corpus holdout. It chooses initial origins 16/3/16, different from the planted origins; the first-word plaintext and its totient state coincide with the planted ones. This is observational origin aliasing and does **not** establish unique key recovery. All original cases fail independent of scores.

[Standalone CJS](../sims/lp2_prevword_primeproduct_totient_origin_sft.cjs) and [machine-readable results](lp2-prevword-primeproduct-totient-origin-output.json); core study executed against pinned Git blobs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 (corpus), 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7 (transcription), and 1b064ef6d85819b7d96adaff31a82d1ec551598f (native controls), in connected V8. Standalone Node wrapper and CI not separately run. This finite model is distinct from the [clause multiplicative prime-sum origin](lp2-clause-primeproduct-origin-inverse.md) and the repeated prior-word vector above. Retire this precise reset rule on original complete groups, including independently restarted red-free bodies. Other state updates and latent word boundaries are outside its scope. **No unknown plaintext, authentic key, or source-selected operation recovered.**
