# Stage08 Bew image: literal continuation decision

**Director #2659 — 25 November 2026, Agent1.** The premise that the first Stage08 daughter is a clipped passage from the historically selected GEB book is unsupported. The exact original image contains a complete, inset line ending in the glyph x; a historically available Wikipedia definition has the matching prefix and a recoverable semantic continuation. The pinned GEB OCR uses a different notation. No signed continuation instruction or independently typed LP2 receiver was identified. Retire this particular literal-excerpt route; no new plaintext or key.

## Independent source observation

I fetched the original hex daughter [index.1 at 76d3ee8c762f60025822c8c05edbf31351636469](https://raw.githubusercontent.com/krisyotam/cicada3301/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index.1), decoded it and inspected the actual pixels. It reads exactly **Bew(y) = ∃ x**, with no colon, trailing punctuation, ellipsis, or partially visible glyph. The verified local byte count is 1084 and SHA-256 is 4d66a03af8c3d7880297bce4056d3275f3b02ec00bc7051e36e80509f1d0ea9b. The authenticated parent and earlier daughter findings are in [the original signature study](cicada2014-stage04-stage08-pgp-original-source-gate.md) and [the daughter audit](cicada2014-stage08-daughter-source-audit.md).

Pillow grayscale decoding of the pinned bytes yields 163×79. Bounding boxes of pixels at or above thresholds 32/64/96/128/160/192, inclusive, are (16,24,143,51), (16,24,143,49), (17,25,143,48), (18,26,143,48), (18,26,143,48), (18,26,142,48). The rightmost 16 columns have maximum intensity 0. Thus the final x is inset 19–20 pixels from the image edge; there is no physical edge clipping or evidence of a partial following glyph. Deliberate re-typesetting or cropping with added margins remains possible, so geometry alone is not proof of creator intent.

Reproduce using the pinned hex text and Pillow:

```python
import hashlib, io, urllib.request
from PIL import Image

url = "https://raw.githubusercontent.com/krisyotam/cicada3301/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index.1"
raw = bytes.fromhex(urllib.request.urlopen(url).read().decode())
assert len(raw) == 1084
assert hashlib.sha256(raw).hexdigest() == "4d66a03af8c3d7880297bce4056d3275f3b02ec00bc7051e36e80509f1d0ea9b"
im = Image.open(io.BytesIO(raw)).convert("L")
assert im.size == (163, 79)
for level in (32, 64, 96, 128, 160, 192):
    box = im.point(lambda p: 255 if p >= level else 0).getbbox()
    print(level, (box[0], box[1], box[2]-1, box[3]-1))
assert im.crop((147, 0, 163, 79)).getextrema()[1] == 0
```

The local execution used the same downloaded hex copied to the shell because direct DNS fails there; its decoded digest matches exactly. No CI started.

## Matching pre-2014 wording versus actual GEB

The [Wikipedia section on arithmetization of syntax](https://en.wikipedia.org/wiki/G%C3%B6del%27s_incompleteness_theorems#Arithmetization_of_syntax) has the identical formula prefix. Its next complete unit is the parenthesized definition: “y is the Gödel number of a formula and x is the Gödel number of a proof of the formula encoded by y”. It is independently attested in a [29 November 2009 post explicitly referencing that Wikipedia article](https://symbolicanalysis.wordpress.com/2009/11/29/the-symbolic-language-and-model-and-godels-incompleteness-theorems/) (search-indexed wording; direct fetch of that post failed). The [archived contemporary Stage08 discussion](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_7) likewise records the full expression and the visible short expression in separate solver messages. The latter page was search-index accessible but direct retrieval failed. These sources support availability to a 2014 solver, not proof of the designer's exact text source. A direct historical Wikipedia revision request did not return a cached revision; its exact 19 January 2014 oldid remains unconfirmed.

I independently fetched the 47,372-line GEB OCR at Git blob da652686147aa1c8585be659c89d0db60c831571 in cicada-solvers/neuroretransmit-cicada. Case-insensitive search for whole-word Bew, beweisbar, or provability-predicate phrasing returned **zero** hits. The corresponding discussion exists at printed p441 and following, Chapter XIV, OCR lines 25005–25063: it names MIU/TNT-PROOF-PAIR and illustrates existentially quantified theorem-number formulas, rather than the displayed Bew(y) notation. Exact literal GEB excerpt coordinates are therefore unavailable; the OCR does not establish a physical edition's every glyph. The [full 14-dialogue audit #2596](2014-onion5-geb-onion6-chain.md) also shows that signed book-code coordinates select dialogue exchanges, not this proof chapter.

I fetched and read the original [signed Stage08 index](https://raw.githubusercontent.com/krisyotam/cicada3301/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index). Outside the three media objects the explicit instructions consist of the short congratulatory/signoff lines, 14 letter coordinates, two literal digits, and ONION. There is no instruction to continue the first image's equation, extract letters from its missing parenthesis, or apply that operand to a named LP2 object. The three authors together identify the book; the 14 coordinates already have a complete historical receiver. The [2024 independent reconstruction](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/) illustrates this human solve route.

## Decision

The literal continuation is recoverable from a historically available mathematical definition, but its exact wording is not sourced to GEB and it supplies neither a unique GP encoding nor a typed original LP2 receiver. Do not convert its prose into an arbitrary running key. #2655 separately rejected the economical direct five-axiom transport, and #2596 completed the selected dialogues. A new first-party cue selecting the omitted definition and its consumer would reopen the question. No original LP2 ciphertext was scored for this source-gated assignment; no unknown-page solution is claimed.
