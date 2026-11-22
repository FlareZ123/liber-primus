# p50 leading-zero collision/rejection inverse: exact long-word gate

**Decision (Agent19, 18 November 2026):** a deterministic additive retry cipher that makes the existing p50 leading-zero / rare-doublet association causal has **zero registered native-GP English preimages at all 109 original LP2 word slots of GP length 10–14**. This remains true after granting every word all **256** p50 starting phases, all **29** possible first-rune collision comparators, and both additive signs. A forced-rejection CIRCUMFERENCES plant is recovered exactly. The proposed decoder therefore fails its first useful plaintext gate and should be retired unless a new source clue changes the rejection rule.

This is a bounded original-input result. It does not erase the independently observed leading-zero/doublet association; it rejects one explicit mechanism that would have explained that association.

## Causal hypothesis

The strongest unresolved p50 observation is tied to the original printed symbols rather than a disputed base conversion: under the natural global 256-cell clock, table tokens whose **literal first character is 0** cover about 23.4% of eligible positions but contain **33 of the 86** surviving adjacent equal-ciphertext events. The effect has the same direction in all nine source chapters. The consolidated observation is preserved in [the p50 tableau gate](lp2-p50-raw-tableau-allsecret-gate.md).

A simple puzzle mechanism that predicts such an enrichment is a rejection cipher:

~~~text
K[j] = p50_byte[j mod 256] mod 29
Z[j] = 1 iff the literal printed p50 token at j begins with "0"

candidate = plaintext + sign*K[j] mod 29

if candidate == previous_ciphertext and Z[j] == 0:
    consume j and retry the same plaintext rune
else:
    emit candidate and consume j
~~~

Under this rule, most candidate doublets consume extra key cells and disappear, while a leading-zero cell permits a doublet to survive. The mechanism is deterministic once plaintext, previous ciphertext, sign and p50 phase are fixed. It uses the live p50 anomaly as an operation rather than as a score.

## Exact inverse

For a proposed plaintext rune and current p50 phase, encryption advances through at most one table period until it finds the first accepted candidate. The inverse therefore has only **256 key phases**. For each observed ciphertext rune, the reproducer enumerates GP29 plaintext runes, simulates the exact retry rule, and keeps only transitions that emit the observed rune.

No language score or tuned skip count is used. Rejection depth is whatever the deterministic source rule requires.

To avoid falsely rejecting a correct continuous cipher because the test is word-local, the necessary-condition gate deliberately grants each original long word:

- any of all **256** starting p50 phases;
- either additive sign;
- any of all **29** possible previous-ciphertext values for the first rune.

Subsequent predecessor values are the actual original ciphertext runes inside that word. This is strictly more permissive than one continuous book-level key clock.

## Registered GP-native lexical gate

The independent TextBlob frequency resource already used by other project word-preimage gates is encoded with the repository's GP29 rules. Restricting to source word lengths 10–14 yields:

| GP rune length | Registered types |
| ---: | ---: |
| 10 | 2,388 |
| 11 | 1,450 |
| 12 | 767 |
| 13 | 379 |
| 14 | 154 |
| **Total** | **5,138** |

The original LP2 p0–55 segmentation contains exactly **109** words in those lengths.

The inverse is implemented as a trie reachability calculation. A hit requires one complete registered word to reproduce every original ciphertext rune in that word under one exact p50 phase trajectory.

## Positive control with genuine rejection

CIRCUMFERENCES encodes to 14 GP runes. With sign minus, start phase 0, and first comparator F=0, the proposed emitter produces:

~~~text
plaintext GP indices:
5,10,4,5,1,19,0,18,4,18,9,5,18,15

ciphertext GP indices:
5,11,21,24,25,9,20,13,16,7,19,1,9,6

rejections per rune:
0,0,1,0,0,0,0,0,0,0,0,1,0,0
~~~

Thus the plant exercises the actual retry branch twice. The exact inverse recovers CIRCUMFERENCES from that ciphertext and phase family.

## Original result

Across the intact source words:

- original long-word slots tested: **109/109**;
- GP-native lexical candidates: **5,138** registered types;
- starting phases granted independently per word: **256**;
- first-rune predecessor comparators granted: **29**;
- signs: **both**;
- exact complete original word preimages: **0/109**.

There is no long-word plaintext survivor to promote into a continuous phase reconstruction or a p55 decipherment.

The [single-file CommonJS reproducer](../sims/lp2_p50_digit0_collision_rejection_wordlex_sft.cjs) parses the original 2,896-word / 12,956-rune source, reconstructs the original ciphertext exactly, builds the GP-native trie, checks the forced-rejection plant, and evaluates every original length-10–14 slot.

## Interpretation

This rejects the exact **p50-byte additive key + nonzero-leading collision rejection + leading-zero collision permission** architecture. The observed leading-zero/doublet association survives as an unexplained structural clue, since this test targets a mechanism rather than the association itself.

Do not rescue the decoder by tuning maximum skip counts, start phases, signs, or word-local phases. The tested retry rule has no skip cap, already grants every start and sign, and still cannot produce even one registered long English word at the original long-word slots.

A successor mechanism needs a new independently motivated ingredient that changes the actual plaintext transition, such as a second table operand or a source-authenticated evolving state. Merely adding hidden key consumption to this exact additive emitter has no causal support after the zero-preimage result.
