# All-cut original ciphertext excludes affine-encrypted native GP words of length 8–14

**Agent10, 16 November 2026; Director [#1208](https://github.com/FlareZ123/liber-primus/issues/1208).** An original-input, exact key-independent necessity test. It recovers **no** unknown plaintext, authenticated key, or source-chosen decoding mechanism.

## Why this matters for the intended solve path

The original manuscript strongly resembles natural word-length segmentation, while its 83 one-rune tokens use 28 of 29 GP glyphs. The first-party 2016 hint names the manuscript's *words* and their *numbers*. A human might therefore consider changing the positions of visible word breaks and rekeying each resulting word with a simple numerical GP29 transform. The previous all-key Caesar gate applied only to the source's **existing** printed words; Director #1208 allows an unknown, possibly context-dependent new segmentation. This result removes the requirement to know **any** of the new word breaks or any per-word affine keys.

Assume the unchanged 12,956 GP29 ciphertext runes retain their source order. Candidate plaintext words can begin and end at **any** inter-rune cut, including cuts that cross printed hyphens, punctuation or physical page seams. For each new word, grant an independent arbitrary secret affine map
`C_j = a_w P_j + b_w (mod 29)`, with `a_w = 1..28` and `b_w = 0..28`: all 812 choices are allowed at every word. Their key schedule can be arbitrary. Only the reconstructed word-length **multiset** is assumed to remain the manuscript's original printed multiset; it need not preserve their printed sequence.

The independent plaintext register is exactly the repository's previously pinned 29,088-entry TextBlob GP-English vocabulary with its existing GP normalization (`QU→CW`, `V→U`, `K/Q→C`, `Z→S`, GP digraphs). This is a **conditional native-English gate**, with no claim about the unknown original language, abbreviations, alternate spellings or true author intent.

## Complete all-key signature

For a word `x=(x_0,...,x_{n-1})`, take the first `j>0` with `x_j != x_0`, then map every position to `(x_i-x_0)/(x_j-x_0) (mod 29)`. A constant word has its own separate invariant. Since 29 is prime, multiplication and addition by an unknown invertible affine key leave this signature **exactly invariant**. Conversely, two words with the same signature are related by an affine key. Thus checking dictionary signatures exhausts every secret `(a_w,b_w)`, without key search or language-score tuning.

Construct this signature for the fixed vocabulary and scan **every possible consecutive n-rune window** of the complete original p0–55 ciphertext. This is a strict superset of all possible word positions under any resegmentation preserving ciphertext order.

| Window length n | Distinct reference affine patterns | Original windows checked | Original windows matching one |
| ---: | ---: | ---: | ---: |
| 5 | 3,332 | 12,952 | 1,649 |
| 6 | 4,593 | 12,951 | 73 |
| 7 | 4,745 | 12,950 | 4 |
| 8 | 4,318 | 12,949 | **0** |
| 9 | 3,417 | 12,948 | **0** |
| 10 | 2,416 | 12,947 | **0** |
| 11 | 1,488 | 12,946 | **0** |
| 12 | 783 | 12,945 | **0** |
| 13 | 404 | 12,944 | **0** |
| 14 | 160 | 12,943 | **0** |

The original printed length multiset contains **156 length-eight words**, 78 length-nine, 52 length-ten, 32 length-eleven, 18 length-twelve, four length-thirteen and three length-fourteen. Any candidate reconstructed segmentation with that multiset must contain those lengths. No such segment can be an affine image of **any** word in the fixed reference dictionary, regardless of its start offset. Thus **all** length-multiset-preserving GP29 affine-per-word encoders are incompatible with reference-register plaintext, even after granting freely reordered lengths, completely unknown boundary positions and 812 independent keys per word. A stronger or source-authenticated general mechanism may change original rune order, use evolving state within words, alter plaintext lengths, or use a different language register.

## Positive, alternative and limits

The standalone test constructs a separate **12,956-rune / 2,896-word GP-native positive** from independent reference words at every original source word length, reorders the entire source length multiset by the bijection `i→17i mod 2896`, and encrypts each word under a different known nonzero GF29 multiplier and offset. It recovers **12,956/12,956** exact plaintext runes and passes the same affine signature oracle on **2,896/2,896** word tokens. The source's authentic rune tape and original word count/lengths are separately asserted against the untouched transcription.

A control relaxing the entire affine family to independent **arbitrary 29! secret rune permutations** finds many matching equality patterns on original 8–14 windows (including **32** length-fourteen possibilities). The new page-group-constrained test below finds **zero** such 14-rune windows on physical pp23–26, even while allowing arbitrary word cuts within that group. That stronger nonlinear family is **not** excluded by this test. Such equality-pattern matches do not recover words; they permit enormous unconstrained secret alphabets, and no original clue currently supplies the required secret permutations or their word-boundary state. A rune-level permutation/transposition or an English vocabulary outside the pinned register likewise escapes this gate.

## Page-group-constrained arbitrary-permutation bound (18 November extension)

The previous full-book result allowed arbitrary **29! secret bijections per word** to survive its affine exclusion. A narrower original-source question is answerable without guessing any secret alphabet: can the complete physical **pp23–26** group still encode the pinned GP-native English register if the group keeps its printed word-length multiset and rune order, but *every word* may receive an independently unknown 29-symbol permutation and *every word boundary* may move within the group?

A fully unknown bijection preserves the **equality pattern** of a complete word, the sequence of first-occurrence class labels. Conversely, two complete equal-length words with identical equality patterns admit a full 29-symbol permutation between them. This supplies an exact, all-secret, all-cut necessary condition.

- The pp23–26 original group has **1,021 contiguous ciphertext runes**. Its intact printed length multiset requires **one length-14 word**, located at global tape offset **6,035** (physical p25, page-local rune offset 46, word index 1353).
- The unchanged TextBlob reference has **29,088** GP-encodable length≤14 words. Scan **all 1,008 possible length-14 windows**, with any starting offset inside this original group, against the complete set of reference length-14 equality patterns: **zero compatible windows**. No choice of word position, secret 29! alphabet or other words' keys can remedy that necessary-condition failure.
- A separately selected genuine GP-native length-14 word, encoded under a nonaffine bijection of all 29 rune labels, preserves the equality-pattern oracle and is decoded **14/14** exactly using the inverse secret alphabet. The prior affine planted book test remains **12,956/12,956** exact.

This excludes **only** source-rune-order-preserving, page-group-local, fixed-length whole-word GP29 substitution into the pinned English vocabulary. It strengthens the prior affine gate by granting unlimited nonlinear alphabet keys per word for one source-defined group. It does **not** exclude unrestricted repartition across pages, a different plaintext register (including English words outside the fixed vocabulary), changed word lengths, state changes within a word or transposition. In particular, the broad arbitrary-word-substitution family remains open without the fixed pp23–26 group boundary and the preserved length-14 requirement.

The same existing CommonJS SFT computes and asserts the group offsets, one required length-14 word, all 1,008 original candidate starts and exact planted inverse. This is a reproducible conditional exclusion and recovers no authentic unknown plaintext.

## Transparent-F and latent word lengths (Agent48, 26 November 2026)

This strengthens the original gate using the fixed 35,938-form GP29 vocabulary, all 12,956 runes in original order, and 2,896 joined printed word slots. The historical transparent-F convention is allowed independently per word: plaintext F emits ciphertext F without applying its affine key; a non-F plaintext rune can also encrypt to F. Ordinary affine words are also allowed. Each word may have an independent intercept b and nonzero multiplier a. No cipher key or authentic plaintext is assumed.

For any candidate interval, enumerate the subsets of its ciphertext F positions as the exact plaintext-F mask; compare the affine-invariant signature on the remaining positions with each dictionary word having that mask. The signature uses differences from the first retained symbol divided by the first nonzero difference modulo 29 (constant strings handled separately). Thus the match is an exact existence test over all 812 affine maps, not a language score. For arbitrary latent cuts, dynamic programming over (prefix length, word count) minimizes OOV, allowing any OOV interval of length 1–24 and either F convention. All 2,176 toy interval comparisons against direct forward encryption passed; nine held-donor controls retained every actual in-vocabulary interval.

The union interval counts at lengths 1–7 are 12,956, 12,955, 12,954, 12,151, 2,036, 98, 3; there are zero matches at length >=8. With conserved lengths, 815 words require length >=6 and at most 95 disjoint matching intervals exist, hence >=720 OOV versus a 144-word (5%) budget. Even with length changes, at least 576 of those original long slots must change length to meet that budget. With only count conserved, the exact optimum is 43 OOV. One constructive witness has 98 length-3, 2,178 length-4, 544 length-5, 33 length-6, and 43 length-24 OOV words; all ciphertext runes replay exactly. It changes 1,935 printed length slots (histogram distance), and the product of distinct lexical plaintext choices for its fixed segmentation exceeds 10^1004. It is not evidence of an authentic plaintext.

For a shared multiplier, retain the first nonzero difference dP of each plaintext signature and admit a=dC/dP; constant signatures admit every nonzero multiplier. Allow all per-word intercepts and mixed F conventions. For each slope and integer lambda, the shortest path minimizes 4096*OOV + lambda*word_count over all complete partitions. Its optimum gives the rigorous fixed-count lower bound ceil((optimum-lambda*2896)/4096). All 28 slopes have certified bounds of 199–203. Exact count DP for slopes 1,23,26,28 gives 201,199,199,199 respectively, proving global minimum 199. If each chapter has its own multiplier and retains its own joined word count, the chapter minima are bounded below by 12,18,27,28,16,21,25,46,5 (sum 198), each over its own 5% budget. The 2,176 brute-force slope interval comparisons and 137 small exact/dual comparisons passed. Two full-length length-matched planted donors (63 OOV each; slopes 13 and 7, ordinary/F and ordinary respectively) retained every true lexical interval; only the true slope passed the 144-OOV threshold in each. This identifies the planted slope, not a unique per-word plaintext.

Reproduce with [the CJS SFT](../sims/lp2_latent_affine_fhold_exact_sft.cjs), default and `--slope`. [Interval/DP output](lp2-latent-affine-fhold-exact.json), [constructive witness](lp2-latent-affine-count-witness.json), [slope certificates and controls](lp2-latent-affine-common-slope.json). Source blobs pinned in the outputs. The computational cores were actually executed in V8; no separate CI run is claimed.

## Research decision

Conserved-length affine-per-reconstructed-word encoders remain excluded even under mixed transparent F and the wider vocabulary. With arbitrary lengths but fixed word count, a single shared multiplier (including one per chapter with retained chapter counts) remains excluded at 5% OOV; independent word-private multipliers survive only as a highly underdetermined family with radical length changes. Neither arbitrary per-word key fitting nor the replayable witness is a decipherment. Reopen only with an independently motivated shared key schedule, altered count/register, or genuinely predictive held-out plaintext. Within-word changing state and non-affine mechanisms are not excluded.

