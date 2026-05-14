import { Check, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLanguages, type AppLanguage } from "@/i18n/resources";

const languageLabels: Record<AppLanguage, string> = {
    vi: "language.vietnamese",
    en: "language.english",
};

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const currentLanguage = supportedLanguages.includes(i18n.language as AppLanguage)
        ? (i18n.language as AppLanguage)
        : "vi";

    const handleChangeLanguage = (language: AppLanguage) => {
        void i18n.changeLanguage(language);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="gap-2"
                    aria-label={t("language.switchTo")}
                    title={t("language.label")}
                >
                    <Globe2 className="size-4" />
                    <span className="text-xs font-semibold uppercase">{currentLanguage}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {supportedLanguages.map((language) => (
                    <DropdownMenuItem
                        key={language}
                        onClick={() => handleChangeLanguage(language)}
                        className="flex items-center justify-between gap-3"
                    >
                        <span>{t(languageLabels[language])}</span>
                        {currentLanguage === language && <Check className="size-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
