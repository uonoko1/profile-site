import type { Site } from "./types";

export const site: Site = {
  name: "Daichi Sakai",
  nameJa: "酒井 大地",
  role: "Software Engineer",
  tagline: "あったらいい、を形に。",
  /*
   * 画面には出さない。検索結果と SNS のカードに出る一文。
   * ページ本体が名乗りだけなので、ここだけは何者かが分かる長さを保つ。
   */
  description:
    "酒井大地のサイト。株式会社ヌーラボでソフトウェアエンジニアとして Backlog を開発しています。",
  url: "https://daichisakai.net",
  locale: "ja_JP",
  links: [
    { label: "GitHub", href: "https://github.com/uonoko1" },
    { label: "Email", href: "mailto:sakai.personal@gmail.com" },
  ],
};
