// АДРЕС ТЕРМИНАЛА РАЗДЕЛА «БЛОКИ» В ЯДРЕ (шаг 300) — одно место для страницы и её машинного двойника.
// Выводится из адреса ядра (`ARCHITECT_URL`, выдаёт установщик узла; на своём домене — architect.<зона>): в коде домена
// нет. Адреса нет — ссылка превращается в обычный текст, а не ведёт в пустоту.
const ARCHITECT = (process.env.ARCHITECT_URL ?? '').replace(/\/+$/, '')

/** `[текст]({terminal})` → ссылка на терминал для языка; без адреса ядра — просто текст. */
export function withTerminal(text: string, lang: string): string {
  return ARCHITECT
    ? text.replaceAll('{terminal}', `${ARCHITECT}/${lang}/blocks/terminal`)
    : text.replace(/\[([^\]]+)\]\(\{terminal\}\)/g, '$1')
}
