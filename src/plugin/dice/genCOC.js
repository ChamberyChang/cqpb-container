import RandomSeed from 'random-seed';

const rand = RandomSeed.create();

/**
 * COC7基础属性生成
 * @returns {Promise<string>} 输出结果
 */
 export default async => {
  var Text = "随机人物属性：\n";
  var p_str = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6)) * 5;
  var p_con = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6)) * 5;
  var p_siz = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + 6) * 5;
  var p_dex = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6)) * 5;
  var p_app = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6)) * 5;
  var p_int = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + 6) * 5;
  var p_pow = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6)) * 5;
  var p_edu = (rand.intBetween(1, 6) + rand.intBetween(1, 6) + 6) * 5;
  Text += `力量STR：${p_str}\n体质CON：${p_con}\n体型SIZ：${p_siz}\n敏捷DEX：${p_dex}\n外貌APP：${p_app}\n智力INT：${p_int}\n意志POW：${p_pow}\n教育EDU：${p_edu}\n`;
  var p_tot = p_str + p_con + p_siz + p_dex + p_app + p_int + p_pow + p_edu;
  var result = '';
  if (p_tot > 700) {
    result = "大祭司";
  } else if (p_tot <= 700 && p_tot > 600) {
    result = "婆罗门";
  } else if (p_tot <= 600 && p_tot > 500) {
    result = "刹帝利"
  } else if (p_tot > 360 && p_tot <= 500) {
    result = "吠舍";
  } else if (p_tot > 240 && p_tot <= 360) {
    result = "首陀罗";
  } else if (p_tot <= 240) {
    result = "达利特";
  }
  Text += `总和：${p_tot}（${result}）`;
  return Text;
}

