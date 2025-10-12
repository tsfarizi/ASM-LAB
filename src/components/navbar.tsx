import { Link as HeroUILink } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export const Navbar = () => {
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
            <p className="font-bold text-inherit">ASM-Lab</p>
          </HeroUILink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="sm:basis-full" justify="end">
        <ThemeSwitch />
      </NavbarContent>
    </HeroUINavbar>
  );
};
