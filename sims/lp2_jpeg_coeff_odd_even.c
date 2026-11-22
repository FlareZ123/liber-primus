#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>
#include <setjmp.h>

struct error_mgr {
    struct jpeg_error_mgr pub;
    jmp_buf jump;
};

static void on_error(j_common_ptr cinfo) {
    longjmp(((struct error_mgr *)cinfo->err)->jump, 1);
}

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "usage: jpeg_coeff_odd_even file.jpg [file.jpg ...]\n");
        return 2;
    }

    puts("file,components,component,blocks,ac_nonzero,ac_pm1,ac_abs_gt1,ac_odd_abs_gt1,dc_zero,dc_nonzero,blocks_with_ac");
    for (int ai = 1; ai < argc; ++ai) {
        FILE *fp = fopen(argv[ai], "rb");
        if (!fp) {
            perror(argv[ai]);
            return 1;
        }

        struct jpeg_decompress_struct cinfo;
        struct error_mgr jerr;
        cinfo.err = jpeg_std_error(&jerr.pub);
        jerr.pub.error_exit = on_error;
        if (setjmp(jerr.jump)) {
            jpeg_destroy_decompress(&cinfo);
            fclose(fp);
            fprintf(stderr, "invalid JPEG: %s\n", argv[ai]);
            return 1;
        }
        jpeg_create_decompress(&cinfo);
        jpeg_stdio_src(&cinfo, fp);
        jpeg_read_header(&cinfo, TRUE);
        jvirt_barray_ptr *coefficients = jpeg_read_coefficients(&cinfo);

        for (int ci = 0; ci < cinfo.num_components; ++ci) {
            jpeg_component_info *comp = &cinfo.comp_info[ci];
            unsigned long long blocks = (unsigned long long)comp->width_in_blocks * comp->height_in_blocks;
            unsigned long long ac_nonzero = 0, ac_pm1 = 0, ac_abs_gt1 = 0, ac_odd_abs_gt1 = 0;
            unsigned long long dc_zero = 0, dc_nonzero = 0, blocks_with_ac = 0;
            for (JDIMENSION y = 0; y < comp->height_in_blocks; ++y) {
                JBLOCKARRAY row = (*cinfo.mem->access_virt_barray)(
                    (j_common_ptr)&cinfo, coefficients[ci], y, 1, FALSE);
                for (JDIMENSION x = 0; x < comp->width_in_blocks; ++x) {
                    JCOEFPTR b = row[0][x];
                    int has_ac = 0;
                    for (int k = 1; k < DCTSIZE2; ++k) {
                        int v = b[k];
                        if (v == 0) continue;
                        ++ac_nonzero;
                        has_ac = 1;
                        if (v == 1 || v == -1) ++ac_pm1;
                        else {
                            ++ac_abs_gt1;
                            if (abs(v) & 1) ++ac_odd_abs_gt1;
                        }
                    }
                    blocks_with_ac += has_ac;
                    if (b[0] == 0) ++dc_zero;
                    else ++dc_nonzero;
                }
            }
            printf("%s,%d,%d,%llu,%llu,%llu,%llu,%llu,%llu,%llu,%llu\n",
                   argv[ai], cinfo.num_components, ci, blocks, ac_nonzero,
                   ac_pm1, ac_abs_gt1, ac_odd_abs_gt1, dc_zero, dc_nonzero, blocks_with_ac);
        }
        jpeg_destroy_decompress(&cinfo);
        fclose(fp);
    }
    return 0;
}
