// 使用 params 进行配置，如果未提供则使用默认值
var cfg = (typeof params === 'object' && params) ? params : {};

// 默认国家关键字表
var defaultCountryKeywords = {
  "香港": "香港",
  "HK": "香港",
  "Hong Kong": "香港",

  "新加坡": "新加坡",
  "狮城": "新加坡",
  "SG": "新加坡",

  "台湾": "台湾",
  "台灣": "台湾",
  "TW": "台湾",

  "日本": "日本",
  "JP": "日本",

  "韩国": "韩国",
  "韓國": "韩国",
  "KR": "韩国",

  "澳门": "澳门",
  "澳門": "澳门",
  "MO": "澳门",

  "美国": "美国",
  "美國": "美国",
  "US": "美国",
  "USA": "美国",
  "LA": "美国",
  "NY": "美国",
  "SF": "美国",

  "加拿大": "加拿大",
  "CA": "加拿大",

  "英国": "英国",
  "UK": "英国",
  "GB": "英国",

  "德国": "德国",
  "DE": "德国",

  "法国": "法国",
  "FR": "法国",

  "意大利": "意大利",
  "IT": "意大利",

  "挪威": "挪威",
  "NO": "挪威",

  "澳大利亚": "澳洲",
  "澳洲": "澳洲",
  "AU": "澳洲",

  "俄罗斯": "俄罗斯",
  "俄羅斯": "俄罗斯",
  "RU": "俄罗斯",

  "乌克兰": "乌克兰",
  "烏克蘭": "乌克兰",
  "UA": "乌克兰",

  "土耳其": "土耳其",
  "TR": "土耳其",

  "阿联酋": "阿联酋",
  "阿聯酋": "阿联酋",
  "AE": "阿联酋",

  "尼日利亚": "尼日利亚",
  "尼日利亞": "尼日利亚",
  "NG": "尼日利亚",

  "菲律宾": "菲律宾",
  "菲律賓": "菲律宾",
  "PH": "菲律宾",

  "泰国": "泰国",
  "泰國": "泰国",
  "TH": "泰国",

  "越南": "越南",
  "VN": "越南",

  "马来西亚": "马来西亚",
  "馬來西亞": "马来西亚",
  "MY": "马来西亚",

  "印度尼西亚": "印度尼西亚",
  "印尼": "印度尼西亚",
  "ID": "印度尼西亚",

  "印度": "印度",
  "IN": "印度",

  "阿根廷": "阿根廷",
  "AR": "阿根廷",

  "巴西": "巴西",
  "BR": "巴西"
};

// 国旗 emoji 映射表（按标准化后的国家名来）
var countryFlags = {
  "香港": "🇭🇰",
  "新加坡": "🇸🇬",
  "台湾": "🇹🇼",
  "日本": "🇯🇵",
  "韩国": "🇰🇷",
  "澳门": "🇲🇴",
  "美国": "🇺🇸",
  "加拿大": "🇨🇦",
  "英国": "🇬🇧",
  "德国": "🇩🇪",
  "法国": "🇫🇷",
  "意大利": "🇮🇹",
  "挪威": "🇳🇴",
  "澳洲": "🇦🇺",
  "俄罗斯": "🇷🇺",
  "乌克兰": "🇺🇦",
  "土耳其": "🇹🇷",
  "阿联酋": "🇦🇪",
  "尼日利亚": "🇳🇬",
  "菲律宾": "🇵🇭",
  "泰国": "🇹🇭",
  "越南": "🇻🇳",
  "马来西亚": "🇲🇾",
  "印度尼西亚": "🇮🇩",
  "印度": "🇮🇳",
  "阿根廷": "🇦🇷",
  "巴西": "🇧🇷"
};

// 从国家名取 emoji，没有就返回空串
function getCountryFlag(country) {
  return countryFlags[country] || "";
}

// 合并参数里的 countryKeywords 和默认值
var countryKeywords = cfg.countryKeywords || defaultCountryKeywords;

// IEPL 关键字列表
var ieplKeywords = Array.isArray(cfg.ieplKeywords) && cfg.ieplKeywords.length
  ? cfg.ieplKeywords
  : ["IEPL", "专线", "直连", "IPLC"];

// 过滤用关键字列表（非节点）
var excludeKeywords = Array.isArray(cfg.excludeKeywords) && cfg.excludeKeywords.length
  ? cfg.excludeKeywords
  : [
      "自动选择",
      "故障转移",
      "境内使用",
      "海外使用",
      "剩余流量",
      "套餐到期",
      "过滤掉",
      "组合机场场景",
      "策略组",
      "Selector",
      "URLTest",
      "Fallback",
      "负载均衡"
    ];

// 名称模板 & IEPL / 中转显示名
var nameTemplate = cfg.nameTemplate || "{country}-{lineType} {index}";
var ieplName = cfg.ieplName || "IEPL";
var relayName = cfg.relayName || "中转";
var indexPadding = typeof cfg.indexPadding === "number" ? cfg.indexPadding : 2;

// 工具：左侧补 0
function padIndex(num, width) {
  var s = String(num);
  while (s.length < width) s = "0" + s;
  return s;
}

// 过滤掉明显不是节点的名字（策略组、流量信息等）
function isRealNodeName(name) {
  if (!name) return false;
  var n = String(name);
  for (var i = 0; i < excludeKeywords.length; i++) {
    var kw = excludeKeywords[i];
    if (!kw) continue;
    if (n.indexOf(kw) !== -1) return false;
  }
  return true;
}

// 根据名称匹配国家
function detectCountry(name) {
  var n = String(name || "");
  var hit = null;
  var bestLen = 0;

  for (var k in countryKeywords) {
    if (!Object.prototype.hasOwnProperty.call(countryKeywords, k)) continue;
    if (!k) continue;

    var idx = n.toLowerCase().indexOf(k.toLowerCase());
    if (idx !== -1 && k.length > bestLen) {
      bestLen = k.length;
      hit = countryKeywords[k];
    }
  }
  return hit;
}

// 判断是否 IEPL 线路
function isIEPLNode(name) {
  if (!name) return false;
  var n = String(name);
  for (var i = 0; i < ieplKeywords.length; i++) {
    var kw = ieplKeywords[i];
    if (!kw) continue;
    var reg = new RegExp(kw, "i");
    if (reg.test(n)) return true;
  }
  return false;
}

// 根据模板生成名称
function buildName(country, lineType, index) {
  var s = nameTemplate;
  s = s.replace(/\{country\}/g, country);
  s = s.replace(/\{lineType\}/g, lineType);
  s = s.replace(/\{index\}/g, index);
  return s;
}

// ---------- 主逻辑 ----------
if (!Array.isArray(proxies)) {
  return proxies || [];
}

// 先过滤掉提醒/非节点的 proxy，例如“套餐到期：长期有效”
proxies = proxies.filter(function (p) {
  if (!p || !p.name) return false;
  return isRealNodeName(p.name); // 用前面定义的排除关键字来判断
});

var counters = Object.create(null);

for (var i = 0; i < proxies.length; i++) {
  var p = proxies[i];
  if (!p || !p.name) continue;

  var oldName = p.name;

  var country = detectCountry(oldName);
  if (!country) continue; // 没匹配到国家就不动

  // 为国家名加上国旗前缀
  var flag = getCountryFlag(country);
  if (flag) {
    country = flag + " " + country;
  }

  var lineType = isIEPLNode(oldName) ? ieplName : relayName;
  var key = country + "-" + lineType;

  if (!counters[key]) counters[key] = 0;
  counters[key]++;

  var index = padIndex(counters[key], indexPadding);

  p.name = buildName(country, lineType, index);
}

return proxies;
