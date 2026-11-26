#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using M=uint32_t; using State=array<M,8>; using Key=array<int,8>;
constexpr M FULL=(1u<<29)-1; constexpr int N=840,CUT=512;
struct Segment{int start,end; State bits{};};
struct Best{int64_t fit=INT64_MIN,tail=INT64_MIN; Key key{}; uint64_t mask=0;};
struct Search{
 vector<int>x,order;vector<Segment>seg;int w[29][29]{};int slot[N]{},naturalSlot[N]{},naturalC[N]{};Key key{};int lut[9][29]{};uint64_t legal=0,pairs=0,mask=0,prefixBits=0;Best predictive,joint;
 Search(string tape,vector<int>o,const vector<string>& records):order(o){for(char c:tape)x.push_back(c-'A');if(x.size()!=N||order.size()!=N)throw runtime_error("length");int n[29][29]{},tot[29]{};for(auto &s:records)for(int i=1;i<(int)s.size();i++){int a=s[i-1]-'A',b=s[i]-'A';n[a][b]++;tot[a]++;}for(int a=0;a<29;a++)for(int b=0;b<29;b++)w[a][b]=lround(1e6*log((n[a][b]+.5)/(tot[a]+14.5)));int st=0,z=0;for(int i=0;i<=N;i++)if(i==N||x[i]==0){Segment s{st,i,{}};for(int j=st;j<i;j++)s.bits[(j-st)%8]|=1u<<x[j];seg.push_back(s);st=i+1;if(i<CUT)z++;}if(seg.size()>63)throw runtime_error("too many zeroes");prefixBits=(1ull<<z)-1;for(int i=0;i<N;i++)naturalC[i]=x[order[i]];}
 void evaluate(){pairs++;int64_t a=0,b=0;int prev=lut[naturalSlot[0]][naturalC[0]];for(int i=1;i<CUT;i++){int p=lut[naturalSlot[i]][naturalC[i]];a+=w[prev][p];prev=p;}auto t=make_pair(key,mask&prefixBits),u=make_pair(predictive.key,predictive.mask&prefixBits);bool candidate=a>predictive.fit||(a==predictive.fit&&t<=u);for(int i=CUT;i<N;i++){int p=lut[naturalSlot[i]][naturalC[i]];b+=w[prev][p];prev=p;}if(candidate&&(a>predictive.fit||t<u||b>predictive.tail))predictive={a,b,key,mask};if(joint.fit==INT64_MIN||a+b>joint.fit+joint.tail)joint={a,b,key,mask};}
 void keys(int j,const State& d){if(j==8){evaluate();return;}for(M a=d[j];a;a&=a-1){int k=__builtin_ctz(a);key[j]=k;for(int c=0;c<29;c++)lut[j][c]=(c+29-k)%29;keys(j+1,d);}}
 void leaf(const State& f,uint64_t h){legal++;mask=h;int j=0,z=0;for(int i=0;i<N;i++){if(x[i]==0){if(h&(1ull<<z++)){slot[i]=8;continue;}}slot[i]=j++%8;}for(int i=0;i<N;i++)naturalSlot[i]=slot[order[i]];State d;for(int k=0;k<8;k++)d[k]=FULL^f[k];keys(0,d);}
 void dfs(int s,int phase,State f,uint64_t h){auto &a=seg[s];for(int j=0;j<8;j++)f[(phase+j)%8]|=a.bits[j];if(find(f.begin(),f.end(),FULL)!=f.end())return;int j=(phase+a.end-a.start)%8;if(s==(int)seg.size()-1){leaf(f,h);return;}dfs(s+1,j,f,h|(1ull<<s));f[j]|=1;if(f[j]!=FULL)dfs(s+1,(j+1)%8,f,h);}
 void print(const char* tag,Best v){cout<<tag<<" fit="<<v.fit<<" tail="<<v.tail<<" key=";for(int k:v.key)cout<<k<<",";cout<<" mask="<<v.mask<<" plaintext=";int j=0,z=0;string p;for(int c:x){int a;if(c==0&&(v.mask&(1ull<<z++)))a=0;else{a=(c+29-v.key[j%8])%29;if(!a||((a+v.key[j++%8])%29)!=c)throw runtime_error("replay");}p+=char('A'+a);}for(int i:order)cout<<p[i];cout<<endl;}
};
int main(){string tape;cin>>tape;vector<int>o(N);for(int&i:o)cin>>i;int n;cin>>n;vector<string>records(n);for(auto&s:records)cin>>s;Search s(tape,o,records);s.dfs(0,0,State{},0);cout<<"legal="<<s.legal<<" pairs="<<s.pairs<<endl;if(s.pairs){s.print("predictive",s.predictive);s.print("joint",s.joint);}}
