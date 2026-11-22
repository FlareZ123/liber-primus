# Adversarial audit of the DH23 43-word register

**Agent1, 19 November 2026. Issue #1881.** Decision: the square-derived state and eight direct lexical anchors survive; the complete nine-block tiling is not source-selected and does not supply an LP2 decipherment.

## Executive result

The original 2014 square metadata independently reconstructs the DH23 state:

~~~text
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4)
~~~

Eight direct state expressions land on eight exact words in the authenticated 2016 message. This is a meaningful cross-era correspondence, not something to discard as generic arithmetic.

The stronger claim—that one source-selected grammar tiles every 2016 word index 0..42—is not established. The full nine-block order is retrospective, has many competing partitions, lacks a source-defined state transition, and has no genuine blind holdout. It does not produce a new receiver on unknown LP2 ciphertext.

## 1. Source-first reconstruction of the state

The original square file contains three square objects:

| Order | Magic sum | Center |
|---:|---:|---:|
| 5 | 3301 | 809 |
| 7 | 1033 | 331 |
| 5 | 1033 | 91 |

Ordinary positional BASE29 conversion gives:

- 91 = [3,4]
- 331 = [11,12]
- 1033 = [1,6,18]

The paired 1033-square orders give g=5 and K=7−5=2. The center pair gives e=3, q=4, and the digitwise center difference [8,8] gives A=8. The 1033 digits give a=6 and A−B=18, hence B=19 mod29.

Then A=g^a mod p requires p to divide 5^6−8=15617=7·23·97. Canonical B=19 excludes 7; e=3 must be invertible modulo p−1, excluding 97. Thus p=23 and b=3⁻¹ mod22=15. The complete DH checks pass:

- 5^6 mod23 = 8
- 5^15 mod23 = 19
- 8^15 mod23 = 19^6 mod23 = 2
- 15·3 = 1 mod22
- q=e+1=4

This derivation uses the original square metadata and the documented DH/BASE29 operations; it does not use the proposed block tiling, candidate p0 key, p50 receiver outputs, or unknown-page language.

## 2. What survives: direct anchors

The authenticated 2016 clear-signed source has 43 alphabetic words when numeric 3301 and the OpenPGP key ID 7A35090F are treated as identifiers rather than words. The eight direct expressions are:

| Expression | Zero-based index | Word |
|---|---:|---|
| g | 5 | EPIPHANY |
| a | 6 | SEEKS |
| A+g | 13 | WAY |
| b | 15 | WORDS |
| B | 19 | THEIR |
| p | 23 | ROAD |
| p+a | 29 | DIRECTION |
| B+p | 42 | OPENPGP |

The first eight state-axis values [u,K,e,q,g,a,t,A]=[1,2,3,4,5,6,7,8] also read “THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED.” Ascending order is a plausible reading of the source's “numbers are the direction” instruction. These are the strongest positive observations.

A limited control over two archived signed 2013 texts gives:

| Control source | Alphabetic words | 43-word windows | Maximum anchor hits | Exact proposed phrase-block hits |
|---|---:|---:|---:|---:|
| 2013 welcome/congratulations | 233 | 191 | 1/8 | 0 |
| 2013 do-not-share text | 403 | 361 | 1/8 | 0 |
| **Total** | **636** | **552** | **1/8** | **0** |

This is a specificity check against these two controls, not a blind corpus-wide probability estimate. It supports the direct anchors' distinctiveness, not the full partition.

## 3. The full block order is underdetermined

The proposed grammar has block lengths:

~~~text
[1,8,6,4,4,9,6,4,1]
~~~

and boundaries:

~~~text
[0,1,9,15,19,23,32,38,42,43]
~~~

Even holding the exact nine-block count and length multiset fixed leaves **15,120** distinct block orders. The 2016 source punctuation boundaries are:

~~~text
[0,1,5,9,14,19,24,30,36,38,41,43]
~~~

The proposed order matches only **6 of 12**. Across all 15,120 permutations, 913 match six punctuation boundaries, 150 match seven, and eight match eight. The proposed order is therefore not uniquely selected by punctuation or clause structure; several alternatives score better under that criterion.

The eight-field axis itself has 8! possible field orders, with only one ascending order. That ascending axis is a plausible source-guided opening. It does not determine the later nine-block sequence or justify the selected uses of 2A, 2B, p+A, and B+p.

## 4. Wrong-state and field-permutation audit

All 9! = **362,880** assignments of the nine recovered values to the state roles were enumerated. Only **one** assignment satisfies the DH equations and q=e+1.

To stress the block-length identity separately, 720 assignments with positive u=q−e, A, a, q and total implied block length 43 were retained. Their eight-anchor hit histogram is:

| Exact direct anchors | Assignments |
|---:|---:|
| 0 | 290 |
| 1 | 271 |
| 2 | 80 |
| 3 | 47 |
| 4 | 19 |
| 5 | 9 |
| 6 | 2 |
| 7 | 1 |
| 8 | 1 |

The correct DH tuple is the sole 8/8 assignment. One incorrect tuple—(23,5,6,2,8,19,15,3,4), swapping b and K—still reaches 7/8. This shows that the state roles matter and that the direct anchors are selective; it does not validate the full nine-block partition.

## 5. Source semantics and the missing selector

The 2013 signed TCP specification documents BASE29 as a radix conversion and DH as a standard exchange. Its NEXT command stores client-supplied text; it does not automatically advance a state, generate a word index, or specify a block sequence. The DH23 values are also a conventional pedagogical exchange, not by themselves an LP2 cipher key.

The 2016 message says that words are the map and their numbers are the direction. That plausibly motivates examining the word register and the ascending [1..8] opening. It does not specify:

1. whether the words are addressed by zero-based array offsets or one-based ordinals;
2. why the exact nine block lengths and their order should be used;
3. why the remaining positions should use this particular additive expression grammar; or
4. how any resulting index selects a reversible operation or typed receiver on original LP2 ciphertext.

The 43-word inventory also depends on treating 3301 and the OpenPGP key ID as non-word identifiers. That is reasonable, but it is still a tokenization convention rather than an explicit word-index instruction.

## 6. Comparison with the p55 H/line-wrap register

The separate p55-directed H/line-wrap report claims to reconstruct the same 0..42 signed-source register using original LP2 ciphertext/layout receivers. It uses the original page/word material and H transform. The DH tiling uses only the 2014 square metadata and the already-known 2016 signed text. They share the target register, not an independent unknown-page receiver.

Consequently, the DH tiling adds no new ciphertext prediction, typed LP2 output, or recovered plaintext. It should not be counted as independent confirmation of the p55 route.

## 7. Holdout status

A genuine blind holdout was **not** available in this invocation: the complete 2016 signed text and the proposed 0..42 table were already present in the repository before the audit. The earlier full-message SFT is a retrospective arithmetic reproduction, not a held-out prediction. No blind result is claimed.

## Decision and next gate

Preserve the DH23 state, ascending [1..8] opening, and eight direct anchors as a meaningful cross-era structural correspondence. Preserve the full index table as a reproducible retrospective arithmetic organization, but do not promote it to a source-selected word map, state machine, cipher, or decryption.

Do not commission more arithmetic partition variants without a new source selector. A positive upgrade requires an authenticated instruction fixing the word origin and exact block order/expression grammar, a genuinely blind held-out clause or terminal block, and a new locked receiver or prediction on original unknown LP2 ciphertext.

## Reproduction

~~~text
node sims/lp2_dh_state_register_adversarial_sft.cjs
~~~

The original arithmetic-cover reproduction remains available at sims/lp2_dh_state_full_source_register_sft.cjs.