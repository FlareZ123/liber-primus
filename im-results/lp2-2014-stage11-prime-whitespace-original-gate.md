# An original 2014 Stage11 whitespace artifact: GP primes 2–37 with 19 omitted

**13 November 2026 · Agent23. Evidence status: byte-exact historical archive text and executed finite original-cipher key tests. The historical author did not cryptographically sign the salient whitespace. No LP2 plaintext/key/endpoint has been recovered.**

## The actual artifact and a human-readable clue candidate

The byte-preserved [May 2014 Stage11 signed handoff](../resources/historical/cicada2014-stage11-message.asc) names the Onion7 host that publicly served the LP2 scans. Its *text-file margins*, in original reading order, contain the following counts of literal ASCII spaces. Count each whitespace-only line once, the leading spaces on a nonempty line once, and the trailing spaces on a nonempty line once. Ignore ordinary internal interword spacing and PGP-armored signature lines:

| Visible line or run | Run type | ASCII spaces |
|---|---|---:|
| After “Hello. Your enlightenment awaits you.” | trailing | **2** |
| Next whitespace-only line | blank | **3** |
| Before `ky2khlqdf7qdznac.onion` | leading | **5** |
| After that Onion hostname | trailing | **7** |
| Next whitespace-only line | blank | **11** |
| Blank line after “We look forward ...” | blank | **13** |
| Following blank line | blank | **17** |
| After “Good luck.” | trailing | **23** |
| Blank line before “3301” | blank | **29** |
| First blank line after “3301” | blank | **31** |
| Final blank line preceding PGP signature | blank | **37** |

The exact ordered margin-length vector is

`[2,3,5,7,11,13,17,23,29,31,37]`.

This is **the first twelve prime numbers with exactly the eighth, 19, omitted**. In the canonical 29-rune Gematria Primus mapping, prime **19** corresponds to **ᚹ / W** (zero-based rune index7). The other eleven prime values correspond to the GP alphabetical prefix `F,U,TH,O,R,C,G,H,N,I,J` with its W absent. The fact is a specific, compact clue candidate with an accessible historical handoff rather than a postselected LP2 ciphertext arithmetic coincidence. It may be relevant to the manuscript's conspicuous use of primes and 29 rune symbols, but authorial intent and an operation are unknown.

The original historical Onion7 file `liber-primus/original-onion7/message.txt.asc` in the [period-image archival mirror](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/original-onion7/message.txt.asc) has identical Git blob SHA-1 `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e` to the repository's preserved copy. By contrast the separate [normalized PGP-message text](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2014-05-liber-primus-release.asc) is Git blob `5bfaaeaf5364291e8a38d27222946f9db93cd50b` and has had all optional trailing and blank-line spaces removed. The two are **different renderings within one archival lineage**, not independent first-party attestations of the 11 space counts.

## Signature/authorship limitation

OpenPGP clearsigned-text canonicalization **excludes trailing ASCII whitespace** when computing the verified signature. All whitespace-only lines are trailing-only; the 2,3,7,11,13,17,23,29,31,37-space runs therefore **are not cryptographically signed**, even if the prose and signature validate. The five spaces preceding the nonspace onion hostname are included in signed content, but this authenticates only one count. A later editor could add, remove or normalize the other counts without invalidating the signature. Consequently the series is **original-archive-visible**, not an independently authenticated 3301 instruction. This specific limitation matters when assigning evidentiary weight to a visually attractive prime pattern.

## Frozen direct cipher/key consumer

To test a minimal human-plausible application without inventing other key material, use the **11 observed whitespace counts in reading order** as a repeated modulo29 additive key (Vigenère-style, both signs), or replace each count by its **GP alphabet index** `[0,1,2,3,4,5,6,8,9,10,11]` and apply the same reversible operation. No phase shift, word reset, extra layer or target-dependent fitting is allowed; phase begins at rune0. Test precisely the complete original unknown p0–2 first chapter (**729 runes**) and separately p55 (**76 runes**). These windows are selected by manuscript opening and terminal bookend rather than their output scores.

All four candidate keys/signs leave both windows linguistically unrecognizable. Original p0–2 has GP29 IoC `0.03408252`; the source-numeric and GP-ordinal transformed values all lie between **0.03419 and 0.03509** (ordinary uniformly distributed 29-symbol text is near 0.03448). On p55 all four candidate outputs lie between approximately **0.03298 and 0.03614**, with original `0.03789474`. No coherent native-GP English or source-selected word/key was recovered; a repeating-additive consumer is negative. These results do not exclude **another original instruction** using missing19/W, a nonperiodic keystream or a message hidden in an unsignatured whitespace channel.

## Research decision and reproduction

The actual prime-valued source margins deserve retention as a **historical-source lead** because ordinary plaintext copies erase them, and a puzzle-maker or historic solver could have inspected them before reading LP2. Their causal path to plaintext is presently blocked: the original file offers no rule selecting W/19 as a cipher reset, a stride, a pad offset, or a page; and most counted runs lack OpenPGP-signature authentication. Do not expand into arbitrary W-omission schemes or 19-phase searches merely because this series looks designed. If a genuinely independently timestamped 2014 message byte witness or another Cicada-authenticated consumer becomes available, freeze its predicted LP2 operation before evaluating ciphertext. The actual unknown-page recovery count remains **zero**.

The [single-run, CommonJS original-input SFT](../sims/lp2_2014_release_whitespace_prime19_sft.cjs) parses the historical source bytes, asserts the entire eleven-count series, identifies missing19/W, tests all four additive candidates against the canonical LP2 original indices and prints the full outputs. It passed in [manual GitHub Actions run 43497628224](https://github.com/FlareZ123/liber-primus/actions/runs/43497628224), using the opt-in `release-whitespace` mode that skips the historical unrelated tests.
