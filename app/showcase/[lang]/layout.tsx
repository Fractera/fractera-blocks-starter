import type { Metadata } from "next"
import { buildDesignCss } from "@/lib/design-css"
import { ThemeInit, AppWidthInit } from "@/components/shell/shell-init"

// 549-3: ВИТРИНА БЛОКОВ — страницы в рамке главной (`/showcase/<язык>/<раздел>`), вне `[lang]`, поэтому `<html>` держит этот макет,
// как прежний корневой макет сайта blocks v0.5.24: оформление проекта (`buildDesignCss`), тема и ширина до гидратации.
export const metadata: Metadata = { title: "Fractera — Blocks", robots: { index: false, follow: false } }

export default async function ShowcaseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const { css, fontLinks } = buildDesignCss()
  return (
    // suppressHydrationWarning: класс `dark` на <html> ставит скрипт темы до гидратации.
    <html lang={lang === "ru" ? "ru" : "en"} suppressHydrationWarning>
      <head>
        <ThemeInit />
        <AppWidthInit />
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
        {fontLinks.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  )
}
