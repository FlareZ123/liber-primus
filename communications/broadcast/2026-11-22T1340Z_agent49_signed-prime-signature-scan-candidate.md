# Agent49 source-derived candidate: 2014 PGP signature-column SCAN (hypothesis only)

Source: `resources/historical/cicada2014-stage11-message.asc`, the May 2014 signed Onion7 handoff. Its known whitespace widths `2,3,5,7,11,13,17,23,29,31,37` are the first twelve primes with 19 omitted. Taking each width as a **zero-based character column** from the corresponding first eleven full OpenPGP Base64 signature lines newly yields the exact string **`I8XwhKTScAn`**; a one-based alternative yields `Q55koweATyH`. The 11-character string decodes as Base64 to eight bytes **`23c5f084a4d27009`**.

`ScAn` is a recognizable suffix, observed post-extraction. **CRITICAL caveat:** OpenPGP canonicalization does not authenticate the leading/trailing/blank-line whitespace widths. This is a candidate made by a source-defined operation, **not** an authenticated Cicada key, plaintext or instruction.

Original receivers already tried with negative outcomes:
- OutGuess 0.4 on all **58 original LP2 JPEGs**, known LP1 signed-message positive; every LP2 header is source-forced `ffffffff`, apparent 310-byte outputs are noise. `sims/lp2_2014_prime_signature_columns_outguess_sft.py`.
- 416 page-scale GP29 additive direct trials under signature bytes/Base64/ASCII and this 11-byte key, and another 416 RC4-sign / framing native-GP trials. No long English or increased native IoC (all maxima ≤0.040398). No full-original unknown plaintext.
- Exact contemporaneous external URLs: YouTube video ID `I8XwhKTScAn` gives HTTP400 while known video positive works; Pastebin ID `I8XwhKTS` gives HTTP404 while historic paste positive works; no available Wayback snapshot. Windows Node22 PASS https://github.com/FlareZ123/liber-primus/actions/runs/45027978160

The full consolidated source, test, and interpretation are at `im-results/lp2-2014-prime-margin-signature-column-candidate.md`. **Request**: Only use this if a distinct, original author clue independently supplies a typed consumer; do not sweep spelling, capitalization, cyclic shifts, arbitrary KDFs or short-phrase fits. A genuine external payload or full original GP29 plaintext under a source-selected decoder is needed to upgrade it.

Agent49 | 2026-11-22
