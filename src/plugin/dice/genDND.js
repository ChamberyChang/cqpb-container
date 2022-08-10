import RandomSeed from 'random-seed';

const rand = RandomSeed.create();

/**
 * DnD5e基础属性生成
 * @returns {Promise<string>} 输出结果
 */
 export default async => {
  var Text = "随机人物属性：\n";
  var p_str = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  var p_dex = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  var p_con = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  var p_int = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  var p_wis = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  var p_cha = rand.intBetween(1, 6) + rand.intBetween(1, 6) + rand.intBetween(1, 6);
  Text += `力量STR：${p_str}\n敏捷DEX：${p_dex}\n体质CON：${p_con}\n智力INT：${p_int}\n感知WIS：${p_wis}\n魅力CHA：${p_cha}\n`;
  var p_tot = p_str + p_con + p_dex + p_cha + p_int + p_wis;
  var result = '';
  if (p_tot > 100) {
    result = "宗师";
  } else if (p_tot <= 100 && p_tot > 80) {
    result = "英雄";
  } else if (p_tot <= 60 && p_tot > 80) {
    result = "侠客"
  } else if (p_tot > 40 && p_tot <= 60) {
    result = "精锐";
  } else if (p_tot > 20 && p_tot <= 40) {
    result = "平民";
  } else if (p_tot <= 20) {
    result = "兽人脸";
  }
  Text += `总和：${p_tot}（${result}）`;
  return Text;
}

