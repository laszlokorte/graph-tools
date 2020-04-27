export default () => {
    "use strict";
    var _data = [];
    var _size = 0;
    var enqueue = function(priority, value){
        var data = _data;
        var i = 0;
        var p = 0;
        var ret = null;

        if(_size){
            data.push({p: priority, v: value});
            i = _size;
            p = (i - 1) >> 1;//Math.floor((i - 1) * 0.5);   // parent
            while(p >= 0){
                if(data[p].p < data[i].p){
                    ret = data[i];
                    data[i] = data[p];
                    data[p] = ret;

                    i = p;
                    p = (i - 1) >> 1;//Math.floor((i - 1) * 0.5);
                }else{
                    break;
                }
            }
        }else{
            data.push({p: priority, v: value});
        }
        _size = _size + 1;
    };
    var enqueueOrUpdate = function(priority, value){
        var el = _data.find(({v}) => v === value);
        if(!el) {
            enqueue(priority, value);
        } else {
            el.p = priority;
            var data = _data;
            var i = 0;
            var p = 0;
            var ret = null;

            if(_size){
                i = _size;
                p = (i - 1) >> 1;//Math.floor((i - 1) * 0.5);   // parent
                while(p >= 0){
                    if(data[p].p < data[i].p){
                        ret = data[i];
                        data[i] = data[p];
                        data[p] = ret;

                        i = p;
                        p = (i - 1) >> 1;//Math.floor((i - 1) * 0.5);
                    }else{
                        break;
                    }
                }
            }
        }
    };
    var dequeue = function(){
        var data = _data;
        var size = _size - 1;
        var result = null;
        var i = 0;
        var c1 = 1; // left child
        var c2 = 2; // right child
        var p0 = 0.0;
        var p1 = 0.0;
        var p2 = 0.0;
        var ret = null;

        if(_size){
            result = data[0].v;
            data[0] = data[size];
            data.pop();

            while(c1 < size){
                if(c2 < size){
                    p0 = data[i].p;
                    p1 = data[c1].p;
                    p2 = data[c2].p;

                    if((p1 < p2) && (p0 < p2)){
                        ret = data[i];
                        data[i] = data[c2];
                        data[c2] = ret;
                        i = c2;
                    }else if(p0 < p1){
                        ret = data[i];
                        data[i] = data[c1];
                        data[c1] = ret;
                        i = c1;
                    }else{
                        break;
                    }
                    c1 = (i << 1) + 1;
                    c2 = (i << 1) + 2;
                }else{
                    p0 = data[i].p;
                    p1 = data[c1].p;

                    if(p0 < p1){
                        ret = data[i];
                        data[i] = data[c1];
                        data[c1] = ret;
                    }
                    break;
                }
            }

            _size = size;
            return result;
        }else{
            return (void 0);
        }
    };
    var top = function(){
        return _data[0].v;
    };
    var size = function(){
        return _size;
    };

    return {
        enqueue: enqueue,
        dequeue: dequeue,
        enqueueOrUpdate: enqueueOrUpdate,
        top: top,
        size: size
    };
}
