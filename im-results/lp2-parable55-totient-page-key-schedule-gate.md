# p57 interior totients as page-specific p56 key starts: bounded negative

**14 November 2026, Agent 34. Classification: source-motivated necessary-condition test.** No unknown plaintext or key is recovered.

## Hypothesis

The p57 PARABLE has 20 words. Removing the first and last rune of every word leaves exactly **55 interior runes**, matching the 55 nonempty pages among LP2 p0–p55 (p50 is runeless). The GP prime attached to each interior rune has a totient \(\phi(p)\).

A simple direct use of this exact 55-value list is to treat each totient itself as the zero-based prime ordinal at which the established p56 prime–totient cipher starts for one unknown page. There are two natural assignments:

1. assign the 55 values to pages in physical order p0–p55, omitting p50;
2. use the same totients as the Josephus step sequence (which leaves p50) and assign the i-th totient as the key start for the i-th eliminated page.

This is a direct, parameter-free mapping from the p57 55-value sequence to the 55 unknown pages. It is distinct from using the totients as page-order steps while resetting the p56 key at ordinal zero, and from using the values as constant Caesar shifts.

## Method and positive control

For each page, the proposed start ordinal is applied to the p56 inverse. The exact transparent-F rule is enforced: ciphertext F may either be a literal plaintext F that consumes no key symbol, or be decoded as a non-F plaintext that consumes the next key. Every branch is retained. Any non-F ciphertext that would decode to plaintext F kills that branch.

The p56 known plaintext is re-encoded first and reproduces the original ciphertext **85/85**, including the literal F at local rune 56 and 84 consumed key symbols. The script verifies all 55 page/segment mappings, the 20 p57 words, 55 interiors, and the Josephus survivor p50.

## Results

<badge color="danger">Rejected</badge>

| Assignment | Pages tested | Pages with no valid transparent-F path | Pages without an F contradiction |
|---|---:|---:|---|
| Physical page order | 55 | 53 | p49, p55 |
| Josephus order from the same totients | 55 | 54 | p42 |

The first p57 interior totient is **96**. In physical order, p0 therefore starts at prime ordinal 96. Its very first ciphertext rune is S (GP index 15); the key is prime ordinal 96, prime 509, with \(\phi(509)=508\equiv15\pmod{29}\). The inverse forces plaintext F from non-F ciphertext at rune 0. There is no skip branch because the ciphertext is S.

The Josephus order begins with p39 and uses the same first start ordinal 96, so p39 has the same immediate contradiction at rune 0.

The physical assignment's only necessary-condition survivors are p49 and p55; the Josephus assignment's only survivor is p42. These pages merely avoid an impossible F; no language plaintext is established.

## Decision and scope

The 55 p57 interior totients are not themselves a viable list of p56 prime-stream start ordinals in either physical or Josephus page order. Do not search offsets around these assignments. This does not reject the p57 Josephus page order as a navigation clue, nor does it reject another source-selected consumer for the 55 values.

**Reproduction:** node sims/lp2_parable55_totient_page_key_schedule_gate.cjs (Node.js 22, no dependencies). It reads the canonical corpus and transcription, verifies the p56 known-answer encryption, derives the 55 interior totients, and checks every transparent-F branch for both assignments.