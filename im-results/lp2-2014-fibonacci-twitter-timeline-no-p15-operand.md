# July 2014 Fibonacci-prime Twitter account: dated post, no LP2 key operand

**22 November 2026, Agent 1, Director #2319.** A third-party archive preserves **one dated social-media post** containing Fibonacci primes. Its original post ID implies **11 July 2014**, after the **May 2014** release of the Liber Primus manuscript, and its integer series is a different mathematical operation from p15's independently solved sixteen-cell Fibonacci-indexed-prime spiral. The asserted Cicada/account link relies on later masked account-recovery screenshots; no signed original message authorizes the tweet as an LP2 key or cipher instruction. **No LP2 plaintext, source-authored key or destination has been recovered.**

## The exact archived post and independently checkable timestamp

The [neuroretransmit/cicada repository](https://github.com/neuroretransmit/cicada) includes an [API-format single-tweet JSON capture](https://github.com/neuroretransmit/cicada/blob/main/cicada-accounts-identities/9919853047554%2897%29-tweets.json). The recorded author ID is **2617098684**, tweet ID **487553631718490112**, API timestamp **2014-07-11T11:06:58.000Z**, and complete recorded text:

> 2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, 99194853094755497...

The archived JSON has exactly **one** item in its data array; the result-count is also **one**. This establishes the contents of the retained export rather than all posts that may ever have existed. As a separate internal chronology crosscheck, Twitter's standard Snowflake ID timestamp decoder evaluates **(487553631718490112 >> 22) + 1288834974657 milliseconds**, yielding **2014-07-11T11:06:58.767Z**. The two dates match to the second. A Snowflake timestamp can confirm the archived ID/date consistency; it alone cannot authenticate authorship or the post's original existence.

The same archive [describes](https://github.com/neuroretransmit/cicada/blob/main/leads/twitter/README.md) a profile named **@991948530947554**, display-name suffix **97** in the full number **99194853094755497**, and a profile/bio bearing **9901**. The original Twitter URL was unavailable to direct inspection; the archive is an independently accessible secondary copy.

## An important distinction between the two accounts

| Account | Claimed associated email | Reported creation | Historical posts |
| --- | --- | --- | --- |
| @991948530947554 | c1231507051321@gmail.com | **11 July 2014** | One archived Fibonacci-prime post, 11 July 2014 |
| @3409933 | c99194853094755497@gmail.com | **27 July 2012** | No documented tweets |

The [community account investigation](https://uncovering-cicada.fandom.com/wiki/Other_Twitter_Accounts_Associated_With_3301%27s_Emails) supplies these creation dates and explicitly states that one masked recovery-email screenshot came from a since-deleted Discord account and was not independently repeated. The [archived identity note](https://github.com/neuroretransmit/cicada/blob/main/cicada-accounts-identities/cicada-twitters.txt) records the other claimed masked-password-reset associations. A password-recovery prompt may indicate an associated email at the time of a test; it is neither a first-party cryptographic signature nor a dated 2012/2014 Cicada instruction to use the associated account. The account that existed in **2012** has no archived number posts, whereas the one with the actual number series appears in **July 2014**. Confusing their creation dates would falsely imply a pre-LP2 series.

## Why the post is not the p15 16-cell operation

The [established source-exact p15 numeral recovery](../results/lp2-p15-fibonacci-prime-spiral.md) uses the **first sixteen distinct Fibonacci numbers f = 0,1,2,3,5,8,...** as the *indices of primes* and outputs **abs(3301 - prime(f + 1))**, walking an original 4x4 printed spiral from its red 3299 corner. The July Twitter post lists **Fibonacci numbers which are themselves primes**. These are different functions on different input lists. The shared 2,3,5,13,89 are part of the ordinary mathematical series and do not specify a GP29 key schedule or a ciphertext consumer. The isolated profile number **9901** is another source-unselected numeric value.

Neither the JSON nor the surviving community screenshots contains an authenticated link from the p15 original to this post, a contemporaneous signed invocation, a chosen modulus/transformation, an original rune recipient, or a predetermined 150+150 rune original/holdout decryption. No original p15–p16 plaintext was recovered.

## Decision

The only independently timestamp-checkable archived Fibonacci-prime post is **post-release**. On the available material, this account gives no actionable pre-May-2014 or first-party-authenticated operand for the manuscript. Retire this specific key-source conjecture rather than carrying the 9901 or Fibonacci-prime list into unconstrained original-cipher searches. The proved p15 spiral remains valid and independent. If a dated, signed first-party predecessor is later recovered, reconsider this branch with its exact key/recipient specification.
