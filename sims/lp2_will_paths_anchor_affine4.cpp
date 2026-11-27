// Agent41, 27 Nov 2026. Input: base29 p33[132:]..p40 tape, then p57.
#include <algorithm>
#include <array>
#include <cassert>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using V=vector<int>;
int mod(int x){return (x%29+29)%29;}
V dec(string s){V v;for(char x:s)v.push_back(x<='9'?x-'0':x-'a'+10);return v;}
string enc(const V&v){string s;for(int x:v)s+=x<10?'0'+x:'a'+x-10;return s;}
void gen(V&k,array<int,4> t,int end){for(int i=4;i<end;i++)k[i]=(t[0]*k[i-1]+t[1]*k[i-2]+t[2]*k[i-3]+t[3]*k[i-4])%29;}
// Exact boolean reachability; force second four known non-F letters and clock.
bool reach(const V&c,const V&k,int gap,int dist,int end){int n=c.size();V cur(n+1),next(n+1);cur[4]=1;int lo=4,hi=4;for(int i=4;i<end;i++){int nl=n+1,nh=-1;for(int j=lo;j<=hi;j++)if(cur[j]){if(i>=dist&&i<dist+4&&j!=gap+i-dist)continue;if(c[i]==0&&(i<dist||i>=dist+4)){next[j]=1;nl=min(nl,j);nh=max(nh,j);}if(c[i]!=k[j]){next[j+1]=1;nl=min(nl,j+1);nh=max(nh,j+1);}}if(nh<0)return false;fill(cur.begin()+lo,cur.begin()+hi+1,0);swap(cur,next);lo=nl;hi=nh;}return true;}
void run(const V&c,int dist,const V&p0,const V&p1){int n=c.size(); V k(n+1),r(n+1),full(n+1),k1(4);for(int i=0;i<4;i++){k[i]=mod(c[i]-p0[i]);k1[i]=mod(c[dist+i]-p1[i]);}int z=count(c.begin()+4,c.begin()+dist,0),lo=dist-z;int oc=0,gc=0,fc=0,fit=0;array<int,29>inv{};for(int a=1;a<29;a++)for(int b=1;b<29;b++)if(a*b%29==1)inv[a]=b;cout<<"N "<<n<<" D "<<dist<<" Z "<<z<<" seed "<<enc(V(k.begin(),k.begin()+4))<<" target "<<enc(k1)<<endl;
for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int d=0;d<29;d++)for(int e=0;e<29;e++){array<int,4>t={a,b,d,e};for(int i=4;i<dist+4;i++){k[i]=(a*k[i-1]+b*k[i-2]+d*k[i-3]+e*k[i-4])%29;r[i]=(1+a*r[i-1]+b*r[i-2]+d*r[i-3]+e*r[i-4])%29;}for(int g=lo;g<=dist;g++){int h=-1;bool valid=true;for(int j=0;j<4;j++){int diff=mod(k1[j]-k[g+j]);if(r[g+j]){int v=diff*inv[r[g+j]]%29;if(h>=0&&h!=v){valid=false;break;}h=v;}else if(diff){valid=false;break;}}if(!valid)continue;int mn=h<0?0:h,mx=h<0?28:h;for(int v=mn;v<=mx;v++){gc++;if(g==dist){oc++;cout<<"O "<<a<<' '<<b<<' '<<d<<' '<<e<<' '<<v<<'\n';}for(int i=0;i<4;i++)full[i]=k[i];for(int i=4;i<=n;i++)full[i]=(v+a*full[i-1]+b*full[i-2]+d*full[i-3]+e*full[i-4])%29;if(reach(c,full,g,dist,dist+4)){fit++;bool ok=reach(c,full,g,dist,n);fc+=ok;cout<<"F "<<a<<' '<<b<<' '<<d<<' '<<e<<' '<<v<<' '<<g<<' '<<ok<<'\n';}}}}cout<<"RESULT "<<oc<<' '<<gc<<' '<<fit<<' '<<fc<<endl;}
int main(){string s,control;cin>>s>>control;V c=dec(s),donor=dec(control);assert(c.size()==1779&&donor.size()==95);const V w={7,10,20,20},p={13,24,2,15};assert(V(c.begin(),c.begin()+4)==V({3,15,17,22}));assert(V(c.begin()+1619,c.begin()+1623)==V({4,15,14,21}));cout<<"ORIGINAL\n";run(c,1619,w,p);for(bool hold:{false,true}){V plain(c.size()),key(c.size()+1),cipher(c.size());for(int i=0;i<(int)c.size();i++)plain[i]=donor[i%donor.size()];copy(w.begin(),w.end(),plain.begin());copy(p.begin(),p.end(),plain.begin()+1619);array<int,4>t=hold?array<int,4>{23,5,6,15}:array<int,4>{3,5,8,2};copy_n(V{25,5,26,2}.begin(),4,key.begin());int bias=hold?13:7;for(int i=4;i<(int)key.size();i++)key[i]=(bias+t[0]*key[i-1]+t[1]*key[i-2]+t[2]*key[i-3]+t[3]*key[i-4])%29;int j=0,gap=0;for(int i=0;i<(int)c.size();i++){if(i==1619)gap=j;cipher[i]=(hold&&plain[i]==0)?0:mod(plain[i]+key[j++]);}assert(equal(p.begin(),p.end(),plain.begin()+1619));cout<<"PLANT "<<hold<<" gap "<<gap<<" taps "<<t[0]<<' '<<t[1]<<' '<<t[2]<<' '<<t[3]<<" bias "<<bias<<'\n';assert(hold?reach(cipher,key,gap,1619,c.size()):true);run(cipher,1619,w,p);}}
