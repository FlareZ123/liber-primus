# 2013 prime_echo 3301 → live DH3301 session gate

**Agent1, 18 November 2026. Director #1657. Classification: exact cross-service parameter reuse; no LP2 receiver or plaintext.**

## Decision

The number **3301** is genuinely player-visible in both 2013 mechanisms. The Cicada OS `prime_echo` script prints 3301 as its final prime and holds it for two seconds; the later organizer test issues `DH 3301` repeatedly to a participant server. The complete preserved DH exchange reproduces exactly.

This does **not** select an LP2 key. The live server base, server secret, public share and resulting shared value depend on participant-side randomness; the organizer's client public share determines only an exponent residue class, not one unique exponent. Neither the signed TCP specification nor the prime_echo program defines a KDF, rune serialization, ciphertext target or reversible LP2 receiver.

Preserve 3301 as a real cross-service 2013 parameter reuse. Do not promote shared1067 or any one exponent representative to LP2 key material without a new first-party source bridge.

## Provenance correction

The phrase “signed prime_echo source” is too strong. `prime_echo` is an extracted original Cicada OS shell script preserved from the 2013 artifact; it is not itself an OpenPGP-signed script. Its parent program clears the screen after it returns and then displays the contemporaneous signed “The key is all around you” message.

The TCP-server protocol is separately authenticated by Cicada's signing key. The exact March DH3301 exchange is preserved in a participant transcript whose subsequent NEXT payload is independently signed, but the surrounding session log itself is not OpenPGP-signed. These evidence classes are sufficient to establish historical player visibility and arithmetic reproduction, while they do not authenticate the participant-random DH outputs as organizer-selected constants.

## Player-visible 3301 reuse

The original `prime_echo` source contains exactly two two-second holds: after1033 and after3301. The 3301 hold is terminal. Ordinary primes use 0.05-second delays.

The preserved server-test record includes three `DH 3301` requests. Under the signed generic DH procedure, the request modulus is client/organizer supplied, while each participant server chooses its own base and secret. Thus **modulus3301** is the stable organizer-side test value; the rest of the live tuple is session-specific.

## Exact live DH3301 arithmetic

The preserved later session records:

- modulus `p = 3301`;
- participant-selected base `g = 2757`;
- participant server secret `a = 331`;
- server public share `A = 1264`;
- organizer/client public share `B = 2800`;
- returned shared value `K = 1067`.

Direct reproduction gives:

- `2757^331 mod 3301 = 1264`;
- `2800^331 mod 3301 = 1067`;
- the multiplicative order of both 2757 and1264 modulo3301 is **550**;
- `2757^x = 2800 (mod 3301)` fixes `x ≡ 11 (mod 550)`.

Within the ordinary exponent range1–3299 this leaves exactly six representatives:

`11, 561, 1111, 1661, 2211, 2761`.

Every one gives `1264^x mod3301 = 1067`. The transcript therefore does **not** identify one unique client private exponent. Selecting11, 561, 1111, 1661, 2211 or2761 for LP2 would require another source rule.

## Receiver gate

The source boundary is the same one established for the p23 worked example, and is even stronger here because the live shared value is session-specific. The signed `DH` protocol returns the shared integer as `03 DATA [k]`; it does not specify any subsequent data cipher. `NEXT` is an independent plaintext-upload command.

`prime_echo` likewise supplies only a terminal pause/hold at3301. It does not say to feed3301 into DH, retain the shared result, select one private exponent representative, serialize a shared integer into GP29, or apply a reversible operation to Liber Primus.

No concrete original LP2 span and exact reversible receiver are source-selected by the combined evidence. The Director fork therefore closes on **cross-service reuse, no receiver**.

Reproducer: [`sims/lp2_primeecho_dh3301_live_session_sft.cjs`](../sims/lp2_primeecho_dh3301_live_session_sft.cjs). Source controls: [`resources/historical/cicada2013-os-original-prime-echo.sh`](../resources/historical/cicada2013-os-original-prime-echo.sh), [`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json), and [`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md).
