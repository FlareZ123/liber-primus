/*
 * LP2 original JPEG keyless sequential DCT-AC LSB source test.
 * Read-only, libjpeg-compatible; supply the 58 Stage11 JPEG paths in order.
 *
 * Four source-fixed receivers: luminance blocks in raster order; AC
 * coefficients in zigzag or native storage order, excluding either zero
 * alone or zero and both signs of one. 512 MSB-packed bytes per receiver.
 * Eight bit alignments are inspected for 15 exact binary/text file headers
 * and long contiguous ASCII. This is not keyed OutGuess/OpenPuff.
 *
 * Each stdout row: source path, mode 0..3, bits, 512-byte hex.
 * Final stderr: image/readout counts and all-mode source test summary.
 */
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

static const int zigzag[64] = {
  0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,
  26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,
  56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,
  45,38,31,39,46,53,60,61,54,47,55,62,63
};

/**
 * Read the first 512 bytes. Mode 0 zigzag |v|>=2; mode 1 zigzag |v|>=1;
 * mode 2 native |v|>=2; mode 3 native |v|>=1. DC and zeros never carry.
 */
static int receive(const char *filename, int mode, unsigned char out[512]) {
  FILE *file = fopen(filename, "rb");
  if (file == NULL) {
    perror(filename);
    return -1;
  }
  struct jpeg_decompress_struct src;
  struct jpeg_error_mgr errors;
  src.err = jpeg_std_error(&errors);
  jpeg_create_decompress(&src);
  jpeg_stdio_src(&src, file);
  jpeg_read_header(&src, TRUE);
  jvirt_barray_ptr *coeff = jpeg_read_coefficients(&src);
  jpeg_component_info *comp = &src.comp_info[0];
  int bits = 0;
  memset(out, 0, 512);
  const int native_order = (mode & 2) != 0;
  const int allow_one = (mode & 1) != 0;

  for (JDIMENSION y = 0; y < comp->height_in_blocks && bits < 4096; y++) {
    JBLOCKARRAY rows = (*src.mem->access_virt_barray)(
      (j_common_ptr)&src, coeff[0], y, 1, FALSE);
    for (JDIMENSION x = 0; x < comp->width_in_blocks && bits < 4096; x++) {
      JCOEF *block = rows[0][x];
      for (int k = 1; k < 64 && bits < 4096; k++) {
        const int v = (int)block[native_order ? k : zigzag[k]];
        if (v == 0 || (!allow_one && abs(v) == 1)) continue;
        out[bits / 8] |= (unsigned char)(((unsigned int)abs(v) & 1u)
                                          << (7 - (bits & 7)));
        bits++;
      }
    }
  }
  jpeg_finish_decompress(&src);
  jpeg_destroy_decompress(&src);
  fclose(file);
  return bits;
}

struct magic { const unsigned char *bytes; size_t size; };
static const struct magic signatures[] = {
  {(const unsigned char *)"PK\x03\x04",4},
  {(const unsigned char *)"\x1f\x8b\x08",3},
  {(const unsigned char *)"BZh",3},
  {(const unsigned char *)"%PDF",4},
  {(const unsigned char *)"\x89PNG",4},
  {(const unsigned char *)"GIF87a",6},
  {(const unsigned char *)"GIF89a",6},
  {(const unsigned char *)"Rar!\x1a\x07",6},
  {(const unsigned char *)"7z\xbc\xaf\x27\x1c",6},
  {(const unsigned char *)"\xfd" "7zXZ" "\x00",6},
  {(const unsigned char *)"\x7f" "ELF",4},
  {(const unsigned char *)"-----BEGIN",10},
  {(const unsigned char *)"ID3",3},
  {(const unsigned char *)"<!DOCTYPE",9},
  {(const unsigned char *)"<html",5}
};

/** Check every bit phase for a known header or contiguous plain ASCII. */
static void inspect(const unsigned char src[512], int *hits, int *longest) {
  unsigned char shifted[512];
  for (int phase = 0; phase < 8; phase++) {
    const int length = phase == 0 ? 512 : 511;
    for (int i = 0; i < length; i++) {
      shifted[i] = phase == 0 ? src[i]
        : (unsigned char)((src[i] << phase) | (src[i + 1] >> (8 - phase)));
    }
    int run = 0;
    for (int i = 0; i < length; i++) {
      if (shifted[i] >= 32 && shifted[i] <= 126) {
        run++;
        if (run > *longest) *longest = run;
      } else {
        run = 0;
      }
    }
    for (size_t j = 0; j < sizeof signatures / sizeof signatures[0]; j++) {
      const struct magic *sig = &signatures[j];
      for (int i = 0; i <= length - (int)sig->size; i++) {
        if (memcmp(shifted + i, sig->bytes, sig->size) == 0) (*hits)++;
      }
    }
  }
}

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "Expected original JPEG paths as arguments.\n");
    return 2;
  }
  unsigned char out[512];
  int headers = 0, longest = 0, streams = 0;
  for (int source = 1; source < argc; source++) {
    for (int mode = 0; mode < 4; mode++) {
      const int bits = receive(argv[source], mode, out);
      if (bits < 0) return 2;
      if (bits != 4096) {
        fprintf(stderr, "Insufficient AC capacity: %s\n", argv[source]);
        return 3;
      }
      inspect(out, &headers, &longest);
      streams++;
      printf("%s\t%d\t%d\t", argv[source], mode, bits);
      for (int byte = 0; byte < 512; byte++) printf("%02x", out[byte]);
      putchar('\n');
    }
  }
  fprintf(stderr,
          "images=%d streams=%d phases=%d known_magic_hits=%d longest_ascii=%d\n",
          argc - 1, streams, streams * 8, headers, longest);
  return 0;
}
