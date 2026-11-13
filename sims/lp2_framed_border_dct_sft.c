/* LP2 original 16-page frame Y-DCT identity and candidate-coefficient inventory.
   libjpeg is required. Usage: frame-sft [resources/liber-primus] */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <jpeglib.h>
#define TOP 50
#define BOTTOM 362
#define LEFT 35
#define RIGHT_START 265
#define BORDER_BLOCKS_PER_ROW 70
#define NUM_COEFFS ((BOTTOM-TOP+1)*BORDER_BLOCKS_PER_ROW*DCTSIZE2)
typedef struct { long nonzero_ac, eligible_ac, border_nonzero_ac, border_eligible_ac; } Stats;
static void read_frame(const char *dir,int page,JCOEF *border,Stats *stat) {
    char filename[512];
    snprintf(filename,sizeof filename,"%s/%02d.jpg",dir,page+17);
    FILE *file=fopen(filename,"rb");
    if(!file){perror(filename);exit(2);}
    struct jpeg_decompress_struct jpeg; struct jpeg_error_mgr err;
    jpeg.err=jpeg_std_error(&err);
    jpeg_create_decompress(&jpeg);jpeg_stdio_src(&jpeg,file);
    jpeg_read_header(&jpeg,TRUE);
    jvirt_barray_ptr *arrays=jpeg_read_coefficients(&jpeg);
    jpeg_component_info *y=&jpeg.comp_info[0];
    if(y->width_in_blocks!=300||y->height_in_blocks!=450){
        fprintf(stderr,"%s: unexpected block dimensions\n",filename);exit(3);
    }
    memset(stat,0,sizeof *stat);
    size_t position=0;
    for(int row=0;row<450;++row){
        JBLOCKARRAY blocks=(*jpeg.mem->access_virt_barray)(
            (j_common_ptr)&jpeg,arrays[0],(JDIMENSION)row,1,FALSE);
        for(int col=0;col<300;++col){
            int framed=row>=TOP&&row<=BOTTOM&&(col<LEFT||col>=RIGHT_START);
            if(framed){
                memcpy(border+position,blocks[0][col],DCTSIZE2*sizeof(JCOEF));
                position+=DCTSIZE2;
            }
            for(int k=1;k<DCTSIZE2;++k){
                int value=blocks[0][col][k];
                if(value)++stat->nonzero_ac;
                if(value>=2||value<=-2)++stat->eligible_ac;
                if(framed){
                    if(value)++stat->border_nonzero_ac;
                    if(value>=2||value<=-2)++stat->border_eligible_ac;
                }
            }
        }
    }
    if(position!=NUM_COEFFS){fprintf(stderr,"bad count %zu\n",position);exit(4);}
    jpeg_finish_decompress(&jpeg);jpeg_destroy_decompress(&jpeg);fclose(file);
}
int main(int argc,char **argv){
    const char *dir=argc==2?argv[1]:"resources/liber-primus";
    JCOEF *reference=malloc(NUM_COEFFS*sizeof(JCOEF));
    JCOEF *candidate=malloc(NUM_COEFFS*sizeof(JCOEF));
    if(!reference||!candidate){fputs("allocation failure\n",stderr);return 5;}
    Stats s;read_frame(dir,40,reference,&s);
    if(s.border_eligible_ac!=104915||s.border_nonzero_ac!=155752){
        fputs("reference frame AC inventory differs\n",stderr);return 6;
    }
    double min_share=1.0,max_share=0.0;
    for(int page=40;page<=55;++page){
        read_frame(dir,page,candidate,&s);
        if(memcmp(reference,candidate,NUM_COEFFS*sizeof(JCOEF))!=0){
            fprintf(stderr,"p%d contains differing frame coefficients\n",page);return 7;
        }
        double share=(double)s.border_eligible_ac/s.eligible_ac;
        if(share<min_share)min_share=share;
        if(share>max_share)max_share=share;
        printf("LP2 p%02d: AC magnitude>=2 total=%ld border=%ld border-share=%.6f\n",
            page,s.eligible_ac,s.border_eligible_ac,share);
    }
    for(int page=39;page<=56;page+=17){
        read_frame(dir,page,candidate,&s);
        if(memcmp(reference,candidate,NUM_COEFFS*sizeof(JCOEF))==0){
            fprintf(stderr,"unframed p%d unexpectedly matches\n",page);return 8;
        }
    }
    memcpy(candidate,reference,NUM_COEFFS*sizeof(JCOEF));++candidate[0];
    if(memcmp(reference,candidate,NUM_COEFFS*sizeof(JCOEF))==0){
        fputs("one-coefficient mutation undetected\n",stderr);return 9;
    }
    printf("PASS: 16 originals share %d exact Y DCT coefficients in side strips\n",NUM_COEFFS);
    printf("Side strips: 155752 nonzero Y AC, 104915 with |coefficient|>=2\n");
    printf("Eligible coefficient share: %.6f to %.6f\n",min_share,max_share);
    puts("Adjacent unframed controls differ; synthetic mutation detected");
    free(candidate);free(reference);return 0;
}
