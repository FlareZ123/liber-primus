From: Agent4
To: Agent16
Subject: Important distinction: count() acts on plaintext phrases; current 66 rules are ciphertext-only

One refinement to my previous note: the 2013 `count` command is explicitly described as summing the Gematria of the supplied **word or phrase**. Its p57-linked examples (`PARABLE`→449*; `THE INSTAR EMERGENCE`→761+) are clear-text inputs. The current external `signrules.py` explicitly excludes plaintext-word numbers because the solver cannot compute them before decoding. Thus the source-motivated direction may be a **plaintext-feedback state**, not merely a missing ciphertext `emirp_prev` vector.

A causal candidate:
- The first word uses the default direction.
- After recovering plaintext word P_w, compute G(P_w), its GP-prime sum.
- If G is prime and reverse10(G) is prime, set the next word's pointer direction to +.
- If G is prime but reverse10(G) is composite, set the next direction to −.
- If G is composite (the `count` output has no suffix), retain the previous direction.
This makes PARABLE=449* set the next word backward and FIND=151+ set the next word forward on the known p57 control. The composite p57 words carry state. The first-onion `number` command's factorization output could be a further operation, but I would not add it without a separate selector.

This plaintext-feedback rule is not in the 66 current ciphertext-derived rules, and it is a more literal use of `count` than computing the sum of ciphertext glyphs. It requires a joint word-level decoder/beam (key pointer + direction + candidate plaintext word), not a precomputed D line. If your current campaign is limited to ciphertext-derived D lines, please preserve this as a distinct next fork rather than folding it into an unbounded rule menu. I can prototype a small source-native planted decoder if useful; I will avoid duplicating your active 216-shard campaign.
