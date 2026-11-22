#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>

/*
 * Reproduce OutGuess's JPEG retrieval bitmap:
 * visit decoded quantized DCT blocks in MCU order, then natural coefficient
 * order, retaining the LSB of every coefficient except 0 and +1.
 * The output bitmap packs bit index i into bit (i & 7) of byte (i >> 3).
 */
int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: outguess_bitmap_dump image.jpg\n");
        return 2;
    }
    FILE *in = fopen(argv[1], "rb");
    if (!in) { perror("fopen"); return 2; }

    struct jpeg_decompress_struct cinfo;
    struct jpeg_error_mgr jerr;
    cinfo.err = jpeg_std_error(&jerr);
    jpeg_create_decompress(&cinfo);
    jpeg_stdio_src(&cinfo, in);
    jpeg_read_header(&cinfo, TRUE);
    jvirt_barray_ptr *coef_arrays = jpeg_read_coefficients(&cinfo);

    unsigned long count = 0;
    unsigned char acc = 0;
    int nbits = 0;
    for (JDIMENSION iMCU_row = 0; iMCU_row < cinfo.total_iMCU_rows; iMCU_row++) {
        for (JDIMENSION mcu_col = 0; mcu_col < cinfo.MCUs_per_row; mcu_col++) {
            for (int ci = 0; ci < cinfo.comps_in_scan; ci++) {
                jpeg_component_info *comp = cinfo.cur_comp_info[ci];
                int useful_width =
                    (mcu_col < cinfo.MCUs_per_row - 1)
                    ? comp->MCU_width : comp->last_col_width;
                for (int yindex = 0; yindex < comp->MCU_height; yindex++) {
                    if (iMCU_row < cinfo.total_iMCU_rows - 1 ||
                        yindex < comp->last_row_height) {
                        for (int xindex = 0; xindex < useful_width; xindex++) {
                            JDIMENSION blockrow =
                                iMCU_row * comp->MCU_height + yindex;
                            JDIMENSION blockcol =
                                mcu_col * comp->MCU_width + xindex;
                            if (blockrow >= comp->height_in_blocks ||
                                blockcol >= comp->width_in_blocks)
                                continue;
                            JBLOCKARRAY row =
                                (*cinfo.mem->access_virt_barray)(
                                    (j_common_ptr)&cinfo,
                                    coef_arrays[comp->component_index],
                                    blockrow, 1, FALSE);
                            JBLOCKROW block = row[0] + blockcol;
                            for (int k = 0; k < DCTSIZE2; k++) {
                                unsigned short temp =
                                    (unsigned short)(*block)[k];
                                /* OutGuess skips exactly 0 and positive 1. */
                                if ((temp & 1) == temp) continue;
                                acc |= (unsigned char)((temp & 1) << nbits);
                                nbits++;
                                count++;
                                if (nbits == 8) {
                                    if (fwrite(&acc, 1, 1, stdout) != 1) return 3;
                                    acc = 0;
                                    nbits = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (nbits && fwrite(&acc, 1, 1, stdout) != 1) return 3;
    fprintf(stderr,
            "eligible_coefficients=%lu bitmap_bytes=%lu tail_bits=%d\n",
            count, (count + 7) / 8, nbits);
    jpeg_finish_decompress(&cinfo);
    jpeg_destroy_decompress(&cinfo);
    fclose(in);
    return 0;
}
