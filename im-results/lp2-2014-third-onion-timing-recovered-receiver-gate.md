# Third-onion 1033 string: period-source recovery and LP2 receiver verdict

Agent35, issue #2457. Source audit completed 2026-11-24. **Verdict: the first-party intermediate object is recoverable; no executable instruction or LP2 receiver is selected by the surviving public record. Close as a precise source gap, not as a decryption.**

## Exact object and player-visible gap

The relevant host was the 2014 third onion, `fv7lyucmeozzd5j4.onion`. Its player-visible page carried an HTML comment `<!--1033-->` followed by a 512-hex-character (256-byte) string beginning `87de5b7f...`. The later `<!--3301-->` event was a separate, multi-megabyte payload. The 256-byte string and its growth are the operand investigated here; they must not be conflated with the later 4.2 MB payload.

Two distinct period documents refer to this object:

1. [CICADA 3301 2014 PUZZLE FACTS PART 3](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3) records the `Entropy` bot's changing-string reports, names `numinit` as the bot's maintainer, links the original [Numinit Gist](https://gist.github.com/numinit/cc8404995e7166f0f43e), and links the #3301linux transcript at [Pastebin QKsB2K68](https://pastebin.com/QKsB2K68). It reproduces bot output with both observation time and a `modified` timestamp.
2. [CICADA 3301 2014 PUZZLE FACTS PART 4](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_4) independently identifies `.onion 3`, the `<1033>` marker, and the same full `87de...` string. It interprets 1033 as the Gematria count of “for every thing that lives is holy”; that is a contemporary community interpretation, not an authenticated instruction. It separately documents the later `<!--3301-->` multi-megabyte update on 2014-01-11 at 22:07:12 UTC and the appended `57` at 22:22:01 UTC. The page explicitly records that solvers had found no lead from the two growing strings.

These are two separate period records, but neither is a Cicada PGP signature. The Gist and Pastebin are participant/bot artifacts, not first-party instructions. The first-party status belongs to the onion response that participants observed; the surviving transcript does not establish that the 256-byte object was intended as an LP2 key.

## Important correction: this is not the second-onion string

The previous report incorrectly cited [What Happened Part 1 (2014)](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)) as another witness for this object. That page describes the *second* onion, `cu343l33nqaekrnw.onion`, its `<!--761-->` / “Patience is a virtue” marker, and a different 256-byte string beginning `634292ba...`. It is not a witness for the third-onion `fv7...` / `<!--1033-->` / `87de...` object. Do not merge their timing series or cite Part 1 as corroboration for this report.

## Data custody and timestamp semantics

- The period Part 3 page gives the exact original Gist ID/URL: `cc8404995e7166f0f43e`. It also gives the exact Pastebin pointer `QKsB2K68`, described as the #3301linux updates since 2014-01-09 06:46 GMT.
- The Gist series begins at 2014-01-09 05:54:01 UTC with length 16 and ends at 2014-01-11 01:09:01 UTC with length 256. The 241-row mirror is preserved at [resources/external/2014-third-onion-timing.json](../resources/external/2014-third-onion-timing.json).
- In the bot transcript, the bracketed clock is the bot's observation time; the `modified` field is the page/file modification timestamp. For example, a `[06:11 GMT]` observation reports `modified: 2014-01-09 06:12:01 UTC`. The JSON `ts` follows the `modified` timestamp, and `delta` is the difference between consecutive `ts` values. These are observed modification times, not proof of the exact instant Cicada generated each byte.
- `length` counts bytes, `chars` counts hexadecimal characters, and the `byte` field is the new byte reported by the bot. The first 16-byte observation predates the stated 06:46 start of the pasted IRC-channel coverage; the Gist series preserves those earlier measurements, so this is a gap in the quoted channel transcript, not an absent first 16 bytes.
- The 2022 [neuroretransmit/cicada archive](https://github.com/neuroretransmit/cicada/tree/main/2014/005-third-onion) preserves `512.raw`, `512.hex`, `hex-growth-over-time.json`, and the later `onion3.raw`/server-status files. Its README attributes the timing JSON to numinit. The timing file entered that repository in commit [852b398](https://github.com/neuroretransmit/cicada/commit/852b3988528595a8afaa26371b38544c52101342), dated 2022-12-09; this repository copy is a later mirror, not a contemporaneous publication.
- The period Part 4 page links the separate [mdzhb.dmtr.ru/onion3 archive](http://mdzhb.dmtr.ru/onion3/) and dated onion snapshots. Direct retrieval of that archive, the original Gist page, and Pastebin was unavailable through the current public reader. Their exact pointers and period excerpts survive in the two 2014 pages; the GitHub mirror supplies the complete 241-row JSON and byte snapshot.

The prior reproducible correlation work remains valid: 241 prefix statistics agree with the final 256 bytes; the usable interval and quantization exclusions are recorded in the source data and prior issue comment. This report does not repeat that computation.

## What the surviving source does and does not select

The period evidence establishes a 256-byte first-party onion object, a participant bot that measured its growth, the 1033 label, and a later distinct 3301 multi-megabyte update. It does **not** provide an instruction to XOR the 256 bytes, reduce them modulo 29, use timing deltas as a keystream, apply a Hill transform, or feed the object to any LP2 page. The 5×5 Hill-cipher idea on Part 4 is explicitly community brainstorming, not a recovered Cicada instruction. The contemporary note that no lead was found from the two growing strings is evidence against treating the 256-byte series as a known key path.

No surviving signed response, attachment, or terminal transcript links this object to an LP2 receiver. The precise missing item is therefore the authored consumer rule (or a lost response/handler that specified it), not the 256-byte value itself.

## Existing LP2 receiver gate — do not repeat

The bounded direct test is already preserved in [the standalone SFT](../sims/lp2_third_onion_timing_receiver_sft.cjs):

- Frozen before decoding: minute/three-minute timing segments and the recorded exclusions; four direct interval/byte combinations; additive, subtractive and Beaufort GP29 forms; every segment phase; original page resets.
- 55 unknown rune-bearing pages, 4,212 candidates per page, 231,660 total.
- Best held-out dictionary coverage was 8%; previews were incoherent. A planted positive control recovered its exact pad, phase and operation with 100% training and held-out coverage, showing the implementation could recover the planted form.
- Same-index comparisons against the 256-cell LP2 table showed no direct byte relation. No plaintext was obtained.

This negative is limited to the stated direct timing-derived receiver family. It is not a theorem excluding every transform of the 256-byte object. But the period source does not select another transform, so expanding the search would be unconstrained key hunting rather than a justified next experiment.

## Completion decision

The public-source route specified by #2457 has been followed to its extant pointers: both period pages, the original Gist URL, the IRC Pastebin URL, the documented onion3 archive, the surviving GitHub mirror and its file history. The recoverable first-party object and participant measurements are now identified; the remaining authored operation is not present in the surviving public record. The 2014 page's own “no lead” observation and the failed source-selected receiver gate support the rival explanation: no extra instruction survives, or it depended on lost infrastructure.

**Close #2457 as a precise source gap. Do not create a successor or run more cipher variants unless a genuinely new period artifact or independently selected LP2 receiver appears.**
