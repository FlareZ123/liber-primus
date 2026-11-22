# Factored 2012 Valete RSA modulus: direct original-LP2 OAEP transfer gate

**Status: exact source-motivated negative, 11 November 2026 (Agent50).** There is **no recovered unknown LP2 plaintext, original cipher key or complete decoder**. This tests a specific historical cross-round cryptographic operation, not an arbitrary brute-force key search.

## Why this original-source operation is worth one test

The authenticated 2012 end-of-round *Valete* postscript displays a single **432-bit decimal number**, documented in the [original clue's community archive](https://uncovering-cicada.fandom.com/wiki/The_Final_Puzzle). Its independently known factors are the 216-bit primes

- `p=99554414790940424414351515490472769096534141749790794321708050837`
- `q=104593961812606247801193807142122161186583731774511103180935025763`.

Their product reproduces the 131-digit postscript **exactly**. Cicada's historically solved **2014 RSA** stage independently identifies `e=65537` and the `Crypt::RSA::ES::OAEP` encryption scheme ([2014 walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014))). Together these cues permit an *executable* proposal: interpret unknown runes as direct GP-base29 digits, then decrypt physically page-start RSA blocks using the 2012 factored key and standard SHA-1 OAEP. The exponent and cross-round reuse are **hypotheses**, not instructions authenticated by the 2012 signature.

## Frozen, complete original-input inverse

With zero-based canonical rune indices `0..28`, take the **first 88** or **first 89** GP runes of every original LP2 physical page long enough to supply that width. The choices bracket the minimal base-29 width for a 432-bit integer; do not tune start positions. Interpret runes left-to-right as the usual big-endian base-29 integer `C`. Reject `C >= N` as invalid RSA ciphertext, otherwise compute `M = C^d mod N` with `d = e^-1 mod ((p-1)(q-1))`, and write `M` as exactly **54 big-endian bytes**. Verify the SHA-1 OAEP lead `00`, unmask MGF1, check `SHA1(empty label)`, the zero padding and the `01` delimiter. The input is [the unchanged source GP29 corpus](../resources/liber-primus/lp2-corpus.json), not another transcription or a recovered text.

| Original direct frame | Eligible page starts | `C >= N` | OAEP leading `00` | Fully valid OAEP |
| --- | ---: | ---: | --- | ---: |
| 88 GP runes | 53 | 0 | 0 | **0** |
| 89 GP runes | 53 | 17 | One candidate: physical p51 | **0** |

At the sole 89-rune leading-byte candidate (p51), OAEP unmasking produces `lHash = 27d12a7ba7c27b36da260f9dbd67afb7a86f171c`, inconsistent with the required SHA1 empty-label hash `da39a3ee5e6b4b0d3255bfef95601890afd80709`. None of the other RSA-eligible page starts passes even the leading-byte condition. **No source-selected 88/89-rune page-prefix block decrypts to authentic OAEP plaintext.**

The complete [single-file CommonJS reproducer](../sims/cicada2012_ps_rsa_lp2_oaep_sft.cjs) explicitly checks the modulus, derives the private exponent, computes all 89 original page-start inverses, and first encrypts/decrypts a deterministic `PILGRIM` SHA-1 OAEP positive control using the same 432-bit key. It asserts the exact two original-result rows. This is a **bounded mathematical RSA-OAEP rejection**, not merely a language-score null.

## End-of-book 76+13 clue-constrained frame check

The visibly final unsolved physical page **p55** has **76 runes followed by one red 13-dot mark**. Counting each dot as one *possible* missing GP29 position yields **89 positions**, exactly the number of base-29 digits required to represent the 2012 RSA modulus. This is an independently inspectable layout coincidence, yet nothing in the source says dots are base29 digits, specifies their values or directs use of RSA.

The most literal convention reads the printed runes first, then adds thirteen unspecified GP digits for the trailing dots. Let `C_76` be p55's exact 76-digit original base29 integer. Its **minimum** possible 89-digit extension is `C_76 * 29^13`. The source-bound calculation shows `C_76 * 29^13 >= N`, so **every one of 29^13 possible 13-digit suffixes is invalid RSA ciphertext under the 2012 modulus, regardless of dot values**. Treating the 76 runes as the complete integer with zero-padding on the left is within `N` but decrypts to a block starting `02da37...`, failing OAEP's `00` prefix. This closes the literal terminal-rune/dot transfer without guessing any dot encoding. It does not rule out reordered, reversed or non-base29 framing, none of which the source selects.
## Research decision

The **direct original-rune prefix → 2012-RSA private key → 2014-OAEP** route is closed under the two natural complete-width GP29 framings and physical page-start anchors. A different external block encoding, bytewise carrier, cryptographic padding, key reuse, secret exponent, or non-page-start framing remains logically possible, but would need its **own independent original clue**, not a large tuned scan. No 2012 secret was shown to be used in LP2; the 2012 P.S. has no authenticated RSA exponent or instruction linking it to the manuscript. Pursue higher-value source-chosen mechanisms instead of generic RSA-block boundaries.
