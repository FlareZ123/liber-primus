# 2013 CicadaOS original executable semantics: no hidden key-generator in the two puzzle scripts

**Agent 20, 14 November 2026. Director #862: full executable-script grammar audit, source-exact original-input negative.** This decides the bounded premise that the known 2013 puzzle-specific executable files might contain an otherwise lost general GP29 key schedule or cryptographic opcode. They do not. All **56** unknown physical LP2 pages remain encrypted. This conclusion does not cover arbitrary generic TinyCore utilities, the distinct data files, or an unpreserved changed ISO.

## Source and independent archive

The stable original shell-script copies are `resources/historical/cicada2013-os-original-cicada.sh` (Git blob `d4798f10c44efc34cdf651d5054d2a7663c8e8a4`, 106 bytes) and `resources/historical/cicada2013-os-original-prime-echo.sh` (blob `65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649`, 12,248 bytes). The precise 65-byte original clear terminal message is `resources/historical/cicada2013-os-original-message.txt` (blob `93484d6a3612eb8032d4c38bf7ff3da0d358e9ac`).

The independently archived ISO rootfs extraction is [neuroretransmit's original 2013 bootable ISO inventory](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/README.md): the identified puzzle-specific `/usr/local/bin/` scripts are **`cicada` and `prime_echo`**, plus `message.txt` and the PGP-signed version; `/tmp/` contains binary `wisdom` and `folly`. In the unbooted ISO, `audio/761.mp3` and three `data/560.*` buffers belong to the separately documented 2013 puzzle. The unmodified `rootfs-contents/usr/local/bin/cicada` and `prime_echo` external archive files are **byte-identical as textual content** to the two repository source copies, checked independently; its `rootfs-modified/` Bash conversion is intentionally excluded.

## Exact forward model, including human-visible control

The original `cicada` script has only these actions, in this exact order:

1. `clear` screen;
2. execute `/usr/local/bin/prime_echo`;
3. `clear` screen again;
4. `cat /usr/local/bin/message.txt`;
5. `sleep 10`, then `/sbin/reboot`.

The original `prime_echo` is **464 literal, sequential shell `echo` statements**, each followed by a literal `sleep`. It neither computes primality at runtime nor reads a key, seed, ciphertext, time, external file, socket, or random device. Independent trial division over **all integers 2–3301 inclusive** gives **exactly 464 primes**, exactly those listed in the original script with no omissions or extras and no repeated prime. Every ten `echo` statements emit a newline; all other output commands use `echo -n`. Every term pauses **0.05 seconds** except printed primes **1033 and 3301**, with literal **2-second** pauses at both. These two already-known display pauses are the only timing exceptions. The **exact** original text displayed after `clear` is:

```text
@1231507051321

The key is all around you.

Good luck.

3301
```

The `@` explicitly points a 2013 solver to a period Twitter account, whose public historical content was used to solve the contemporaneous 2013 stages. The script specifies **no additional key-generation recurrence, byte stream, nonce or per-rune GP29 cipher operation**. Subsequent Twitter/feed/ISO data files are separate input assets, so this result makes no claim about whether those files contain other cryptographic or steganographic payloads.

## Reproduction and decision

[Read-only single-file CommonJS source audit](../sims/lp2_2013_original_executable_semantics_sft.cjs) reads the three source files, requires exact launcher and terminal text, rejects **every unrecognized line** in `prime_echo`, independently recomputes all 464 mathematical primes, verifies the two exception pauses and every tenth-line layout, and prints the SHA256 of all three original texts. It also accepts the automatic Windows Git-checkout CRLF conversion by normalizing line endings before checking and hashing, without altering any source values. The original 2013 terminal and documented screen output are the independently known positive control. The source-exact SFT passed [Windows/Node.js 22 run 43581679022](https://github.com/FlareZ123/liber-primus/actions/runs/43581679022); a preliminary Windows run failed only because Git checked out the original shell scripts with CRLF, which the corrected script now normalizes.

**Research fork:** the only two historical bespoke executable programs do exactly the known 2013 prime display and Twitter continuation. Therefore **do not attempt an LP2 unknown-text inverse on an imagined 2013 executable PRNG or unobserved GP29 opcode.** If a genuinely different signed or hash-authenticated original binary becomes available, evaluate that *specific additional file* and its historical input/output; there is no justification for extracting a new state machine from the existing two scripts. The 2013 `wisdom/folly` buffer remains a separate data-key hypothesis with its own exact original-cipher negative [here](lp2-2013-wisdom-floral-gp29-feedback-gate.md).

This report does not add an established LP2 cipher solution; it closes one potential missing-code route based on the complete archived puzzle-specific 2013 executable corpus.
