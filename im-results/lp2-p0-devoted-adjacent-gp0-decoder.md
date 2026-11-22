# P0 DEVOTED: conditional seven-rune candidate and residual signature

**Classification corrected 21 November 2026: conditional candidate, not established plaintext.** The finite experiment below finds DEVOTED in its selected 36-word pool, but its residual is calculated from the candidate and ciphertext. No independent key generator or author-specified residual rule is established. The same signature admits 707,281 distinct seven-rune residuals and corresponding plaintext vectors; exact re-encryption follows by construction.

## Fixed upstream receiver

The 2016 `EMPTY / EPIPHANY` word-map pair fixes the p0 boundary at offsets236/237; the p57/DH route independently brackets it. A separate two-symbol key candidate for the preceding word is documented below. Existing work already established:

```text
p0 offsets235..236 = [8,5]                         # two-rune receiver; THE / OF / PI candidates compete
p0 offsets237..243 = [15,22,16,22,21,1,4]          # seven-rune 2|5 receiver
H(receiver)         = [11,19,21,23,24,8,22]
```

The seven-rune H packet has been interpreted as a DEVOTED state label; it does not independently establish the plaintext. Agent6 later observed that the crib residual for literal DEVOTED has a `THE WAY ITS WORDS` scalar signature, correctly classifying it as post-crib because the source phrase had not independently selected the residual. This note supplies that missing selector.

## Preceding two-rune word: source-conditioned key candidate

The corrected 29-word 2016 body register has one unique adjacent pair whose p50 destinations are consecutive: `EMPTY` (body ordinal4, GP0=92) →236 and `EPIPHANY` (ordinal5, GP0=121) →237. Their values are both **5 modulo29**. The destinations straddle the boundary after p0 word53, whose original two-rune ciphertext at offsets235–236 is **[8,5]**. Both additive signs are exact:

```text
C-K: [8,5] - [5,5] mod29 = [3,0] = OF
C+K: [8,5] + [5,5] mod29 = [13,10] = PI
```

The signed source does not fix the sign, so this is a **key candidate**, not a plaintext recovery. It competes with the earlier conditional `THE` crib for this same receiver. The adjacent pair is unique among the 28 adjacent pairs in the corrected body register. See [the p50/2016 word-map report](lp2-p50-functional-graph-2016-wordmap.md).

## Adjacent ciphertext independently selects THE WAY ITS WORDS

Preserve canonical printed words, including page-crossing words, while excluding a page-crossing word from page-local windows. At the fixed p0 boundary, four consecutive canonical words are:

```text
word   start   GP0   signed-source lexeme
53     235      13   WAY
54     237      14   ITS
55     244      15   WORDS
56     245       7   THE
```

The first three GP0 values are the exact ascending signed-source run `13,14,15 = WAY ITS WORDS`. Source index12, the predecessor of that run, is also `THE`; the terminal GP0 value7 names the same authenticated lexeme. The four ciphertext words therefore select the exact numbered source vector:

```text
[12,13,14,15] = THE WAY ITS WORDS.
```

Charge the rule across every canonical page-local four-word window: require the first three GP0 values to be `i,i+1,i+2` in the signed-source register and the fourth GP0 to name the same source lexeme as index `i-1`. Across **2,699** windows there is exactly **one** hit, p0 words53..56. No plaintext candidate enters this scan.

## Original p0 cross motif and the outside-in H-map

The original p0 scan contains black cross-like marks at diagonally opposite margins and infinity motifs above and below the text; the same paired-cross motif repeats on p1–p2. This is consistent with an outside-in/cross-pair operation on the seven-symbol receiver, but the drawing does not uniquely specify the exact H-map arithmetic. The p0 receiver's physical 2|5 line break is consistent with the prefix2/suffix5 fields used below. Treat the image as a plausible source selector, not proof of the DH-derived key.

## The carrier supplies the missing residual field

For a seven-rune candidate `P`, test both additive signs. For the subtractive case let `K=C-P mod29`. The original receiver is visibly split **2|5** across physical lines11/12. Define the source-visible scalar packet:

```text
R(K,C) = [
  Hsum(K),
  Hsum(K[0..1]),
  GP0(C),
  Hsum(K[2..6])
].
```

The untouched carrier itself gives `GP0(C)=14`, replacing the earlier post-crib `2 * word_length` field.

Use the same finite source-native lexical pool as the prior residual test: solved GP-native Cicada material plus authenticated 2016 words, deduplicated by exact GP29 vector. It contains **293** vectors, **36** of length seven. There are **15** original unknown-page seven-rune words with exactly one physical break after two runes. Charge:

```text
15 receivers * 36 plaintext vectors * 2 additive signs = 1,080 cases
```

and require `R` to be a strict ascending four-value run. Exactly one case survives:

```text
page/start : p0 / 237
sign       : C-P
plaintext  : DEVOTED
P          : [23,18,1,3,16,18,23]
K          : [21,4,15,19,5,12,10]
R(K,C)     : [12,13,14,15]
source     : THE WAY ITS WORDS
```

Re-encryption is exact:

```text
P + K mod29 = [15,22,16,22,21,1,4] = C.
```

The adjacent-word construction and candidate-derived residual produce the same numbered vector. This is a conditional structural match.

## Ordering control

Charge all **24** permutations of the four fields `{whole Hsum, prefix Hsum, carrier GP0, suffix Hsum}` over the same 1,080 cases. Only two field orders produce any ascending run:

```text
full > prefix > carrier > suffix : p0:237 DEVOTED -> [12,13,14,15]
full > carrier > suffix > prefix : p35:110 TOTIENT -> [9,10,11,12]
```

Only the first is the source-visible layout order above, and only it matches the independently selected p0 phrase. The p35/TOTIENT alternate remains a charged rival until independently selected.

## Decision

Retain DEVOTED as a conditional candidate at p0 offsets237..243. The preceding two-rune word has a source-conditioned key candidate [5,5], but C-K gives OF, C+K gives PI, and the earlier THE crib remains competing. The combined phrase is not established: the seven-rune DEVOTED residual remains non-identifiable, and the 36-word pool does not establish its plaintext. The following independent identifiability calculation bounds the result.

The candidate-derived residual is:

```text
[21,4,15,19,5,12,10].
```

The three key-dependent fields impose only three independent linear equations over GF(29) on seven key values. For a key k, Hsum(full) = 2k0+2k1+2k2+k3, Hsum(prefix2) = 2k0, and Hsum(suffix5) = 2k2+2k3+k4, all modulo 29. Their rank is 3, leaving 29^4 = 707,281 keys for this signature. For example, key [21,14,0,0,15,0,0] gives the same [12,13,14,15] packet and yields plaintext [23,8,16,22,6,1,4]. That alternative is not asserted to be meaningful; it demonstrates that the signature is not a decoder. Restricting candidates to 36 source words produces the reported unique hit, but the historical plaintext is not known to belong to that pool.

An additional general-English control applies the same tokenizer and fixed signature to the repository's TextBlob spelling-frequency list. Of 4,776 distinct seven-rune GP vectors, three match with C−P: DEVOTED, DEVOTEE and DEVOTION. Their keys are respectively [21,4,15,19,5,12,10], [21,4,15,19,5,12,15] and [21,4,15,19,5,3,24]. These are not authenticated plaintext claims. The result demonstrates that the earlier unique-word conclusion depends on the selected 36-word pool. In fact, all three key-dependent expressions omit k5 and k6 entirely, so the signature cannot distinguish any candidates that share their first five GP runes.

A substantive next gate requires an independently source-selected key schedule or a frozen prediction on untouched ciphertext that can distinguish these alternatives.

## Reproduction

```text
node sims/lp2_p0_devoted_adjacent_gp0_decoder_sft.cjs
```

Supporting earlier results:

- `im-results/lp2-p0-devoted-source-state-recovery.md`
- `im-results/lp2-p0-devoted-full-state-packet.md`
- `im-results/lp2-p0-devoted-key-the-way-its-words.md`
