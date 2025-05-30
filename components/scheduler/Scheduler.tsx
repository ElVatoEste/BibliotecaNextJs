'use client';

import React from "react";
import Shell from "../shell";
import Content from "../content/Content";
import Calendar from "./Calendar";
import {CalendarEvent} from "../../interfaces/CalendarEvent";
import {es} from "date-fns/locale";


export default function Scheduler() {
    // Ejemplo de datos: un evento para el 15 de junio 2025
    const reservas: CalendarEvent[] = [
        { date: "2025-05-15", title: "Reunión con Cliente" },
        { date: "2025-05-20", title: "Mantenimiento" },
    ];

    const handleSelect = (date: Date) => {
        alert(`Elegiste: ${date.toLocaleDateString()}`);
        // aquí podrías abrir un modal para reservar...
    };

    return (
        <Shell>
            <Content title="Agenda de Reservas">
                <Calendar
                    events={reservas}
                    initialDate={new Date("2025-06-01")}
                    onDateSelect={handleSelect}
                    locale={es}
                />
            </Content>
        </Shell>
    );
}

