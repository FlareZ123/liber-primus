# Conditional word crib from the p36 triple five-step echo

**18 November 2026. Status: a reproducible conditional word-pattern observation. The independently examined 2012 tapestry source does not supply a five-phase LP2 key or authenticated plaintext.**

An original printed ten-rune word at **LP2 p36**, visible in original **53.jpg**, is split only by a **line wrap**:

```text
ᛈᛟᛄᚪᛝᛈ/
ᚦᛈᚪᛝ
```

It has the Gematria transliteration `P OE J A NG P TH P A NG`. The words' five aligned pairs (rune positions 0/5 through 4/9) have equality pattern `[equal, different, different, equal, equal]`. This is the only ten-rune word with **three exact five-step equalities** in the section-spanning original-rune census examined on 18 November. Its exact word is preserved in [the single-file reader](../sims/lp2_p36_lag5_tapestries_conditional_crib_sft.cjs); the line break is ignored while the word boundary is retained.

The extensively discussed **order-five within-word substitution** remains an *unproven cipher hypothesis*. If the same output alphabet recurs at positions five apart within a word, then ciphertext equalities at offset five imply identical **plaintext** GP runes at those positions. Under that conditional rule, the original word has an invariant plaintext letter pattern.

The repository already stores an independent English [29,157-word TextBlob spelling frequency list](../resources/control/english_wordfreq_textblob.txt). Re-encoding all its words in the original Gematria spelling convention (including ING as one rune and the documented alphabet merges), exactly **one** 10-rune English word matches all five equalities/inequalities:

**T A P E S T R I E S** (`TAPESTRIES`, TextBlob source frequency 1).

A larger **CMUdict** comparison, independently calculated locally, produced additional matches including `CONVECTIVE`, `SUPERSAVER`, `SCHERZINGER`, `SRIVASTAVA`, and `VANDEVELDE`; it therefore prevents treating `TAPESTRIES` as the unique possible English plaintext. The input CMUdict is a distinct modern English and proper-name lexicon, and was not part of the fixed repository SFT. Source-specific historical/archaic language could add alternatives.


**Source-first test of the 2012 tapestry link (18 November 2026, #1489): negative as a decrypting clue.** The independent period archive [2012 subreddit stage](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/README.md) provides the *complete typed operation*: an [original stereogram of King Arthur/Guinevere imagery](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/posts/8D7hN.jpg) carried an OutGuess-extracted, PGP-signed instruction, “The key has always been right in front of your eyes. This isn't the quest for the Holy Grail.” The actual then-used key was the source-visible 23-symbol subreddit-info string `a2e7j6ic78h0j7eiejd0120`; it maps to exactly **23 integer shifts** `10,2,14,7,19,6,18,12,7,8,17,0,19,7,14,18,14,19,13,0,1,2,0`, for Vigenère on the original **Latin post titles**, then an independently selected Mabinogion/Charlotte Guest book code. The original public user aliases `ImagoOnNib` and `CageThrottleUs` encode those reference names. The stereogram is a signed clue *carrier* and picture motif, not a source-supplied five-phase key, GP29 alphabet permutation or reusable rune-level receiver. There is no independent 2012 instruction to shorten the 23-shift key to five states, retarget Latin26 to GP29, choose an LP2 clock or decode p36. Doing any of those because the p36 ten-rune word resembles `TAPESTRIES` would fit an unsolved input and violate the independent-key gate. No 150-rune source-specified original decoder exists under this link, so it is closed without running unfounded five-phase key sweeps.

**What this enables:** Any fully specified, independently source-selected order-five word decoder can now test a frozen, unusually discriminating **plaintext prediction** at LP2 p36: `TAPESTRIES` should decrypt from the ten original rune positions without adjusting the key to it, and neighboring original ciphertext must continue to meaningful GP English under the same mechanism. This would be more meaningful than merely reproducing three echoes. If the predicted word disagrees, the crib is rejected under that decoder, and other candidate words remain possible.

**What it does not show:** No operator, key or authenticated plaintext has been recovered. Matching a 10-rune shape in a lexicon is compatible with coincidence; the candidate's base frequency in the fixed lexicon is very low (1), so the single-word match alone is particularly weak evidence of intended plaintext. This belongs in active exploratory research pending an independent decipherment.
