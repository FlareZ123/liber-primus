# Pre-2014 base-60 alphabet reference: MIRACL (February 2007)

## Primary source

- **Title:** *MIRACL User's Manual*
- **Publisher:** Shamus Software Ltd.; copyright 1998–2007 Michael Scott and Shamus Software Ltd.
- **Date on document:** February 2007
- **Source PDF:** https://citeseerx.ist.psu.edu/document?doi=83470024cd38f5300bdc77ae4ec09ca8cf177daf&repid=rep1&type=pdf
- **Relevant passage:** User Interface section, around the discussion of `IOBASE` and integer input/output (PDF text lines 1434–1454; printed page 28).

The manual states: “Numbers up to base 60 use as many of the symbols 0–9, A–Z, a–x as necessary.” It treats base64 separately. This is a positional arbitrary-radix integer convention, not merely a case-insensitive identifier alphabet.

Exact digit order:

```text
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx
```

Thus `0=0`, `A=10`, `Z=35`, `a=36`, `f=41`, and `x=59`; `3D` is `3×60+13 = 193` in base60.

## Independent pre-2014 corroboration

*Sendmail*, 3rd edition (December 2002), §11.2.1, documents the same exact alphabet for Sendmail V8.10–V8.12 queue-identifier fields and explains the date/sequence fields:

https://docstore.mik.ua/orelly/other/Sendmail_3rd/1565928393_sendmail3-chp-11-sect-2.html

This corroborates that the ordered alphabet was in practical technical use before Liber Primus. It does not by itself show that Cicada used Sendmail.

## Relevance and limit for Liber Primus

The alphabet exactly matches the candidate base60 alphabet of the original pp49–51 two-character table. It therefore gives base60 a concrete, pre-2014 technical precedent and makes it the stronger conventional working interpretation over the analyst-created alphabet that omits lowercase `f`.

No examined Cicada artifact references MIRACL or Sendmail, and the signed 26 January 2013 TCP challenge specifies `BASE29`, not base60. The external match is **not creator authentication** and does not establish how the resulting p50 bytes are used. Retain the f-omitting base59 reading as a live alternative until a Cicada-specific clue or independent original-cipher inverse discriminates the intended radix.

## Reproduction

`sims/p50_miracl_base60_alphabet_match_sft.cjs` derives sample token values and the 104-byte physical-p50 block digests from `resources/liber-primus/base60-grid.json`. It reports data fingerprints only; it does not claim a recovered key or plaintext.
