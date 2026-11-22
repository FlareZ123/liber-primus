# Original 2014 LP1 page 05 (archived as `0_wisdom`): source and transcription

**Evidence class:** third-party transcription of an original puzzle-page image; the image is primary. The copied text below is a reference input, not an independent OCR or a claim that the external transcription is error-free.

**Legacy path note:** this file retains the historical path `resources/external/2013-0-wisdom-source.md` because existing reproducible scripts and reports link to it. The filename is not a date and must not be treated as evidence of a 2013 page.

**Dated provenance correction (12 November 2026):** The image named `0_wisdom.jpg` (Git blob `2829e13812015601ff1014cb4427587b4a8aa3a6`) is byte-identical to the complete **2014 Stage04 original LP1 page-05 binary**, separately archived as `server-status.bin` (673,066 bytes, same Git blob). The complete 673,066-byte object is exactly a 336,353-byte JPEG prefix, a 360-byte OOB field (`\n\na` plus 357 hex characters), and a 336,353-byte suffix equal to the byte-reversed JPEG prefix. Reversing and hex-decoding the full OOB field yields the pinned 179-byte matrix with final LF; the 357-character subwindow yields the same 178-byte text without LF. The reversed suffix is not an independent payload. Both are contained in the *same original 2014 source artifact*. Its earlier appearance in 2013 has not been established by any timestamped independent source. The actual 2013 Cicada OS `/tmp/wisdom` and `/tmp/folly` paths resolve to the **same byte-identical 3,368-byte high-entropy binary** in the archived extraction (Git blob SHA `62b1b949a1e4e4a346e75b1c34101000d3c53220`); they are not this 673,066-byte LP1 page-05/Stage04 object. The lossless base64 copy and bounded classification are preserved in [the 2013 OS binary report](../../im-results/2013-os-wisdom-folly-source-classification.md) and [resource payload](../historical/cicada-2013-os-wisdom-folly.bin.b64). The old “2013→2014 cross-round relation” was unsupported chronology; the exact 25/25 prime-sum equivalence remains established. [Exact original-byte SFT](../../sims/stage04_original_server_status_square_sft.py) · [Successful CI](https://github.com/FlareZ123/liber-primus/actions/runs/43126749975).

## Pinned source

All links below are from `krisyotam/cicada3301` at pinned commit [`76d3ee8c762f60025822c8c05edbf31351636469`](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469).

- Original image: [`0_wisdom.jpg`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/LiberPrayground/pages/0_wisdom.jpg) — Git blob SHA `2829e13812015601ff1014cb4427587b4a8aa3a6`.
- Raw rune transcription: [`0_wisdom.txt`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/LiberPrayground/pages/0_wisdom.txt) — Git blob SHA `320257b0db6ee6326ef3fc216c5379c9c91694f3`.
- External solved transcription: [`solved_0_wisdom.txt`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/tools/solvers/LiberPrayground/pages/solved_0_wisdom.txt) — Git blob SHA `2a30e8a8083b60f853d0860f024d17eb27241119`.

The solved transcription renders the prose as “the primes are sacred”, “the totient function is sacred”, and “all things should be encrypted.” These readings are useful context, but the original image remains the primary evidence.

## Raw rune transcription

Copied verbatim from the pinned external `0_wisdom.txt` transcription:

```text
ᛋᚩᛗᛖ•ᚹᛁᛋᛞᚩᛗ⁜ᚦᛖ•ᛈᚱᛁᛗᛖᛋ•ᚪᚱᛖ•ᛋᚪᚳ
ᚱᛖᛞ⁘ᚦᛖ•ᛏᚩᛏᛁᛖᚾᛏ•ᚠᚢᚾᚳᛏᛡᚾ•ᛁᛋ•ᛋᚪ
ᚳᚱᛖᛞ⁘ᚪᛚᛚ•ᚦᛝᛋ•ᛋᚻᚩᚢᛚᛞ•ᛒᛖ•ᛖᚾᚳᚱᚣ
ᛈᛏᛖᛞ⁜

ᚳᚾᚩᚹ•ᚦᛁᛋ⁜
272        138      ᛋᚻᚪᛞᚩᚹᛋ  131       151⁘
ᚫᚦᛖᚱᛠᛚ  ᛒᚢᚠᚠᛖᚱᛋ  ᚢᚩᛁᛞ     ᚳᚪᚱᚾᚪᛚ    18⁘
226        ᚩᛒᛋᚳᚢᚱᚪ  ᚠᚩᚱᛗ     245       ᛗᚩᛒᛁᚢᛋ⁘
18         ᚪᚾᚪᛚᚩᚷ   ᚢᚩᛁᛞ     ᛗᚩᚢᚱᚾᚠᚢᛚ  ᚫᚦᛖᚱᛠᛚ⁘
151        131      ᚳᚪᛒᚪᛚ    138       272⁘
```

## Use and limits

The raw table contains 12 numeric cells and 13 GP-rune word cells. Replacing each word cell with the sum of its constituent GP prime weights reproduces the archived 2014 stage04 5×5 magic square cell-for-cell. This is a within-artifact numerical expansion of the printed rune table in the same original 2014 LP1 page05 binary. No earlier 2013 image witness is established. It does not decrypt unknown LP2 ciphertext.
