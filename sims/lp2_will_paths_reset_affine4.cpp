// Agent41 — exhaustive shared affine GP29 recurrence with independent local seeds.
#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <iostream>
#include <string>
#include <vector>
using namespace std;using V=vector<int>;using T=array<int,5>;using S=array<int,4>;
V dec(string s){V v;for(char c:s)v.push_back(c<='9'?c-'0':c-'a'+10);return v;}
string enc(const V&v){string s;for(int x:v)s+=x<10?'0'+x:'a'+x-10;return s;}
double lp[29][29][29];int mod(int x){return(x+29)%29;}
double score(const V&p){double s=0;for(int i=2;i<(int)p.size();i++)s+=lp[p[i-2]][p[i-1]][p[i]];return s/(p.size()-2);}
V decode(const V&c,const S&seed,T t){V p;int a=seed[3],b=seed[2],d=seed[1],e=seed[0];for(int i=4;i<(int)c.size();i++){int k=(t[0]*a+t[1]*b+t[2]*d+t[3]*e+t[4])%29;p.push_back(mod(c[i]-k));e=d;d=b;b=a;a=k;}return p;}
double runscore(const V&c,const S&seed,T t){int a=seed[3],b=seed[2],d=seed[1],e=seed[0],x=0,y=0;double s=0;for(int i=4;i<(int)c.size();i++){int k=(t[0]*a+t[1]*b+t[2]*d+t[3]*e+t[4])%29;int z=mod(c[i]-k);if(i>=6)s+=lp[x][y][z];x=y;y=z;e=d;d=b;b=a;a=k;}return s/(c.size()-6);}
double walk(const V&c,const int*k,int i,int j,int x,int y,double sum){
 for(;i<(int)c.size();i++){
  if(c[i]==0){double h=walk(c,k,i+1,j,y,0,sum+(i>=6?lp[x][y][0]:0.));if(k[j]==0)return h;int z=29-k[j];double v=walk(c,k,i+1,j+1,y,z,sum+(i>=6?lp[x][y][z]:0.));return max(h,v);}
  if(c[i]==k[j])return -1e9;
  int z=mod(c[i]-k[j++]);if(i>=6)sum+=lp[x][y][z];x=y;y=z;
 }return sum;
}
double holdscore(const V&c,const S&seed,T t){int k[256];copy(seed.begin(),seed.end(),k);for(int i=4;i<(int)c.size();i++)k[i]=(t[0]*k[i-1]+t[1]*k[i-2]+t[2]*k[i-3]+t[3]*k[i-4]+t[4])%29;return walk(c,k,4,4,0,0,0.)/(c.size()-6);}
V plant(const V&p,const S&seed,T t,bool hold){V c={0,0,0,0};int a=seed[3],b=seed[2],d=seed[1],e=seed[0];for(int x:p){if(hold&&!x){c.push_back(0);continue;}int k=(t[0]*a+t[1]*b+t[2]*d+t[3]*e+t[4])%29;c.push_back((x+k)%29);e=d;d=b;b=a;a=k;}return c;}
void show(T t){for(int x:t)cout<<x<<' ';}
void run(V c1,V c2,bool hold){S s1={25,5,26,2},s2={20,20,12,6};double floor1=-3.320259963435666,floor2=-3.221241329729617;double fit=-1e9,held=-1e9,maxheld=-1e9;T best{},best2{};int n1=0,n2=0,legal=0;auto sc=hold?holdscore:runscore;
for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int c=0;c<29;c++)for(int d=0;d<29;d++)for(int e=0;e<29;e++){T t={a,b,c,d,e};double f=sc(c1,s1,t);if(f>-1e6)legal++;if(f>fit){fit=f;best=t;held=sc(c2,s2,t);}if(f>=floor1){n1++;double h=sc(c2,s2,t);if(h>maxheld){maxheld=h;best2=t;}if(h>=floor2){n2++;if(n2<=20){cout<<"JOINT ";show(t);cout<<f<<' '<<h<<'\n';}}}}
cout<<"LEGAL "<<legal<<"\nCOUNTS "<<n1<<' '<<n2<<"\nFIT ";show(best);cout<<fit<<' '<<held<<"\nMAX_HELD ";show(best2);cout<<maxheld<<'\n';if(!hold){cout<<"FIT_DEC "<<enc(decode(c1,s1,best))<<' '<<enc(decode(c2,s2,best))<<'\n';if(n1)cout<<"MAX_HELD_DEC "<<enc(decode(c1,s1,best2))<<' '<<enc(decode(c2,s2,best2))<<'\n';}}
int main(int argc,char**argv){string train,tape,p57;cin>>train>>tape>>p57;V tr=dec(train),t=dec(tape);assert(tr.size()==3510&&t.size()==1779);int b[29][29]={},tri[29][29][29]={};for(int i=2;i<(int)tr.size();i++){b[tr[i-2]][tr[i-1]]++;tri[tr[i-2]][tr[i-1]][tr[i]]++;}for(int i=0;i<29;i++)for(int j=0;j<29;j++)for(int k=0;k<29;k++)lp[i][j][k]=log((tri[i][j][k]+1.)/(b[i][j]+29.));cout.precision(12);cout<<"CAL "<<score(tr)<<' '<<score(dec(p57))<<endl;assert(abs(score(tr)+2.260728012730832)<1e-10);assert(abs(score(dec(p57))+2.468144714244746)<1e-10);
bool hold=argc>1&&string(argv[1])=="hold",control=argc>2&&string(argv[2])=="plant";
if(control){V p1=dec("316819ni4fgo9nlo9ng32i3di98o9nin2ifs45803439i783f8okk4i5ia1iafb3q64sgi42o96a1l"),p2=dec("9n2i7oq0o4i4fo9n78i939i30q310okkfn3798i0okkf03423fihi8a9n8ajo5o1gr9o6oa9fg2ifg1jhklfg39ioqo9n8i0okkf03423fio8sn308aj783231680ofgi4o9nf14i430033gqig4ij31in93");T tt=hold?T{23,5,6,15,13}:T{3,5,8,2,7};cout<<"PLANT_TRUTH "<<score(p1)<<' '<<score(p2)<<endl;run(plant(p1,{25,5,26,2},tt,hold),plant(p2,{20,20,12,6},tt,hold),hold);}else run(V(t.begin(),t.begin()+82),V(t.begin()+1619,t.end()),hold);}
