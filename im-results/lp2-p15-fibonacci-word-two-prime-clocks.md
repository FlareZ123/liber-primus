# p15 Fibonacci-word interleaved prime clocks: original inverse decision

**Agent49, 26 November 2026.** All independent prime origins 0–3301 and both signs fail the complete original 1,883-rune p15–22 black-body interval under one frozen nonperiodic binary rail assignment. No recovered unknown LP2 plaintext or authentic key. Three blinded planted origin pairs/signs are recovered exactly on the prefix; all 393 withheld plaintext runes recover exactly. Some training F-history ambiguities remain.

## Clue and executable receiver

The original p15 spiral represents Fibonacci prime ordinals (see [source construction](p15-fibonacci-prime-spiral-historical-source-gate.md)); p56 supplies the authentic prime-minus-one stream and literal plaintext-F bypass. A different, standard mathematical object associated with Fibonacci numbers is the infinite binary Fibonacci word, obtained from 0 by 0→01 and 1→0 (prefix 01001010010010100101). Unlike the previous [Zeckendorf digit-sum clock](lp2-p15-zeckendorf-digit-sum-inverse.md), this model dispatches *physical positions* to two independent prime streams rather than interpolating one scalar stream from Fibonacci coefficients. No original instruction selects this word, binary dispatch or the two clocks; the source link is conjectural. No claim that this explains the repeat anomaly.

Freeze the first mask bit at the first black p15 rune (local offset20), continuing in physical order through p22, ignoring printed word boundaries. No phase search for the Fibonacci word. Let r(i) be the bit at physical position i; each rail has its own prime cursor j_r. For plaintext P=0 (F), emit C=0 and hold the selected cursor. Otherwise emit C=(P+s*(prime[j_r]-1)) mod29 and advance only j_r. The prime index is zero-based, p[0]=2. Test independent origins 0..3301, both signs, even allowing opposite signs between rails for the exact rejection. The positive blind receiver uses a common sign.

The inverse factors exactly into two one-cursor reachability problems because the rail mask depends only on physical position. At observed C=0, retain the hold edge AND any legal consuming nonzero-P edge. At nonzero C, retain precisely the consuming edge if its inverse P is nonzero. A dead cursor set is a certificate independent of dictionary, language score, or hidden-F mask. No beam, timeout, or cap. Forward replay of an ambiguous inverse is not key authentication.

## Original result

| Rail | Original length | Fit length (p15–21) | Sign | Complete origins, 0..3301 | Longest legal prefix (runes) |
|---|---:|---:|---:|---:|---:|
|0|1164|1083|+|0|370|
|0|1164|1083|−|0|445|
|1|719|669|+|0|678|
|1|719|669|−|0|628|

Rail 0 is already impossible on the 1,752-rune physical fit interval, so no joint model can reach p22. Rail 1 alone has two positive-sign prefix origins (2938,2939); both fail at its local offset678 on the complete tape. Origin-zero rail0 dies at offsets23/12, rail1 at offsets0/12 (+/−). This rules out all (3302)^2 origin pairs even with independent signs under this exact physical mask. It does not rule out other masks, transpositions, arbitrary origin domains, different F semantics or other cipher laws.

## Actual blind inverse controls

The exact cursor enumeration also supports a constructive per-rail Viterbi receiver: train smoothed GP29 unigram and lag-1/2/3 conditional distributions on solved sections 0,2,5,6,7,8, excluding the three donor sections. Choose each origin and common sign by prefix likelihood; freeze its final cursor and last plaintext before processing the last 131 physical positions. All planted input sections are original solved-source transcriptions (WELCOME, first KOAN, LOSS); concatenate in the three cyclic orders shown in raw results. They overlap and are not independent literary samples. The selection does not receive the true key, holdout, or true text. Authentic p56 forward replay first confirms 85/85 runes and 84 consuming primes.

| Plant origins, sign | Blind recovered origins, sign | Fit truth /1752 | Heldout truth /131 | Exact ciphertext replay |
|---|---|---:|---:|---|
|0,0; +|0,0; +|1747|131|yes|
|17,113; +|17,113; +|1748|131|yes|
|3299,3301; −|3299,3301; −|1739|131|yes|

The six origins and three signs are recovered, but 22 prefix plaintext runes differ because F/consuming-zero histories can be ambiguous. Every selected complete inverse replays. The negative original is an exact no-path result and is not dependent on these language scores.

## Reproduction and next decision

- [Read-only Node CommonJS SFT](../sims/lp2_p15_fibonacci_word_two_prime_clocks_sft.cjs), run from root with `node sims/lp2_p15_fibonacci_word_two_prime_clocks_sft.cjs`.
- [Raw output](lp2-p15-fibonacci-word-two-prime-clocks.json), pinned corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and donor blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.
- Executed the experiment function in connected JavaScript on actual repository inputs; no CI execution claimed.
- Retire this receiver. A different rail mask or clock must be independently source-selected; do not expand this into a speculative mask/phase sweep. No authoritative solution-count change.
