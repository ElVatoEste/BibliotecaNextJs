import React, { useState, useMemo } from "react";
import {
    addMonths,
    subMonths,
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
} from "date-fns";
import { CalendarEvent } from "../../firebase/models/CalendarEvent";
import { CalendarProps } from "../../interfaces/CalendarProps";
import PreviewEvent from "./PreviewEvent";
import EventModal from "./EventModal";

export default function Calendar({
                                     events = [],
                                     initialDate = new Date(),
                                     onDateSelect,
                                     onEditEvent,
                                     onDeleteEvent,
                                     locale,
                                 }: CalendarProps & {
    onEditEvent: (event: CalendarEvent) => void;
    onDeleteEvent: (eventId: number) => void;
}) {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const calendarDays = useMemo(() => {
        const startMonth = startOfMonth(currentDate);
        const endMonth = endOfMonth(currentDate);
        const startDate = startOfWeek(startMonth, { locale });
        const endDate = endOfWeek(endMonth, { locale });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate, locale]);

    const eventMap = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(ev => {
            const key = format(parseISO(ev.fechaEntrada), "yyyy-MM-dd");
            const arr = map.get(key) ?? [];
            arr.push(ev);
            map.set(key, arr);
        });
        return map;
    }, [events]);

    const prevMonth = () => setCurrentDate(d => subMonths(d, 1));
    const nextMonth = () => setCurrentDate(d => addMonths(d, 1));

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded">‹</button>
                <div className="font-semibold">
                    {format(currentDate, "LLLL yyyy", { locale })}
                </div>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded">›</button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-xs text-center text-gray-500 py-2">
                {["D","L","M","X","J","V","S"].map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 flex-1 gap-px bg-gray-200">
                {calendarDays.map(day => {
                    const iso = format(day, "yyyy-MM-dd");
                    const inMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayEvents = eventMap.get(iso) || [];

                    return (
                        <div
                            key={iso}
                            onClick={() => inMonth && onDateSelect?.(day)}
                            className={`flex flex-col p-1 cursor-pointer h-full
                ${inMonth ? "bg-white" : "bg-gray-50"}
                ${isToday ? "border-2 border-blue-500" : ""}
                hover:bg-blue-50`}
                        >
                            {/* Día */}
                            <div className={`text-right text-sm ${inMonth ? "text-gray-800" : "text-gray-400"}`}>
                                {format(day, "d")}
                            </div>

                            {/* Preview de eventos (hasta 2) */}
                            <div className="mt-auto space-y-1">
                                {dayEvents.slice(0, 2).map((ev, idx) => (
                                    <PreviewEvent
                                        key={idx}
                                        event={ev}
                                        onClick={() => setSelectedEvent(ev)}
                                    />
                                ))}
                                {dayEvents.length > 2 && (
                                    <div className="text-[10px] text-gray-500">
                                        +{dayEvents.length - 2} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Evento Modal */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onEdit={onEditEvent}
                    onDelete={onDeleteEvent}
                />
            )}
        </div>
    );
}

