"""Period-authentic public signature format gate, not a private-key search."""
from pathlib import Path
from base64 import b64decode
from hashlib import sha1
import re

ROOT = Path(__file__).resolve().parent.parent / 'resources'
GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
P55 = [21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10]


def unarmor(text: str, kind: str) -> bytes:
    body = text.split(f'-----BEGIN PGP {kind}-----', 1)[1]
    lines = body.split('\n\n', 1)[1].splitlines()
    return b64decode(''.join(line for line in lines if not line.startswith(('=', '-'))), validate=True)


def first_packet(data: bytes, tag: int) -> bytes:
    # Both original packet formats use old-format two-octet lengths.
    assert data[0] == 0x80 | (tag << 2) | 1
    size = int.from_bytes(data[1:3], 'big')
    assert len(data) >= 3 + size
    return data[3:3+size]


def mpi(data: bytes, pos: int) -> tuple[int, int]:
    bits = int.from_bytes(data[pos:pos+2], 'big')
    end = pos + 2 + (bits+7)//8
    val = int.from_bytes(data[pos+2:end], 'big')
    assert val.bit_length() == bits and end <= len(data)
    return val, end


key = first_packet(unarmor((ROOT/'cicada-3301-authentic-public-key.asc').read_text(encoding='utf-8'), 'PUBLIC KEY BLOCK'), 6)
assert key[0] == 4 and key[5] == 1
fingerprint = sha1(b'\x99'+len(key).to_bytes(2,'big')+key).hexdigest().upper()
assert fingerprint == '6D854CD7933322A601C3286D181F01E57A35090F'
n, pos = mpi(key, 6)
e, end = mpi(key, pos)
assert end == len(key) and n.bit_length() == 4096 and e == 65537
k = (n.bit_length()+7)//8
DER_SHA1 = bytes.fromhex('3021300906052b0e03021a05000414')


def rsa_representative(s: int) -> bytes:
    assert 0 <= s < n
    return pow(s,e,n).to_bytes(k,'big')


def encoded_sha1(digest: bytes) -> bytes:
    tail = DER_SHA1 + digest
    return b'\x00\x01' + b'\xff'*(k-len(tail)-3) + b'\x00' + tail


for name in ('cicada2014-may2-signed-message.asc','historical/cicada2016-4gq25-outguess.asc'):
    text = (ROOT/name).read_text(encoding='utf-8')
    clear = text.split('\n\n',1)[1].split('\n-----BEGIN PGP SIGNATURE-----',1)[0]
    clear = '\r\n'.join(re.sub(r'[ \t]+$', '', line[2:] if line.startswith('- ') else line) for line in clear.split('\n')).encode('utf-8')
    sig = first_packet(unarmor(text,'SIGNATURE'),2)
    assert sig[:4] == bytes([4,1,1,2])  # v4, canonical text, RSA, SHA1
    h_end = 6 + int.from_bytes(sig[4:6],'big')
    u_end = h_end+2+int.from_bytes(sig[h_end:h_end+2],'big')
    signature, end = mpi(sig,u_end+2)
    assert end == len(sig)
    digest = sha1(clear+sig[:h_end]+b'\x04\xff'+h_end.to_bytes(4,'big')).digest()
    assert digest[:2] == sig[u_end:u_end+2]
    assert rsa_representative(signature) == encoded_sha1(digest)
    print(f'CONTROL {name}: verified exact SHA1={digest.hex()}, packet body={len(sig)}, MPI={signature.bit_length()} bits, prefix={rsa_representative(signature)[:8].hex()}')

master = (ROOT/'transcriptions/liber_primus_master.txt').read_text(encoding='utf-8')
sections = [s for s in master.split('%') if [GP.index(c) for c in s if c in GP] == P55]
assert len(sections) == 1
groups = [[GP.index(c) for c in word if c in GP] for word in sections[0].replace('/','').split('-')]
groups = [g for g in groups if g]
assert list(map(len,groups)) == [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]
interior = [c for g in groups[1:] for c in g[1:-1]]
shell = groups[0]+[c for g in groups[1:] for c in (g[0],g[-1])]
assert (len(interior),len(shell)) == (43,33)
assert 3301 == len(interior)*76+len(shell)


def base29(digits: list[int]) -> int:
    n = 0
    for digit in digits:
        n = 29*n+digit
    return n


for label, digits in [('interior',interior),('full shell including NG carry',shell)]:
    s = base29(digits)
    assert s == (510043531279477768552291351270111060625364732293226050492113768 if label=='interior' else 1369636156327157530854965033451154339299654501152)
    em = rsa_representative(s)
    print(f'ORIGINAL {label}: {len(digits)} digits, {s.bit_length()} bits, direct MPI={s}, minimal bytes={(s.bit_length()+7)//8}, RSA prefix={em[:16].hex()}')
    assert em[:2] != b'\x00\x01', 'Unexpected signature prefix; inspect full encoding'
print('PASS: both exact original BASE29 values fail a message-independent necessary condition of historical OpenPGP RSA verification.')
# A v4 OpenPGP fingerprint is a 160-bit SHA1 value. This exact typed
# candidate is motivated independently by the 2016 signed key-ID warning.
assert base29(interior).bit_length() > 160
shell_bytes = base29(shell).to_bytes(20,'big')
assert shell_bytes != bytes.fromhex(fingerprint)
print(f'FINGERPRINT: shell={shell_bytes.hex()}, historical={fingerprint.lower()}, mismatch')
