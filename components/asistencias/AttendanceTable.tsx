"use client"

import React, {useEffect, useMemo, useState} from "react"
import type { CalendarEvent } from "../../firebase/models/CalendarEvent"
import { actualizarAsistenciaReserva, getReservasByMonthPaginated } from "../../firebase/asistencias/useAsistencias"
import { ChevronLeft, ChevronRight, Search, Check, X, Clock, Loader2, Calendar, User, Filter } from "lucide-react"

interface AttendanceTableProps {
    className?: string
}

export default function AttendanceTable({ className }: AttendanceTableProps) {
    const today = useMemo(() => new Date(), []);

    // Estado principal
    const [month, setMonth] = useState(today.getMonth())
    const [year, setYear] = useState(today.getFullYear())
    const [reservas, setReservas] = useState<CalendarEvent[]>([])
    const [lastDoc, setLastDoc] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [updatingAttendance, setUpdatingAttendance] = useState<number | null>(null)

    // Filtros
    const [searchTerm, setSearchTerm] = useState("")
    const [attendanceFilter, setAttendanceFilter] = useState<string>("all")

    // Estado para notificaciones
    const [notification, setNotification] = useState<{
        type: "success" | "error"
        message: string
    } | null>(null)

    // Función para mostrar notificaciones
    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }


    // Datos filtrados
    const filteredReservas = reservas.filter((reserva) => {
        const matchesSearch =
            reserva.nombreEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.correo.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesAttendance = attendanceFilter === "all" || reserva.asistencia === attendanceFilter
        return matchesSearch && matchesAttendance
    })

    const fetchReservas = async (append = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }

        try {
            const result = await getReservasByMonthPaginated(year, month, 10, append ? lastDoc : null)
            setReservas((prev) => (append ? [...prev, ...result.reservas] : result.reservas))
            setLastDoc(result.lastDoc)

            if (!append) {
                showNotification(
                    "success",
                    `Se encontraron ${result.reservas.length} reservas para ${getMonthName(month)} ${year}`,
                )
            }
        } catch (error) {
            console.error("Error cargando reservas:", error)
            showNotification("error", "No se pudieron cargar las reservas. Intenta nuevamente.")
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleAsistenciaUpdate = async (idReserva: number, estado: CalendarEvent["asistencia"]) => {
        setUpdatingAttendance(idReserva)
        try {
            await actualizarAsistenciaReserva(idReserva, estado)
            setReservas((prev) => prev.map((r) => (r.idReserva === idReserva ? { ...r, asistencia: estado } : r)))

            const estadoTexto =
                estado === "ASISTENCIA" ? "asistencia" : estado === "INASISTENCIA" ? "inasistencia" : "pendiente"

            showNotification("success", `Se marcó ${estadoTexto} correctamente.`)
        } catch (err) {
            console.error("Error actualizando asistencia:", err)
            showNotification("error", "No se pudo actualizar la asistencia. Intenta nuevamente.")
        } finally {
            setUpdatingAttendance(null)
        }
    }

    const handlePrevMonth = () => {
        setLastDoc(null)
        setReservas([])
        if (month === 0) {
            setMonth(11)
            setYear((prev) => prev - 1)
        } else {
            setMonth((prev) => prev - 1)
        }
    }

    const handleNextMonth = () => {
        setLastDoc(null)
        setReservas([])
        if (month === 11) {
            setMonth(0)
            setYear((prev) => prev + 1)
        } else {
            setMonth((prev) => prev + 1)
        }
    }

    const getMonthName = (monthIndex: number) => {
        return new Date(year, monthIndex).toLocaleString("es-NI", { month: "long" })
    }

    const getAttendanceBadge = (asistencia: CalendarEvent["asistencia"]) => {
        switch (asistencia) {
            case "ASISTENCIA":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Asistió
          </span>
                )
            case "INASISTENCIA":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            No asistió
          </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </span>
                )
        }
    }
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("es-NI", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    useEffect(() => {
        fetchReservas()
    }, [month, year])

    return (
        <div className={`h-max flex flex-col max-w-full w-full mx-auto px-4 md:px-6 lg:px-8 ${className}`}>
            {/* Notificación */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 left-4 md:left-auto md:right-4 z-50 p-3 md:p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm md:max-w-md mx-auto md:mx-0 ${
                        notification.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                    style={{ top: "1rem" }}
                >
                    <div className="flex items-center text-sm md:text-base">
                        {notification.type === "success" ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
                        ) : (
                            <X className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
                        )}
                        <span className="break-words">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                {/* Header */}
                <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="hidden sm:inline">Control de Asistencias</span>
                            <span className="sm:hidden">Asistencias</span>
                        </h2>
                        <div className="flex items-center justify-center md:justify-end gap-2">
                            <button
                                onClick={handlePrevMonth}
                                disabled={loading}
                                className="p-2 md:p-3 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="text-base md:text-lg font-semibold min-w-[180px] md:min-w-[200px] text-center text-gray-900 px-2">
                                {getMonthName(month)} {year}
                            </div>
                            <button
                                onClick={handleNextMonth}
                                disabled={loading}
                                className="p-2 md:p-3 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm md:text-base"
                            />
                        </div>
                        <div className="relative w-full md:w-auto md:min-w-[200px]">
                            <select
                                value={attendanceFilter}
                                onChange={(e) => setAttendanceFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 md:py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors w-full text-sm md:text-base"
                            >
                                <option value="all">Todas las asistencias</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="ASISTENCIA">Asistieron</option>
                                <option value="INASISTENCIA">No asistieron</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4 md:p-6 flex flex-col flex-1 min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center flex-1">
                            <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
                            <span className="text-gray-600">Cargando reservas...</span>
                        </div>
                    ) : (
                        <>
                            {/* Tabla con scroll */}
                            <div className="flex-1 overflow-auto mb-6">
                                <table className="w-full table-fixed divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4"/>
                                                    <span className="hidden sm:inline">Estudiante</span>
                                                    <span className="sm:hidden">Est.</span>
                                                </div>
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                Correo
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <span className="hidden md:inline">Fecha y Hora</span>
                                                <span className="md:hidden">Fecha</span>
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                                Asunto
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReservas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                {searchTerm || attendanceFilter !== "all"
                                                    ? "No se encontraron reservas con los filtros aplicados."
                                                    : "No hay reservas para este mes."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReservas.map((reserva) => (
                                            <tr key={reserva.idReserva} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div
                                                        className="max-w-[120px] md:max-w-none truncate">{reserva.nombreEstudiante}</div>
                                                </td>
                                                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                                    <div
                                                        className="max-w-[150px] lg:max-w-none truncate">{reserva.correo}</div>
                                                </td>
                                                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div
                                                        className="text-xs md:text-sm">{formatDate(reserva.fechaEntrada)}</div>
                                                </td>
                                                <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                                                    <div className="max-w-[150px] xl:max-w-[200px] truncate"
                                                         title={reserva.asuntoReserva}>
                                                        {reserva.asuntoReserva}
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                                    {getAttendanceBadge(reserva.asistencia)}
                                                </td>
                                                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-1 md:gap-2">
                                                        <button
                                                            onClick={() => handleAsistenciaUpdate(reserva.idReserva, "ASISTENCIA")}
                                                            disabled={
                                                                updatingAttendance === reserva.idReserva || reserva.asistencia === "ASISTENCIA"
                                                            }
                                                            className="inline-flex items-center p-1.5 md:p-2 border border-green-200 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {updatingAttendance === reserva.idReserva ? (
                                                                <Loader2
                                                                    className="w-3 h-3 md:w-4 md:h-4 animate-spin"/>
                                                            ) : (
                                                                <Check className="w-3 h-3 md:w-4 md:h-4"/>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAsistenciaUpdate(reserva.idReserva, "INASISTENCIA")}
                                                            disabled={
                                                                updatingAttendance === reserva.idReserva || reserva.asistencia === "INASISTENCIA"
                                                            }
                                                            className="inline-flex items-center p-1.5 md:p-2 border border-red-200 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {updatingAttendance === reserva.idReserva ? (
                                                                <Loader2
                                                                    className="w-3 h-3 md:w-4 md:h-4 animate-spin"/>
                                                            ) : (
                                                                <X className="w-3 h-3 md:w-4 md:h-4"/>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación con tamaño fijo */}
                            {lastDoc && (
                                <div className="flex justify-center py-4 flex-shrink-0">
                                    <button
                                        onClick={() => fetchReservas(true)}
                                        disabled={loadingMore}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                                Cargando más...
                                            </>
                                        ) : (
                                            "Cargar más reservas"
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Estadísticas con tamaño fijo */}
                            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 flex-shrink-0">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                                    <div className="text-xl md:text-2xl font-bold text-green-600">
                                        {filteredReservas.filter((r) => r.asistencia === "ASISTENCIA").length}
                                    </div>
                                    <p className="text-xs md:text-sm text-green-700">Asistencias</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                                    <div className="text-xl md:text-2xl font-bold text-red-600">
                                        {filteredReservas.filter((r) => r.asistencia === "INASISTENCIA").length}
                                    </div>
                                    <p className="text-xs md:text-sm text-red-700">Inasistencias</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                                    <div className="text-xl md:text-2xl font-bold text-gray-600">
                                        {filteredReservas.filter((r) => r.asistencia === "PENDIENTE").length}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-700">Pendientes</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
