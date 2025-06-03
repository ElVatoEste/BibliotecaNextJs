import React, { createContext, useContext, useEffect, useState } from "react";
import Svg from "../../svg/";
import NavOptions from "../NavOptions";
import Link from "next/link";
import { signOut } from "../../../utils/genericUtils";
import Image from "next/image";
import Logo from "../../../images/logo.png";
import useLocalStorage from "../../../utils/hooks/useLocalStorage";

const CollapsedContext = createContext(false);

export default function SideNav() {
    const [collapsed, setCollapsed] = useLocalStorage("collapsed", false);

    return (
        <CollapsedContext.Provider value={collapsed}>
            <div className="flex flex-col bg-[#0099a8] text-white px-6 py-4">
                <SideNavHeader />
                <SideNavMenu />
                <SideNavFooter setExpanded={setCollapsed} />
            </div>
        </CollapsedContext.Provider>
    );
}

const SideNavHeader = () => {
    const collapsed = useContext(CollapsedContext);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex items-center ml-2 pb-8">
            <Link href="/" passHref>
                <a className="flex items-center text-white no-underline hover:text-blue-100">
                    <Image
                        src={Logo}
                        width={40}
                        height={40}
                        alt="Logo"
                        className="inline"
                    />
                    {/* Sólo muestro el texto después de montar */}
                    {mounted && !collapsed && (
                        <span className="ml-2 text-xl font-bold">Biblioteca UAM</span>
                    )}
                </a>
            </Link>
        </div>
    );
};

const SideNavMenu = () => {
    const collapsed = useContext(CollapsedContext);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hasta que no estemos montados, forzamos expanded=true
    const expanded = mounted ? !collapsed : true;

    return (
        <nav className="space-y-2">
            <NavOptions smallScreen={false} expanded={expanded} />
        </nav>
    );
};

type sideNavFooterProps = {
    setExpanded: (expanded: boolean) => void;
};

export const SideNavFooter = ({ setExpanded }: sideNavFooterProps) => {
    const collapsed = useContext(CollapsedContext);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Link href="/ajustes" passHref>
                <a className="flex ml-1 items-end mt-auto px-1 no-underline text-white hover:opacity-100">
                    <Svg.CogSvg />
                    {mounted && !collapsed && <div className="pl-2">Ajustes</div>}
                </a>
            </Link>

            <div className="flex pt-2">
                <a
                    href="#"
                    className="flex ml-1 items-center mt-3 px-1 pb-2 no-underline text-white hover:opacity-100"
                    onClick={signOut}
                >
                    <Svg.SignOutSvg />
                    {mounted && !collapsed && <div className="pl-2">Sign Out</div>}
                </a>

                <div className="text-right flex-1 content-center">
                    <button
                        onClick={() => setExpanded(!collapsed)}
                        className="px-2 py-1"
                    >
                        {mounted ? (collapsed ? ">" : "<") : "<"}
                    </button>
                </div>
            </div>
        </>
    );
};