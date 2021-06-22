import _ from 'lodash';
import random from './random';

export default ctx => {
  const decks = global.config.bot.gacha;
  let stop = false;

  for (let { file, name } of decks) {
    if ([file, name].some(v => !(typeof v === 'string' && v.length))) continue;

    const regexp = "(^" + name + "模拟十连$)"
    const reg = new RegExp(regexp);
    const exec = reg.exec(ctx.message);
    if (!exec) continue;

    stop = true;

    const replyMsg = random(file, 10);
    if (replyMsg.length) global.replyMsg(ctx, replyMsg, true);
    break;
  }

  return stop;
};


