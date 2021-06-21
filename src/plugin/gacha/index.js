import _ from 'lodash';
import random from './random';

export default ctx => {
  const decks = global.config.bot.gacha;
  let stop = false;

  for (let { file, name } of decks) {
    if ([file, name].some(v => !(typeof v === 'string' && v.length))) continue;

    if (!ctx.includes(name) || !ctx.includes('十连') || !ctx.includes('抽卡')) continue;

    stop = true;

    const replyMsg = random(file, 10);
    if (replyMsg.length) global.replyMsg(ctx, replyMsg, true);
    break;
  }

  return stop;
};


