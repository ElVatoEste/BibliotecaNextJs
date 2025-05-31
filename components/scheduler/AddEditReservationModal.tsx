"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { CalendarEvent } from "../../interfaces/CalendarEvent"
import { formatISO } from "date-fns"

interface AddEditReservationModalProps {
    date?: Date
    event?: CalendarEvent
    onClose: () => void
    onSave: (data: CalendarEvent) => Promise<void>
}

export default function AddEditReservationModal({ date, event, onClose, onSave }: AddEditReservationModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && e.target === overlayRef.current) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    const [formData, setFormData] = useState<CalendarEvent>({
        idReserva: event?.idReserva ?? 0,
        nombreEstudiante: event?.nombreEstudiante ?? "",
        cif: event?.cif ?? "",
        correo: event?.correo ?? "",
        asuntoReserva: event?.asuntoReserva ?? "",
        cantidadPersonas: event?.cantidadPersonas ?? 1,
        fechaEntrada: event ? event.fechaEntrada : date ? formatISO(date).slice(0, 16) : "",
        fechaSalida: event ? event.fechaSalida : date ? formatISO(date).slice(0, 16) : "",
        utilizaPizarra: event?.utilizaPizarra ?? false,
        utilizaProyector: event?.utilizaProyector ?? false,
        utilizaComputadora: event?.utilizaComputadora ?? false,
        extras: event?.extras,
        asistencia: event?.asistencia ?? "PENDIENTE",
    })

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nombreEstudiante.trim()) {
            newErrors.nombreEstudiante = "El nombre es requerido"
        }

        if (!formData.cif.trim()) {
            newErrors.cif = "El CIF es requerido"
        }

        if (!formData.correo.trim()) {
            newErrors.correo = "El correo es requerido"
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = "El correo no es válido"
        }

        if (!formData.asuntoReserva.trim()) {
            newErrors.asuntoReserva = "El asunto es requerido"
        }

        if (new Date(formData.fechaSalida) <= new Date(formData.fechaEntrada)) {
            newErrors.fechaSalida = "La fecha de salida debe ser posterior a la fecha de entrada"
        }

        if (formData.cantidadPersonas < 1) {
            newErrors.cantidadPersonas = "Debe haber al menos 1 persona"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        if (type === "checkbox") {
            const el = e.target as HTMLInputElement
            setFormData((prev) => ({
                ...prev,
                [name]: el.checked,
            }))
        } else if (name === "cantidadPersonas") {
            setFormData((prev) => ({
                ...prev,
                [name]: Number.parseInt(value) || 1,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error("Error saving reservation:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDIENTE: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" },
            ASISTENCIA: { bg: "bg-green-100", text: "text-green-800", label: "Asistencia" },
            INASISTENCIA: { bg: "bg-red-100", text: "text-red-800", label: "Inasistencia" },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDIENTE

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
        {config.label}
      </span>
        )
    }

    return (
        <div ref={overlayRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#007C91] px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{event ? "Editar Reserva" : "Nueva Reserva"}</h2>
                                <p className="text-blue-100 text-sm">
                                    {event
                                        ? "Modifica los detalles de la reserva"
                                        : "Completa la información para crear una nueva reserva"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {event && getStatusBadge(formData.asistencia)}
                            <button className="text-white hover:text-gray-200 transition-colors p-1" onClick={onClose}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Información Personal */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Estudiante *</label>
                                    <input
                                        type="text"
                                        name="nombreEstudiante"
                                        value={formData.nombreEstudiante}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.nombreEstudiante ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                        placeholder="Ingrese el nombre completo"
                                    />
                                    {errors.nombreEstudiante && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.nombreEstudiante}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CIF *</label>
                                    <input
                                        type="text"
                                        name="cif"
                                        value={formData.cif}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.cif ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                        placeholder="Ingrese el CIF"
                                    />
                                    {errors.cif && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.cif}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Correo Electrónico *</span>
                                        </div>
                                    </label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.correo ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                        placeholder="ejemplo@correo.com"
                                    />
                                    {errors.correo && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.correo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detalles de la Reserva */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Detalles de la Reserva</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Asunto de la Reserva *</label>
                                    <input
                                        type="text"
                                        name="asuntoReserva"
                                        value={formData.asuntoReserva}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.asuntoReserva ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                        placeholder="Describe el propósito de la reserva"
                                    />
                                    {errors.asuntoReserva && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.asuntoReserva}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                            <span>Cantidad de Personas *</span>
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        name="cantidadPersonas"
                                        min="1"
                                        value={formData.cantidadPersonas}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.cantidadPersonas ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.cantidadPersonas && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.cantidadPersonas}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Asistencia</label>
                                    <select
                                        name="asistencia"
                                        value={formData.asistencia}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                    >
                                        <option value="PENDIENTE">Pendiente</option>
                                        <option value="ASISTENCIA">Asistencia</option>
                                        <option value="INASISTENCIA">Inasistencia</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fechas y Horarios */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Fechas y Horarios</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Entrada *</label>
                                    <input
                                        type="datetime-local"
                                        name="fechaEntrada"
                                        value={formData.fechaEntrada.slice(0, 16)}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.fechaEntrada ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.fechaEntrada && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.fechaEntrada}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Salida *</label>
                                    <input
                                        type="datetime-local"
                                        name="fechaSalida"
                                        value={formData.fechaSalida.slice(0, 16)}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            errors.fechaSalida ? "border-red-500 bg-red-50" : "border-gray-300"
                                        }`}
                                    />
                                    {errors.fechaSalida && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.fechaSalida}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Equipamiento */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
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
                                <h3 className="text-lg font-semibold text-gray-900">Equipamiento Requerido</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Selecciona el equipamiento que necesitas para tu reserva</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="utilizaPizarra"
                                        checked={formData.utilizaPizarra}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                </label>
                                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="utilizaProyector"
                                        checked={formData.utilizaProyector}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-900">Proyector</span>
                                    </div>
                                </label>
                                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="utilizaComputadora"
                                        checked={formData.utilizaComputadora}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-[#007C91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-900">Computadora</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : event ? (
                                "Guardar Cambios"
                            ) : (
                                "Crear Reserva"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
