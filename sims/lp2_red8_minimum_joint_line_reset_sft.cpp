// Continuation of the calibrated minimum-line-reset inverse.
// Keep all p55-compatible minimum p54 paths (three changes, end phase 2).
// p55 supplies structural phase reachability only, no lexical fit.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
Paths conditioned(const string& c,const vector<int>& boundaries,int start=-1,int end=-1){
 int n=c.size();set<int>B(boundaries.begin(),boundaries.end());vector<array<int,8>> d(n+1);
 for(int j=0;j<8;j++)d[n][j]=(end<0||j==end)?0:100000;
 for(int i=n-1;i>=0;i--)for(int p=0;p<8;p++){int x=fixed::val(c[i]),v=100000;
  for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;
   if(!x)v=min(v,z+d[i+1][j]);if(x!=K[j])v=min(v,z+d[i+1][(j+1)%8]);}d[i][p]=v;
 }
 Paths out{start<0?*min_element(d[0].begin(),d[0].end()):d[0][start],{}};
 if(out.cost>=100000)return out;
 Path a;function<void(int,int)> rec=[&](int i,int p){
  if(i==n){a.end=p;out.paths.push_back(a);return;}
  int x=fixed::val(c[i]);
  for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;if(z)a.reset.push_back(i);
   if(!x&&z+d[i+1][j]==d[i][p]){a.key.push_back(-1);rec(i+1,j);a.key.pop_back();}
   if(x!=K[j]&&z+d[i+1][(j+1)%8]==d[i][p]){a.key.push_back(K[j]);rec(i+1,(j+1)%8);a.key.pop_back();}
   if(z)a.reset.pop_back();
  }
 };
 for(int j=0;j<8;j++)if((start<0||j==start)&&d[0][j]==out.cost){a.start=j;rec(0,j);}
 return out;
}
int main(){try{
 aff::init();fixed::dictionary();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 vector<int> L55{24,46,68};auto lm=conditioned(join(train),LINE,-1,2),hm=conditioned(join(held),L55,2,-1);
 auto bad=conditioned(join(held),L55,7,-1);fixed::require(lm.cost==3&&lm.paths.size()==88&&hm.cost==1&&hm.paths.size()==20&&bad.paths.empty(),"joint minimum");
 for(int j=0;j<8;j++)if(j!=2&&j!=7)fixed::require(conditioned(join(train),LINE,-1,j).paths.empty(),"p54 end support");
 cout<<"JOINT MINIMUM "<<lm.cost+hm.cost<<" trainPaths="<<lm.paths.size()<<" holdPaths="<<hm.paths.size()<<endl;
 bool a=control(train,held,3301),b=control(train,held,1033);if(!a||!b){cout<<"GATED OFF"<<endl;return 2;}
 int exhausted=0,candidates=0;uint64_t nodes=0,joins=0,seeds=0,perms=0;
 for(size_t i=0;i<lm.paths.size();i++){
  cout<<"JOINT PATH "<<i<<" start="<<lm.paths[i].start<<" resets";for(int v:lm.paths[i].reset)cout<<" "<<v;cout<<endl;
  Search s(train,lm.paths[i]);s.run(40);nodes+=s.nodes;joins+=s.joins;seeds+=s.done;perms+=s.perms;
  if(s.found){candidates++;auto w=split(decode(join(train),lm.paths[i],s.answer),train);int accepted=0;
   for(const auto& p:hm.paths){auto h=split(decode(join(held),p,s.answer),held);h[0]=w.back()+h[0];int hit=count_if(h.begin(),h.end(),[](const string& x){return fixed::dict.count(x);});if(hit==17){accepted++;cout<<"HOLD";for(auto&x:h)cout<<" "<<x;cout<<endl;} }
   cout<<"TRAIN CANDIDATE "<<aff::str(s.answer)<<" OOV="<<s.oov<<" fullHoldoutPaths="<<accepted<<endl;
  }else if(!s.timed&&s.done==s.total)exhausted++;
 }
 cout<<"JOINT exhausted="<<exhausted<<"/"<<lm.paths.size()<<" candidates="<<candidates<<" nodes="<<nodes<<" joins="<<joins<<" seeds="<<seeds<<" perms="<<perms<<endl;
 return exhausted==int(lm.paths.size())?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
