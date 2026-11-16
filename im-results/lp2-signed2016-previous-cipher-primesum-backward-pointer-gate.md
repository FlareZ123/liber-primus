# Signed 2016 word-number direction as a backward-moving 2014 prime key

**Status (16 November 2026):** one fully specified original-source cipher is impossible after 35 physical LP2 runes with *all* transparent-F possibilities admitted. This is a bounded negative for a pointer-movement hypothesis, not recovered plaintext or a claim about other 2016 interpretations. Director [#1193](https://github.com/FlareZ123/liber-primus/issues/1193).

## Motivating clue and alternative

The original 2016 image contains a PGP-verifiable instruction: “Its words are the map, their meaning is the road, and their numbers are the direction.” The 2014 solved LP1 *Some Wisdom* actually uses sum-of-GP-prime rune values. The authentically deciphered LP2 p56 establishes an independent, precise prime-totient keystream with a transparent F exception. These furnish a real numerical word operation and a reusable historic stream.

**Hypothesis fixed without scoring LP2:** the *previous ciphertext word's* GP-prime sum decides the next word's travel direction through the successive prime-totient key: prime means backward, composite means forward. Prime is the exceptional/backtracking condition. Initialize at prime 2 (zero-based position 0) and traverse the first word forward. Encryption is the p56 operation `C = (P + (prime−1)) mod29`; a literal plaintext F becomes ciphertext F and consumes no key symbol. The key has no wrap or invented page reset. All 2,896 authentic printed words and 32 cross-page words are preserved. Every alternative interpretation of a ciphertext-F rune is admitted by exhaustive state merging.

This exact prime/backward convention is **not specified by the signed message**; parity and opposite direction are plausible alternatives. The signed message postdates the 2014 LP2 distribution. The competing explanation is semantic, geographic or manuscript-order guidance rather than a wordwise cryptographic pointer.

## Reproduction and decisive result

- [CommonJS source-exact decoder and forward encoder](../sims/lp2_signed2016_backward_prime_pointer_ftransparent_sft.cjs). Inputs: `resources/liber-primus/lp2-corpus.json` SHA256 `7f311254d406b755df39510b8b3f4e53d7dfaea87a0320074c16507d46a07522`; `lp2-transcription.txt` SHA256 `57d123515bc5310774913ce3b1bc27e18bfb695ac3f732f076a13bc8339fcd04`.
- Run the script from the repository root under Windows Node 22. No flags or external model files beyond the repository's native Shakespeare control.
- [Passing original Windows Node22 Action 43809190188](https://github.com/FlareZ123/liber-primus/actions/runs/43809190188), including the matched-null extension; [initial independent positive run 43808988848](https://github.com/FlareZ123/liber-primus/actions/runs/43808988848).

| Source | Original or control size | Exact decision |
|---|---:|---|
| Original unknown LP2 pp0–55, printed whole-word continuity | 12,956 ciphertext runes / 2,896 words | No legal path past original rune index **34** (zero-based): at index **35**, word index 6, within-word index 1, pointer direction −1, the exact DP has **zero reachable cursor states**; maximum surviving width was 3 |
| Original first source chapter pp0–2 | 729 runes / 158 whole words | Same first failure at rune index **35**, independent of later pages |
| Word-rotation control preserving each printed word's exact GP-prime sum, length and ciphertext-F count | 12,956 runes | No legal path past index **2**; first failure at index **3**. This control demonstrates the high source sensitivity and is not itself a null-significance test |
| Authentic solved original p56 | 85 ciphertext runes | Independently known solved prose encrypts to the **exact original 85/85**; reachable decoder contains valid states, including F transparency |
| Independent source-native Shakespeare plant | 12,956 runes cut at all 2,896 original word lengths | Key cursor starts at 100 to avoid the source-dependent early negative boundary; **956 direction changes**, **273 plaintext-F bypasses**, complete exact forward re-encryption, and the DP keeps the planted path to 12,956/12,956 (maximum state width 14) |

The p56 control tests the original p56 arithmetic and literal-F exception; its single all-rune segment does not prove the 2016 interword direction rule. The Shakespeare plant demonstrates that the pointer mechanism and exact skip-aware reachability admit long genuine native-GP inputs when the starting cursor is valid. The plant's shifted cursor is a controlled test fixture only; the original hypothesis remains pinned to zero.

## Decision

**Retire only the initial-index-zero, no-wrap, prime-sum-backward / composite-forward, previous-ciphertext-word pointer over the p56 prime-totient source.** The actual original fails as an exact impossibility, so no language score, postselected word deletion, or approximate reencryption can rescue this specific mechanism. The other direction conventions enumerated externally and independent source streams have not been tested here. New dependent work needs an independently visible convention or an original plaintext/key prediction; the 2016 quotation alone does not choose one.
