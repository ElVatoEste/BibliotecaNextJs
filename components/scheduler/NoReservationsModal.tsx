// src/components/NoReservationsModal.tsx
import React, { useEffect, useRef } from "react";

interface NoReservationsModalProps {
    onClose: () => void;
}

export default function NoReservationsModal({ onClose }: NoReservationsModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && e.target === overlayRef.current) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h2 className="text-xl font-semibold mb-2">Sin Reservas</h2>
                <p className="mb-4">Actualmente no existen reservas registradas.</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
