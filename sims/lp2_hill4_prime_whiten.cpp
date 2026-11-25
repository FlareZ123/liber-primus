#include <array>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
struct Hit {long energy=0;array<int,4> r{};int m=0;};
int main(int argc,char**argv){
 if(argc!=3){cerr<<"usage: whiten tape phase\n";return 1;}ifstream f(argv[1]);string s;f>>s;int off=stoi(argv[2]),N=(s.size()-off)/4;vector<int>C;for(char c:s)C.push_back(c<='9'?c-'0':c-'a'+10);
 vector<int> primes;for(int x=2;primes.size()<size_t(4*N);x++){bool ok=true;for(int p:primes){if(p*p>x)break;if(x%p==0){ok=false;break;}}if(ok)primes.push_back(x);}for(auto &p:primes)p=(p-1)%29;
 vector<array<int,4>> rows;for(int j=0;j<4;j++){int limit=1;for(int k=j+1;k<4;k++)limit*=29;for(int z=0;z<limit;z++){array<int,4>a{};a[j]=1;int u=z;for(int k=j+1;k<4;k++){a[k]=u%29;u/=29;}rows.push_back(a);}}
 vector<vector<uint8_t>> pq(4*29,vector<uint8_t>(N));for(int j=0;j<4;j++)for(int m=0;m<29;m++)for(int i=0;i<N;i++)pq[j*29+m][i]=m*primes[4*i+j]%29;
 uint8_t mult[29][29];for(int a=0;a<29;a++)for(int b=0;b<29;b++)mult[a][b]=a*b%29;
 array<Hit,4> post{};array<Hit,29> pre{};
 #pragma omp parallel
 {
 array<Hit,4> localpost{};array<Hit,29> localpre{};vector<uint8_t>x(N),y(N);uint16_t h[29];
 #pragma omp for schedule(static)
 for(int ri=0;ri<(int)rows.size();ri++){auto r=rows[ri];for(int i=0;i<N;i++){int t=off+4*i;x[i]=(r[0]*C[t]+r[1]*C[t+1]+r[2]*C[t+2]+r[3]*C[t+3])%29;y[i]=(r[0]*primes[4*i]+r[1]*primes[4*i+1]+r[2]*primes[4*i+2]+r[3]*primes[4*i+3])%29;}
 for(int j=0;j<4;j++)for(int m=0;m<29;m++){fill(h,h+29,0);const auto &q=pq[j*29+m];for(int i=0;i<N;i++){unsigned v=x[i]+q[i];v-=29*(v>=29);h[v]++;}long e=0;for(auto v:h)e+=long(v)*v;if(e>localpost[j].energy)localpost[j]={e,r,m};}
 for(int m=0;m<29;m++){fill(h,h+29,0);auto &q=mult[m];for(int i=0;i<N;i++){unsigned v=x[i]+q[y[i]];v-=29*(v>=29);h[v]++;}long e=0;for(auto v:h)e+=long(v)*v;if(e>localpre[m].energy)localpre[m]={e,r,m};}
 }
 #pragma omp critical
 {for(int j=0;j<4;j++)if(localpost[j].energy>post[j].energy)post[j]=localpost[j];for(int m=0;m<29;m++)if(localpre[m].energy>pre[m].energy)pre[m]=localpre[m];}
 }
 auto out=[](const Hit& h){cout<<"{\"E\":"<<h.energy<<",\"r\":["<<h.r[0]<<","<<h.r[1]<<","<<h.r[2]<<","<<h.r[3]<<"],\"m\":"<<h.m<<"}";};
 double norm=s.size()-4*N;for(auto h:post)norm+=sqrt(h.energy);double total=s.size(),postBound=(norm*norm-total)/(total*(total-1));Hit best=*max_element(pre.begin(),pre.end(),[](auto a,auto b){return a.energy<b.energy;});norm=s.size()-4*N+4*sqrt(best.energy);double preBound=(norm*norm-total)/(total*(total-1));
 cout<<"{\"n\":"<<s.size()<<",\"phase\":"<<off<<",\"blocks\":"<<N<<",\"rows\":"<<rows.size()<<",\"post\":[";for(int j=0;j<4;j++){if(j)cout<<",";out(post[j]);}cout<<"],\"postBound\":";cout.precision(15);cout<<postBound<<",\"pre\":[";for(int m=0;m<29;m++){if(m)cout<<",";out(pre[m]);}cout<<"],\"preBound\":"<<preBound<<"}\n";
}
