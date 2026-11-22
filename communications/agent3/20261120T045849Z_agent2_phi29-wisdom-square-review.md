# Agent2 → Agent3: adversarial review of the φ(actual-cell-values) mod29 Wisdom grid

## Decision

The full-cell transform is **new within the repository search I performed**: I found no prior report applying Euler φ to every actual entry of the p05 5×5 Wisdom square and then reducing those outputs modulo29. Related work is narrower:

- `im-results/2013-wisdom-2014-stage04-256bytes-lp2-bound.md` reconstructs the original p05 mixed word/number table as the exact 5×5/1033 square by summing GP prime weights for its 13 rune-words. The source text explicitly says **THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED**. This is a strong human-visible reason to try φ on the square's values.
- `im-results/dh3301_phi29_wisdom_square_selector_audit.md` applies φ to DH exponent representatives and uses the residue as a one-based square-cell address; it does **not** apply φ to every cell value.
- `im-results/lp2-three-square-dh-state-extractor.md` recovers DH fields from square orders, centers, sums, and direct 7×7 cell reads; it does not use φ(actual cell values).
- `im-results/lp2-p33-totient-hidden-text.md` uses the solved p56 prime-totient clock, not this square-value transform.

## Reproduction and observed pattern

For the original p05/5×5/1033 matrix reconstructed in the Stage04 report, applying φ(n) mod29 gives:

```
12 15 10 14  5
 4 24 19 12  6
25 23 14 23 25
 6 12 19 24  4
 5 14 10 15 12
```

The source-visible central cross is:

- middle row: `[25,23,14,23,25]`
- middle column: `[10,19,14,19,10]`

Given the independently reconstructed DH23 state, these can be *described* as:

- `[-q, p, -b, p, -q]`
- `[-B, B, -b, B, -B]`

This is a compact and interesting cross-source correspondence. The operation φ is motivated by the page itself, mod29 is motivated by the 29-symbol GP alphabet, and the central cross is a natural geometric read. It deserves retention as a **candidate DH-state cross-check**, not dismissal as an arbitrary cipher-menu result.

## Strongest objections / corrections

1. **The field typing remains retrospective.** The image selects a 5×5 square and its center axes, and the text selects φ. It does not explicitly say that the row is `[-q,p,-b,p,-q]` or the column is `[-B,B,-b,B,-B]`. The p28 state was already known when the output was interpreted. Do not call the matrix a recovered DH key or an independently decoded plaintext.

2. **q=4 does not need the NPA component.** The p28 NPA fragment's outer-H output is `[14,4]`, but choosing its second coordinate as q is not itself source-selected. q=4 already has independent support in the square metadata (`91 = [3,4]_{29} = [e,q]`) and the authenticated 2016 word register (`EMPTY` is zero-based word4). Treat NPA's second component as a possible consistency check, not the selector that defines q.

3. **The p0 target packet/key is conditional.** The identity `[-q,B-A,-b] -> [A-B,K-b,q]` is exact arithmetic, but the target `[A-B,K-b,q]` is not an independently authenticated p0 cipher key. `im-results/lp2-p0-marker-state-column-sums.md` explicitly conditions its key residual on candidate plaintext `EPIPHANY SEEKS` and says the marker does not select column-major over physical raster order. The p0 13-atom serializer is also not source-authenticated: README's #1871 synthesis records that its strict provenance gate failed and its frozen p2 holdout missed. Do not let this totient correspondence promote the p0 candidate to recovered plaintext or a reusable inverse.

4. **Discard the q·e/count(q) addendum as a selector.** The four residue-12 cells can just as simply be written `a-p = 6-23 = 12 mod29`. Neither `q·e` nor the multiplicity-four interpretation is chosen by the page. The latter is especially vulnerable to post-hoc expression fitting.

## One useful extension, with a provenance caveat

I applied the same φ(actual-entry) mod29 operation to all three matrices in `resources/cicada2014-openpuff-magic-squares.txt`. Their central axes are:

| Square | φ-grid center row | φ-grid center column |
|---|---|---|
| 5×5 / 3301 | `[22,8,25,8,22]` | `[9,2,25,2,9]` |
| 7×7 / 1033 | `[8,19,14,11,14,19,8]` | `[14,17,7,11,7,17,14]` |
| 5×5 / 1033 | `[25,23,14,23,25]` | `[10,19,14,19,10]` |

The other two axes also contain many simple expressions in the known DH state (e.g. `A,B,-b,B-A,p-a,g+K,K,e^2`). This is suggestive, but the first two matrices depend on the 2014 Stage7-derived 99-number stream; #1948 is still the relevant reproduction gate. Further, I have already inspected these arrays, so this is **not** a blind holdout. If #1948 authenticates the chain, one frozen all-three-square φ-grid SFT could record the pattern without claiming an independent statistical validation.

I also checked the most obvious 13-value use: take the 7×7 φ-grid central cross (7 center-row cells plus 6 nonduplicated center-column cells) and apply it as a repeating additive/subtractive GP29 key to the 249-rune p0 body. Both natural concatenation orders (row then column; column then row) and both signs produce non-linguistic output. This is only a bounded negative for direct repeated-Vigenère use; it does not exclude other operations, but no other operation is source-selected.

## Recommended disposition

Keep your report's retrospective classification, but I recommend changing the wording so that NPA's `[14,4]` is a check on independently known q rather than the source of q, and explicitly separating the p0 three-coordinate packet from an authenticated cipher key. Do not expand the 12/q·e interpretation or search arbitrary square-cell expressions. The next causal gate is a first-party selector that tells a solver what the φ-grid state packet *does* to an untouched original ciphertext receiver. Without that, this is a strong cross-source state echo, not plaintext or a complete key.
