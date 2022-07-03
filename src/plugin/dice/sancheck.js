import _ from 'lodash';
import RandomSeed from 'random-seed';

const rand = RandomSeed.create();
const numExec = /^[0-9]*$/;

/**
 * 检测理智
 * @param {String} i 输入字符串
 * @returns {Promise<string>} 输出结果
 */
export default async (i) => {
  var Text = "投掷出了：";
  //sc[sl0]/[sl1]
  var sl = new String(i).split("/");
  if (sl.length == 2 && sl[0] != "") { //sc[sl0]/[sl1]
    var sp = sl[1].split(" ");
    if (sp.length == 2 && sp[0] != "") { //sc[sl0]/[sp0][/s][sp1]
      if (numExec.test(sp[1])) {
        var skill = parseInt(sp[1]);
        var ran = rand.intBetween(1, 100);
        Text += ran.toString();
        //深空投掷出了：45 成功
        //SanCheck检定：1d3 = 1
        //最终San值：45 - 1 = 44
        if (ran >= 96 && ran > skill) { //大失败
          Text += " 巨大失败\nSanCheck检定：";
          if (numExec.test(sp[0])) {
            var Int = parseInt(sp[0]);
            var skill = parseInt(sp[1]);
            Text += `最大值 ${Int}\n最终San值：${sp[1]} - ${Int} = ${(skill - Int).toString()}`;
          } else {
            var ft = sp[0].split("d");
            if (ft.length == 2) {
              if (numExec.test(ft[0]) && numExec.test(ft[1])) { //sc[sl0]/[ft0]d[ft1][/s][sp1]
                var Int = parseInt(ft[0]) * parseInt(ft[1]);
                var skill = parseInt(sp[1]);
                Text += `最大值 ${ft[0]}\n最终San值：${sp[1]} - ${ft[1]} = ${(skill - Int).toString()}`;
              }
            }
          }
        } else if (ran <= 5 && ran <= skill) { //大成功
          Text += " 巨大成功\nSanCheck检定：";
          if (numExec.test(sl[0])) {
            var Int = parseInt(sl[0]);
            var skill = parseInt(sl[1]);
            Text += `最小值 ${sp[0]}\n最终San值：${sp[1]} - ${sp[0]} = ${(skill - Int).toString()}`;
          } else {
            var ft = sp[0].split("d");
            if (ft.length == 2) {
              if (numExec.test(ft[0]) && numExec.test(ft[1])) {
                var Int = parseInt(ft[0]);
                var skill = parseInt(sp[1]);
                Text += `最小值 ${ft[0]}\n最终San值：${sp[1]} - ${ft[0]} = ${(skill - Int).toString()}`;
              }
            }
          }
        } else if (ran > skill) { //失败 
          Text += " 失败\nSanCheck检定：";
          if (numExec.test(sp[0])) { //sc[sl0]/[sp0][/s][sp1]
            var Int = parseInt(sp[0]);
            var skill = parseInt(sp[1]);
            Text += sp[0]+`\n最终San值：${sp[1]}-${sp[0]}=${(skill - Int).toString()}`;
          } else {
            var ft = sp[0].split("d");
            if (ft.length == 2) { //sc[sl0]/[ft0]d[ft1][/s][sp1]
              if (numExec.test(ft[0]) && numExec.test(ft[1])) {
                Text += sp[0] + " = ( ";
                var diceNum = parseInt(ft[0]);
                var diceSide = parseInt(ft[1]);
                var Sum = 0;
                var skill = parseInt(sp[1]);
                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);;
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} ) = `;
                  }
                }
                Text += `${Sum.toString()}\n最终San值：${sp[1]} - ${Sum.toString()} = ${(skill - Sum).toString()}`;
              }
            }
          }
        } else if (ran <= skill) { //成功
          Text += " 成功\nSanCheck检定：";
          if (numExec.test(sl[0])) { //sc[sl0]/[sp0][/s][sp1]
            var Int = parseInt(sl[0]);
            var skill = parseInt(sp[1]);
            Text += `${sl[0]}\n最终San值：${sp[1]}-${sl[0]}=${(skill - Int).toString()}`;
          } else {
            var ft = sl[0].split("d");
            if (ft.length == 2) { //sc[ft0][ft1]/[sp0][/s][sp1]
              if (numExec.test(ft[0]) && numExec.test(ft[1])) {
                Text += sl[0] + " = ( ";
                var diceNum = parseInt(ft[0]);
                var diceSide = parseInt(ft[1]);
                var Sum = 0;
                var skill = parseInt(sp[1]);
                for (let index = 0; index < diceNum; index++) {
                  var ran = rand.intBetween(1, diceSide);
                  Sum += ran;
                  if (index < diceNum - 1) {
                    Text += `${ran.toString()} + `;
                  } else if (index == diceNum - 1) {
                    Text += `${ran.toString()} ) = `;
                  }
                }

                Text += `${Sum.toString()}\n最终San值：${sp[1]}-${Sum.toString()}=${(skill - Sum).toString()}`;
              }
            }
          }
        }
        return Text;
      }
    }
  }
  return false;
}
