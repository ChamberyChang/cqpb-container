import _ from 'lodash';
import RandomSeed from 'random-seed';

const rand = RandomSeed.create();
const numExec = /^[0-9]*$/;

const diceNumLimit = 10;
const diceSideLimit = 1000;

/**
 * 投掷
 * @param {String} i 输入字符串
 * @returns {Promise<string>} 输出结果
 */
export default async (i) => {
  var Text = `投掷出了：`;
  if (i != "") {
    var ft = new String(i).split("d");
    if (ft.length == 2) { //r[x]d[x] && r[x]d[x]+[x] && r[x]d[x][\s][x] && r[x]d[x]+[x][\s][x]
      //console.log("r[x]d[x] && r[x]d[x]+[x] && r[x]d[x][/s][x] && r[x]d[x]+[x][/s][x]");
      if (ft[0] != '' && ft[1] != '') {
        //ft[0] 骰子数
        //ft[1] 待解析
        var ps = ft[1].split("+");
        if (ps.length == 1) { //r[x]d[x][/s][x] && r[x]d[x]
          //console.log("r[x]d[x][/s][x] && r[x]d[x]");
          var sp = ps[0].split(" ");
          if (sp.length == 1) { //r[ft0]d[ft1]
            //console.log("r[ft0]d[ft1]");
            if (numExec.test(ft[0]) && numExec.test(ft[1])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
              var diceNum = parseInt(ft[0]);
              var diceSide = parseInt(ft[1]);
              if (diceNum <= diceNumLimit && diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = 0;
                Text += `( `;

                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} )`;
                  }
                }
                Text += ` = ${Sum.toString()}`;
                return Text;
              }
            }
          } else if (sp.length == 2) { //r[ft0]d[sp0][/s][sp1]
            //console.log("r[ft0]d[sp0][/s][sp1]");
            if (numExec.test(ft[0]) && numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否三者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x][/s][x]格式
              var diceNum = parseInt(ft[0]);
              var diceSide = parseInt(sp[0]);
              var skill = parseInt(sp[1]);
              if (diceNum <= diceNumLimit && diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = 0;
                Text += `( `;
                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} )`;
                  }
                }
                Text += ` = ${Sum.toString()}`;
                var result = Compare(Sum, skill, diceSide);
                if (result) {
                  Text += `\n${result}`;
                  return Text;
                }
              }
            }
          }
        } else if (ps.length == 2) { //r[x]d[x]+[x] && r[x]d[x]+[x][/s][x]
          //console.log("r[x]d[x]+[x] && r[x]d[x]+[x][/s][x]");
          var sp = ps[1].split(" ");
          if (sp.length == 1) { //r[ft0]d[ps0]+[ps1]
            //console.log("r[ft0]d[ps0]+[ps1]");
            if (numExec.test(ft[0]) && numExec.test(ps[0]) && numExec.test(ps[1])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
              var diceNum = parseInt(ft[0]);
              var diceSide = parseInt(ps[0]);
              var plus = parseInt(ps[1]);
              if (diceNum <= diceNumLimit && diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = 0;
                Text += `( `;
                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} )`;
                  }
                }
                Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
                return Text;
              }
            }
          } else if (sp.length == 2) { //r[ft0]d[ps0]+[sp0][/s][sp1]
            //console.log("r[ft0]d[ps0]+[sp0][/s][sp1]");
            if (numExec.test(ft[0]) && numExec.test(ps[0]) && numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否均全为数字
              var diceNum = parseInt(ft[0]);
              var diceSide = parseInt(ps[0]);
              var plus = parseInt(sp[0]);
              var skill = parseInt(sp[1]);
              if (diceNum <= diceNumLimit && diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = 0;
                Text += `( `;
                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} )`;
                  }
                }
                Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
                Sum += plus;
                var result = Compare(Sum, skill, diceSide);
                if (result) {
                  Text += `\n${result}`;
                  return Text;
                }
              }
            }
          }
        }
      } else if (ft[0] == '' && ft[1] != '') {
        ft[0] = ft[1];
        var ps = ft[0].split("+");
        if (ps.length == 1) { //rd[x][/s][x] && rd[x]
          //console.log("rd[x][/s][x] && rd[x]");
          var sp = ft[0].split(" ");
          if (sp.length == 1) { //rd[x]
            //console.log("rd[x]");
            if (numExec.test(ft[0])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
              var diceSide = parseInt(ft[0]);
              if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = rand.intBetween(1, diceSide);
                Text += Sum.toString();
                return Text;
              }
            }
          } else if (sp.length == 2) { //rd[x][/s][x]
            //console.log("rd[x][/s][x]");
            if (numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合rd[x][/s][x]格式
              var diceSide = 100;
              if (sp[0] != "") {
                diceSide = parseInt(sp[0]);
              }
              var skill = parseInt(sp[1]);
              if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = rand.intBetween(1, diceSide);
                Text += Sum.toString();
                var result = Compare(Sum, skill, diceSide);
                if (result) {
                  Text += `\n${result}`;
                  return Text;
                }
              }
            }
          }
        } else if (ps.length == 2) { //rd[x]+[x] && rd[x]+[x][\s][x]
          //console.log("rd[x]+[x] && rd[x]+[x][\s][x]");
          var sp = ps[1].split(" ");
          if (sp.length == 1) { //rd[ps0]+[ps1]
            //console.log("rd[ps0]+[ps1]");
            if (numExec.test(ps[0]) && numExec.test(ps[1])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
              var diceSide = parseInt(ps[0]);
              var plus = parseInt(ps[1]);
              if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = rand.intBetween(1, diceSide);
                Text += Sum.toString();
                Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
                Sum += plus;
                return Text;
              }
            }
          } else if (sp.length == 2) { //rd[ps0]+[sp0][/s][sp1]
            //console.log("rd[ps0]+[sp0][/s][sp1]");
            if (numExec.test(ps[0]) && numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否均全为数字
              var diceSide = parseInt(ps[0]);
              var plus = parseInt(sp[0]);
              var skill = parseInt(sp[1]);
              if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
                var Sum = rand.intBetween(1, diceSide);
                Text += Sum.toString();
                Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
                Sum += plus;
                var result = Compare(Sum, skill, diceSide);
                if (result) {
                  Text += `\n${result}`;
                  return Text;
                }
              }
            }
          }
        }
      }
    } else if (ft.length == 1) { //rd[x] && rd[x][/s][x] && rd[x]+[x][/s][x]
      //console.log("rd[x] && rd[x][/s][x] && rd[x]+[x][/s][x]");
      var ps = ft[0].split("+");
      if (ps.length == 1) { //rd[x][/s][x] && rd[x]
        //console.log("rd[x][/s][x] && rd[x]");
        var sp = ft[0].split(" ");
        if (sp.length == 1) { //rd[x]
          //console.log("rd[x]");
          if (numExec.test(ft[0])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
            var diceSide = parseInt(ft[0]);
            if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
              var Sum = rand.intBetween(1, diceSide);
              Text += Sum.toString();
              return Text;
            }
          }
        } else if (sp.length == 2) { //rd[x][/s][x]
          //console.log("rd[x][/s][x]");
          if (numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否三者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x][/s][x]格式
            var diceSide = parseInt(sp[0]);
            var skill = parseInt(sp[1]);
            if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
              var Sum = rand.intBetween(1, diceSide);
              Text += Sum.toString();
              var result = Compare(Sum, skill, diceSide);
              if (result) {
                Text += `\n${result}`;
                return Text;
              }
            }
          }
        }
      } else if (ps.length == 2) { //rd[x]+[x] && rd[x]+[x][\s][x]
        //console.log("rd[x]+[x] && rd[x]+[x][\s][x]");
        var sp = ps[1].split(" ");
        if (sp.length == 1) { //rd[ps0]+[ps1]
          //console.log("rd[ps0]+[ps1]");
          if (numExec.test(ps[0]) && numExec.test(ps[1])) { //验证是否二者均全为数字，到此为止完全成功的话，即代表符合r[x]d[x]格式
            var diceSide = parseInt(ps[0]);
            var plus = parseInt(ps[1]);
            if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
              var Sum = rand.intBetween(1, diceSide);
              Text += Sum.toString();
              Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
              Sum += plus;
              return Text;
            }
          }
        } else if (sp.length == 2) { //rd[ps0]+[sp0][/s][sp1] //TODO
          //console.log("rd[ps0]+[sp0][/s][sp1]");
          if (numExec.test(ps[0]) && numExec.test(sp[0]) && numExec.test(sp[1])) { //验证是否均全为数字
            var diceSide = parseInt(ps[0]);
            var plus = parseInt(sp[0]);
            var skill = parseInt(sp[1]);
            if (diceSide <= diceSideLimit) { //为避免服务器压力过大或被人爆破，限制一下dice的个数上限为一千个，dice的面数最多为一万面
              var Sum = rand.intBetween(1, diceSide);
              Text += Sum.toString();
              Text += ` + ${plus.toString()} = ${(Sum + plus).toString()}`;
              Sum += plus;
              var result = Compare(Sum, skill, diceSide);
              if (result) {
                Text += `\n${result}`;
                return Text;
              }
            }
          }
        }
      }
    }
    return false;
  } else { //r
    //console.log("r");
    Text += rand.intBetween(1, 100);
    return Text;
  }
}

/**
 * 判定比较
 * @param {int} Sum 数值
 * @param {int} skill 技能
 * @param {int} SumMax 数值上限
 * @returns
 */
 function Compare(Sum, skill, SumMax=100) {
  var result = '';
  if (SumMax < 2) return false;
  if (Sum <= SumMax-2 && Sum > skill) {
    result = "**失败**"
    return result;
  } else if (Sum > 2 && Sum <= skill) {
    result = "**成功**";
    return result;
  } else return false;
}

