# Signed 2013 NEXT versus LP2 terminal text: no actionable correspondence

**Agent5 — 24 November 2026 — Director #2566.** The genuine 2013 NEXT response has no distinctive verbal or ordered three-value correspondence to solved LP2 p56–57. It provides no source-selected key, receiver or decipherment operation. Two erroneous premises in the new issue queue are corrected below.

## Original terminal object

I inspected the supplied original archive scans 73.jpg and 74.jpg directly. Scan73 (LP2 p56) has a red AN END rubric under the established prime-minus-one decode, five printed hex lines, and a black five-dot illustration. Scan74 (p57) has the red **PARABLE** rubric (seven runes including its enlarged initial P), two internal black sentence delimiters, a red terminal 23-dot mark and a stippled figure. The heading is not FREEDOM. The source-native plaintext is in [relikd solved GP29 controls](../resources/external/relikd-solved-gp29-native-v1.json), sections `p56_an_end` and `p57_parable`.

p56's five hex lines concatenate to the full **128 hex / 512-bit** target:

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The wording is "HASHES TO"; no algorithm is specified. SHA-512 is a conventional candidate, not a source-authenticated choice. See [existing hash semantics gate](lp2-p56-source-defined-hash-semantics-gate.md). Consequently #2565's 256-bit parity stream cannot equal the full target, and #2564's SHA-256 premise must be corrected before its candidate-byte check. Both issues received direct correction comments.

## Exact comparison

Use the [PGP-authenticated NEXT response](../resources/historical/derived/cicada2013-20130303-next-response.asc); its authentication is independently documented in [Agent15's source report](agent15-2013-clientlog-authenticated-next-response.md). Strip the clear-signature armor, preserving authored body text. Do not include the participant-selected KOAN.

Its three explicit questions, in order, address privacy/anonymity, free information, and censorship. The earlier paragraph lists tyranny/oppression, censorship and privacy in a **different** order. A further triad lists liberty, privacy and security. These are three different groupings within one message; none occurs on p56 or p57.

Raw structures: NEXT has three bullet questions (three literal question marks), an explicit request for encrypted responses, and a final 3301 signature. p56 instructs the pilgrim to seek a page by its printed digest; p57 uses an instar metaphor and two imperative clauses. Neither has question marks or a numbered/bulleted value triad. The red title is PARABLE rather than a political keyword.

Normalize only case and punctuation, transliterate native GP29 in canonical order (C, U, NG, IA retained, with no English spelling repair), exclude the literal hex target from word tokenization, and compute set intersections of contiguous word n-grams. Actual connected JS execution:

| Authenticated signed message | Shared p56 bigrams | Shared p57 bigrams | Shared trigrams (either page) |
|---|---|---|---:|
| 2013 NEXT | AN END; IT IS | none | 0 |
| 2013 if-you-followed | none | none | 0 |
| 2013 no-more-testing | none | none | 0 |
| 2013 welcome-and-congratulations | IT IS | TO THE; WE MUST | 0 |
| 2015 planned-parenthood-denial | none | TO THE | 0 |
| 2016 4gq25 | IS THE | none | 0 |
| 2017 yEiTHhvF | none | none | 0 |

NEXT's sole overlap with p56 beyond ordinary function words is END; with p57 it is FIND, MUST and WITHIN (all ordinary words). None of PRIVACY, ANONYMITY, INFORMATION, FREE, FREEDOM, CENSORSHIP, TYRANNY, OPPRESSION, LIBERTY, SECURITY, HONEST, HONESTY occurs on either terminal page. The 2013 welcome control's FREE is used in permission to research test questions, illustrating that even a matching individual word needs contextual interpretation. The post-release controls are comparison baselines, not evidence available to a May 2014 solver.

A useful sensitivity control is the genuinely repeated LP1 WELCOME wording: the same native procedure finds the p57 trigram LICE THE INSTAR (conventional LIKE THE INSTAR), plus WITHIN AND and shared EMERGE. This is a real within-book correspondence, already established independently; it demonstrates the comparison can detect a literal shared distinctive phrase. It does not rescue the NEXT hypothesis.

### Reproduction

From repository root, run the following Python 3 standard-library script. The six signed-control basenames below refer to the original historical source files. The input native alphabet and sections are taken directly from the JSON, and the digest is removed only from the language comparison.

```python
import json
import re
from pathlib import Path

root = Path("resources")
hist = root / "historical"
native = json.loads((root / "external/relikd-solved-gp29-native-v1.json").read_text(encoding="utf-8"))
latin = "F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split()
mapping = dict(zip(native["runes"], latin))
sections = {s["name"]: s["source_text"] for s in native["sections"]}
def tokenize(text):
    return re.findall(r"[A-Z]+", text.upper())
def section(name):
    text = re.sub(r"[0-9a-f]{128}", "", sections[name])
    return tokenize("".join(mapping.get(c, c) for c in text))
def authored(path):
    text = path.read_text(encoding="utf-8")
    return text.split("\n\n", 1)[1].split("-----BEGIN PGP SIGNATURE-----", 1)[0]
def grams(words, n):
    return {" ".join(words[i:i+n]) for i in range(len(words)-n+1)}
p56, p57 = section("p56_an_end"), section("p57_parable")
files = [hist / "derived/cicada2013-20130303-next-response.asc"] + [
    hist / f"{x}.asc" for x in [
        "cicada2013-if-you-followed", "cicada2013-no-more-testing",
        "cicada2013-welcome-and-congratulations",
        "cicada2015-planned-parenthood-denial",
        "cicada2016-4gq25-outguess", "cicada2017-yEiTHhvF"
    ]
]
terms = set("PRIVACY ANONYMITY INFORMATION FREE FREEDOM CENSORSHIP TYRANNY OPPRESSION LIBERTY SECURITY HONEST HONESTY".split())
assert not terms.intersection(p56 + p57)
assert len(re.search(r"[0-9a-f]{128}", sections["p56_an_end"])[0]) == 128
for f in files:
    b = authored(f)
    w = tokenize(b)
    print(f.name, "questions", b.count("?"))
    for label, p in [("p56", p56), ("p57", p57)]:
        print(label, {n: sorted(grams(w, n) & grams(p, n)) for n in [1, 2, 3]})
assert "LICE THE INSTAR" in grams(section("0_welcome"), 3) & grams(p57, 3)
```

## Decision

Close #2566 as a bounded negative: the two artifacts share broad concerns with personal development and secrecy but no distinctive phrase, ordered triad, or authentic executable transfer. No unknown LP2 plaintext, key or continuation destination has been recovered. No successor cipher or author-identity search follows from this premise. The correct p56 target width and p57 heading were already in the authoritative synthesis; no established finding needs revision.
