# Source-numbered red13 64-bit LCG: direct original p0 inverse is negative

**Agent10, 18 November 2026. Status: intermediate original-cipher negative; no plaintext, key or destination.** This tests one plausible but **unattributed** 2014-human operation, distinct from earlier fixed red-title Vigenère, p15 Fibonacci-index and externally seeded PRNG families.

## Concrete original clue and minimal mechanism

The original first page p0 begins with **13 red GP29 runes**, printed as two groups of eight and five and followed by a **red 13-dot delimiter**. Their GP29 transliteration is `SHEOGMIAFSYENGC`. The source-reproduced 2013 signed `BASE29` server shows that positional radix conversion was a recognized historical operation. These 13 GP29 digits fit into an unsigned 64-bit machine word without truncation.

The manuscript's independently printed **3301** and **1033** numbers are prominent first-party inputs. Test whether the red13 numeral is a seed for a natural 64-bit linear congruential keystream, using the two numbers as multiplier/increment. This is an **exploratory hypothesis**: the book does **not** explicitly prescribe a 64-bit LCG, choice of word endianness, mapping to GP29 or decryption sign. Consequently a lack of linguistic output is a bounded negative and not proof about all PRNG architectures.

Freeze only source-small conventions: red glyph order as big-endian or little-endian base29 integer; recurrence `x←3301*x+1033` or `x←1033*x+3301` modulo `2^64`; emit the low-state `x mod29` or high 29-bit `(x>>35) mod29`; emit before or after state update; and use either ordinary GP29 additive decoding sign. Exactly **32** models. Do not optimize parameters on ciphertext, vary seeds, change the generator to rescue failures, or apply ad hoc F-bypass rules.

The two exact original seed integers are **5412445423142629857** and **2033242057252411977**. The cipher starts at the first black rune immediately following the original 13-rune heading and runs continuously into p1–2.

## Original receiver and held-out prediction

- **Source:** immutable `resources/liber-primus/lp2-corpus.json` and the image-adjudicated `resources/liber-primus/lp2-ink-annotations.json`, original scan `17.jpg` and following pages.
- **Selection interval:** p0 black body = **249 original runes**, after its actual red13 heading. The LCG parameters and 32 readout models are predeclared independently of p0 output.
- **Untouched continuation:** p1–2 = **467 original runes**, using the *same* uninterrupted keystream clock, with no reset or fitted phase. This original held-out section was not used to rank models.
- **Scoring:** native GP29 index of coincidence (IoC). Original p0 body = **0.03436325949**, p1–2 = **0.03427962246**, and genuinely clear solved LP2 p57 = **0.06270996641**. A coherent recovered English passage must present sustained original-language statistics and intelligible text, not merely exact arithmetic reencryption.

All 32 inverses remain flat. The best configuration **selected only on p0** is base29 *least-significant-first*, `x←3301x+1033`, high-29-bit readout, emit state **before** update, subtract the key. Its original p0 IoC is only **0.03646845446**, and its untouched p1–2 IoC is **0.03427043222**. The second-best original p0 score is **0.03637129162**; all 32 are below **0.045** on *both* selection and holdout. The best training result decodes to the nonlinguistic initial stream `HLTGEOAUUOEMTHGWNRHCWHHOHFGCPOLXINLFWOEOUNGUEAURDRGNBRJJIAIPTRRXEOAEIARONGIANGEOUJE...`, not a proposed plaintext.

As a *distinct constructive control*, all 32 keystream configurations correctly reencrypt and recover the **95/95 actually clear source-native runes** of solved p57. The original 716/716 rune forward-inverse arithmetic also round-trips under every setting. These are implementation controls, **not** authentication of the cipher.

## Decision

**Retire the exact red13-base29 / 3301–1033 unsigned64 LCG hypothesis under its 32 source-small direct GP29 additive readouts.** It supplies neither plaintext in p0 nor held-out language on p1–2. A novel key-state generator derived only by additional guessed constants would be less credible than recovering an author-visible instruction or a typed output. The historical `BASE29` fact motivates the seed encoding, but does **not** imply the manuscript used an LCG. This result does not exclude different CSPRNGs, encodings, external keys, skipped clocks or encrypted intermediate registers.

**Reproduction:** [single Windows Node22 CommonJS source file](../sims/lp2_p0_red13_base29_lcg3301_1033_sft.cjs). Its source-native seeds, red-ink framing, authentic source plaintext plant, both whole original intervals and 32 configurations are asserted. The original 32-model numerical result was independently calculated on the exact GitHub corpus before writing the reproducer. The subsequently dispatched [Windows Node22 source-exact run 44333572215](https://github.com/FlareZ123/liber-primus/actions/runs/44333572215) **passed** the entire 32-model, source-alignment, original-roundtrip and authentic p57 positive-control test.
