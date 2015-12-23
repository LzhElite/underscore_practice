(function () {
    var root = this;
    root.previousLzh = root.lzh;

    // 创建一个空的对象常量, 便于内部共享使用
    var breaker = {};

    //将内置对象的原形链缓存在局部变量，方便快速调用
    var ArrayPtoto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    //将内置对象原型中常用的方法缓存在局部变量
    var slice = ArrayPtoto.slice,
        unshift = ArrayPtoto.unshift,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    // ECMAScript 5 支持的原生方法，申明如下：（如果宿主环境支持，则优先调用原生方法）
    var nativeForEach = ArrayPtoto.forEach,
        nativeMap = ArrayPtoto.map,
        nativeReduce = ArrayPtoto.reduce,
        nativeReduceRight = ArrayPtoto.reduceRight,
        nativeFilter = ArrayPtoto.filter,
        nativeEvery = ArrayPtoto.every,
        nativeSome = ArrayPtoto.some,
        nativeIndexOf = ArrayPtoto.indexOf,
        nativeLastIndexOf = ArrayPtoto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;

    //返回一个新的Person对象
    var lzh = function (obj) {
        return new Person(obj);
    }

    //针对不同的宿主环境, 将lzh的命名变量存放到不同的对象中
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exports = lzh;
        }
        exports.lzh = lzh;
    } else {
        root['lzh'] = lzh;
    }

    lzh.VERSION = '1.0.0';


    //lzh.prototype.prototype的属性
    lzh.prototype = Person.prototype;

    //lzh对象的测试函数
    lzh.eyes = function () {
        console.log('blue');
    }
    lzh.hair = function () {
        console.log('black');
    }

    // @ 1 集合相关的方法(数据和对象的通用处理方法)
    //实现一个each方法，功能和ECMA 5中的forEach函数一样
    var each = lzh.each = lzh.forEach = function (obj, iterator, context) {
        if (obj === null)
            return;
        var nativeForEach = Array.prototype.forEach
        if (nativeForEach && obj.forEach == nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {//obj.length为非NaN数据 字符串，对象，数组
            for (var i = 0, i = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker)//i in obj只有数组满足
                    return;
            }
        } else {
            for (var key in obj) {
                if (lzh.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker)
                        return;
                }
            }
        }
    }
    /* 通过变换函数（iteratee迭代器）把list中的每个值映射到一个新的数组中（注：产生一个新的数组）。如果存在原生的map方法，就用原生map方法来代替。如果list是个JavaScript对象*/
    lzh.map = lzh.collect = function (obj, iterator, context) {
        var results = [];
        if (obj === null) return result;
        if (Array.prototype.map == obj.map) return obj.map(iterator, context);

        each(obj, function (value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        })
        if (obj.length === +obj.length) results.length = obj.length;// ?????
        return results
    }

    /*reduce方法把list中元素归结为一个单独的数值。Memo是reduce函数的初始值，reduce的每一步都需要由iteratee返回。*/
    lzh.reduce = lzh.foldl = lzh.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null)
            obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) {
                iterator = _.bind(iterator, context);
            }
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list)
            }
        })
    }

    lzh.reduceRight = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;//如果是三个以上参数
        if (obj == null)
            obj = [];
        if (nativeReduceRight && obj.reduceRight == nativeReduceRight) {
            if (context)
                iterator = _.bind(context, iterator);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var reversed = lzh.toArray(obj).reverse();
        if (context && !initial)//如果是三个以上参数，且context存在
            iterator = lzh.bind(context, iterator);
        return initial ? lzh.reduce(reversed, iterator, memo, context) : lzh.reduce(reversed, iterator)
    }
    //在list中逐项查找，返回第一个通过predicate迭代函数真值检测的元素值，如果没有值传递给测试迭代器将返回undefined。 如果找到匹配的元素，函数将立即返回，不会遍历整个list。
    lzh.find = function (obj, iterate, context) {
        var result;
        any(obj, function (item, index, context) {
            if (iterate.call(context, item)) {
                result = item;
                return true;
            }
        });
        return result;
    }
    //遍历list中的每个值，返回包含所有通过predicate真值检测的元素值。
    lzh.filter = function (obj, predicate, context) {
        var result = [];
        if (obj == null)
            return result;
        if (nativeFilter && obj.filter == nativeFilter) {
            return obj.filter(predicate, context);
        }
        each(obj, function (item, index, obj, context) {
            if (predicate.call(context, item, index, obj)) {
                result[result.length] = item;
            }
        });
        return result;
    }

    //返回list中没有通过predicate真值检测的元素集合，与filter相反。
    lzh.reject = function (obj, iterate, context) {
        var result = [];
        if (obj == null)
            return result;
        each(obj, function (item, index, list) {
            if (!iterate.call(context, item, index, list)) {
                result[result.length] = item;
            }
        });
        return result;
    }

    //如果list中的所有元素都通过predicate的真值检测就返回true。
    lzh.every = lzh.all = function (obj, predicate, context) {
        var result = true;
        if (obj === null) return result;
        if (nativeEvery && obj.every == nativeEvery) {
            return obj.every(predicate, context)
        }
        each(function (item, index, obj, context) {
            //当predicate的真值检测返回为false，结束循环
            if (!(result || (result = predicate.call(context, item, index, obj))))return breaker;
        })
        return result;
    }
    //如果obj中有任何一个元素通过 iterator 的真值检测就返回true。一旦找到了符合条件的元素, 就直接中断对obj的遍历.
    var any = lzh.any = lzh.some = function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some == nativeSome)
            return obj.some(predicate, context);
        each(obj, function (item, index, list) {
            if (result || (result = predicate.call(context, item, index, list))) {
                return breaker//返回一个空对象，结束循环
            }
            ;
        })
        return result;
    }
    //如果list包含指定的value则返回true（愚人码头注：使用===检测）。如果list 是数组，内部使用indexOf判断。使用fromIndex来给定开始检索的索引位置
    lzh.include = lzh.contains = function (obj, target) {
        var found = false;
        if (obj == null) return found;
        if (nativeIndexOf && obj.indexOf == nativeIndexOf)return obj.indexOf(target) != -1;//通过索引判断list是否包含
        found = any(obj, function (item, index, obj) {
            return item === target;
        });
        return found;
    }
    // 在obj的每一个元素上调用method（可以带参数），在返回一个数组，存储了所有方法的处理结果
    lzh.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        return lzh.map(obj, function (value) {
            return (lzh.isFunction(method) ? method : value[method]).apply(value, args);
        })
    };

    //遍历一个有对象列表组成的数组，并返回每个对象中的指定属性的值列表
    lzh.pluck = function (obj, key) {
        return lzh.map(obj, function (value) {
            return value[key];
        });
    };
    //返回list中的最大值。
    // 如果传递iteratee参数，iteratee将作为list中每个值的排序依据。
    // 如果list为空，将返回-Infinity，所以你可能需要事先用isEmpty检查 list 。
    lzh.max = function (obj, iterator, context) {
        if (!iterator && lzh.isArray(obj) && obj[0] === +obj[0])//如果没有迭代器，且obj是数组，且数组项为number类型
            return Math.max.apply(Math, obj);
        if (!iterator && lzh.isEmpty(obj)) {
            return -Infinity;
        }
        var result = {
            computed: -Infinity
        }
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            })
        });
        return result.value;
    }
    //查找数组中的最小值
    lzh.min = function (obj, iterator, context) {
        //如果是数字组成的数组，且没有迭代器，则用原生Math.min方法
        if (!iterator && lzh.isArray(obj) && obj[0] === +obj[0])
            return Math.min.apply(Math, obj);
        //如果是空对象（对象等于null 空数组[] 空字符串''）则返回infinity
        if (lzh.isEmpty(obj))
            return Infinity;
        var result = {
            computed: Infinity
        };
        //each循环，如果当前计算值computed小于，当前结果值，则将当前计算值存入当前结果值
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            })
        })
        return result.value;
    }
    //将数组顺序打乱
    lzh.shuffle = function (obj) {
        var shuffled = [], rand;
        each(obj, function (value, index, list) {
            rand = Math.floor(Math.random() * (index + 1));
            //生成一个[0,list.length]的随机整数，
            //当index是0时，rand是0
            //当index是1时， rand是0 或 1
            //当index是2时，rand是0 1 2
            //当index是3时，rand是0 1 2 3
            //当index是4时，rand是0 1 2 3 4
            //当index是5时，rand是0 1 2 3 4 5
            shuffled[index] = shuffled[rand];
            shuffled[rand] = value;
        })
        return shuffled;
    }
    //返回一个排序后的list拷贝副本。如果传递iteratee参数，iteratee将作为list中每个值的排序依据。迭代器也可以是字符串的属性的名称进行排序的(比如 length)。
    lzh.sortBy = function (obj, val, context) {
        //如果是valshi
        var iterator = lzh.isFunction(val) ? val : function () {
            return obj[val];
        }
        return lzh.pluck(lzh.map(obj, function (value, index, list) {
            return {
                value: value,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria, b = right.criteria;
            if (a === void 0)return 1;
            if (b === void 0)return -1;
            return a < b ? -1 : a > b ? 1 : 0;
        }))
    }
    //把一个集合分组为多个集合，通过 iterator 返回的结果进行分组. 如果 iterator 是一个字符串而不是函数, 那么将使用 iterator 作为各元素的属性名来对比进行分组.
    lzh.groupBy = function (obj, val, context) {
        var result = [];
        //obj[val]有疑问
        var iterator = lzh.isFunction(val) ? val : function () {
            return obj[val];
        }
        each(obj, function (value, index) {
            var key = iterator(value, index);
            (result[key] || (result[key] = [])).push(value);
        })
        return result;
    }
    //使用二分查找确定value在list中的位置序号，value按此序号插入能保持list原有的排序。如果提供iterator函数，iterator将作为list排序的依据，包括你传递的value 。
    lzh.sortedIndex = function (array, obj, iterator) {
        iterator || (iterator = lzh.identity);
        var low = 0, high = array.length;
        while (low < high) {
            var mid = (low + high) >> 1;
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }
        return low;
    }


    lzh.toArray = function (obj) {
        if (!obj) return [];//如果undefined null 空字符串
        if (lzh.isArray(obj)) return slice.call(obj);//如果是数组
        if (lzh.isArguments(obj))  return slice.call(obj);
        if (obj.toArray && lzh.isFunction(obj.toArray)) return obj.toArray();//不理解
        return lzh.values(obj)//如果是对象，获取对象的值
    }
    lzh.size = function (obj) {
        return lzh.isArray(obj) ? obj.length : lzh.keys(obj).length;
    }
    // @ 2 数组相关方法
    //2-1 返回array（数组）的第一个元素。传递 n参数将返回数组中从第一个元素开始的n个元素（返回数组中前 n 个元素.）。
    lzh.first = function (array, n, guard) {
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    }
    //2-2 返回数组中除了最后一个元素外的其他全部元素。 在arguments对象上特别有用。传递 n参数将从结果中排除从最后一个开始的n个元素（排除数组后面的 n 个元素）。
    lzh.initial = function (array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null || guard) ? 1 : n));
    }
    //2-3 返回array（数组）的最后一个元素。传递 n参数将返回数组中从最后一个元素开始的n个元素（返回数组里的后面的n个元素）。
    lzh.last = function (array, n, guard) {
        if (n !== null && !guard) {
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            return array[array.length - 1];
        }
    }
    //2-4 返回数组中除了第一个元素外的其他全部元素。传递 index 参数将返回从index开始的剩余所有元素 。
    lzh.rest = function (array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    }
    //2-5 返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
    lzh.compact = function (array) {
        return lzh.filter(array, function (value) {
            return !!value;
        })
    };
    //2-6 将一个嵌套多层的数组 array（数组） (嵌套可以是任何层数)转换为只有一层的数组。 如果你传递 shallow参数，数组将只减少一维的嵌套。
    lzh.flatten = function (array, shallow) {
        return lzh.reduce(array, function (memo, value) {
            if (lzh.isArray(value))return memo.concat(shallow ? value : lzh.flatten(value));

            memo[memo.length] = value;
            return memo;
            /*
             *  return memo.concat(value)
             *  */
        }, []);
    };
    //2-7 返回一个删除所有values值后的 array副本。（愚人码头注：使用===表达式做相等测试。
    lzh.without = function (array) {
        lzh.difference(array, slice.call(arguments, 1));
    }
    //2-8 返回 array去重后的副本, 使用 === 做相等测试. 如果您确定 array 已经排序, 那么给 isSorted 参数传递 true值, 此函数将运行的更快的算法. 如果要处理对象元素, 传递 iteratee函数来获取要对比的属性.。
    lzh.uniq = lzh.unique = function (array, isSorted, iterator) {
        var initial =iterator?lzh.map(array,iterator):array;
        var results =[];
        if(array.length<3)isSorted = true;
        lzh.reduce(initial,function(memo,value,index){
            // 如果isSorted参数为true, 则直接使用===比较记录中的最后一个数据
            // 如果isSorted参数为false, 则使用include方法与集合中的每一个数据进行对比
            //!memo.length 是否有必要
            if(isSorted?lzh.last(memo)!==value||!memo.length:!lzh.include(memo,value)){
                memo.push(value);
                results.push(array[index]);
            }
        },[]);
        return results;
    }
    //2-9 union方法与uniq方法作用一致, 不同之处在于union允许在参数中传入多个数组
    lzh.union=function(){
        return lzh.uniq(lzh.flatten(arguments,true));
    }
    //2-10 返回传入 arrays（数组）交集。结果中的每个值是存在于传入的每个arrays（数组）里。
    lzh.intersection = lzh.intersect = function(array){
        var rest = slice.call(arguments,1);
        return lzh.filter(lzh.uniq(array),function(item){
            return lzh.every(rest,function(other){
                return lzh.indexof(other,item)>= 0;
            })
        })
    };

    //2-11 返回一个数组，值来自array参数数组，并且不存在于other 数组.
    lzh.difference = function (array) {
        var rest = lzh.flatten(slice.call(arguments, 1), true);
        return lzh.filter(array, function (value) {
            return !lzh.include(rest, value);
        })
    }

    // 2-12 将 每个arrays中相应位置的值合并在一起。在合并分开保存的数据时很有用.
    // 如果你用来处理矩阵嵌套数组时, _.zip.apply 可以做类似的效果。
    lzh.zip=function(){
        var arg = slice.call(arguments);
        var length = lzh.max(lzh.pluck(arg,'length'));
        var results = new Array(length);
        for(var i=0;i<length;i++){
            results[i]=lzh.pluck(arg,""+i);
        }
        return results;
    }
    //返回value在该 array 中的索引值，如果value不存在 array中就返回-1。使用原生的indexOf 函数，除非它失效。
    // 如果您正在使用一个大数组，你知道数组已经排序，传递true给isSorted将更快的用二进制搜索..,
    // 或者，传递一个数字作为第三个参数，为了在给定的索引的数组中寻找第一个匹配值。
    lzh.indexOf=function(){

    }
    //
    lzh.lastIndexOf=function(){

    }
    //
    lzh.range=function(){

    }

    // @ 3 函数相关方法
    //空函数参数用作代理原型交换
    var ctor = function () {
    };

    //为函数func半丁执行上下文context。绑定函数时，可以同时给函数传递其他形参
    lzh.bind = function bind(func, context) {
        var bound, args;
        //优先调用宿主环境提供的bind方法
        if (func.bind === nativeBind && nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        if (!lzh.isFunction(func))
            throw new TypeError('Bind must be called on a function');
        args = slice.call(arguments, 2);//args变量存储了bind方法第三个开始的参数列表
        return bound = function () {
            if (!(this instanceof bound))//如果this不是bound的实例
                return func.apply(context, args.concat(slice.call(arguments)));
            //如果this是bound的实例,生成一个对象ctor实例，并且集成func的原型
            ctor.prototype = func.prototype;
            var self = new ctor;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result)//如果result是一个对象，则返回
                return result;
            return self; //返回对象ctor实例
        }

    }


    // @ 4 对象相关方法
    //获取对象的属性
    lzh.keys = function (obj) {
        if (!lzh.isFunction(obj))throw new Error('Invalid Object');
        var keys = [];
        for (var key in obj) {
            if (lzh.has(obj, key))keys[keys.length] = key;
        }
        return keys;
    }
    //获取对象的values
    lzh.values = function (obj) {
        return lzh.map(obj, lzh.identity)
    }
    //将定义在对象上（不包括原型上的方法）的所有是函数属性，放在数组中返回
    lzh.functions = function (obj) {
        var names = [];
        for (var key in obj) {
            if (lzh.isFunction(obj[key])) {
                names.push(key);
            }
        }
        return names.sort();
    }

    //判断一个对象是否为函数
    lzh.isFunction = function (obj) {
        return toString.call(obj) == '[object Function]';
    };

    lzh.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) == '[object Array]';
        };
    lzh.isString = function (obj) {
        return toString.call(obj) == '[object String]';
    };
    lzh.isArguments = function (obj) {
        return toString.call(obj) == '[object Arguments]'
    };
    lzh.isEmpty = function (obj) {
        if (obj == null) return true;//如果是空对象
        if (lzh.isArray(obj) || lzh.isString(obj))return obj.length === 0;//数组或者字符串
        for (var key in obj)if (lzh.has(obj,key))return false;//如果对象有属性，则返回false
        return true;
    };


    //判断key是否是obj自有属性，非原型属性
    lzh.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // @ 5 工具函数

    //5-1 将root.lzh恢复成定前的值
    lzh.noConflict = function () {
        root.lzh = previousLzh;
        return this;
    };
    //5-2 内部默认迭代方法，返回和参数相同的值
    lzh.identity = function (value) {
        return value;
    };
    //5-3使用指定的迭代函数n次
    lzh.times = function (n, iterator, context) {
        for (var i = 0; i < n; i++)
            iterator.call(context, i)
    };
    //5-4 将HTML字符串中的特殊字符转换为HTML实体, 包含 & < > " ' \
    lzh.escape = function (string) {
        return ('' + string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27').replace(/\//g, '&#x2F;');
    };
    //5-5 如果对象 object 中的属性 property 是函数, 则调用它, 否则, 返回它。
    lzh.result = function (object, property) {
        if (object == null)
            return null;
        var value = object[property];
        lzh.isFunction(value) ? value.call(object) : value;
    };
    //5-6 将定义在对象上的（不包括原型上的方法）的所有是函数属性，添加到Person对象原型上
    lzh.mixin = function (obj) {
        each(lzh.functions(obj), function (item) {
            addToPerson(item, lzh[item] = obj[item]);
        })
    };
    //5-7 返回一个唯一的id
    var idCounter = 0;
    lzh.uniqueId = function (prefix) {
        var id = idCounter++;
        return prefix ? prefix + id : id;
    };


    //生成一个新的Person对象，并且声明支持链式调用
    lzh.chain = function (obj) {
        return lzh(obj).chain();
    };


    // @ 6 Underscore对象封装相关方法
    //定义一个Person对象
    function Person(obj) {
        this._wrapped = obj;
    }

    // 声明Person对象进行链式操作
    Person.prototype.chain = function () {
        this._chain = true;
        return this;
    };

    //result函数：用于构造方法链。如果上下文申明了支持链式操作，则将新生成的Person对象，也申明支持链式操作。
    var result = function (obj, chain) {
        return chain ? lzh(obj).chain() : obj;
    };

    //将一个自定义的方法添加到Person对象的原型中
    var addToPerson = function (name, func) {
        Person.prototype[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            unshift.call(args, this._wrapped);//将原始数据放入参数最前
            return result(func.apply(lzh, args), this._chain);//func运行时this指向对象_，this._chain，中的this指向Person对象
        }
    };

    // 定义在lzh对象上的（不包括原型上的方法）的所有是函数属性，添加到Person对象原型上
    lzh.mixin(lzh)

    //将原生的数组函数，添加到Person对象的原型中。返回Array对象本身(也可能是封装后的原Array)
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = Array.prototype[name];
        Person.prototype[name] = function () {
            var wrapped = this._wrapped;
            method.apply(wrapped, arguments);
            var length = wrapped.length;

            if ((name == 'shift' || name == 'splice') && length == 0) {//这里不理解
                delete wrapped[0]
            }
            result(wrapped, this._chain);
        }
    });

    //将原生的数组函数，添加到Person对象的原型中。concat, join, slice方法将返回一个新的Array对象(也可能是封装后的新Array)
    each(['concat', 'join', 'slice'], function (name) {
        Person.prototype[name] = function () {
            var method = Array.prototype[name];
            result(method.apply(this._wrapped, arguments), this._chain)
        }
    })
}).call(this);