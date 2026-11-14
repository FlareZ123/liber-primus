# All-secret period-five plaintext-F GP29 additive exclusion on original LP2

**14 November 2026, Agent47. Classification:** exact original-ciphertext family exclusion, without a language model, known-plaintext assumption, prescribed secret key or fitted phase. **No unknown plaintext, key or author-selected cipher recovered.** The source is the unchanged 12,956-rune LP2 unknown corpus; a native solved-p57 plant confirms the decoder's legal F clock.

## Why this finite family is a live research decision

Cicada's independently solved p56 section encrypts non-F Gematria Primus runes by a GP29 additive prime-totient shift; *plaintext F* remains literal and does **not** consume a key position. Period **five** has two independent source-relevant motivations, although neither establishes the unknown cipher: the earlier 2014 puzzle used a printed 5×5 square, and LP2's original word-internal ciphertext has the documented excess of lag-five equal-symbol echoes. A repeating five-rune additive key is the simplest historical-operation transfer worth ruling out before attempting a free five-phase secret-key search.

Grant **one entirely arbitrary shared five-digit GP29 key** to the whole unknown book, with every one of the **55 rune-bearing pages independently choosing any of the five key starting phases**, and all algebraically legal ciphertext-F plaintext/clock interpretations retained. This grant is more permissive than a single book-continuous phase or one reset at each of nine chapter boundaries. Additive signs + and − are both covered: negating an arbitrary GP29 key permutes the same exhaustive key space.

Define the direct encoder for rune index \`P\`, ciphertext \`C\`, effective key digit \`K[j]\`, and key phase \`j mod5\`:

- If \`P=0\` (the native **F**), emit \`C=0\` and leave \`j\` unchanged.
- Otherwise emit \`C=(P+K[j]) mod29\` and advance \`j\` by one mod5.

A ciphertext F can originate from literal F, or from encryption of non-F if the current key is nonzero. Both paths must be retained in the inverse; choosing convenient skips by a language score would be unsound.

## Two exact, source-input stages

**1. A deliberately permissive key-digit obstruction.** To check whether *any* key phase could contain a fixed nonzero value \`v\`, place \`v\` at phase0 without loss of generality (page starting phase is arbitrary). At every other phase, allow every non-F ciphertext; at **every** ciphertext F, allow the clock either to stay or to advance, even when the actual key would prohibit one branch. Thus this finite phase automaton accepts a strict **superset** of real possible decryptions. At a non-F source rune with value \`v\`, phase0 cannot legally emit it, as that would decrypt to the forbidden encrypted plaintext F.

Run this five-state automaton from **all five initial phases on every complete original page**. For **22 of the 28 nonzero values**, at least one physical page has no admissible phase path even under these generous rules. Consequently a common period-five key must use only the seven values

\`{F=0, G=6, EO=12, B=17, A=24, Y=26, T=16}\`

at each of its five positions. The ordering is the numeric ascending list **[0, 6, 12, 16, 17, 24, 26]**, not an extracted key.

**2. Exhaust the exact remaining key family.** There are only **7^5=16,807** key vectors over this surviving seven-symbol set. For each vector, the exact original p56-style F-clock decoder carries *all* feasible phase states across each complete physical page, restarting from **all five possible phases at each next page**. A key is rejected as soon as one original page has zero legal states.

**Result: exactly one of the 16,807 keys survives all 55 pages, the all-zero identity key [0,0,0,0,0].** The **16,806** nonzero keys all fail by **physical p15**, so the earliest sixteen original pages already form a complete source-input exclusion witness. The all-zero key reproduces ciphertext as plaintext and provides no decryption.

For reproducible checkpoints, the first rejecting-page counts among the 16,806 excluded keys are: p0 **15,561**; p1 **710**; p2 **365**; p3 **85**; p4 **45**; p5 **15**; p6 **10**; p7 **5**; p9 **5**; p15 **5**. These counts sum to the exhaustive nonzero key population. No other physical page is needed for this specific exclusion.

## Exact source-native positive and limits

The test encrypts all **95 actual clear-GP runes on p57** with a nonzero five-digit plant key \`[17,6,24,0,12]\`, using the historical plaintext-F bypass and a hidden starting phase3. The same exact feasible-phase decoder accepts the complete planted ciphertext and asserts that at least one original clear F really skipped the clock. The original unencrypted p57 remains accepted under the identity key. These distinguish a functioning detector from a decoder that rejects all possible ciphers.

This theorem **rules out every nonidentity repeating period-five GP29 additive key shared across the original rune-bearing pages under literal-plaintext-F clock bypass**, even with freely chosen per-page initial phases. It does not exclude independent secret keys on each page or word, evolving nonlinear states, non-GP output, or a different F-handling rule. It supplies no authenticated plaintext. It extends the previously documented all-secret [periods 1–4 exclusion](lp2-allsecret-period4-ftransparent-original-exclusion.md) with a different, dramatically smaller necessary-condition search.

**Reproduce:** [Windows Node22/CommonJS single-file test](../sims/lp2_allsecret_period5_ftransparent_exact_sft.cjs), reading [the canonical source indices](../resources/liber-primus/lp2-corpus.json). It asserts all source lengths, the 22 digit vetoes, all 16,807 keys, the first rejecting pages, and an original GP p57 planted positive.
