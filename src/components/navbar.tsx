import { Link as HeroUILink } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export const Navbar = () => {
  const { activeLanguage } = useLanguage();
  const { account } = useAuth();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <HeroUILink
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="#/"
          >
            <Logo />
            <p className="font-bold text-inherit">{activeLanguage.labLabel}</p>
          </HeroUILink>
        </NavbarBrand>

        {account?.role === "admin" ? (
          <>
            <HeroUILink
              className="hidden rounded-full px-4 py-1 text-sm font-medium text-default-600 transition hover:text-primary sm:inline-block dark:text-default-300 dark:hover:text-primary-200"
              color="foreground"
              href="#/admin"
            >
              Admin
            </HeroUILink>
            <HeroUILink
              className="text-sm font-medium text-default-600 transition hover:text-primary sm:hidden dark:text-default-300 dark:hover:text-primary-200"
              color="foreground"
              href="#/admin"
            >
              Admin
            </HeroUILink>
          </>
        ) : null}
      </NavbarContent>

      <NavbarContent className="sm:basis-full" justify="end">
        {account ? (
          <span className="hidden text-xs font-medium text-default-500 dark:text-default-300 sm:inline-block">
            {account.npm} · {account.role === "admin" ? "Admin" : "User"}
          </span>
        ) : (
          <HeroUILink className="text-sm font-medium" color="foreground" href="#/login">
            Login
          </HeroUILink>
        )}
        <ThemeSwitch />
      </NavbarContent>
    </HeroUINavbar>
  );
};






