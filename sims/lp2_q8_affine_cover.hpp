#pragma once
#include <array>
#include <cstdint>
#include <stdexcept>
#include <vector>

namespace lp2_affine_cover {
constexpr int P=29;
constexpr uint32_t ALL=(uint32_t(1)<<P)-1;
using Params=std::array<int,3>;
struct Direction {
    Params a{};
    uint32_t forbidden_rhs=0; // forbid dot(a,key_params) in this set
};
struct Result {
    unsigned count=0; // truncated at the caller's cap
    Params first{};
};
inline int mod(int x){int r=x%P;return r<0?r+P:r;}
inline int inv(int a){for(int b=1;b<P;++b)if(a*b%P==1)return b;throw std::logic_error("zero inverse");}
inline uint32_t rot(uint32_t m,int d){return d?((m<<d)|(m>>(P-d)))&ALL:m;}

// Enumerate prefix rows, eliminating all final-coordinate values with
// precomputed bitsets. The default count cap distinguishes zero, one, many.
// This tests within-component injectivity; it does not prove packing.
inline Result solve(int d,const std::vector<Direction>&dirs,unsigned cap=2){
    if(d<0||d>3||!cap)throw std::invalid_argument("cover dimension/cap");
    Result result;
    if(!d){for(const auto&v:dirs)if(v.forbidden_rhs&1u)return result;result.count=1;return result;}
    struct Table{Params a;std::array<uint32_t,P> mask;};
    std::vector<Table> tables;tables.reserve(dirs.size());
    for(const auto&v:dirs){
        Table t{};t.a=v.a;
        int q=v.a[d-1];
        if(!q){
            for(int b=0;b<P;++b)t.mask[b]=(v.forbidden_rhs&(1u<<b))?ALL:0;
        }else{
            int iq=inv(q);uint32_t base=0;
            for(int r=0;r<P;++r)if(v.forbidden_rhs&(1u<<r))base|=1u<<mod(r*iq);
            for(int b=0;b<P;++b)t.mask[b]=rot(base,mod(-b*iq));
        }
        tables.push_back(t);
    }
    int rows0=d>1?P:1,rows1=d>2?P:1;
    for(int x=0;x<rows0;++x)for(int y=0;y<rows1;++y){
        uint32_t blocked=0;
        for(const auto&t:tables){
            int b=mod((d>1?t.a[0]*x:0)+(d>2?t.a[1]*y:0));
            blocked|=t.mask[b];if(blocked==ALL)break;
        }
        uint32_t allowed=ALL^blocked;
        if(!allowed)continue;
        if(!result.count){
            if(d>1)result.first[0]=x;
            if(d>2)result.first[1]=y;
            int i=0;while(!(allowed&(1u<<i)))++i;result.first[d-1]=i;
        }
        unsigned n=0;while(allowed){allowed&=allowed-1;++n;}
        if(n>=cap-result.count){result.count=cap;return result;}
        result.count+=n;
    }
    return result;
}
}
