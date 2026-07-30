export type AppLanguage = "zh-CN" | "zh-TW" | "en";

export const LANG_LABELS: Record<AppLanguage, string> = {
  "zh-CN": "简",
  "zh-TW": "繁",
  "en": "EN",
};

export type I18nMessages = {
  title: string;
  subtitle: string;
  dropHint: string;
  clickBrowse: string;
  files: string;
  convertS2T: string;
  convertT2S: string;
  convertAuto: string;
  converting: string;
  download: string;
  remove: string;
  statusPending: string;
  statusConverting: string;
  statusDone: string;
  statusError: string;
  themeLabel: string;
  footerCopyrightBefore: string;
  footerCopyrightLink: string;
  footerSite: string;
  footerDonate: string;
  footerDivider: string;
  langSwitch: string;
  bilibili: string;
  douyin: string;
  introTitle: string;
  introText: string;
};

const zhCN: I18nMessages = {
  title: "FSYLのEPUB简繁转换器",
  subtitle: "电子书简繁转换工具",
  dropHint: "拖拽 EPUB 文件到此处",
  clickBrowse: "或点击选择文件",
  files: "文件",
  convertS2T: "简体转繁体",
  convertT2S: "繁体转简体",
  convertAuto: "自动转换",
  converting: "转换中",
  download: "下载",
  remove: "删除",
  statusPending: "待转换",
  statusConverting: "转换中",
  statusDone: "已完成",
  statusError: "失败",
  themeLabel: "主题",
  footerCopyrightBefore: "© 2026 版权归属 ",
  footerCopyrightLink: "FSYLの小破站",
  footerSite: "FSYL的小破站",
  footerDonate: "前往赞赏",
  footerDivider: "|",
  langSwitch: "语言",
  bilibili: "B站主页",
  douyin: "抖音主页",
  introTitle: "关于本站",
  introText: "这是我的一个小工具站，平时自己也需要把 EPUB 电子书在简体和繁体之间来回倒腾，干脆就写了个网页版的，方便自己也方便大家。所有转换都在浏览器里完成，不会上传你的文件，可以放心用。如果你觉得有用，欢迎去上面赞赏支持一下～",
};

const zhTW: I18nMessages = {
  title: "FSYLのEPUB簡繁轉換器",
  subtitle: "電子書簡繁轉換工具",
  dropHint: "拖拽 EPUB 檔案到此處",
  clickBrowse: "或點擊選擇檔案",
  files: "檔案",
  convertS2T: "簡體轉繁體",
  convertT2S: "繁體轉簡體",
  convertAuto: "自動轉換",
  converting: "轉換中",
  download: "下載",
  remove: "刪除",
  statusPending: "待轉換",
  statusConverting: "轉換中",
  statusDone: "已完成",
  statusError: "失敗",
  themeLabel: "主題",
  footerCopyrightBefore: "© 2026 版權歸屬 ",
  footerCopyrightLink: "FSYLの小破站",
  footerSite: "FSYL的小破站",
  footerDonate: "前往贊賞",
  footerDivider: "|",
  langSwitch: "語言",
  bilibili: "B站主頁",
  douyin: "抖音主頁",
  introTitle: "關於本站",
  introText: "這是我的個人小工具站，平時自己也需要把 EPUB 電子書在簡繁體之間轉來轉去，索性就寫了個網頁版，方便自己也方便大家。所有轉換都在瀏覽器裡完成，不會上傳你的文件，可以放心使用。如果你覺得有用，歡迎去上面贊賞支持一下～",
};

const en: I18nMessages = {
  title: "FSYL EPUB Converter",
  subtitle: "Chinese Text Converter for eBooks",
  dropHint: "Drop EPUB files here",
  clickBrowse: "or click to browse",
  files: "Files",
  convertS2T: "S to T",
  convertT2S: "T to S",
  convertAuto: "Auto",
  converting: "Converting",
  download: "Download",
  remove: "Remove",
  statusPending: "Pending",
  statusConverting: "Converting",
  statusDone: "Done",
  statusError: "Error",
  themeLabel: "Theme",
  footerCopyrightBefore: "© 2026 ",
  footerCopyrightLink: "FSYL's Site",
  footerSite: "FSYL's Site",
  footerDonate: "Donate",
  footerDivider: "|",
  langSwitch: "Language",
  bilibili: "Bilibili",
  douyin: "Douyin",
  introTitle: "About",
  introText: "This is a personal tool I built for converting EPUB eBooks between Simplified and Traditional Chinese. All conversions happen locally in your browser — your files never leave your device. Feel free to use it, and if you find it helpful, consider supporting via the donate link above.",
};

const messages: Record<AppLanguage, I18nMessages> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
};

export function getMessages(lang: AppLanguage): I18nMessages {
  return messages[lang];
}

export function detectLanguage(): AppLanguage {
  try {
    const lang = navigator.language;
    if (lang.startsWith("zh-TW") || lang.startsWith("zh-HK") || lang.startsWith("zh-MO")) {
      return "zh-TW";
    }
    if (lang.startsWith("zh")) {
      return "zh-CN";
    }
    return "en";
  } catch {
    return "zh-CN";
  }
}

export function getNextLang(lang: AppLanguage): AppLanguage {
  const order: AppLanguage[] = ["zh-CN", "zh-TW", "en"];
  const idx = order.indexOf(lang);
  return order[(idx + 1) % order.length];
}
