#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <jpeglib.h>

/* JPEG zig-zag scan order for quantized DCT coefficients. */
static const int zz[64]={0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63};
typedef struct { uint8_t b;int n;FILE*fp;size_t count;} BW;
static void putbit(BW*o,int x){o->b=(uint8_t)((o->b<<1)|(x&1));o->n++;o->count++;if(o->n==8){fputc(o->b,o->fp);o->b=0;o->n=0;}}
static void done(BW*o){if(o->n) fputc(o->b<<(8-o->n),o->fp);fclose(o->fp);}
static void write_coeff(BW*o,JCOEF v,int mode){int a=abs(v);if(mode==0 && a<=1) return;if(mode==1 && a==0)return;if(mode==2 && a<=1)return;putbit(o, mode==2?((v&1)^1):(a&1));}
int main(int argc,char**argv){
 if(argc!=3){fprintf(stderr,"usage: %s FILE OUTPREFIX\n",argv[0]);return 2;}
 FILE*f=fopen(argv[1],"rb");if(!f){perror("input");return 2;}
 struct jpeg_decompress_struct c;struct jpeg_error_mgr e;
 c.err=jpeg_std_error(&e);jpeg_create_decompress(&c);jpeg_stdio_src(&c,f);jpeg_read_header(&c,TRUE);
 jvirt_barray_ptr*coef=jpeg_read_coefficients(&c);
 int comps=c.num_components;
 BW s[12];memset(s,0,sizeof(s));char path[1024];
 for(int m=0;m<3;m++)for(int j=0;j<4;j++){
  snprintf(path,sizeof(path),"%s_m%d_c%d.bin",argv[2],m,j);
  s[m*4+j].fp=fopen(path,"wb");if(!s[m*4+j].fp){perror("output");return 2;}
 }
 unsigned long long totals[3][4]={0};
 const JDIMENSION mcu_cols=(c.image_width+8*c.max_h_samp_factor-1)/(8*c.max_h_samp_factor);
 const JDIMENSION mcu_rows=(c.image_height+8*c.max_v_samp_factor-1)/(8*c.max_v_samp_factor);
 for(JDIMENSION my=0;my<mcu_rows;my++)for(JDIMENSION mx=0;mx<mcu_cols;mx++)
 for(int cp=0;cp<comps;cp++){
  jpeg_component_info*com=&c.comp_info[cp];
  for(int vy=0;vy<com->v_samp_factor;vy++)for(int hx=0;hx<com->h_samp_factor;hx++){
   JDIMENSION by=my*com->v_samp_factor+vy,bx=mx*com->h_samp_factor+hx;
   if(by>=com->height_in_blocks||bx>=com->width_in_blocks)continue;
   JBLOCKARRAY row=(*c.mem->access_virt_barray)((j_common_ptr)&c,coef[cp],by,1,FALSE);
   for(int k=1;k<64;k++){
    JCOEF v=row[0][bx][zz[k]];
    for(int m=0;m<3;m++){
     size_t previous=s[m*4+cp+1].count;
     write_coeff(&s[m*4+cp+1],v,m);
     totals[m][cp+1]+=s[m*4+cp+1].count-previous;
     write_coeff(&s[m*4+0],v,m);
    }
   }
  }
 }
 for(int m=0;m<3;m++)for(int j=0;j<4;j++)done(&s[m*4+j]);
 printf("%s",argv[1]);
 for(int cp=0;cp<comps;cp++)printf(" comp%d=%dx%d",cp,c.comp_info[cp].width_in_blocks,c.comp_info[cp].height_in_blocks);
 printf(" extract_bits(all, Y, Cb, Cr):");for(int m=0;m<3;m++){
  printf(" mode%d=%zu",m,s[m*4].count);
  for(int cp=0;cp<comps;cp++)printf(",%llu",totals[m][cp+1]);
 }
 printf("\n");
 jpeg_finish_decompress(&c);jpeg_destroy_decompress(&c);fclose(f);return 0;
}
