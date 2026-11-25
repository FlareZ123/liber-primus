#include <algorithm>
#include <array>
#include <cmath>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <vector>
#include <unordered_map>
#include <cstdint>
using namespace std;constexpr int N=29,Q=8;
using Key=array<int,N>;using Prob=array<double,N>;
struct State{array<Prob,Q> v{};array<bool,Q> seen{};vector<int> holds;double ll=0;int phase=0;};
struct Model{Key f,inv;Prob p;double h;};
bool consume(State&s,int c,const Model&m){int j=s.phase;double z=0;Prob next{};if(!s.seen[j]){next=m.p;z=1.0/N;s.seen[j]=true;}else{for(int y=1;y<N;y++){double w=m.p[y]*s.v[j][m.inv[(c-y+N)%N]];next[y]=w;z+=w;}if(z==0)return false;for(double&v:next)v/=z;}s.v[j]=next;s.phase=(j+1)%Q;s.ll+=log1p(-m.h)+log(z);return true;}
int blockZeros=8;
uint64_t signature(const State&s){uint64_t k=s.phase;for(int j=0;j<Q;j++){if(!s.seen[j])return UINT64_MAX;int x=0;for(int y=1;y<N;y++)if(s.v[j][y]>0){if(x)return UINT64_MAX;x=y;}if(!x)return UINT64_MAX;k=(k<<5)|x;}return k;}
void extend(State s,const vector<int>&ct,int a,int b,const Model&m,vector<State>&out){for(int i=a;i<b;i++){int c=ct[i];if(c==0){State hold=s;hold.holds.push_back(i);hold.ll+=log(m.h);extend(move(hold),ct,i+1,b,m,out);}if(!consume(s,c,m))return;}out.push_back(move(s));}
vector<State> beam(const vector<int>&ct,int a,int b,const Model&m,int width,State start){vector<State>states{move(start)},next,unique;for(int i=a;i<b;){int end=i,zeros=0;while(end<b){if(ct[end++]==0&&++zeros==blockZeros)break;}while(end<b&&ct[end]!=0)end++;
next.clear();for(State&s:states)extend(move(s),ct,i,end,m,next);if(next.empty()){cerr<<"death at "<<i<<".."<<end<<"\n";return {};}unordered_map<uint64_t,int>best;unique.clear();for(State&s:next){auto k=signature(s);if(k==UINT64_MAX){unique.push_back(move(s));continue;}auto [it,added]=best.emplace(k,unique.size());if(added)unique.push_back(move(s));else if(s.ll>unique[it->second].ll)unique[it->second]=move(s);}
if((int)unique.size()>width){nth_element(unique.begin(),unique.begin()+width,unique.end(),[](const State&a,const State&b){return a.ll>b.ll;});unique.resize(width);}states.swap(unique);i=end;}sort(states.begin(),states.end(),[](const State&a,const State&b){return a.ll>b.ll;});return states;}
struct Decoded{vector<int> pt;State end;array<int,Q> primer{};};
Decoded recover(const vector<int>&ct,int a,int b,const Model&m,const State&s){Decoded d;d.pt.assign(b-a,0);array<vector<int>,Q> indices;int phase=0;size_t k=0;for(int i=a;i<b;i++){if(k<s.holds.size()&&s.holds[k]==i){k++;continue;}indices[phase].push_back(i);phase=(phase+1)%Q;}d.end.phase=phase;for(int j=0;j<Q;j++){auto&v=indices[j];if(v.empty())continue;double best=-numeric_limits<double>::infinity();int first=-1;for(int x=1;x<N;x++){double ll=log(m.p[x]);int y=x;for(size_t t=1;t<v.size();t++){y=(ct[v[t]]-m.f[y]+N)%N;if(y==0){ll=-numeric_limits<double>::infinity();break;}ll+=log(m.p[y]);}if(ll>best){best=ll;first=x;}}if(first<1){cerr<<"invalid recovery\n";exit(4);}int y=first;d.primer[j]=(ct[v[0]]-y+N)%N;d.pt[v[0]-a]=y;for(size_t t=1;t<v.size();t++){y=(ct[v[t]]-m.f[y]+N)%N;d.pt[v[t]-a]=y;}d.end.v[j][y]=1;d.end.seen[j]=true;}return d;}
vector<int> recoverFixed(const vector<int>&ct,int a,int b,const Model&m,const State&start,const State&end){vector<int>pt(b-a,0);array<int,Q> prev{};for(int j=0;j<Q;j++)prev[j]=max_element(start.v[j].begin(),start.v[j].end())-start.v[j].begin();int phase=start.phase;size_t k=0;for(int i=a;i<b;i++){if(k<end.holds.size()&&end.holds[k]==i){k++;continue;}int y=(ct[i]-m.f[prev[phase]]+N)%N;if(y==0){cerr<<"bad fixed decode\n";exit(5);}pt[i-a]=y;prev[phase]=y;phase=(phase+1)%Q;}return pt;}
double total(const vector<State>&s){if(s.empty())return -numeric_limits<double>::infinity();double z=0;for(auto&v:s)z+=exp(v.ll-s[0].ll);return s[0].ll+log(z);}
int main(int argc,char**argv){if(argc!=8)return 2;blockZeros=stoi(argv[7]);ifstream ci(argv[1]),pi(argv[2]),ki(argv[3]);vector<int>ct;int x;while(ci>>x)ct.push_back(x);Model m;for(double&v:m.p)pi>>v;for(int&v:m.f)ki>>v;for(int i=0;i<N;i++)m.inv[m.f[i]]=i;int fit=stoi(argv[4]),width=stoi(argv[5]);m.h=stod(argv[6]);auto states=beam(ct,0,fit,m,width,State{});if(states.empty()){cerr<<"no fit path\n";return 3;}auto d=recover(ct,0,fit,m,states[0]);auto hold=beam(ct,fit,ct.size(),m,width,d.end);cout.precision(12);cout<<"fitLogMarginalLower="<<total(states)<<" fitBest="<<states[0].ll<<" fitHolds="<<states[0].holds.size()<<" holdLogMarginalLower="<<total(hold)<<"\n";if(hold.empty())return 0;auto pt=recoverFixed(ct,fit,ct.size(),m,d.end,hold[0]);d.pt.insert(d.pt.end(),pt.begin(),pt.end());for(int v:d.primer)cout<<v<<" ";cout<<"\n";for(int v:d.pt)cout<<"0123456789abcdefghijklmnopqrs"[v];cout<<"\n";}