# LP2 original pointer-direction 000: same-key cross-window transfer and clock bound

**Decision (17 November 2026): the strongest registered source-key overlap does not permit one continuous key-pointer clock.** In exact original convention **000** (`h=0,m=0,c=0`) across adjacent original source segments `seg0.7` and `seg0.8`, the same registered **`3301 * p_n`** key/multiplier/model appears in the top50 initial hits for *both* independently scored 300-rune windows. Its initial IoCs are 1.3197 and 1.3294, both already below the preregistered native-language cutoff 1.40. More decisively, its **two source-frozen key offsets are separated by 4,606 indices**, while the actual pointer-direction mechanism can advance by at most **2,187 indices** across the 729-rune first segment. This rules out a single uninterrupted instance of the source-specified convention/key across the boundary, even if either independent-window reading later appeared structured.

## Source-fixed data and independent matched controls

The entire [source-frozen original stage1 run 44006868510](https://github.com/FlareZ123/liber-primus/actions/runs/44006868510) has completed all 12 `000` shards: 132 original real rule/orientation TSVs and 132 source-generated matched-random TSVs. Each TSV retains the exact top **50** registered 581-stream/offset/GP29-sign/model hits across first300 runes in two original source segments. No new key candidates or offsets were sampled.

In each of the 132 vectors, group its 50 source hits by exact key **name + GP29 sign + anti-repeat model**; retain only identities present in both `seg0.7` and `seg0.8`. Define its score as the smaller of the two first300 IoCs. Under this same statistic:

| Original input role | Vectors | Same-key/mult/model paired appearances | Compatible with uninterrupted 000 key pointer |
| --- | ---: | ---: | ---: |
| **Actual LP2 ciphertext** | 132 | **22** | **3** |
| **Original registered matched-random controls** | 132 | **19** | **3** |

The strongest actual original pair is `A_prev_f_fwd.tsv`, `3301 * p_n`, **GP29 multiplier28**, **skip model0**, `seg0.7` offset **10,754**, IoC**1.3197**, and `seg0.8` offset **15,360**, IoC**1.3294**. The strongest matched-random pair has minimum score **1.2932** (key `RANDOM 174`), but this is a post-selection maximum over 132 source rule/orientation vectors, not an independent probability estimate. The strongest **clock-compatible** actual overlap has minimum IoC **1.2706**, compared with **1.2738** in matched random: no recognizable original-only key signal.

## Exact key-pointer necessary condition

The pinned independent original [pdir specification](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen/pdir_ref.py) defines convention `h=0,m=0,c=0` as **read the current pointer first; no inter-word movement; backward collision compares the previous emitted rune**. Each successful emitted rune advances the absolute key index in its word's sign by **1, 2, or at most 3** (skip/coin retries). No wrap or hidden 4,606-step jumps occur. The original [source window exporter](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/kscreen/export.py) labels these consecutive original sections `seg0.7` and `seg0.8`, with the second carrying the preceding boundary rune from first.

An uninterrupted key with no unselected reset therefore necessarily satisfies

[
|j_{0.8}-j_{0.7}| \le 3\times729 = 2{,}187.
]

For the actual matched source hit, `15,360 - 10,754 = 4,606`, which exceeds the upper bound by **2,419**. The absolute bound deliberately ignores word-direction cancellations and so favors the claimed key. Among **22** source-registered original paired-key examples, only **3** satisfy this necessary bound; the matched random has the same **3/19**. This excludes cross-section continuity for the remaining pairs **under original convention000**. It does not exclude a new key reset or independently authored section-specific key start, but the book has not supplied either offset for this attempt.

## Exact reproducibility and pending original decoder

[Single-file source-input reproducer](../sims/lp2_pdir_000_twosegment_clock_gate.py) accepts the **12** exact `pdir-stage1-000-0.zip` through `pdir-stage1-000-11.zip` artifacts under `--artifacts`, which can be downloaded individually from the completed [44006868510 run](https://github.com/FlareZ123/liber-primus/actions/runs/44006868510). It checks all 264 TSVs, 50 records each, 22/19 paired hits and 3/3 original/control clock-compatible hits and the exact selected source key/offset. No heuristic language model, unrestricted decryption, or post-hoc key fit enters this mathematical exclusion.

A separate source-pinned [actual full original section decoding run 44027294656](https://github.com/FlareZ123/liber-primus/actions/runs/44027294656) was dispatched with **exactly those frozen first300 hits**, both unmodified original segments, original `3301*p_n` key, convention, sign and model, full-section IoC and 20 same-key random-offset controls, using [this fixed workflow](../.github/workflows/agent12-pdir-3301-prime-crosswindow-original.yml). Its result, if it completes, answers the *independent reset* variant. A prior workflow run44026715131 failed before decoder work because the artifact downloader changed its containing directory; the source was unchanged and the file discovery was corrected in the committed workflow.

**Decision:** Avoid presenting the 4,606-offset key coincidence as a genuine global pdir key mechanism. It already fails the exact no-reset index-motion necessity; the source's paired score distribution also resembles matched random and neither first300 score meets 1.40. If the fixed full-window test independently returns coherent plaintext, it must explain section-specific key resets and pass an untouched original section before promotion.
