"""Exact historical forward gzip reconstruction; no LP2 key search."""
import argparse
import gzip
import hashlib
import pathlib
import struct
import subprocess
import zipfile
import zlib


def blob(data):
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()


def raw_deflate(data, level):
    encoder = zlib.compressobj(level, zlib.DEFLATED, -15)
    return encoder.compress(data) + encoder.flush()


def member(data, level, mtime, filename):
    xfl = 4 if level == 1 else 2 if level == 9 else 0
    header = struct.pack('<BBBBIBB', 31, 139, 8, 8, mtime, xfl, 3)
    footer = struct.pack('<II', zlib.crc32(data), len(data) % 2**32)
    return header + filename + b'\0' + raw_deflate(data, level) + footer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=pathlib.Path, default=pathlib.Path('.'))
    parser.add_argument('--hex', type=pathlib.Path)
    parser.add_argument('--jpg-zip', type=pathlib.Path)
    parser.add_argument('--fourth-gzip', type=pathlib.Path)
    args = parser.parse_args()
    historical = args.root / 'resources/historical'
    source = args.hex or historical / 'cicada2013-second-onion-icmp-echo.hex.txt'
    lines = source.read_text().splitlines()
    original = bytes.fromhex(''.join(lines))
    assert [len(bytes.fromhex(line)) for line in lines] == [28]*27 + [22]
    assert blob(original) == '8f97ecf20117a235e6f72559a306116603dc3540'
    decoded = gzip.decompress(original)
    assert hashlib.sha256(decoded).hexdigest() == '13645961e2642811500677f1a08d537e3c38f8c28764229b9d93480965c1c78c'
    signed = historical / 'cicada2013-second-onion-icmp-echo.asc'
    if signed.exists():
        assert signed.read_bytes() == decoded
    assert original[:26] == bytes.fromhex('1f8b080843f5ee5000036d6573736167652e7478742e61736300')
    assert struct.unpack('<II', original[-8:]) == (zlib.crc32(decoded), len(decoded))
    hits = []
    for level in range(1, 10):
        trial = member(decoded, level, 1357837635, b'message.txt.asc')
        exact = trial == original
        print('2013', level, len(trial), exact)
        if exact:
            hits.append(level)
            assert [trial[i:i+28].hex() for i in range(0,len(trial),28)] == [line.lower() for line in lines]
    assert hits == [5,6,7,8]
    print('2013 exact levels', hits, 'zlib', zlib.ZLIB_RUNTIME_VERSION)
    names = [f'{i:02}.jpg' for i in range(6,10)]
    if args.jpg_zip:
        with zipfile.ZipFile(args.jpg_zip) as z:
            pages = [z.read(next(p for p in z.namelist() if p.rsplit('/',1)[-1] == n)) for n in names]
    else:
        pages = [(args.root / 'resources/liber-primus' / n).read_bytes() for n in names]
    assert [blob(x) for x in pages] == ['596ae8f80ada7657f77f342d38d05ed0f997cae7','1ce21df6a0b8013615c2fd98a57a32021f55e4e1','426124114b6209475778c6ec7e02bf341c92157b','fa928ae55ac841a795b5c12eead3e14efc8c419b']
    a,b,c,d = pages
    plain = a+b+(c+d)[::-1]
    assert blob(plain) == '7b640ff8b74e51b1c767f5270a5eec9cdc677448'
    print('2014 exact uncompressed',len(plain),blob(plain))
    for level in range(1,10):
        packed = subprocess.check_output(['gzip',f'-{level}','-n','-c'],input=plain)
        assert gzip.decompress(packed)==plain
        print('2014 GNU',level,len(packed),'archive minus candidate',2532309-len(packed))
    if args.fourth_gzip:
        fourth = args.fourth_gzip.read_bytes()
        assert blob(fourth)=='7e273e715c4138a178c3f36bf17ac05955fe4c1d'
        assert gzip.decompress(fourth)==plain
        print('2014 source header',fourth[:64].hex())
        # A single FNAME-only member permits direct metadata-preserving comparison.
        if fourth[3]==8:
            end = fourth.index(b'\0',10)+1
            for level in range(1,10):
                packed=subprocess.check_output(['gzip',f'-{level}','-n','-c'],input=plain)
                print('2014 metadata-preserving GNU',level, fourth[:end]+packed[10:]==fourth)
    else:
        print('2014 exact compressed comparison pending original header/member bytes')


if __name__ == '__main__':
    main()
