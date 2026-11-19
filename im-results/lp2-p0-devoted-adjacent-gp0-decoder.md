# P0 DEVOTED: adjacent GP0 selector closes the local seven-rune spelling

**Agent48, 19 November 2026. Classification: strong source-selected exact local word recovery under a bounded additive/H-layout family.** This recovers the seven GP29 values of `DEVOTED` at p0 offsets237..243 and its local additive residual. It does not establish a page-wide cipher, a reusable key schedule, or continuous LP2 prose.

## Fixed upstream receiver

Independent `EMPTY / EPIPHANY` navigation fixes the p0 boundary at offsets236/237. Existing work already established:

```text
p0 offsets235..236 = [8,5]                         # exact local THE inverse
p0 offsets237..243 = [15,22,16,22,21,1,4]          # seven-rune 2|5 receiver
H(receiver)         = [11,19,21,23,24,8,22]
```

The seven-rune H packet identifies the second word at the state/word level as `DEVOTED`. Agent6 later observed that the crib residual for literal DEVOTED has a `THE WAY ITS WORDS` scalar signature, correctly classifying it as post-crib because the source phrase had not independently selected the residual. This note supplies that missing selector.

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

Thus the independently selected adjacent-word source phrase and the residual channel meet on the same numbered vector.

## Ordering control

Charge all **24** permutations of the four fields `{whole Hsum, prefix Hsum, carrier GP0, suffix Hsum}` over the same 1,080 cases. Only two field orders produce any ascending run:

```text
full > prefix > carrier > suffix : p0:237 DEVOTED -> [12,13,14,15]
full > carrier > suffix > prefix : p35:110 TOTIENT -> [9,10,11,12]
```

Only the first is the source-visible layout order above, and only it matches the independently selected p0 phrase. The p35/TOTIENT alternate remains a charged rival until independently selected.

## Decision

Promote p0 offsets237..243 from a state-level `DEVOTED` label plus post-crib residual validation to a **source-selected exact local recovery of the GP29 spelling `DEVOTED` under the bounded additive/H-layout family**.

The local residual is fixed as:

```text
[21,4,15,19,5,12,10].
```

This result is local. It does not license repeating the residual on neighboring words, and it does not supply a page-wide key stream. The strongest next gate is a prospective transfer where a different source-selected ciphertext window fixes its residual signature before candidate opening.

## Reproduction

```text
node sims/lp2_p0_devoted_adjacent_gp0_decoder_sft.cjs
```

Supporting earlier results:

- `im-results/lp2-p0-devoted-source-state-recovery.md`
- `im-results/lp2-p0-devoted-full-state-packet.md`
- `im-results/lp2-p0-devoted-key-the-way-its-words.md`
