# Original September 2014–2016 solver chat: dated unknown-page claims lack a decoder

**Agent 26, 14 November 2026. Classification: newly bounded historical witness screen, negative for independently executable unknown-LP2 plaintext.** This source audit extends beyond the May–August 2014 material being examined separately by Director Issue #888. It recovers **no unknown-page plaintext, original-cipher inverse, key or continuation address**. The full historical chat remains a possible source for a later genuinely sourced code attachment.

## Source and bounded acquisition

The original IRC export [#cicadasolvers.freenode.2.log](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log) is **27,234,234 exact bytes**, Git blob SHA-1 **72634a9d071d32af767edbffc0493d810e88cd0d**, containing **347,454 physical lines**. The [one-file original-blob scanner](../sims/lp2_2014_2016_late_irc_unknown_claim_sft.py) downloads the pinned public source in a manual CI worker, checks exact byte size and Git object identity before processing text, and scopes messages to **September–December 2014, 2015 and 2016**. Its date-stamped message counts are **38,008 / 162,874 / 144,109**. The later file's January 2016 page56/historical-hash finding was previously studied in [the separate Pastebin archive audit](2016-pastebin-irc-original-source-audit.md). The current scanner excludes explicit page 56/57 and the solved AN END passage. It does not claim to audit all linked files or every unworded allusion to a solution.

The targeted lexical screen yielded **688** same-message page/book/rune + solution-verb candidates, **34** matching stronger apparent direct-claim grammar; 25 higher-scoring lines plus separately selected full ±13-line contexts were retained in [passing original GitHub Actions run 43608652302](https://github.com/FlareZ123/liber-primus/actions/runs/43608652302). This is a high-recall triage corpus, rather than 688 independent decryptions.

## Four concrete dated original-language claims

| Original archived line | Claim and decisive adjacent source lines | Supported conclusion |
| --- | --- | --- |
| **L149655–68**, 6 Aug 2015 | Nick glyph420 writes “i solved the runes” and “i got an onion but its offline”; when asked to share, there is no visible page, algorithm, key or address, and a participant says the claim looks false | **Unsubstantiated**: no checkable original ciphertext mapping or destination |
| **L230833–35**, 7 Jan 2016 | Seneca relays a claim from Janus3271 to have decrypted pages and supplies a Base64-like purported “re-encrypted page 23”; immediately says “Probably a troll” | **Unsubstantiated**: new unauthenticated ciphertext without original plaintext, key or source identity |
| **L265003–15**, 15 Jan 2016 | paradokz claims “i deciphered page 49 by using bernoulli numbers”; when challenged to give the output, explains that cuneiform digits (17,13) and (55,1) mean **1033 and 3301** under sexagesimal, and another participant says this interpretation is already on the wiki | **Existing known numeric motif**: no Bernoulli decoding of any unknown rune is shown |
| **L285354–66**, 29 Jan 2016 | yam00 jokingly claims the first word decoded by assuming a one-rune final printed word is **I**, with nearby joking congratulations and subsequent generalized dictionary ideas | **One-character linguistic guess**: neither a key nor verified word recovery |

These are first-hand dated **participant statements**, with no Cicada-signed output. None supplies a frozen reversible operation on an original unknown LP2 rune interval. The full contexts distinguish claimed success from actual numeric readouts and unsupported jokes, so no generic Bernoulli or Base64 inversion campaign follows from these mentions.

## Decision and reproducibility

The [manual-only source gate](../.github/workflows/agent26-late-irc-unknown-plaintext-manual.yml) ran successfully in [CI 43608529327](https://github.com/FlareZ123/liber-primus/actions/runs/43608529327) and [CI 43608652302](https://github.com/FlareZ123/liber-primus/actions/runs/43608652302). The script retains source line IDs, exact size/hash, date-scoped counts, candidate ranking, and full contextual messages for the four witnesses. It does not convert an unverified participant's 2016 speculation into an LP2 solution.

**Research fork:** find a later original code/source attachment with an actual published key and plaintext, or return to the original author's mathematical/visual instructions. These four explicit alleged solutions cannot support a cipher search: each lacks enough authenticated original-source inputs to make a discriminating plaintext prediction. This negative is limited to the specified dated IRC file and lexical claim grammar.
