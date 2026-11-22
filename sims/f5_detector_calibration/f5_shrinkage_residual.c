/* F5 shrinkage-specific residual versus a blind, source-like ink reconstruction. */
#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>
static void load(const char *path, struct jpeg_decompress_struct *j, struct jpeg_error_mgr *e, FILE **fp, jvirt_barray_ptr **coef) {
 *fp=fopen(path,"rb"); if(!*fp){perror(path);exit(2);}
 j->err=jpeg_std_error(e); jpeg_create_decompress(j); jpeg_stdio_src(j,*fp);
 if(jpeg_read_header(j,TRUE)!=JPEG_HEADER_OK){fprintf(stderr,"invalid JPEG\n");exit(2);}
 *coef=jpeg_read_coefficients(j);
}
int main(int argc,char **argv){
 if(argc!=3){fprintf(stderr,"usage: f5_shrinkage_residual observed.jpg reconstructed.jpg\n");return 2;}
 struct jpeg_decompress_struct a={0},b={0}; struct jpeg_error_mgr ea,eb;
 FILE *fa=NULL,*fb=NULL; jvirt_barray_ptr *ac,*bc;
 load(argv[1],&a,&ea,&fa,&ac); load(argv[2],&b,&eb,&fb,&bc);
 if(a.num_components!=b.num_components||a.image_width!=b.image_width||a.image_height!=b.image_height){fprintf(stderr,"dimensions/components mismatch\n");return 2;}
 long long plus[9]={0},minus[9]={0},eq[9]={0},total[9]={0};
 for(int comp=0;comp<a.num_components;comp++){
  jpeg_component_info *ca=&a.comp_info[comp],*cb=&b.comp_info[comp];
  if(ca->width_in_blocks!=cb->width_in_blocks||ca->height_in_blocks!=cb->height_in_blocks){fprintf(stderr,"component block mismatch\n");return 2;}
  for(JDIMENSION y=0;y<ca->height_in_blocks;y++){
   JBLOCKARRAY ar=(*a.mem->access_virt_barray)((j_common_ptr)&a,ac[comp],y,1,FALSE);
   JBLOCKARRAY br=(*b.mem->access_virt_barray)((j_common_ptr)&b,bc[comp],y,1,FALSE);
   for(JDIMENSION x=0;x<ca->width_in_blocks;x++)
    for(int f=1;f<64;f++){
     int u=f%8,v=f/8,band=u+v<=3?0:u+v<=7?1:2;
     int obs=ar[0][x][f],pred=br[0][x][f];
     int mag=abs(obs)<=1?0:abs(obs)<=3?1:2,k=band*3+mag;
     total[k]++;
     if(obs!=0&&pred!=0&&(obs>0)!=(pred>0))continue;
     int d=abs(pred)-abs(obs);
     if(d==1)plus[k]++;else if(d==-1)minus[k]++;else if(d==0)eq[k]++;
    }
  }
 }
 printf("{\"plus\":[");for(int k=0;k<9;k++)printf("%s%lld",k?",":"",plus[k]);
 printf("],\"minus\":[");for(int k=0;k<9;k++)printf("%s%lld",k?",":"",minus[k]);
 printf("],\"equal\":[");for(int k=0;k<9;k++)printf("%s%lld",k?",":"",eq[k]);
 printf("],\"total\":[");for(int k=0;k<9;k++)printf("%s%lld",k?",":"",total[k]);puts("]}");
 jpeg_finish_decompress(&a);jpeg_destroy_decompress(&a);fclose(fa);
 jpeg_finish_decompress(&b);jpeg_destroy_decompress(&b);fclose(fb);
 return 0;
}
