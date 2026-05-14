import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const { t } = useTranslation()
    const isDark = resolvedTheme === "dark"
    const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark")

    return (
        <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={label}
            aria-pressed={isDark}
            title={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t("theme.toggle")}</span>
        </Button>
    )
}
