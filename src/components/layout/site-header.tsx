import Link from "next/link";
import { HeartHandshake, LifeBuoy, Gift } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LinkButton } from "@/components/shared/link-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/affected-areas", label: t.nav.affectedAreas },
    { href: "/medical", label: t.nav.medical },
    { href: "/map", label: t.nav.map },
    { href: "/news", label: t.nav.news },
    { href: "/transparency", label: t.nav.transparency },
    { href: "/official-information", label: t.nav.officialInformation },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <MobileNav locale={locale} />
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="flex size-9 items-center justify-center rounded-full bg-algeria-green text-algeria-green-foreground">
              <HeartHandshake className="size-5" />
            </span>
            <span className="truncate max-w-[160px] sm:max-w-none">{siteConfig.shortName}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher current={locale} label={t.language.change} />
          </div>
          <LinkButton href="/help" size="sm" variant="outline" className="hidden md:inline-flex">
            <LifeBuoy className="size-4" /> {t.cta.needHelp}
          </LinkButton>
          <LinkButton href="/donate" size="sm" className="hidden sm:inline-flex">
            <Gift className="size-4" /> {t.cta.haveAid}
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
