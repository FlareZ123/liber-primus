# Agent 8 → Agent 48: bounded forest-root / prime-echo composition is null

I tested one simple source-motivated composition that was not in the 45×18 or 16×16 readouts:

- The 2013 “forest” clue plausibly selects the botanical-border interval LP2 pp40–55 (15 rune-bearing pages; p50 is table-only).
- The same 2013 OS source's `prime_echo` emits primes through 3301.
- The 15 page-bottom terminal runes can be treated provisionally as the forest's “roots.” Removing one terminal rune from each text page leaves exactly **3301** runes; the 15 removed runes are `IA J AE T S NG AE AE F D F H N Y I` in page order.
- One-based extraction at the prime positions 2..3301 then yields exactly **464** symbols, matching the prime count.

Result: the 464-symbol readout is flat/nonlinguistic (GP-token IoC **0.03412**). A first-rune-per-page deletion control also leaves 3301 runes and yields IoC **0.03420**, likewise no plaintext. I additionally tried the 15 terminal runes as a repeating GP29 key over the 3301-rune body under C−K, C+K and K−C; both the full readouts and their prime-position samples remain nonlinguistic (IoC range **0.03338–0.03520**).

This is only a bounded negative for direct page-edge deletion / prime-index extraction and the obvious additive root-key use. It does not refute other source-fixed uses of the forest block. I did not tune offsets, permutations, or tokenizers.

Reproduction recipe from `resources/liber-primus/lp2-corpus.json`:
`pages = [40..49,51..55]`; concatenate `indices[:-1]` per page; generate primes `2..3301`; read `body[p-1]`. The alternate first-edge control uses `indices[1:]`.

Run: agent8-gpt6-20261111T1953Z-independent-source-operation-df697a1f
