# Independent non-repository LP2 solve-attempt delta (Agent 50, #3009)

2026-11-26. Scope: new-to-index, dated public analyses outside GitHub solver repositories. Existing #944 and #2986 findings were not rerun. None of the sources below authenticates a new first-party artifact, key, or unknown-page plaintext.

## Source-linked delta

| Source / publication | Artifact, operation and actual evidence | Disposition |
|---|---|---|
| [shimobukure_chan, 18 July 2026](https://shimobukure-chan.blogspot.com/2026/07/research-using-llms-on-cicada3301.html) | Physical LP2 p54/p55 (232/76 runes). Reports eight EA positions, an A/B scaffold (91 and 57 payload runes), terminal source219→320, and a 2014 SSSS-related coordinate model. Its own audit finds the raw offsets do not independently regenerate the asserted full panel; it disclaims payload plaintext. | Exact EA positions reproduce below. The article gives no executable full partition/router, its own exact seven SSSS input rows or authenticated rule for the terminal index. New lead is the **specific verifier and original raw offset records**, if actually published; require immutable pre-fit rule plus independent holdout rather than fitting the reported targets. |
| [shimobukure_chan, 21–22 July 2026](https://shimobukure-chan.blogspot.com/2026/07/calibrated-large-scale-search-and.html) | Reports two p54 short-word anomalies, extensive calibrated bounded negative searches and four omitted apostrophe marks in its transcription audit. Its fixed-key display-space permutation null does not account for adaptive selection; no coherent plaintext. | Independent methodological prior art, not transferable exclusions without exact implementation. Exact native-GP tests of two literal receiver interpretations below yield no whole printed-word beacon or p55 continuation. Request exact corpus, 23-symbol display map, key phase, verifier/offsets and four apostrophe coordinates only if released; no wider search triggered. |
| [Frank G. Bosman, 11 February 2020](https://frankgbosman.wordpress.com/2020/02/11/cicada-3301-the-book-of-daniel/) | Literary interpretation of Blake's images in the 2014 challenge and associations with Daniel, Newton and Jung's Red Book, including the 107/167/229 image references. Supplies secondary interpretive links, not a specified LP2 coordinate/key sequence. | Recognizable source references are not a receiver. #1662/#3008 already retire the literal Stage10 triplet bridge in the absence of a source-selected operation. No new key or cipher test. |
| [Cryptography Stack Exchange, 1 October 2019](https://crypto.stackexchange.com/questions/74736/using-an-integer-ring-with-rsa) | Small integer-ring RSA-style letter mapping in Cicada context, modulus 26. No original LP2 recovery. | Static symbolwise permutation cannot repair original equality-pattern constraints; does not specify an LP2 GP29 block/state receiver. No new search. |
| [Reddit, 2 January 2017](https://www.reddit.com/r/cicada/comments/5lkdf2) | Tree/branch imagery and magic-square/2016-message conjectures. No exact decoding rule. | Earlier public interpretation only; overlaps existing artwork and square research. |
| [Reddit, 5 August 2019](https://www.reddit.com/r/cicada/comments/cmevyf) | Reports a failed book-derived onion/hash attempt involving SHA-1, base32 and SHA-512. Exact source serialization absent. | Anecdotal negative only, not a reproducible exclusion or authentic external resource. No new preimage candidate. |

## New bounded original-cipher test: July 2026 p54 candidates

The earlier article's 232/76 counts settle the page numbering: physical LP2 54/55, not archive image 54. Native GP29 values, no transliteration collapse. Inputs: `resources/liber-primus/lp2-corpus.json` and `resources/transcriptions/lp2-image-corrected.txt`. Extract the p54 transcription segment by exact rune-sequence equality; its 50 local groups include the end fragment. Remove layout slash/newline but retain printed word/section separators. Independently reconcile with the image-corrected visual groups in `resources/liber-primus/lp2-page-groups-54-55-derived.json`; all reported beacon-containing intervals agree. The raw parser may merge the red8 heading with the adjacent body group, so use the visual groups for the actual boundary test. Positions zero-based, intervals half-open.

* EA indices reproduce exactly: 48,52,54,73,135,151,211,228. Merely extracting an ordinary rune's eight positions is not evidence for its control function.
* Freeze ordinary phase-zero additive interpretation of CONSUME: key GP indices [5,3,9,15,1,19,18], P_i=(C_i+K[i mod7]) mod29. No skips or resets. Test p55 at continuing i=232, not a newly fitted phase.
* Exact GP29 NOT=[9,3,16] appears once at p54 offset215, inside printed group [210,220). YOU=[26,3,1] appears once at45, crossing [41,46)→[46,53). **Zero whole-group matches**. p55: zero NOT and YOU, no readable passage.
* An explicit illustrative lossy alias rule N∈{N,NG}, O∈{O,OE}, T∈{T,TH} gives NOT-shaped tokens at 96 (NG/OE/TH; crosses group boundary), 185 (N/OE/T; crosses group boundary), 215 (literal). This is not asserted to be the author's unreported 23-symbol map, so its reported four display hits are neither replicated nor refuted by this rule.
* Freeze one ordinary ciphertext-autokey interpretation followed by the given affine map: P_i=(23(C_i−C_{i−6})+21) mod29 for i≥6, with the unknown initial six left undefined. Exact WAS, ATE, FOR, NOW and THAT (single TH rune) are evaluated against original groups. One FOR at26, crossing [26,28)→[28,33), no whole-group match; p55 continuation gives none of the five, no readable passage. The external article does not fix initial state, sign, or full affine convention, so this is a bounded receiver test, not an exact replication of its selected sparse output.

Reproducer (Python 3, repository root; no external dependencies):

```python
import json
from pathlib import Path
d=json.loads(Path("resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
a,b=(d["pages"][i]["indices"] for i in (54,55))
r={x:i for i,x in enumerate(d["runes"])}
parts=Path("resources/transcriptions/lp2-image-corrected.txt").read_text(encoding="utf-8").split("%")
s=next(s for s in parts if [r[x] for x in s if x in r]==a)
visual=json.loads(Path("resources/liber-primus/lp2-page-groups-54-55-derived.json").read_text(encoding="utf-8"))
alphabet="0123456789abcdefghijklmnopqrs"
assert [alphabet.index(x) for x in "".join(visual["p54"]["all_visual_groups"])]==a
assert [alphabet.index(x) for x in "".join(visual["p55"]["groups"])]==b
groups=[]; n=0
for word in visual["p54"]["all_visual_groups"]:
    groups.append((n,n+len(word))); n+=len(word)
assert (len(a),len(b),len(groups))==(232,76,50)
assert [i for i,x in enumerate(a) if x==28]==[48,52,54,73,135,151,211,228]
c=a+b
key=[5,3,9,15,1,19,18]
p=[(x+key[i%7])%29 for i,x in enumerate(c)]
q=[None if i<6 else (23*(x-c[i-6])+21)%29 for i,x in enumerate(c)]
def hits(values, pattern, lo, hi):
    return [(i,(i,i+len(pattern)) in groups) for i in range(lo,hi-len(pattern)+1)
            if values[i:i+len(pattern)]==pattern]
for name,w in {"NOT":[9,3,16],"YOU":[26,3,1]}.items():
    print(name,hits(p,w,0,232),hits(p,w,232,308))
for name,w in {"WAS":[7,24,15],"ATE":[24,16,18],"FOR":[0,3,4],
               "NOW":[9,3,7],"THAT":[2,24,16]}.items():
    print(name,hits(q,w,6,232),hits(q,w,232,308))
```

## Historical SSSS offset receiver — exact independent operands

The seven public historical offsets are already available, independently replayed against the original 2013 ISO: [pklmx report and exact seven-row table](pklmx-2013-onion-continuation-gate.md). This avoids treating the raw historical offsets as missing. In that report's source order (Dallas, Okinawa, Moscow, Little Rock, Annapolis, Portland, Columbus), the offsets are 33461, 37861, 1111111, 13831, 77977, 12821, 617. The external article does not publish its own seven input rows, so equality to its internal data cannot be asserted.

Under literal reduction modulo232, these give [53,45,63,143,25,61,153]. Freeze the single-step formula set actually named in the article: r, r±1, r±104, 320−r, all reduced modulo232. No chained formula or fitted constants. Against the published panel [53,53,91,153,229,217,226]:

| Panel value | Producing historical row and formula |
|---:|---|
| 53 (twice) | Dallas, r (one underlying witness, not two independent ones) |
| 91 | none |
| 153 | Annapolis, r−104; Columbus, r |
| 229 | none |
| 217 | none |
| 226 | none |

The independently sourced ordinary receiver recovers only two distinct panel values, 53 and 153; it cannot generate the other four. Removing the final reduction from the 320-complement does not add a missing value. This tests the stated literal one-step registry, not the author's unpublished full formula ledger. In particular, the 217/226 values cannot be used as externally generated key coordinates on the available rule. The exact seven raw rows are known; the missing dependency is the **prior frozen extended formula registry and its actual typed connection to LP2**, not another historical ISO search.

Reproduce: `{(f(o % 232)) % 232 for o in offsets for f in (lambda r:r, lambda r:r-1, lambda r:r+1, lambda r:r-104, lambda r:r+104, lambda r:320-r)} & {53,91,153,229,217,226}` gives `{53,153}`.

## Decision

This is a concrete negative for two specified native GP29 receiver interpretations, not a claim that the external adaptive searches were replayed, nor an exclusion of a genuinely specified layered system. The sole actionable external dependency is the unpublished/unlocated p54 verifier and SSSS formula chronology; exact apostrophe coordinates could also be compared if available. The presently published summaries do not supply either. Close the bounded discovery task without commissioning another generic public-source survey. Reopen on the actual executable verifier/source records or new authenticated primary data. No change to 0/56 unknown pages solved.
