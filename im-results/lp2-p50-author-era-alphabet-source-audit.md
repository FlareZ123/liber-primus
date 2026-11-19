# Author-era source audit for the p50 numeral alphabet and lowercase-f omission

**Agent8, 18 November 2026. Director #1693. Classification: bounded historical source result.**

## Decision

Conventional base60 is demonstrably a contemporaneous 2014 participant interpretation of the p49–51 table. No source in the bounded 2012–2014 author-era corpus examined here defines a drop-`f` base59 alphabet, instructs omission of lowercase `f`, or supplies a creator-authored two-character table parser.

The historical result strengthens the base60 entry state. The post-MUST drop-`f` base59 state remains a manuscript-internal cryptanalytic hypothesis selected by the current `WE MUST SHED` route and the whole-table validity constraint.

## Earliest paired p49–51 source

The preserved participant repository `micheloosterhof/cicada-2014` has commit `19d68fbb9cff1c06d52cc0add30285199c936282`, recorded at **2014-05-11 20:41:01 UTC**. It adds `49.txt`, `50.txt`, and `51.txt` with copied two-character table tokens and decimal values.

Using the ordered digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, all **256** raw tokens reproduce the later archived decimal stream. The pinned reproducer verifies the full set. Sample mappings are `3N=203`, `0x=59`, `4F=255`, `0g=42`, and `1O=84`.

This proves that the conventional base60 ordering was in actual participant use in May 2014. It does not prove Cicada authored that conversion.

## Later byte-string commit

Commit `a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462`, recorded at **2014-05-11 21:39:09 UTC**, adds `decimal.txt`, `decimaltobyte.pm`, and `sexagesimal.bin`.

The full converter only reads each already-computed decimal line and emits Perl `pack 'C'`. It never reads the original tokens and contains no digit alphabet, radix selector, or missing-character rule. The source tree at this commit was enumerated for stage11/base/decimal/byte-related paths, and no second token-to-decimal parser appears alongside those files.

## Contemporaneous discussion

The pinned original `#cicadasolvers` Freenode corpus records a **4 May 2014** p49–51 discussion. Participants first considered base64, then identified the cuneiform/sexagesimal motif and discussed treating each two-character pair as one number or byte. This predates the May 11 committed decimal rendering and confirms that base60 was an original-era solver reading.

Later discussion records RSA, biliteral, XOR and stream-cipher proposals around the 256-byte object. No successful table codec or base59 transition is recorded in the bounded contexts summarized by the source corpus.

## First-party comparison

The GPG-verified signed TCP challenge from 26 January 2013 explicitly specifies `BASE29` with digits `0123456789ABCDEFGHIJKLMNOPQRS`; its positive control is `BASE29 3301 -> 3QO`.

This is direct evidence that an authenticated Cicada protocol could state a radix operation and its digits. No comparable first-party `BASE60`, `BASE59`, p49–51 parser, or lowercase-`f` omission instruction has been recovered in the bounded 2014 stage11 material.

## Lowercase f

Lowercase `f` is the sole unused character of the conventional 60-symbol alphabet across the original 256 copied tokens. That absence was therefore observable in 2014.

The operation "remove the sole unused digit and continue in base59" is absent from the period participant code and signed source examined here. The previously observed eight case-only transcription discrepancies spell `01100110 = 0x66 = ASCII f`, but those discrepancies come from the same solver transcription and involve correlated case confusions. They remain a conditional mnemonic rather than an independent creator witness.

## External alphabet precedent

A 2007 MIRACL manual and 2002 Sendmail reference use the same `0-9,A-Z,a-x` ordering. This establishes that the alphabet was a real technical convention before Liber Primus. No examined Cicada artifact references either source, so they are excluded from creator authentication.

## Relation to MUST/SHED

Director #1688 found that `MUST` uniquely supplies the 60-to-59 boundary inside the frozen solved-word family, deleting `f` is uniquely compatible with a single 59-symbol alphabet over all printed tokens, and frozen address87 gives `SHED=64` after the switch. Local arithmetic still leaves 17 possible deletions, so whole-table validity is essential.

The historical audit supports the conventional base60 entry state and supplies no independent historical authentication for the switch.

## Director fork

**No creator-authored exact table codec was recovered. Conventional base60 is fixed as a contemporaneous solver interpretation. No author-era base59/drop-f rule was found.**

Downstream research should treat base60 as historically grounded context. The drop-`f` base59 state must continue to earn support through manuscript-internal predictions on blind receivers.

## Reproduction

- `resources/external/cicada2014-stage11-original-transcriptions.json`
- `resources/cicada2014-sexagesimal-source.json`
- `resources/external/2014-cicadasolvers-freenode-log-corpus.md`
- `resources/external/2013-tcp-server-signed-source.md`
- `resources/external/miracl-2007-base60-alphabet.md`
- `sims/lp2_p50_authorera_alphabet_source_audit_sft.cjs`
- Windows Node 22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44425316714
