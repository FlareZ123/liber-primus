# Six signed THE-followers as one native 28-rune key

Director #2510, Agent21. **Bounded negative original inverse, no new plaintext.**

The p28 conditional DH23/H→THE bridge selects the six authenticated THE-followers in signed 2016 text: PATH DEVOTED WAY MAP ROAD DIRECTION, in that order. We preserve this selection rather than re-fit its 130-position or D4 family. A distinct concrete key interpretation is possible: use the entire ordered follower phrase as a single GP29 Vigenère keyword. In the native Cicada spelling V→U, TH→single rune, IO→single rune. The last convention is independently attested in solved WELCOME's ILLUSIONS and INSTRUCTION, WISDOM's FUNCTION, the loss-of-divinity text's CONSUMPTION/DECEPTION/PRESERVATION, and jpg229's CWESTION. This is not a post-fit spelling choice. The six lengths are [3,7,3,3,4,8], total **28**, matching the candidate p28 origin. The source does not explicitly say Vigenère, so the length match is a motivated exploratory receiver hypothesis, not independently established authorship.

The [pre-execution issue comment](https://github.com/FlareZ123/liber-primus/issues/2510#issuecomment-7124072687) fixed the complete key, receiver and clock before opening the target values:

```
key = [13,24,2, 23,18,1,3,16,18,23, 7,24,26, 19,24,13,
       4,3,24,23, 23,10,4,18,5,16,27,9]
P_i = (C_i - K_t) mod 29
t starts at 0 on the first physical p29 rune and runs continuously
through p31, with no phase, order or receiver fitting.
```

One standard clock increments for each rune. The second is the historically attested plaintext F bypass: F (GP0=0) emits F without key consumption; a non-F plaintext emits its encrypted value, possibly F, and increments the key. For the latter, use exact dynamic programming over key phase and two-rune language context, allowing both possible meanings of every cipher F. A non-F cipher rune with decrypted value F is impossible. State merging preserves every feasible phase/context; no heuristic beam cutoff. A smoothed conditional trigram model is trained on the eight other independently solved native records, not the target or the positive donor.

## Actual original computation

| Clock | p29 (277) | Withheld p30–31 (532) | Full 809 |
|---|---:|---:|---:|
| Ordinary IoC | .034139068 | .034903643 | .034586153 |
| Ordinary mean trigram log score | -3.621581 | -3.656868 | -3.645747 |
| Literal-F bypass | **no legal path by rune 47** | not reached | impossible |

Ordinary replay is exact, but the result is nonlinguistic; a preview starts EEARWIAMPIEOIAEAIAIAYTEOEOEPUDJIAEOEAH. The F-bypass failure is a key-and-clock-specific exact feasibility result, not a low-language-score judgment: all paths die at position 47 (maximum live states 2). There is no valid plaintext under this exact historical clock/key pairing.

Positive control: plant the same keyword on the independent solved 755-rune loss-of-divinity section. Original native plaintext IoC .061215241 and mean trigram -2.979015. Ordinary inverse recovers all 755 exactly. Literal-F inverse has maximum 12 live states, four at termination, selects 750/755 exact plaintext runes with mean trigram -2.969973 and exact forward replay. Do not call the ambiguous five errors exact recovery; this plant demonstrates valid bypass handling, not uniqueness.

Execution was performed in JavaScript against the original source corpus and independent native controls; [standalone CommonJS reproducer](../sims/lp2_signed2016_followers28_key_original_sft.cjs). Scope is the exact six-word concatenation, native spelling, fixed zero phase, historical subtraction, original pp29–31. No adjustment after evaluation.

## Decision

No original plaintext or key. Retire the 28-rune concatenated follower keyword with these two fixed clocks. Earlier #2281 already ruled out an independently selected six-opcode program, #2377 rules out the uniform GP0/GP-prime table direction grammar, and #2018/#1785 bound register cutoff and topology label ambiguity. The historical 2013 BASE29/DH/NEXT grammar does not specify a text-to-key instruction for this signed phrase; DH parameters in the worked example are participant-selected, and NEXT stores supplied text. Preserve the source-local p28 scaffold as conditional evidence, not a recovered decoder. A successor needs independently specified operator/state/receiver, not a phase search or another re-assignment of the follower words.
