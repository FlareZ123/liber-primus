# Historical p56 solve procedure and the "Skip index 221" semantics

**Agent16, 28 November 2026 — Director #3350. Decision: the surviving historical solution record does not contain a transferable source-side F-hold/key-extent rule. The old "Skip index 221" is the solved branch itself: raw formatted-character index 221 maps exactly to p56 rune offset 56, the authentic hold already isolated by readable plaintext. The record explicitly describes F positions as trial-and-error selections.**

## Upstream exact ambiguity

#3336 established the source-native inverse obstruction without using known English:

- p56 has 85 runes;
- printed `F` ciphertext occurs at rune offsets **35, 47, 51, 56, 74**;
- strict solved-page F semantics plus consecutive `phi(prime)=prime-1` shifts admit **22** complete exact reencrypting inverse paths;
- even granting the authentic 84-prime extent leaves three paths, holding rune **51, 56, or 74**.

Therefore a historical solution only supplies new state information if its **documented selection procedure** identifies rune56 independently of reading the plaintext.

Reproducer for that ambiguity: `sims/lp2_p56_source_visible_fhold_gate_sft.cjs`.

## Old solution snapshot: what it actually says

A preserved 8 July 2018 snapshot of the Uncovering Cicada Wiki page **"How the solved pages of the Liber Primus were solved"** contains two critical statements in its introduction:

1. the ciphertext is taken from **rtkd's transcription** in the order shown;
2. multiple ciphers skip plaintext `F` values; some visible ciphertext F's are unchanged but not all, and:
   **"It would be difficult to find which indices these were without using trial and error. The positions of the F's that you should skip are given."**

For p56 the same snapshot then gives:

```text
Method:
Subtract prime numbers - 1 in order:
decimal[i] = (decimal[i] - (primes[i] - 1)) % 29
...
Note that phi(p) = p - 1, where p is prime
Skip index 221
Plaintext:
AN END
...
```

Source mirror:
https://www.scribd.com/document/429439402/How-the-Solved-Pages-of-the-Liber-Primus-Were-Solved-Uncovering-Cicada-Wiki-FANDOM-Powered-by-Wikia

The important point is semantic: this document does **not** present 221 as an independently derived key extent, checksum, page coordinate, or clock state. Its introduction explicitly classifies such skip indices as branch positions found/provided after trial-and-error.

## Exact meaning of index 221

Reconstruct the p56 ciphertext exactly as printed in that historical snapshot, including punctuation, slashes/newlines, the two ampersand separators, and the 128 hex characters. Zero-based raw-character positions of the five printed `F` runes are:

| printed F occurrence | raw formatted index | rune-only offset |
| ---: | ---: | ---: |
| 1 | 47 | 35 |
| 2 | 209 | 47 |
| 3 | 215 | 51 |
| 4 | **221** | **56** |
| 5 | 245 | 74 |

Thus **"Skip index 221" is exactly the authentic p56 hold at rune offset 56** from #3336. It is a coordinate translation, not an additional discriminator.

This also explains why the historical number is larger than the 85-rune page: rtkd/wiki indexing counted the formatted page string, whose intervening 128-character hash and punctuation occupy the raw coordinate space.

**Reproduce:** `node sims/lp2_p56_historical_skip221_sft.cjs`.

## Later solution records preserve the same plaintext-dependent semantics

The current `scream314/cicada3301/liber_primus.md` p56 entry states:

```text
Key: phi(prime). Shift down forward Gematria.
Note: Every clear text F is an F, and needs to be skipped.
```

That wording is explicitly plaintext-conditioned: one knows which ciphertext F is transparent from the recovered cleartext, not from a source-visible state bit.

The current `neuroretransmit/cicada` reproduction similarly records the totient solution, but its tracked p56 solver files were committed in 2022/2023 and therefore cannot establish a distinct 2014 branch-selection procedure.

The accessible 2014 IRC corpus does not expose a preserved p56 code/paste that states an independent branch rule. Searches for the plaintext/hash/totient procedure converge on later solution writeups rather than a dated first-solve program. This limits the historical claim: we can reconstruct the old published procedure and its index semantics, but cannot name the exact first solver or recover a missing 2014 paste from the currently reachable archive.

## Replay against #3336's exact paths

Apply the historical stated rule literally:

1. use forward GP29 order;
2. subtract `prime - 1` sequentially;
3. at raw formatted index 221, preserve the F and do not advance the prime clock.

Raw index 221 maps to rune offset56, so this selects the authentic one of the three 84-prime paths and recovers the known p56 English.

But the selection is **not source-independent**. The same historical document tells the reader the skip coordinates because they otherwise require trial-and-error; it does not derive 221 from page layout, the hash, prime count, punctuation, artwork, or another first-party observable.

This is exactly compatible with #3336: once the correct branch is supplied, the cipher is deterministic; the missing information is how to select that branch on an unknown recipient.

## Consequence

Treat p56 as evidence for:

- the real primitive `C - phi(prime) mod 29`;
- a real transparent-plaintext-F convention;
- a real non-consuming clock hold at the authentic p56 F.

Do **not** treat p56 as evidence for a hidden manuscript-side rule that tells an unknown solver where to hold. The historical solve record supplies the correct coordinate as a post-solve/trial-and-error fact.

A transferable p56 state rule can be reopened only by recovering a contemporaneous first-solve artifact that derives the hold **before** plaintext inspection from an independently observable source field. Until then, unknown-page F branching must be constrained by some other source-selected key/state or solved jointly with genuine plaintext evidence.

**Decision for #3350: negative on transferable branch-selection semantics; positive on exact historical-coordinate interpretation.**
