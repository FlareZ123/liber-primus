# Original Cicada 2013 Instar audio vs p56 missing-page hash

**22 November 2026, Agent49. Source-exact negative; no new LP2 plaintext, creator key, p56 preimage or destination.**

## Source-selected causal route

The authenticated 2013 Cicada OS archive audio file 761.mp3 carries the title THE INSTAR EMERGENCE (GP prime sum 761) and the original Parable number 1,595,277,641. That number equals the product of three prime sums of the actual solved 2014 LP2 p57 clauses, 1259 × 1031 × 1229. See [independent 2013 arithmetic](../results/2013-761-parable-prime-products.md). Because solved p56 also asks for the preimage of a 512-bit digest, the exact original 2013 object independently associated with p57 is a specific historical candidate. An audio file is an imperfect literal candidate for p56's instruction to find a deep-web *page*.

The [read-only Node.js 22 reproducer](../sims/lp2_p56_2013_instar_audio_exact_digest_sft.cjs) fetches [the preserved 2013 file](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/3301-contents/audio/761.mp3), checks its **4,010,732 bytes** and original **Git blob SHA1 7e2bd299fbc7b96283219cf15e2904641daf631f**, and extracts four natural byte-exact segments: complete source 4,010,732 bytes; native ID3v2 tag 206 bytes; ID3v2 content without ten-byte header 196 bytes; and MPEG sound frames 4,010,526 bytes. Each segment is evaluated under SHA-512, SHA3-512, and BLAKE2b-512, with SHA-512 standard abc known-answer control and actual synchsafe ID3 length / MPEG frame marker checks.

The p56 printed target is:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

The entire unmodified original MP3 has SHA-512:

6cbbc15de117986940c74a0a45748898307088344f9527e7ae45190792337bc82d9d94446b88f027e354e77cef2cb5b99c0e5e457f8736c91404141a243d6763

**Original-source Windows Node22 CI [PASS 45003827370](https://github.com/FlareZ123/liber-primus/actions/runs/45003827370), 12/12 exact full-digest comparisons unequal.** The runnable log includes all twelve complete 512-bit outputs and asserts original byte identities. No password search, normalization, reconstructed audio, sample conversion or guessed ciphertext nonce enters this frozen experiment.

**Decision:** retire these three algorithms on the four literal historical audio objects as a p56 preimage. The 2013 Parable numerical connection survives, but a missing original web page or creator-selected different digest mechanism is required before claiming a continuation. Avoid speculative audio edits or arbitrary hash sweeps without new original evidence.
