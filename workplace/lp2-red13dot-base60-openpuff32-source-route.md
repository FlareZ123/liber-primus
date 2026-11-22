# Red-rune / physical thirteen-dot run lengths: one frozen historical OpenPuff key route

**Scope and evidentiary classification (16 November 2026):** This is an exploratory **source-to-password** hypothesis, not a decipherment, a hidden-file finding, or a verified original Cicada instruction. The exact candidate was frozen and its native test submitted before any original-carrier output was read. A result must meet the actual historical decoder's native file-extraction criterion, not just round-trip arithmetic or a numerological count.

## Independent visual operands and causal route

The physical LP2 pages p0–p57 have **225 ink-red GP rune glyphs** and **31 original *thirteen-dot* punctuation marks** (30 red, one black on p7) documented in `resources/liber-primus/lp2-ink-annotations.json`. Their **256** combined events are an exact count checked against the 2014 original JPEGs by the existing independent image SFT; the separately measured 4 red ten-dot and 1 red 23-dot marks are intentionally excluded because this hypothesis selects one visible dot species. The original p49–51 number field, separately source-visible, consists of **32 printed rows of eight base60-encoded byte cells**. Its explicit base60 60-character alphabet is stored in `resources/liber-primus/base60-grid.json`.

A possible human puzzle operation is: read all pages and their red runes in published order, place all **physical 13-dot marks** into the same stream at their printed offsets, then count red runes **between consecutive 13-dot marks**. The 31 marks form exactly **32 runs**, one per printed numeric row. Intriguingly all 32 resulting counts fit one **base60 digit**, with maximum exactly **59**. The long count 59 is the ordinary cumulative run consisting of red p40 eight plus red p53 fifty-one, separated by no physical 13-dot mark; it is not a freely chosen constant.

The exact 32 run-length integers are:

```text
13 0 16 0 3 0 11 0 0 14 12 0 9 11 0 16
0 19 0 10 0 8 0 3 0 59 9 0 5 0 7 0
```

Translate these integers through the **already printed** base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` without retuning, yielding exactly the source-derived 32-character string:

```text
D0G030B00EC09B0G0J0A08030x905070
```

A 32-character A-only password could, *conditionally*, feed the **historically authenticated original OpenPuff v4.00** decoder: the 2014 Cicada puzzle previously used that application on another carrier, and an identical-version original JPEG native positive has independently succeeded. This is a puzzle-design hypothesis, **not** an authenticated command to apply OpenPuff to LP2. Specifically, the original materials do not require that the 31 separators include the black mark, that all 58 images constitute a single OpenPuff carrier, or that JPEG Maximum 1/2 is the intended bit level. These are the route's weakest assumptions and reasons to avoid a broader password permutation search.

## Frozen original-cipher experiment

The one-pass original native test has been dispatched as [manual GitHub Actions run 43879058108](https://github.com/FlareZ123/liber-primus/actions/runs/43879058108) on the original **58 LP2 JPEGs `17.jpg`–`74.jpg` in publication order**, with `A=D0G030B00EC09B0G0J0A08030x905070`, B/C disabled, **JPEG Maximum 1/2** and original OpenPuff v4.00. The same workflow first extracts a publicly authored 35-byte JPEG positive with a source-known password to establish that the native tool and GUI work. The exact A password is recomputed and asserted from original source metadata in the run; no image, byte or key has been adapted to a desired output.

Reproducible derivation: [`sims/lp2_red13dot_base60_openpuff_key_sft.cjs`](../sims/lp2_red13dot_base60_openpuff_key_sft.cjs), `node sims/lp2_red13dot_base60_openpuff_key_sft.cjs`; `--password-only` supplies the exact A string. The manual workflow's original historical-password test is unchanged by default; new input `key_source=red13dot-base60` selects this candidate.

**Decision gate:** Only a native completed extraction of nonempty original bytes (followed by meaningful content and independent checks) would establish a new path toward plaintext or key. A native corrupted-stream rejection, zero files or a genuinely failed source-key positive would not yield any LP2 plaintext. Do not rescue this exact failed candidate with variants of dot type, event order, alphabet, password formatting, image subset or bit levels without a separately visible original clue.

**Current result (16 November 2026):** Manual run [43879058108](https://github.com/FlareZ123/liber-primus/actions/runs/43879058108) completed the original OpenPuff v4.00 extraction path on all 58 LP2 JPEGs with the frozen A-only password and JPEG Maximum 1/2. The same-run 35-byte source-known JPEG positive extraction passed, but the LP2 native probe returned `native-corrupted-stream` / `Task stopped: corrupted stream`; no output file was created. This rejects the exact 32-character run-length password + 58-image order + A-only + JPEG Maximum 1/2 configuration. It does not reject other steganographic mechanisms, but no variant is justified without a separately visible original selector. No LP2 plaintext/key was recovered.
