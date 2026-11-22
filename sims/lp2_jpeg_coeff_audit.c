#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>
#include <setjmp.h>

struct error_mgr { struct jpeg_error_mgr pub; jmp_buf jump; };
static void fail_jpeg(j_common_ptr cinfo) {
    struct error_mgr *e = (struct error_mgr *)cinfo->err;
    longjmp(e->jump, 1);
}

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "usage: %s image.jpg [image.jpg ...]\n", argv[0]);
        return 2;
    }
    for (int ai = 1; ai < argc; ++ai) {
        FILE *fp = fopen(argv[ai], "rb");
        if (!fp) { perror(argv[ai]); continue; }
        struct jpeg_decompress_struct cinfo;
        struct error_mgr jerr;
        cinfo.err = jpeg_std_error(&jerr.pub);
        jerr.pub.error_exit = fail_jpeg;
        if (setjmp(jerr.jump)) {
            jpeg_destroy_decompress(&cinfo);
            fclose(fp);
            fprintf(stderr, "JPEG decode error: %s\n", argv[ai]);
            continue;
        }
        jpeg_create_decompress(&cinfo);
        jpeg_stdio_src(&cinfo, fp);
        jpeg_read_header(&cinfo, TRUE);
        jvirt_barray_ptr *coef = jpeg_read_coefficients(&cinfo);

        printf("%s W=%u H=%u precision=%d components=%d progressive=%d scans=%d restart=%u",
               argv[ai], cinfo.image_width, cinfo.image_height,
               cinfo.data_precision, cinfo.num_components,
               cinfo.progressive_mode, cinfo.input_scan_number,
               cinfo.restart_interval);

        for (int ci = 0; ci < cinfo.num_components; ++ci) {
            jpeg_component_info *comp = &cinfo.comp_info[ci];
            long long zero = 0, total = 0, dc_abs_sum = 0;
            long long ac_magnitude[16] = {0};

            for (JDIMENSION y = 0; y < comp->height_in_blocks; ++y) {
                JBLOCKARRAY row = (*cinfo.mem->access_virt_barray)(
                    (j_common_ptr)&cinfo, coef[ci], y, 1, FALSE);
                for (JDIMENSION x = 0; x < comp->width_in_blocks; ++x) {
                    JCOEFPTR block = row[0][x];
                    for (int k = 0; k < DCTSIZE2; ++k) {
                        int value = block[k];
                        int magnitude = abs(value);
                        ++total;
                        if (value == 0) ++zero;
                        if (k == 0) {
                            dc_abs_sum += magnitude;
                        } else {
                            int bin = 0;
                            while (magnitude > 1 && bin < 15) {
                                magnitude >>= 1;
                                ++bin;
                            }
                            ++ac_magnitude[bin];
                        }
                    }
                }
            }

            printf(" C%d=%ux%u sampling=%dx%d qtable=%d zero=%.6f dc_abs_sum=%lld ac_log2_bins=",
                   ci, comp->width_in_blocks, comp->height_in_blocks,
                   comp->h_samp_factor, comp->v_samp_factor,
                   comp->quant_tbl_no, (double)zero / (double)total, dc_abs_sum);
            for (int b = 0; b < 16; ++b)
                printf("%s%lld", b ? "," : "", ac_magnitude[b]);
        }
        putchar('\n');
        jpeg_finish_decompress(&cinfo);
        jpeg_destroy_decompress(&cinfo);
        fclose(fp);
    }
    return 0;
}
