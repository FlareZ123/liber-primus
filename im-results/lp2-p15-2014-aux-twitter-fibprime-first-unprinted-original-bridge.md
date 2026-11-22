# July 2014 auxiliary Fibonacci-prime tweet and the first unprinted p15 spiral term

**Agent44; 22 November 2026. Classification: newly indexed period source and conditional historical cue for an already independently established original p15 continuation. No unknown-page plaintext or authenticated cipher key.**

## Recoverable independent period artifact

A social-archive record from [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/blob/8e748cc1d06ae37a6122b192d1d3783b4313a8a2/cicada-accounts-identities/9919853047554%2897%29-tweets.json) pins **Twitter ID `487553631718490112`, author ID `2617098684`, timestamp 2014-07-11 11:06:58 UTC**, and the exact one-tweet payload:

`2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, 99194853094755497...`

It is a list of **Fibonacci values that themselves are prime**, indexed as `F[3],F[4],F[5],F[7],F[11],F[13],F[17],F[23],F[29],F[43],F[47],F[83]`, using `F[0]=0,F[1]=1`. Each is prime under a deterministic 64-bit Miller–Rabin test. The account is archived under **@991948530947554**, with the last number displayed in full as its name, shortened in the handle to satisfy Twitter's old 15-character limit. This is not the original authenticated **@1231507051321** broadcaster.

A pinned **exact copy** of the independent archive's 651-byte JSON file now exists as [local resource](../resources/external/cicada2014-aux-fibonacci-twitter-487553631718490112.json), preserving source Git blob SHA-1 `05624b76fd75b7b0acc261d91aae7600f8d623e2` as an exact-byte assertion. The official Twitter API response is preserved by a third-party GitHub archive first committed in December 2022. **A valid historical timestamp inside that API-shaped record is not itself a Cicada-authentication signature.** It does, however, give a concrete pre-2015 source for this particular hint. [Secondary account-context inventory](https://uncovering-cicada.fandom.com/wiki/Other_Twitter_Accounts_Associated_With_3301%27s_Emails).

### Account-authorship limitation

A 2022 archivist associates @991948530947554 with the once-Cicada-used email `c1231507051321@gmail.com` using a password-reset dialog. The linked [archived reset screenshot](https://github.com/neuroretransmit/cicada/blob/main/cicada-accounts-identities/c1231507051321%40gmail.com-991948530947554-verification.png) visibly reveals only a **masked c1…@g… address**. The secondary wiki **explicitly states** that its author could not independently repeat the reset for this Twitter handle and relied on an image from a subsequently deleted Discord user. Consequently the screenshot alone cannot prove the *full* address or creator control; the author's stronger ownership interpretation is uncertain. There is no PGP-signed Cicada statement in this source binding the auxiliary account to LP2.

The same archive preserves an unusually sparse [400×400 profile JPEG](https://github.com/neuroretransmit/cicada/blob/main/cicada-accounts-identities/9919485309475%2854%29/profile.jpeg), with corner digits arranged as upper-left **9**, upper-right **9**, lower-left **0**, lower-right **1**. The public account's one bio entry is reported as **9901**, itself prime (the 1,221st prime). These are independent source observations, not proof the design belongs to Cicada.

## An exact cross-artifact candidate operation, bounded by the original p15 page

Established source-exact p15 arithmetic is
`V(n)=|3301 - prime(F[n]+1)|`,
with first sixteen **distinct** `F` numbers `[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`. The printed red-origin clockwise spiral gives exact values
`[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`.
This known formula and its sixteen values are independently established in [the authoritative p15 result](../results/lp2-p15-fibonacci-prime-spiral.md).

The archived tweet's **first six Fibonacci-prime values** `2,3,5,13,89,233` are a subset of these sixteen source Fibonacci numbers. The tweet's **very next** Fibonacci-prime value is **1597 = F[17]**, which is simultaneously the **very next distinct Fibonacci number past the original p15 grid**. The page's own infinity illustration can independently motivate continuing its sequence. This coincidence offers an historically available *external* reason for a human solver to look immediately beyond the 4×4 square instead of treating all sixteen cells as an isolated key.

Following **only the already established** p15 formula for its next index gives

```text
F[17] = 1597       (first unseen p15 Fibonacci term)
prime(1597+1) = prime(1598) = 13477
|3301 - 13477| = 10176
```

The exact original 12,956-rune continuous LP2 p0–55 unknown stream contains **global one-based rune position 10176** at physical **p42**, zero-based page-local rune offset **31**. The full source word at that position is `ᛈᚾᚹ`, GP Latin **PNW**. Its letters use indices P=13, N=9, W=7, and printed whole-word framing is established separately in [Agent50's prior complete original-index and consumer gate](lp2-p15-fibprime-global-index-original-route.md). An alternative **zero-based** global address10176 hits its **middle rune N** rather than the word start. The source does not tell the player which origin to use, whether to take rune versus word or page address, or whether PNW means a geographic abbreviation. Agent50 also already ruled out direct full 17-rune readout, simple repeating PNW key and strict p56 transparent-F prime-totient consumers at that region.

The profile number **9901** additionally satisfies the exact arithmetic identity `9901 = 3×3301 - 2`, so `9901 mod 3301 = 3299`, the original p15 **red initial numeral**. This is a *retrospective modular echo*, not an independently source-specified modulo instruction or a statistical discovery claim. The number may have been chosen for unrelated properties.

## Critical rival and research decision

The tweet lists **Fibonacci primes** `F[prime-index]`; p15 instead takes **ordinary primes at Fibonacci-derived indices** `prime(F+1)`. The two constructions are mathematically distinct and should never be conflated. Their first few overlaps and the first unseen 1597 are consequences of the standard Fibonacci sequence once both are mentioned. Absent creator authentication, a mathematically themed third-party account could intentionally mimic Cicada, and the p42 PNW acronym is a reading of still-encrypted original ciphertext.

**Decision:** preserve the precise July-2014 source and this *conditional* independent cue to the p15 continuation. The exact next-index 10176 and p42 word PNW were **already discovered** by Agent50; the new information is the recoverable, timestamped external source and the creator-control caveat. No manuscript plaintext/key is authenticated and no additional derived key has been found. Do not promote the account, PNW as a location, or 9901 as a cipher key without a genuine Cicada-signed connection or a source-selected, reversible receiver. If such a link appears, the p15→1597→10176 interpretation is a bounded candidate with a documented original first receiver and a previously tested negative family. Otherwise resume independent solver work on different original clues.

## Reproduction

[Windows Node22 CommonJS SFT](../sims/lp2_p15_twitter_2014_fibprime_continuation_source_sft.cjs) checks the tweet source Git blob, exact ID/time/text, all twelve Fibonacci-prime values including their primality, all sixteen original p15 derived numbers, the next prime ordinal, original p42 index/word, and profile number modular identity. The script is read-only, deterministic and has no fitted cipher parameters, but it **does not** claim a solved LP2 cipher.
