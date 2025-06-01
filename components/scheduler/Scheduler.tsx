'use client';

import React, { useState } from "react";
import Shell from "../shell";
import Content from "../content/Content";
import Calendar from "./Calendar";
import NoReservationsModal from "./NoReservationsModal";
import AddEditReservationModal from "./AddEditReservationModal";
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
    } = useReservations();

    const [showNoReservationsModal, setShowNoReservationsModal] = useState(false);
    const [addEditData, setAddEditData] = useState<{ date?: Date; event?: CalendarEvent } | null>(null);

    // 1) Solo abrimos el “Sin Reservas” cuando ya cargó y no hay datos
    React.useEffect(() => {
        if (!loading && reservas.length === 0) {
            setShowNoReservationsModal(true);
        } else {
            setShowNoReservationsModal(false);
        }
    }, [loading, reservas]);

    const handleDateSelect = (date: Date) => {
        // Abrir modal en “modo agregar”
        setAddEditData({ date });
    };

    const handleEditEvent = (event: CalendarEvent) => {
        // Abrir modal en “modo editar”
        setAddEditData({ event });
    };

    const handleDeleteEvent = async (eventId: number) => {
        await deleteReservation(eventId);
        // Si el evento que se muestra en el modal es el que se eliminó, cierra el modal
        if (addEditData?.event?.idReserva === eventId) {
            setAddEditData(null);
        }
    };

    const handleSaveReservation = async (eventData: CalendarEvent) => {
        if (eventData.idReserva && reservas.some((r) => r.idReserva === eventData.idReserva)) {
            await updateReservation(eventData);
        } else {
            await addReservation(eventData);
        }
        setAddEditData(null);
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
                            initialDate={new Date()}
                            onDateSelect={handleDateSelect}
                            onEditEvent={handleEditEvent}
                            onDeleteEvent={handleDeleteEvent}
                            locale={es}
                        />

                        {showNoReservationsModal && (
                            <NoReservationsModal onClose={() => setShowNoReservationsModal(false)} />
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

// 3) Envolvemos con ReservationsProvider
export default function Scheduler() {
    return (
        <ReservationsProvider>
            <SchedulerInner />
        </ReservationsProvider>
    );
}
