#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <random>
#include <string>
#include <vector>
using namespace std;
using Perm=array<int,16>;
constexpr float NEG=-1e20f;
float lm[30][29];
vector<int> K;
vector<int> read(const string& name){ifstream f(name);string s;f>>s;vector<int> v;for(char c:s)v.push_back(c<='9'?c-'0':c-'a'+10);return v;}
int mod(int v){return (v+29)%29;}
void train(){double u[29],b[30][29]={},n[30]={};fill(u,u+29,.5);ifstream f("prior.txt");string s;while(f>>s){int prev=29;for(char c:s){int v=c<='9'?c-'0':c-'a'+10;u[v]++;b[prev][v]++;n[prev]++;prev=v;}}double total=accumulate(u,u+29,0.0);assert(total==1050.5);for(int i=0;i<30;i++)for(int j=0;j<29;j++)lm[i][j]=log((b[i][j]+5*u[j]/total)/(n[i]+5));for(int n=2;K.size()<6000;n++){bool p=true;for(int d=2;d*d<=n;d++)if(n%d==0){p=false;break;}if(p)K.push_back((n-1)%29);}}
vector<int> enc(const vector<int>& p,int origin){vector<int> c;int j=origin;for(int v:p)c.push_back(v==0?0:(v+K[j++])%29);return c;}
vector<int> reorder(const vector<int>& c,const Perm& p){vector<int> v=c;for(int i=0;i+16<=c.size();i+=16)for(int j=0;j<16;j++)v[i+j]=c[i+p[j]];return v;}
Perm inv(const Perm& p){Perm q;for(int i=0;i<16;i++)q[p[i]]=i;return q;}
struct Result {float score;vector<int> plain;int errors;};
// A(h) ends with a consuming rune, B(h) ends with a literal F. For a given h,
// last A rune is determined by ciphertext and the clock. Thus two scores suffice.
Result score(const vector<int>& raw,const Perm& p,int origin,int N,float penalty,bool trace=false){
 const auto c=reorder(raw,p); const int nz=count(c.begin(),c.begin()+N,0);vector<float>a(nz+2,NEG),b(nz+2,NEG),na(nz+2,NEG),nb(nz+2,NEG);a[0]=0;int z=0;
 vector<array<unsigned char,2>> parent; if(trace)parent.resize(N*(nz+2));
 for(int i=0;i<N;i++){
   int v=c[i],vv=i?c[i-1]:0;
   for(int h=0;h<=z+1;h++)na[h]=nb[h]=NEG;
   for(int h=0;h<=z;h++){
      const int x=mod(v-K[origin+i-h]),last=i>h?mod(vv-K[origin+i-1-h]):29;
      float aa=a[h]+lm[last][x],bb=b[h]+lm[0][x]; if(x==0){aa-=penalty;bb-=penalty;}
      na[h]=max(aa,bb);if(trace)parent[i*(nz+2)+h][0]=bb>aa;
      if(v==0){aa=a[h]+lm[last][0];bb=b[h]+lm[0][0];nb[h+1]=max(aa,bb);if(trace)parent[i*(nz+2)+h+1][1]=bb>aa;}
   }
   a.swap(na);b.swap(nb);if(v==0)z++;
 }
 float best=NEG;int h=0,t=0;for(int i=0;i<=z;i++){if(a[i]>best){best=a[i];h=i;t=0;}if(b[i]>best){best=b[i];h=i;t=1;}}
 Result out{best,{},0};if(trace&&best>NEG/2){out.plain.resize(N);for(int i=N-1;i>=0;i--){int pp=t?0:mod(c[i]-K[origin+i-h]);out.plain[i]=pp;out.errors+=(!t&&pp==0);int prev=parent[i*(nz+2)+h][t];h-=t;t=prev;}}
 return out;
}
void printp(const Perm& p){for(int x:p)cout<<x<<',';}
int main(int argc,char**argv){train();string mode=argv[1];int restarts=stoi(argv[2]),iters=stoi(argv[3]),origin=stoi(argv[4]);const auto raw=read("raw.txt"),donor=read("donor.txt");Perm truth{5,10,12,14,6,0,15,11,2,7,1,8,3,4,13,9};auto c=mode=="plant"?reorder(enc(donor,origin),inv(truth)):raw;constexpr int N=928;mt19937 rng(3301);uniform_real_distribution<float> u(0,1);Perm best{};float bs=NEG;const float penalty=12;int steps=0;
 if(mode=="plant"){auto x=score(c,truth,origin,N,penalty,true);cout<<"true training "<<x.score/N<<" errors "<<x.errors<<endl;}
 for(int r=0;r<restarts;r++){Perm p; iota(p.begin(),p.end(),0);shuffle(p.begin(),p.end(),rng);if(r%3==2&&bs>NEG/2){p=best;for(int j=0;j<4;j++)swap(p[rng()%16],p[rng()%16]);}float s=score(c,p,origin,N,penalty).score;
 for(int i=0;i<iters;i++){Perm q=p;int x=rng()%16,y=rng()%16;swap(q[x],q[y]);if(rng()%20==0)swap(q[rng()%16],q[rng()%16]);float t=score(c,q,origin,N,penalty).score;float T=8*pow(.035f,float(i)/iters);if(t>s||u(rng)<exp((t-s)/T)){p=q;s=t;}if(s>bs){best=p;bs=s;}steps++;}
 if(r%5==0||r+1==restarts){cout<<"restart "<<r<<" best "<<bs/N<<" perm ";printp(best);cout<<endl;}
 }
 cout<<"steps "<<steps<<" best ";printp(best);cout<<endl;auto tr=score(c,best,origin,N,1e6,true),full=score(c,best,origin,c.size(),1e6,true);cout<<"strict train score "<<tr.score/N<<" errors "<<tr.errors<<" full score "<<full.score/c.size()<<" errors "<<full.errors<<endl;if(mode=="plant"){int k=0;for(int i=0;i<16;i++)k+=best[i]==truth[i];int correct=0,hold=0;for(int i=0;i<full.plain.size();i++){correct+=full.plain[i]==donor[i];if(i>=N)hold+=full.plain[i]==donor[i];}cout<<"key "<<k<<"/16 full correct "<<correct<<" withheld "<<hold<<endl;}if(full.errors==0){auto inner=enc(full.plain,origin);assert(reorder(inner,inv(best))==c);}
 ofstream f(mode+"-anneal.txt");for(int v:full.plain)f<<char(v<10?'0'+v:'a'+v-10);f<<'\n';
 return 0;
}
