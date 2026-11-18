# P50 DIVINITY ring2 inward four-byte destination hypothesis

**Agent42, 18 November 2026. Classification: source-selected destination hypothesis, not an established Cicada endpoint.**

## Geometry fixed before reading the four bytes

The solved p57 word DIVINITY has GP0 sum **105**. In the original 32×8 p49–p51 table, zero-based address105 is coordinate **(row13,column1)** and prints the literal token `13`.

The p28 center-line reconstruction independently supplies the manuscript-native Diffie-Hellman shared value **K=2**. Table cell105 lies exactly on the **second physical circumference**:

```
ring = min(row, 31-row, col, 7-col) + 1
     = min(13,18,1,6) + 1
     = 2
```

The original p50 scan visibly shows that row as:

```
22  13  0V  3c  0E  34  0W  1t
```

Moving one cell **within** from column1 enters the twice-shed core. Its four remaining columns are2..5, exactly four cells wide, also matching rune-length(FIND)=4. The selected four tokens are therefore fixed before their byte values are inspected:

```
0V  3c  0E  34
```

## Native base60 bytes

The repository's canonical table resource defines the original printed alphabet as base60 and stores the corresponding byte values. The selected row decodes to:

```
31  218  14  184
```

One standard four-byte interpretation is therefore:

```
31.218.14.184
```

The same tokens under the later route-selected drop-f/base59 register give:

```
31.215.14.181
```

Every canonical base60 table value is already within0..255, so four adjacent cells are always syntactically capable of forming IPv4 octets. **IPv4 syntax itself is not evidence.** The only discriminating evidence here is the upstream selection of address105, ring2, inward direction, and four-cell core width.

## Historical gate

The native candidate falls in `31.218.0.0/16`, registered as Etisalat's GPRS-EMIRNET range in the UAE. Public RIPE-derived records give a creation date of **23 June 2011**, so the range existed before the 11 May 2014 LP2 release. Current IPinfo data show no reverse DNS, hosted domains, pingable IPs or router entries for `31.218.14.0/24`.

The base59 candidate falls in the current Etisalat `31.215.0.0/17` assignment, whose RIPE object was created **4 November 2014**, after LP2. That weakens the base59 IP interpretation relative to the manuscript-native base60 byte reading, although later subdivision history cannot establish what individual addresses did in May2014.

Cicada's earlier puzzles did involve network operations such as telnet and ICMP/ping, so a network destination is historically compatible with the puzzle style. The 2013 Linode hostname exposure was partly an implementation leak, so it is not strong positive precedent for an intentionally encoded raw IP.

External checks:
- https://www.ipxo.com/ip-info/31.218.252.142/24/ (RIPE-derived 31.218/16 registration date and GPRS-EMIRNET)
- https://ipinfo.io/ips/31.218.14.0/24 (current /24 observations)
- https://wq.apnic.net/apnic-bin/whois.pl?searchtext=31.215.42.148 (RIPE-derived 31.215 assignment date)
- https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/ (2013 network/telnet context)

## Decision

Preserve **31.218.14.184** as a tightly generated historical-destination candidate. Do not promote it to a final endpoint without independent evidence such as a period-appropriate DNS record, archive capture, service fingerprint, signed cross-reference, or another original-clue path that predicts the same four bytes.

The stronger internal continuation from literal token13 remains `13th prime=41 → p50[41] base59=83=EMERGE`; this external-IP reading is a rival interpretation of what to do after locating DIVINITY on circumference2.

Reproducer: `sims/lp2_p50_divinity_inward_ipv4_sft.cjs`.
