# Direct GP29 and GP28 radix interpretations yield no OpenPGP packet

**Agent50, 22 November 2026. Exact bounded original-cipher negative; no recovered unknown LP2 plaintext, key, file or destination.**

## Human-facing candidate and independent input

Cicada 3301 used OpenPGP in the authenticated 2014 puzzle handoff. A signed 2013 stage explicitly demonstrated BASE29 as a numerical conversion. The 2014 LP2 artifact provides the 29-symbol Gematria Primus register. Taken together, they motivate a small, independently readable test: do the original rune values, or the 28 alternatives to a repeat of the previous rune, directly encode an OpenPGP binary packet as a large-base integer? The numeric-to-OpenPGP operation remains a hypothesis, with no author-authenticated instruction that it is the LP2 cipher.

The input is the actual 12,956 ciphertext runes on 55 original rune-bearing LP2 physical pages p0–55. Source p50 holds a 32×8 numeric table and contributes no runes; solved p56 is 85 runes and clear p57 is 95.

## Frozen reversible digit-to-byte reader

In **65 source-defined scopes** (whole unknown book, nine illustrated chapters and each of 55 rune pages), test (1) the original GP29 digits, (2) the nonrepeating differences modulo29 minus one, and (3) the rank of each successor among 28 glyphs excluding the preceding glyph, sorted by Gematria Primus order. For the latter two, each page resets the predecessor and equal-adjacent positions are excluded as hypothetical separate markers. Read each stream forward or backward, serialize the *entire* resulting base29 or base28 integer in minimal or fixed-capacity unsigned big-endian bytes. No secret substitution, unknown mask, fitted offset, hidden packet pointer or additional source decoder is permitted.

Classify the **beginning** of each binary output using an OpenPGP packet header: high-bit packet indicator, complete RFC 4880 length, and a tag-appropriate basic body check. An incidental high-bit header and in-bounds length alone is insufficient to claim a file.

| Source digit family | Tested complete streams | Packet-like high-bit headers | In-bounds packet lengths | Typed OpenPGP packets |
| --- | ---: | ---: | ---: | ---: |
| GP29 raw | 260 | 26 | 5 | 0 |
| GP28 predecessor-exclusion (two readings) | 520 | 35 | 8 | 0 |
| **Total** | **780** | **61** | **13** | **0** |

The actual 13 in-bounds packet-length examples have no matching typed OpenPGP body. A constructed **13-byte literal-data OpenPGP packet whose content is HELLO** passes the *same* parser after exact base28 and base29 integer conversion, proving this fixed reader detects real payload bytes when present. A separate GP28 plant synthesizes the predecessor-derived runes and reconstructs all digits exactly.

**Executed original-source Windows Node22 result:** [GitHub Actions run 44993062608](https://github.com/FlareZ123/liber-primus/actions/runs/44993062608), PASS. Reproducer: [original GP29/GP28 OpenPGP gate](../sims/lp2_gp29_gp28_openpgp_typed_original_sft.cjs). The original corpus and all 780 candidates are independently regenerated in one file.

## Research decision

The directly readable unkeyed full-scope OpenPGP-packet interpretation fails under this fixed, simple family. Further unmotivated secret offsets, XOR candidates or packet-fragment search would not follow from the source. A cipher using an independently specified key or altered framing, or an encrypted file lacking an OpenPGP envelope, remains possible.

A separate prior [fixed-alphabet base28 raw-packet capacity proof](gp28-direct-binary-packet-capacity.md) excludes a different five-digit and ten-digit grouping even when its alphabet is secret. The new result concerns whole-scope base28/base29 integer conversion, so it should not be mistaken for a second test of that grouping. No actual plaintext has been recovered from any unknown page.