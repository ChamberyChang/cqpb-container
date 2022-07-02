import _ from 'lodash';
import RandomSeed from 'random-seed';
import SanCheck from './sancheck';
import Roll from './roll';

const rand = RandomSeed.create();

/**
 * 骰子监听
 * @param {String} context 接收内容
 * @param {Boolean} reply 开启回复
 * @returns
 */
async function diceHandler(context, reply = true) {
  var msg = new String(context).toLowerCase();
  if (msg[0] == '-' && msg[1] == '-') {
    var commands = new String(msg).substring(2, msg.length);
    console.log(`Commands Received: ${commands}`);
    if (commands[0] == 'r') {
      if (commands[1] == 'h') {
        //暗骰
        Roll(new String(commands).substring(2, commands.length)) 
        .then(res => global.replyPrivateForwardMsgs(context, res))
        .catch(e => console.error(e));
      } else if (commands[1] == 'a') {
        //检定骰D20
        Assay(new String(commands).substring(2, commands.length))
        .then(res => global.replyMsg(context, res, false, reply))
        .catch(e => console.error(e));
      } else if (commands[1] == 'c') {
        //检定骰D100
        Check(new String(commands).substring(2, commands.length))
        .then(res => global.replyMsg(context, res, false, reply))
        .catch(e => console.error(e));
      } else {
        //正常投点
        Roll(new String(commands).substring(1, commands.length))
        .then(res => global.replyMsg(context, res, false, reply))
        .catch(e => console.error(e));
      }
    } else if (commands[0] == "s" && commands[1] == "c") {
      SanCheck(new String(commands).substring(2, commands.length))
      .then(res => global.replyMsg(context, res, false, reply))
      .catch(e => console.error(e));
    }
  }
}

/**
 * 检定D20
 * @param {String} i 输入
 * @returns {Promise<string>} 输出结果
 */
async function Assay(i){
  if (i != "") {
    const diceAssay = /\s((?:[1-9]?\d))$/.exec(i);
    if(diceAssay) {
      if(~~diceAssay[0] <= 20){
        const randDice = rand.intBetween(0, 20);
        var result = Compare(randDice, ~~diceAssay[0], 20);
        if (result) {
          var Text = `投掷出了：${randDice.toString()}`;
          Text += `\n${result}`;
          return Text;
        }
      }
    }
  }
  return false;
}

/**
 * 检定D100
 * @param {String} i 输入
 * @returns {Promise<string>} 输出结果
 */
async function Check(i){
  if (i != "") {
    const diceCheck = /\s((?:[1-9]?\d|100))$/.exec(i);
    if(diceCheck){
      const randDice = rand.intBetween(0, 100);
      var result = Compare(randDice, ~~diceCheck[0], 100);
      if(result){
        var Text = `投掷出了：${randDice.toString()}`;
        Text += `\n${result}`;
        return Text;
      }
    }
  }
  return false;
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
  if (SumMax <= 2) return false;
  if (Sum > SumMax-1 && Sum > skill) {
    result = "**巨大失败**";
    return result;
  } else if (Sum > skill) {
    result = "**普通失败**"
    return result;
  } else if (Sum <= 2 && Sum <= skill) {
    result = "**巨大成功**";
    return result;
  } else if (Sum > skill / 2) {
    result = "**普通成功**";
    return result;
  } else if (Sum <= skill / 2 && Sum > skill / 5) {
    result = "**困难成功**";
    return result;
  } else if (Sum <= skill / 5) {
    result = "**极难成功**";
    return result;
  } else return false;
}

export default diceHandler;
