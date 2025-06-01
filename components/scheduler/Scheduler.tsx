import React, { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import Shell from "../shell";
import Content from "../content/Content";
import Calendar from "./Calendar";
import NoReservationsModal from "./modal/NoReservationsModal";
import AddEditReservationModal from "./modal/AddEditReservationModal";
import { CalendarEvent } from "../../firebase/models/CalendarEvent";
import { es } from "date-fns/locale";

// Importamos el contexto nuevo
import { ReservationsProvider, useReservations } from "../../firebase/reservations/ReservationsContext";

function SchedulerInner() {
    const {
        reservas,
        loading,
        addReservation,
        updateReservation,
        deleteReservation,
        setStartDate,
        setEndDate,
    } = useReservations();

    // Estado para controlar qué mes debe mostrar el calendario
    const [monthToShow, setMonthToShow] = useState<Date>(new Date());

    const [showNoReservationsModal, setShowNoReservationsModal] = useState(false);
    const [addEditData, setAddEditData] = useState<{ date?: Date; event?: CalendarEvent } | null>(null);

    // 1) Al montar, cargamos las reservas del mes inicial
    useEffect(() => {
        const inicio = startOfMonth(monthToShow);
        const fin = endOfMonth(monthToShow);
        setStartDate(inicio);
        setEndDate(fin);
    }, []);

    // 2) Solo abrimos el “Sin Reservas” cuando ya cargó y no hay datos
    useEffect(() => {
        if (!loading && reservas.length === 0) {
            setShowNoReservationsModal(true);
        } else {
            setShowNoReservationsModal(false);
        }
    }, [loading, reservas]);

    // Cuando el usuario hace clic en un día sin eventos, abrimos modal para “agregar”.
    const handleDateSelect = (date: Date) => {
        setAddEditData({ date });
    };

    // Cuando el usuario hace clic en un evento, abrimos modal para “editar”
    const handleEditEvent = (event: CalendarEvent) => {
        setAddEditData({ event });
    };

    // Eliminar reserva
    const handleDeleteEvent = async (eventId: number) => {
        await deleteReservation(eventId);
        // Si el modal estaba mostrando justamente ese evento, cerramos
        if (addEditData?.event?.idReserva === eventId) {
            setAddEditData(null);
        }
    };

    // Guardar o actualizar reserva desde el modal
    const handleSaveReservation = async (eventData: CalendarEvent) => {
        if (
            eventData.idReserva &&
            reservas.some((r) => r.idReserva === eventData.idReserva)
        ) {
            await updateReservation(eventData);
        } else {
            await addReservation(eventData);
        }
        setAddEditData(null);
    };

    // 3) Cuando cambie de mes en el calendario, actualizamos el estado local y los rangos de contexto
    const handleMonthChange = (newMonthDate: Date) => {
        setMonthToShow(newMonthDate);

        const inicio = startOfMonth(newMonthDate);
        const fin = endOfMonth(newMonthDate);
        setStartDate(inicio);
        setEndDate(fin);
    };

    return (
        <Shell>
            <Content title="Agenda de Reservas">
                {loading ? (
                    <p className="text-center py-4">Cargando reservas...</p>
                ) : (
                    <>
                        <Calendar
                            events={reservas}
                            initialDate={monthToShow}
                            onDateSelect={handleDateSelect}
                            onEditEvent={handleEditEvent}
                            onDeleteEvent={handleDeleteEvent}
                            onChangeMonth={handleMonthChange}
                            locale={es}
                        />

                        {showNoReservationsModal && (
                            <NoReservationsModal
                                onClose={() => setShowNoReservationsModal(false)}
                            />
                        )}

                        {addEditData && (
                            <AddEditReservationModal
                                date={addEditData.date}
                                event={addEditData.event}
                                onClose={() => setAddEditData(null)}
                                onSave={handleSaveReservation}
                            />
                        )}
                    </>
                )}
            </Content>
        </Shell>
    );
}

// 4) Envolvemos con ReservationsProvider
export default function Scheduler() {
    return (
        <ReservationsProvider>
            <SchedulerInner />
        </ReservationsProvider>
    );
}
