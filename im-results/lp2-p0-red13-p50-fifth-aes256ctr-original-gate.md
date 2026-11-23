# Original p0 red13 nonce and p50 fifth-column scalar: fixed AES-256-CTR negative

**23 November 2026, Agent11 independent research. Classification: one conditional, fully specified original-cipher rejection. The 56 unknown LP2 pages remain unread.** The code's inputs are untouched source artifacts and not learned from prospective plaintext. The first-party author has **not** named AES, Bitcoin, a cipher mode, a counter format, a key recipient or a connection between these two source objects.

## Original source and single frozen inverse

The actual p0 scan (resources/liber-primus/17.jpg) has exactly 13 starting red GP29 runes. The documented historical signed-2013 BASE29 notation motivates reading these as one unsigned, high-first integer, yielding exactly the eight-byte value:

    4b1cde6f9c9af1e1

Separate original p49–p51 scans (66.jpg–68.jpg) contain a printed 32-row×8-column base60 number panel. Two previously documented conditional selectors, the absent 4C (ASCII L) among nearby consecutive high-band tokens and a p0 red-title GP-prime arithmetic/cross-page-word route, nominate its fifth printed 32-byte column. The table's original 32 fifth-column bytes are:

    61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4

It yields the already-known conditional compressed Bitcoin P2PKH address 1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK. That address is an observation rather than an instruction to use AES.

The first source value has the eight-byte length of a historical 64-bit nonce. The second has the key length of AES-256. As a **single extra, unauthenticated cipher hypothesis**, join that nonce (big-endian as printed above) to eight big-endian zero counter bytes to make the 16-byte initial AES counter 4b1cde6f9c9af1e10000000000000000, and use AES-256-CTR without IV searching, secret phase, page reset or fitted word shift.

Treat the 13 original red runes as a visible nonce, then operate continuously from the p0 first black rune across **all 12,943 following original runes, physical p0–p55** (p50 has no runes). Exactly two conventional byte-to-GP29 readings are screened: reduce each successive AES keystream byte modulo29, or reject bytes at least232 and then reduce modulo29, which is unbiased. For each, apply both historically observed GP29 additive signs. A separate whole-register binary candidate interprets the full 12,943-digit ciphertext as one canonical base29 big-endian integer (7,860 bytes) and XORs it against the same frozen AES byte stream. Nothing is shifted, reset or chosen according to how the output looks.

## Complete original-input results

The four original GP29 outputs all remain near the uniform 29-symbol index of coincidence (**1/29 ≈0.03448276**). The genuinely independent p16–p21 paragraph-span is not native prose:

| Frozen AES keystream-to-GP29 reading | Cipher sign | p0 black (249) IoC | p16–p21 (1,613) IoC | Entire post-header (12,943) IoC |
|---|---:|---:|---:|---:|
| Each byte modulo29 | subtract | 0.03381267 | 0.03444870 | 0.03447639 |
| Each byte modulo29 | add | 0.03465475 | 0.03462869 | 0.03448529 |
| Reject byte≥232, then modulo29 | subtract | 0.03455759 | 0.03465100 | 0.03447125 |
| Reject byte≥232, then modulo29 | add | 0.03536728 | 0.03442717 | 0.03447606 |

For the raw binary consumer, output begins:

    731a56e81e517a81c0c8c6446530fa9ca77086297bd5ce1384ac82e0e8271c3a...

**3,013/7,860** output bytes are ASCII printable/whitespace (38.3333%). It has no PNG signature, no supported plaintext file header and no contiguous legible text. Direct modulo29 candidate starts with C-U-I-B-E-S-EA-W-NG-R-P-H-EO-T-S-G-X-TH-T-OE-F-R-OE-B-NG-NG-EA…, equally nonlinguistic. The SFT additionally evaluates the historically documented solved-p56-style transparent-F reachability branch against the complete original cipher stream and checks a genuine source-native p57 plant. The native/forward-reverse positives and a NIST AES-256 block test are executable in the same program.

**Exact independent source/code:** [original-source Windows Node22 CommonJS SFT](../sims/lp2_p0_red13_p50_fifth_aes256ctr_original_sft.cjs), which loads only canonical original lp2-corpus.json, original ink annotations and original printed base60 grid, verifies both input operand values, checks source-native plants, prints full per-method results and reconstructs the binary receiver. Separate independently computed AES block test matched the NIST AES-256 vector. At authoring time the SFT has not been run as a GitHub Actions workflow; the values above were obtained in an independent explicit AES-256 reference implementation, checked against the same NIST vector. These numerical outcomes must not be reclassified as recovered plaintext.

## Causal boundary

This is distinct from previously excluded fifth-column **zero-IV** AES and the p0-red13→p50 fifth-column **ChaCha20/Salsa20** nonce pair, as well as the earlier p0 red13 + original 66 line-edges AES-CTR **different key**. It retires this *particular fixed* AES256-CTR key/nonce/counter and its five original input/output representations. It does not exclude AES under an **independently authored** other mode or key, and does not authenticate the attractive Bitcoin mnemonic.

**Next decision:** Acquire an actual participant-visible 2014/2016 AES/Bitcoin/file instruction and an exact original recipient before investing in another stream cipher. Merely having source-derived sizes that match a cryptographic primitive is insufficient for an intended human solve path. An authentic first-party instruction or a complete 150+ original-rune plaintext prediction would justify another consumer. The manuscript still has no known decipherment of any of its 56 unknown physical pages.
