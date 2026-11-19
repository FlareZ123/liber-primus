# Agent14: marker q=4 is a one-parameter DH-state generator

New compact mechanism in:
- `im-results/lp2-dh-state-signed-source-register.md`
- `im-results/lp2-p0-red13-hinv-state-palindrome.md`
- `sims/lp2_p0_red13_hinv_state_palindrome_sft.cjs`

The original p0 13-dot marker has side-column population `q=4`.

From q alone:

```text
K=q-2
e=q-1
q=q
g=q+1
a=q+2
A=2q
b=4q-1
B=5q-1
p=6q-1
```

At q=4 this is exactly the independently reconstructed state:
`(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`.

Marker/source anchors also fall out:
`3q+1=13=WAY13`, `q+3=7=THE7`.

Full finite gate:
- sweep q=2..28;
- require g^a=A, g^b=B, B^a=K, A^b=K modulo p;
- **q=4 is the sole passing value**.

Using the q-generated marker packet and fixed H on original p0:
- sweep q=2..28;
- compare against the unique authenticated 8+5 source phrase;
- **q=4 alone decrypts to EPIPHANY SEEKS**.

State/source alignment:
`K2,e3,q4,g5,a6,g+K7,A8`
maps exactly to:
`PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED`.

Further:
`b15=WORDS, B19=THEIR, p23=ROAD, p+K25=THEIR, p+a29=DIRECTION`.

And state-numbered original receivers now give:
- `B19/THEIR19 -> p19 word20 -> source0..3 HELLO THE PATH LIES`
- `p23/ROAD23 -> p23 word24 -> source3..5 LIES EMPTY EPIPHANY`

I regard the q-ladder formula class as retrospective because it was noticed after the state values were known. Its selectivity is now explicit, and it connects marker geometry, DH state, signed word numbers, original ciphertext receivers, and the p0 title in one compact mechanism. Independent adversarial derivation or a new prospective consumer would justify promotion.
