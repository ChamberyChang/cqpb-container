# cq-picsearcher-bot

这是一个以 Node.js 编写的酷Q机器人程序，用于搜图、搜番、搜本子，并夹带了许多娱乐向功能（。）

因酷Q已停止运营，本程序转为适配 [go-cqhttp](https://github.com/Mrs4s/go-cqhttp)，初期可能 bug 很多，请支持并耐心等待 go-cqhttp 的完善

目前支持的搜图服务：

- [saucenao](https://saucenao.com)
- [whatanime](https://trace.moe)
- [ascii2d](https://ascii2d.net)

附加功能：

- 复读
- setu
- OCR
- 明日方舟公开招募计算
- 定时提醒
- 群发消息
- 反哔哩哔哩小程序
- [抽卡模拟器](https://github.com/SayaSS/CQ-gacha/)（*）

详细说明请移步 [wiki](https://github.com/Tsuk1ko/cq-picsearcher-bot/wiki)

本分支附加小修改：
- 对 Mangadex 和 AniDB 搜索结果的信息增补
- 剔除 ascii2d 搜索结果中的无用内容（主要是购买链接）
- 为明日方舟公招计算器增加日语词条支持，使用时请增加 ```--lang=ja```

## *对抽卡模拟器模块的额外说明
我确实不认为这个屑分支有谁会在乎，但是我还是把配置方式写在这里了。
感谢原作者 [SayaSS](https://github.com/SayaSS) 基于MIT协议开源代码。

首先你需要新建一个 ```./data/decks``` 目录，并在里头存放如下格式的JSON牌库。注意牌库与DICE等跑团机器人牌库格式完全不同，不能通用。
```ps1
{
	"weight": [0.7, 3.4, 18, 77, 0.9], 
    //概率分别为tierUp/tier3/tier2/tier1/tier4（%）
    //注意：json格式内不能留注释，配置时请去掉//后内容或考虑jsonc
	"tierUp": ["3★-優衣（公主）"],
	"tier4": ["3★-貪吃佩可（公主）", "3★-可可蘿（公主）"],
	"tier3": ["3★-霞（魔法少女）", "3★-空花（大江戶）", "3★-妮諾（大江戶）"],
	"tier2": ["2★-茜里", "2★-綾音", "2★-千歌", "2★-惠理子",],
	"tier1": ["1★-碧", "1★-步未", "1★-日和", "1★-胡桃",]
}
```

然后在经由 ```config.default.jsonc``` 复制而来的 ```config.jsonc``` 处的 ```"gacha"``` 后的数组 ```[]``` 内增加类似以下的字段：
```ps1
"gacha": [
      {
          "file": "pcr",
          "name": "公主链接"
      }
    ],
```
其中 ```file``` 表示你放在decks目录下不包含.json后缀的文件名，最好不要起怪名字；```regexp``` 表示在唤起模拟抽卡命令时对应的正则匹配词，也可以理解为口令。调用原理同 ```corpus[]``` 形式。

正则匹配以及可以自定义一回抽几次的配置代码在 ```gacha/index.js``` 中，请自行阅读并根据需要修改。

## 感谢以下项目或服务（不分先后）

- [saucenao](https://saucenao.com)
- [ascii2d](https://ascii2d.net)
- [trace.moe](https://trace.moe) ([GitHub](https://github.com/soruly/trace.moe))
- [coolq-http-api](https://cqhttp.cc) ([GitHub](https://github.com/richardchien/coolq-http-api))
- [node-cq-websocket](https://github.com/momocow/node-cq-websocket)
- [酷Q](https://cqp.cc) (R.I.P.)
- [go-cqhttp](https://github.com/Mrs4s/go-cqhttp)

## GUDO

重构为更加模块化的一个机器人框架，以支持自定义插件等
