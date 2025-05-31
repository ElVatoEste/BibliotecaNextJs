import React, { createContext, useContext } from "react";
import Svg from "../../svg/";
import NavBarOptions from "../navBar/NavBarOptions";
import Link from "next/link";
import { signOut } from "../../../utils/genericUtils";
import Image from "next/image";
import Logo from "../../../images/logo.png";
import useLocalStorage from "../../../utils/hooks/useLocalStorage";

const CollapsedContext = createContext(false);

export default function SideNav() {
  const [expanded, setExpanded] = useLocalStorage("collapsed", false);

  return (
    <CollapsedContext.Provider value={expanded}>
      <div className="flex flex-col bg-[#0099a8] text-white px-6 py-4">
        <SideNavHeader />
        <SideNavMenu />
        <SideNavFooter setExpanded={setExpanded} />
      </div>
    </CollapsedContext.Provider>
  );
}

const SideNavHeader = () => {
    const collapsed = useContext(CollapsedContext);

    return (
        <div className="flex items-center ml-2 pb-8">
            <Link href="/">
                <a className="flex items-center text-white no-underline hover:text-blue-100">
                    <Image
                        src={Logo}
                        width={40}
                        height={40}
                        alt="Logo"
                        className="inline"
                    />
                    {!collapsed && (
                        <span className="ml-2 text-xl font-bold">Biblioteca UAM</span>
                    )}
                </a>
            </Link>
        </div>
    );
};

const SideNavMenu = () => {
  const collapsed = useContext(CollapsedContext);

  return (
    <nav className="space-y-2">
      <NavBarOptions smallScreen={false} expanded={!collapsed} />
    </nav>
  );
};

type sideNavFooterProps = {
  setExpanded: (expanded: boolean) => void;
};

const SideNavFooter = ({ setExpanded }: sideNavFooterProps) => {
  const collapsed = useContext(CollapsedContext);
  return (
      <>
          <Link href="/settings">
              <a className="flex ml-1 items-end mt-auto px-1 no-underline text-white hover:opacity-100">
                  <Svg.CogSvg/>
                  {!collapsed && <div className="pl-2">Settings</div>}
              </a>
          </Link>

          <div className="flex pt-2">

              <a
                  href=""
                  className="flex ml-1 items-center mt-3 px-1 pb-2 no-underline text-white hover:opacity-100"
                  onClick={signOut}
              >
                  <Svg.SignOutSvg/>
                  {!collapsed && <div className="pl-2">Sign Out</div>}
              </a>
              <div className="text-right flex-1 content-center">
                  <button
                      onClick={() => {
                          // dispatch(toggle());
                          setExpanded(!collapsed);
                      }}
                  >
                      {collapsed ? ">" : "<"}
                  </button>
              </div>
          </div>
      </>
  );
};
