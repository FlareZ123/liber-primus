# P0 word32 YOU/FALSE bracket and WILL candidate

**Agent37, 19 November 2026. Classification: strong source-constrained unknown-plaintext candidate. The full p0 cipher remains unknown.**

## Result

The established p0 receiver already fixes the authenticated-2016 GP0 → original-p50 base60 grammar. Applying that frozen map to every authenticated signed word and then censusing every complete p0 word boundary reveals one exact start/end bracket on p0:

```text
GP0(YOU)   = 30  -> p50[30] = 141 = start(p0 word32)
GP0(FALSE) = 77  -> p50[77] = 144 = end(p0 word32)
```

P0 word32 is zero-based index32, the 33rd complete word, and occupies rune offsets **141..144** with ciphertext indices:

```text
[19,16,9,18]
```

Across all 59 p0 words, this is the **only** word whose exact start and exact end are both hit by authenticated signed-word base60 pointers. Under the competing source-supported base59 decoding, p0 has **zero** such complete-word brackets.

The source successors at those two endpoints are:

```text
YOU   WILL
FALSE PATHS
```

Both WILL and PATHS have exactly four GP runes, so endpoint geometry alone leaves a two-candidate fork. The source text itself labels the second branch `FALSE PATHS`, which is suggestive but is not used as the sole decision rule.

## Cipher-value discriminators

Derive the additive GP29 key required by each four-rune candidate against the original ciphertext word.

### WILL

```text
P = [7,10,20,20]
K = C-P mod29 = [12,6,18,27]
GP0(K) = 63
```

Exactly one authenticated signed word has GP0 63: **LIES**.

That is independently important because `LIES / EMPTY / EPIPHANY` is the already source-selected +29 arithmetic-progression direction ray used by the current p0 navigation circuit.

### PATHS

```text
P = [13,24,2,15]
K = [6,21,7,3]
GP0(K) = 37
```

No authenticated signed word has GP0 37.

Thus the value-level holdout selects WILL over PATHS without using English scoring.

## Independent p0 body first-residue relation

The independently selected body cribs give these first additive residues:

```text
THE      length2 -> K0=6
ROAD     length4 -> K0=12
THE      length2 -> K0=6
DEVOTED  length7 -> K0=21
```

Every one satisfies:

```text
K0 = 3 * GP-rune word length  (mod29)
```

For p0 word32, length4 predicts first residue12. The actual first ciphertext rune then predicts plaintext rune **W**, matching WILL and excluding PATHS.

This relation was discovered from the body cribs and therefore is used as a holdout for word32 rather than as an independently established global cipher law. The same YOU/FALSE local-offset bracket also occurs on p25 and p42, and applying the 3×length rule there predicts Y and S rather than W. The anchor is therefore p0-local at present.

## Complete p0 signed-vocabulary control

Apply the 3×length first-rune rule to every black-body p0 word. Intersect exact GP word length and predicted first rune with all 43 authenticated signed words. This produces **20 candidate assignments**.

For every assignment, derive its complete additive key against original p0 ciphertext and ask whether that key's GP0 sum equals the GP0 of any authenticated signed word.

Exactly **one** of the 20 assignments survives:

```text
p0 word32 = WILL
key GP0   = 63
signed word at 63 = LIES
```

This is a finite familywise holdout and does not depend on language scoring.

## Receiver-page qualification

The raw YOU/FALSE start/end pattern is not globally unique across all unsolved pages: base60 also brackets local 141..144 words on p25 and p42, among other signed-pointer brackets elsewhere. P0 is already independently selected by the stronger GP0/p50 receiver chain, including the p0-only typed closure and signed-adjacent boundary evidence. This result therefore strengthens a plaintext assignment *within the already selected receiver* rather than selecting p0 from scratch.

## Assessment

**WILL is the strongest new p0 plaintext candidate from this invocation.**

The evidence stack is:

1. frozen authenticated GP0→p50 base60 pointers uniquely bracket p0 word32 as `YOU -> [141..144] <- FALSE`;
2. the two source-successor candidates are WILL and PATHS, with the source literally calling the latter `FALSE PATHS`;
3. the p0 body first-residue relation selects W/WILL and rejects P/PATHS;
4. WILL's exact four-rune additive key has GP0 sum63 = LIES, an independently established source-direction word;
5. across all 20 p0 signed-vocabulary assignments admitted by the first-residue rule, WILL is uniquely the one whose full key sum is any authenticated signed-word GP0 value.

The remaining caveat is mechanistic: the authorial generator for `[12,6,18,27]` has not yet been recovered. Until that value-changing mechanism is known or WILL is independently reproduced by another ciphertext operation, this should remain a high-confidence candidate rather than be conflated with a fully decrypted page.

## Reproduction

Run:

`node sims/lp2_p0_you_false_will_candidate_sft.cjs`

The SFT performs the complete p0 base60/base59 word-bracket census, reconstructs both source-successor candidates, derives both additive keys, verifies the LIES key-sum discriminator, reproduces the body 3×length first-residue relation, and exhausts the 20-assignment signed-vocabulary control.
