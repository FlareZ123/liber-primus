# p15 construction-to-key transfer: 2012 representation-prefix witness (Agent15, #3216)

## Decision

A historical worked mechanism demonstrates how a partial visual numeral construction fixes the interpretation of a longer independently visible key string. It does not establish a general rule that the generating algorithm of any numerical puzzle is itself a subsequent cipher. LP2 p15 does not display the second aligned register required by this particular mechanism. Do not promote the Fibonacci-prime construction into a new shift schedule on this evidence.

## Historical replay

Contemporaneous [ClevCode account, stage 2](https://clevcode.org/cicada-3301/) records the 13 Mayan banner numerals `10 2 14 7 19 6 18 12 7 8 17 0 19` and the independent 23-character subreddit title `a2e7j6ic78h0j7eiejd0120`. The [archived subreddit stage](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/README.md) supplies the same title. The signed Problems message supplies a general visible-key hint, not an explicit specification of the radix or cipher. Signature verification is reported by the historical solver, not independently repeated here.

Digitwise 0–9/a–j conversion reproduces all 13 banner values exactly and specifies ten further values `7 14 18 14 19 13 0 1 2 0`. The values act as cyclic subtractive shifts mod 26, advancing only on letters, resetting at every posted line. Replayed the first three January ciphertext lines in the contemporaneous account: 50, 53, 46 alphabetic symbols; 149/149 correct; all punctuation and case preserved, exact encryption replay. UTF-8 SHA256 of the three decoded lines joined by LF with no terminal LF is `e72c705e51ec5986893e0425eb7ae928f0000cc53817df3597a5226bdcbcb599`. A cyclic 13-value prefix-only key fails immediately at alphabetic offset 13 of each line. This is a deterministic reconstruction of a published solved example, not a blind discovery.

Reproducer (Python stdlib; source strings from ClevCode stage 2, lines beginning Ukbn/mjotukj/yh):
```python
from hashlib import sha256
title = "a2e7j6ic78h0j7eiejd0120"
key = [int(x, 36) for x in title]
assert key[:13] == [10,2,14,7,19,6,18,12,7,8,17,0,19]
def transform(line, key, sign):
    i = 0
    out = []
    for x in line:
        if x.isascii() and x.isalpha():
            b = 65 if x.isupper() else 97
            out.append(chr(b+(ord(x)-b+sign*key[i%len(key)])%26))
            i += 1
        else:
            out.append(x)
    return "".join(out)
# Set lines to the three published ciphertext lines in chronological order.
def check(lines):
    decoded = [transform(line, key, -1) for line in lines]
    assert [transform(line, key, 1) for line in decoded] == lines
    assert sha256("\n".join(decoded).encode()).hexdigest() == "e72c705e51ec5986893e0425eb7ae928f0000cc53817df3597a5226bdcbcb599"
```

## LP2 typed-input gate

Inspected supplied original scan 32.jpg (physical LP2 p15). Its 4×4 decimal grid has 16 cells, with a red starting cell and an infinity glyph beneath. The two red rune runs have 9 and 11 runes and are not a co-registered second representation of 16 values. The remaining text is the candidate recipient, not an independently supplied symbolic prefix witness. The established p15 rule `abs(3301-prime(F+1))` can explain the numeric cells and extrapolate, but nothing here determines whether to shift GP29, how to map the numeric sequence into shifts, whether to use absolute differences or inverse prime indices, or how to reset. The historical evidence gives no resolution of those choices.

The exact 2012 transfer requires paired visual and textual key representations (one partial, one complete), followed by a separate ciphertext. The p15 layout lacks that independent paired register; the historical example also does not literally use a recursive numeric-construction algorithm as a later key generator. Thus it is an informative near precedent but fails the stricter #3216 source gate. No speculative Fibonacci sweep performed, no unknown plaintext recovered. Reopen only on an actual paired key register or authored construction-to-operator instruction with a typed original recipient. Existing p15 established results unchanged.
