#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <jpeglib.h>

static const int zigzag[64] = {
  0, 1, 8,16, 9, 2, 3,10,17,24,32,25,18,11, 4, 5,
 12,19,26,33,40,48,41,34,27,20,13, 6, 7,14,21,28,
 35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
 58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63
};

typedef struct {
  FILE *file;
  unsigned char byte;
  int used;
  unsigned long long bit_count;
} BitWriter;

static BitWriter open_bits(const char *path) {
  BitWriter writer = {0};
  writer.file = fopen(path, "wb");
  if (!writer.file) { perror(path); exit(2); }
  return writer;
}

static void put_bit(BitWriter *writer, int bit) {
  writer->byte = (unsigned char)((writer->byte << 1) | (bit & 1));
  writer->used++;
  writer->bit_count++;
  if (writer->used == 8) {
    fputc(writer->byte, writer->file);
    writer->byte = 0;
    writer->used = 0;
  }
}

static void close_bits(BitWriter *writer) {
  if (writer->used) {
    writer->byte <<= (8 - writer->used);
    fputc(writer->byte, writer->file);
  }
  fclose(writer->file);
}

int main(int argc, char **argv) {
  if (argc != 3) {
    fprintf(stderr, "usage: %s input.jpg output-prefix\n", argv[0]);
    return 2;
  }
  FILE *input = fopen(argv[1], "rb");
  if (!input) { perror(argv[1]); return 2; }

  struct jpeg_decompress_struct cinfo;
  struct jpeg_error_mgr jerr;
  cinfo.err = jpeg_std_error(&jerr);
  jpeg_create_decompress(&cinfo);
  jpeg_stdio_src(&cinfo, input);
  if (jpeg_read_header(&cinfo, TRUE) != JPEG_HEADER_OK) {
    fprintf(stderr, "invalid JPEG header: %s\n", argv[1]);
    return 3;
  }
  jvirt_barray_ptr *arrays = jpeg_read_coefficients(&cinfo);

  char path[4096];
  snprintf(path, sizeof(path), "%s_all_gt1.bin", argv[2]);
  BitWriter all_gt1 = open_bits(path);
  snprintf(path, sizeof(path), "%s_all_nz.bin", argv[2]);
  BitWriter all_nz = open_bits(path);

  unsigned long long total_ac = 0, total_nz = 0, total_gt1 = 0;
  unsigned long long total_odd_nz = 0, total_odd_gt1 = 0;
  printf("{\"width\":%u,\"height\":%u,\"components\":%d,\"component_stats\":[",
         cinfo.image_width, cinfo.image_height, cinfo.num_components);

  for (int ci = 0; ci < cinfo.num_components; ci++) {
    jpeg_component_info *component = &cinfo.comp_info[ci];
    snprintf(path, sizeof(path), "%s_c%d_gt1.bin", argv[2], ci);
    BitWriter component_gt1 = open_bits(path);
    snprintf(path, sizeof(path), "%s_c%d_nz.bin", argv[2], ci);
    BitWriter component_nz = open_bits(path);

    unsigned long long ac = 0, nz = 0, gt1 = 0, odd_nz = 0, odd_gt1 = 0;
    for (JDIMENSION y = 0; y < component->height_in_blocks; y++) {
      JBLOCKARRAY row = (*cinfo.mem->access_virt_barray)(
        (j_common_ptr)&cinfo, arrays[ci], y, 1, FALSE);
      for (JDIMENSION x = 0; x < component->width_in_blocks; x++) {
        JCOEF *block = row[0][x];
        for (int z = 1; z < 64; z++) {
          int coefficient = (int)block[zigzag[z]];
          int magnitude = coefficient < 0 ? -coefficient : coefficient;
          ac++;
          if (magnitude > 0) {
            int bit = magnitude & 1;
            nz++;
            odd_nz += (unsigned long long)bit;
            put_bit(&all_nz, bit);
            put_bit(&component_nz, bit);
          }
          if (magnitude > 1) {
            int bit = magnitude & 1;
            gt1++;
            odd_gt1 += (unsigned long long)bit;
            put_bit(&all_gt1, bit);
            put_bit(&component_gt1, bit);
          }
        }
      }
    }
    close_bits(&component_gt1);
    close_bits(&component_nz);
    if (ci) printf(",");
    printf("{\"component\":%d,\"id\":%d,\"width_blocks\":%u,\"height_blocks\":%u,\"ac\":%llu,\"nonzero\":%llu,\"abs_gt1\":%llu,\"odd_nonzero\":%llu,\"odd_gt1\":%llu}",
           ci, component->component_id, component->width_in_blocks,
           component->height_in_blocks, ac, nz, gt1, odd_nz, odd_gt1);
    total_ac += ac;
    total_nz += nz;
    total_gt1 += gt1;
    total_odd_nz += odd_nz;
    total_odd_gt1 += odd_gt1;
  }

  close_bits(&all_gt1);
  close_bits(&all_nz);
  printf("],\"total_ac\":%llu,\"total_nonzero\":%llu,\"total_abs_gt1\":%llu,\"odd_nonzero\":%llu,\"odd_gt1\":%llu,\"jsteg_bits\":%llu,\"all_nonzero_bits\":%llu}\n",
         total_ac, total_nz, total_gt1, total_odd_nz, total_odd_gt1,
         all_gt1.bit_count, all_nz.bit_count);

  jpeg_finish_decompress(&cinfo);
  jpeg_destroy_decompress(&cinfo);
  fclose(input);
  return 0;
}
