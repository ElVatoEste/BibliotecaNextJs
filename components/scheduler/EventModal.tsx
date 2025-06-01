"use client"

import React, { useEffect, useRef, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { CalendarEvent } from "../../firebase/models/CalendarEvent"

interface EventModalProps {
    event: CalendarEvent
    onClose: () => void
    onEdit: (event: CalendarEvent) => void
    onDelete: (eventId: number) => void
}

export default function EventModal({ event, onClose, onEdit, onDelete }: EventModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && e.target === overlayRef.current) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "ASISTENCIA":
                return {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    border: "border-green-200",
                    icon: "✓",
                    label: "Confirmada",
                }
            case "INASISTENCIA":
                return {
                    bg: "bg-red-100",
                    text: "text-red-800",
                    border: "border-red-200",
                    icon: "✗",
                    label: "No asistió",
                }
            default:
                return {
                    bg: "bg-yellow-100",
                    text: "text-yellow-800",
                    border: "border-yellow-200",
                    icon: "⏳",
                    label: "Pendiente",
                }
        }
    }

    const statusConfig = getStatusConfig(event.asistencia)

    const formatDateTime = (dateString: string) => {
        const date = parseISO(dateString)
        return {
            date: format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
            time: format(date, "HH:mm"),
        }
    }

    const startDateTime = formatDateTime(event.fechaEntrada)
    const endDateTime = formatDateTime(event.fechaSalida)

    const handleDelete = () => {
        onDelete(event.idReserva)
        onClose()
    }

    return (
        <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-[#007C91] px-6 py-4 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                            <h2 className="text-xl font-bold mb-1 leading-tight">{event.asuntoReserva}</h2>
                            <div className="flex items-center space-x-2 text-blue-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="text-sm font-medium">{event.nombreEstudiante}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                            >
                                <span className="mr-1">{statusConfig.icon}</span>
                                {statusConfig.label}
                            </div>
                            <button className="text-white hover:text-gray-200 transition-colors p-1" onClick={onClose}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Información Personal */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Información del Estudiante</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">CIF</p>
                                    <p className="font-medium text-gray-900">{event.cif}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Correo</p>
                                    <p className="font-medium text-gray-900 break-all">{event.correo}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detalles de la Reserva */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Detalles de la Reserva</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Fechas y Horarios */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Inicio</span>
                                        </div>
                                        <p className="text-sm text-gray-600 capitalize">{startDateTime.date}</p>
                                        <p className="text-lg font-bold text-gray-900">{startDateTime.time}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Fin</span>
                                        </div>
                                        <p className="text-sm text-gray-600 capitalize">{endDateTime.date}</p>
                                        <p className="text-lg font-bold text-gray-900">{endDateTime.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Participantes */}
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Participantes</p>
                                    <p className="font-medium text-gray-900">
                                        {event.cantidadPersonas} {event.cantidadPersonas === 1 ? "persona" : "personas"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equipamiento */}
                    {(event.utilizaPizarra || event.utilizaProyector || event.utilizaComputadora) && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900">Equipamiento Solicitado</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {event.utilizaPizarra && (
                                    <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-900">Pizarra</span>
                                    </div>
                                )}
                                {event.utilizaProyector && (
                                    <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Proyector</span>
                                    </div>
                                )}
                                {event.utilizaComputadora && (
                                    <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Computadora</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {event.extras && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                    <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900">Información Adicional</h3>
                            </div>
                            <p className="text-gray-700 bg-white rounded-lg p-3 border border-gray-200">{event.extras}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    {!showDeleteConfirm ? (
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => onEdit(event)}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                Editar Reserva
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                Eliminar Reserva
                            </button>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                <h4 className="font-semibold text-red-800">Confirmar Eliminación</h4>
                            </div>
                            <p className="text-red-700 mb-4">
                                ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
