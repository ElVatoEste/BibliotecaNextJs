import React from "react";
import Svg from "../../svg";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "../../../utils/genericUtils";

type Props = {
  /** Whether the navbar options are appearing on a small screen, or a collapsed navbar */
  smallScreen?: boolean;
  expanded?: boolean;
};

export default function NavBarOptions({
  smallScreen = false,
  expanded = true,
}: Props) {
  return (
    <>
      <NavItem
        link="/"
        svgIcon={<Svg.ChartPieSvg />}
        title="Calendario"
        expanded={expanded}
      />
      <NavItem
        link="/asistencia"
        svgIcon={<Svg.MessagesSvg />}
        title="Asistencias"
        expanded={expanded}
      />
      <NavItem
        link="/estudiantes"
        svgIcon={<Svg.UsersSvg />}
        title="Estudiantes"
        expanded={expanded}
      />
      {smallScreen && (
        <>
          <NavItem link="/settings" svgIcon={<Svg.CogSvg />} title="Settings" />
          <a
            onClick={signOut}
            className="flex items-center no-underline text-blue-50 hover:text-blue-100 p-3 rounded-md"
          >
            {<Svg.SignOutSvg />}
            <div className="font-bold pl-3">Sign Out</div>
          </a>
        </>
      )}
    </>
  );
}

type NavItemProps = {
  link: string;
  svgIcon: JSX.Element;
  title: string;
  expanded?: boolean;
};

const NavItem = ({ link, svgIcon, title, expanded = true }: NavItemProps) => {
  const router = useRouter();
  return (
    <Link href={link}>
      <a
        className={`flex items-center no-underline text-blue-50 hover:text-blue-100 p-3 rounded-md ${
          isActivePage(link, router.pathname) ? "bg-[#007C91]" : ""
        }`}
      >
        {svgIcon}
        {expanded && <div className="font-bold pl-3">{title}</div>}
      </a>
    </Link>
  );
};

const isActivePage = (link: string, pathName: string) => {
  return pathName.toLowerCase() === link.toLowerCase();
};
