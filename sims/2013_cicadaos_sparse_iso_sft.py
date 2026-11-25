#!/usr/bin/env python3
"""Sparse, read-only replay of the seven historical CicadaOS phone XORs.

Run with an ISO path or an HTTPS mirror; --self-test needs no external data.
A successful sparse replay verifies sampled bytes, not the entire ISO hash.
Never mounts, boots, or executes content from the ISO.
"""
import argparse
import io
import re
import runpy
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

SECTOR = 2048
ISO_SIZE = 136_398_848
SIZES = {'560.13': 118_818_811, '560.17': 1_183_811}
MIRROR = 'https://connortumbleson.com/uploads/2024/01/3301.iso'


class LocalReader:
    def __init__(self, file):
        self.file = file
        self.size = file.seek(0, 2)
        self.transferred = 0
        self.requests = 0

    def read(self, offset, length):
        self.file.seek(offset)
        data = self.file.read(length)
        if len(data) != length:
            raise ValueError('short local read')
        self.transferred += length
        self.requests += 1
        return data


class HTTPReader:
    def __init__(self, url, opener=urlopen):
        self.url = url
        self.opener = opener
        self.size = ISO_SIZE
        self.transferred = 0
        self.requests = 0

    def read(self, offset, length):
        if not 0 <= offset < offset + length <= self.size:
            raise ValueError('range outside ISO')
        last = offset + length - 1
        req = Request(self.url, headers={
            'Range': f'bytes={offset}-{last}', 'Accept-Encoding': 'identity'})
        with self.opener(req, timeout=30) as response:
            if response.status != 206:
                raise ValueError(f'expected HTTP 206, got {response.status}; no full-body fallback')
            expected = f'bytes {offset}-{last}/{self.size}'
            if response.headers.get('Content-Range') != expected:
                raise ValueError('Content-Range does not match pinned ISO range: ' +
                                 str(response.headers.get('Content-Range')))
            if response.headers.get('Content-Encoding', 'identity') != 'identity':
                raise ValueError('unexpected Content-Encoding')
            data = response.read(length + 1)
        if len(data) != length:
            raise ValueError('incorrect HTTP range body length')
        self.transferred += length
        self.requests += 1
        return data


def both(record, offset, width):
    little = int.from_bytes(record[offset:offset+width], 'little')
    big = int.from_bytes(record[offset+width:offset+2*width], 'big')
    if little != big:
        raise ValueError('ISO both-endian field mismatch')
    return little


def extent(record):
    if len(record) < 34 or record[1] or record[26] or record[27] or record[25] & 128:
        raise ValueError('unsupported extended/interleaved/multi-extent record')
    return both(record, 2, 4), both(record, 10, 4), bool(record[25] & 2)


def directory(reader, entry):
    lba, size, is_dir = entry
    if not is_dir or not 0 < size <= 1_048_576 or lba * SECTOR + size > reader.size:
        raise ValueError('invalid directory extent')
    data = reader.read(lba * SECTOR, size)
    entries = {}
    i = 0
    while i < size:
        n = data[i]
        if n == 0:
            i = (i // SECTOR + 1) * SECTOR
            continue
        if n < 34 or i + n > size or i % SECTOR + n > SECTOR:
            raise ValueError('bad directory record')
        r = data[i:i+n]
        name = r[33:33+r[32]]
        if len(name) != r[32]:
            raise ValueError('truncated identifier')
        if name not in (b'\x00', b'\x01'):
            key = name.decode('ascii').split(';')[0].rstrip('.').upper()
            if key in entries:
                raise ValueError('ambiguous directory name: ' + key)
            entries[key] = extent(r)
        i += n
    return entries


def data_extents(reader):
    if reader.size != ISO_SIZE:
        raise ValueError(f'ISO length {reader.size} != {ISO_SIZE}')
    for lba in range(16, 64):
        pvd = reader.read(lba * SECTOR, SECTOR)
        if pvd[1:7] != b'CD001\x01' or pvd[0] == 255:
            raise ValueError('no supported primary volume descriptor')
        if pvd[0] == 1:
            break
    else:
        raise ValueError('primary volume descriptor not found')
    if both(pvd, 128, 2) != SECTOR:
        raise ValueError('unexpected logical block size')
    root = extent(pvd[156:156+pvd[156]])
    entries = directory(reader, directory(reader, root)['DATA'])
    result = {}
    for name, expected_size in SIZES.items():
        lba, size, is_dir = entries[name]
        offset = lba * SECTOR
        if is_dir or size != expected_size or offset + size > reader.size:
            raise ValueError('wrong source file extent: ' + name)
        result[name] = offset
    return result


def replay(reader, rows):
    extents = data_extents(reader)
    out = []
    for city, dataset, offset, phone_hex, slice_hex, expected in rows:
        phone = bytes.fromhex(phone_hex)
        if offset < 0 or offset + len(phone) > SIZES[dataset]:
            raise ValueError('phone offset outside dataset')
        raw_offset = extents[dataset] + offset
        raw = reader.read(raw_offset, len(phone))
        if raw != bytes.fromhex(slice_hex):
            raise ValueError(f'{city}: independent raw slice disagrees with archived extraction')
        message = bytes(a ^ b for a, b in zip(phone, raw)).decode('ascii').strip()
        if message != expected:
            raise ValueError(f'{city}: XOR output mismatch')
        out.append((city, dataset, offset, raw_offset, raw.hex(), message))
    return extents, out


def self_test():
    # Synthetic ISO geometry; payload bytes are arbitrary and test-only.
    def dual(n, w):
        return n.to_bytes(w, 'little') + n.to_bytes(w, 'big')

    def rec(name, lba, size, flags):
        name = bytes(name)
        n = 33 + len(name) + (len(name) % 2 == 0)
        r = bytearray(n)
        r[0] = n
        r[2:10] = dual(lba, 4)
        r[10:18] = dual(size, 4)
        r[25] = flags
        r[28:32] = dual(1, 2)
        r[32] = len(name)
        r[33:33+len(name)] = name
        return bytes(r)

    image = {}
    root, data, a, b = 20, 21, 100, 60_000
    pvd = bytearray(SECTOR)
    pvd[:7] = b'\x01CD001\x01'
    pvd[128:132] = dual(SECTOR, 2)
    rr = rec(b'\x00', root, SECTOR, 2)
    pvd[156:156+len(rr)] = rr
    image[16*SECTOR] = bytes(pvd)
    image[root*SECTOR] = rec(b'DATA', data, SECTOR, 2).ljust(SECTOR, b'\x00')
    image[data*SECTOR] = (rec(b'560.13;1', a, SIZES['560.13'], 0) +
                          rec(b'560.17;1', b, SIZES['560.17'], 0)).ljust(SECTOR, b'\x00')
    rows = []
    # Seven disjoint tests including an unaligned sector-crossing read.
    for k, (dataset, lba, offset) in enumerate([
        ('560.17', b, 33461), ('560.13', a, 37861), ('560.13', a, 1111111),
        ('560.13', a, 13831), ('560.17', b, 77977), ('560.13', a, 12821),
        ('560.17', b, 2040)]):
        message = f'test fixture {k}'.encode()
        raw = bytes((37*i+k) % 256 for i in range(len(message)))
        phone = bytes(x ^ y for x, y in zip(raw, message))
        image[lba*SECTOR+offset] = raw
        rows.append((str(k), dataset, offset, phone.hex(), raw.hex(), message.decode()))

    class Response(io.BytesIO):
        def __init__(self, payload, range_header, status=206):
            super().__init__(payload)
            self.status = status
            self.headers = {'Content-Range': range_header}

    def opener(req, timeout):
        match = re.fullmatch(r'bytes=(\d+)-(\d+)', req.get_header('Range'))
        first, last = map(int, match.groups())
        payload = image[first]
        assert len(payload) == last-first+1
        return Response(payload, f'bytes {first}-{last}/{ISO_SIZE}')

    reader = HTTPReader(MIRROR, opener)
    extents, output = replay(reader, rows)
    assert extents == {'560.13': a*SECTOR, '560.17': b*SECTOR}
    assert len(output) == 7 and reader.requests == 10
    assert reader.transferred == 3*SECTOR + sum(len(bytes.fromhex(r[3])) for r in rows)
    print('SYNTHETIC PASS: 7/7,', reader.requests, 'range requests,', reader.transferred, 'payload bytes')
    with tempfile.TemporaryFile() as f:
        f.truncate(ISO_SIZE)
        for offset, payload in image.items():
            f.seek(offset)
            f.write(payload)
        local = LocalReader(f)
        assert replay(local, rows) == (extents, output)
        assert local.transferred == reader.transferred
        damaged = next(offset for offset in image if offset > 100*SECTOR)
        f.seek(damaged)
        f.write(bytes([image[damaged][0] ^ 1]))
        try:
            replay(LocalReader(f), rows)
        except ValueError as e:
            assert 'independent raw slice disagrees' in str(e)
        else:
            raise AssertionError('damaged sample accepted')
    print('SYNTHETIC PASS: local sparse fixture and altered-byte rejection')
    # Ensure status/range mismatch never falls back to reading the full file.
    for status, header in [(200, ''), (206, f'bytes 1-1/{ISO_SIZE}')]:
        bad = HTTPReader(MIRROR, lambda *args, **kw: Response(b'x', header, status))
        try:
            bad.read(0, 1)
        except ValueError:
            pass
        else:
            raise AssertionError('invalid HTTP response accepted')
    print('SYNTHETIC PASS: rejected full-body response and wrong Content-Range')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('iso', nargs='?', default=MIRROR)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    rows = runpy.run_path(str(Path(__file__).with_name('2013_pklmx_reproduce.py')))['XOR_ROWS']
    if args.iso.startswith('https://'):
        reader = HTTPReader(args.iso)
        extents, output = replay(reader, rows)
    else:
        with open(args.iso, 'rb') as f:
            reader = LocalReader(f)
            extents, output = replay(reader, rows)
    print('DATA file absolute byte extents:', extents)
    for row in output:
        print(*row, sep=' | ')
    print(f'PASS: {len(output)}/7 historical slices; {reader.requests} reads, {reader.transferred} bytes')
    print('Sparse read only: full ISO digest has not been recomputed.')


if __name__ == '__main__':
    main()
