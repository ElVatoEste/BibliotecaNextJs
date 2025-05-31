import React, { useMemo } from "react"
import { format, parseISO } from "date-fns"
import type { CalendarEvent } from "../../interfaces/CalendarEvent"

interface PreviewEventProps {
    event: CalendarEvent
    onClick?: () => void
}

function hashStringToHSL(str: string): { bg: string; border: string; text: string } {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360

    return {
        bg: `hsl(${hue}, 65%, 95%)`,
        border: `hsl(${hue}, 70%, 80%)`,
        text: `hsl(${hue}, 80%, 25%)`,
    }
}

export default function PreviewEvent({ event, onClick }: PreviewEventProps) {
    const colors = useMemo(() => hashStringToHSL(event.nombreEstudiante), [event.nombreEstudiante])
    const start = parseISO(event.fechaEntrada)
    const end = parseISO(event.fechaSalida)
    const timeRange = `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "ASISTENCIA":
                return { color: "bg-green-500", label: "✓" }
            case "INASISTENCIA":
                return { color: "bg-red-500", label: "✗" }
            default:
                return { color: "bg-yellow-500", label: "⏳" }
        }
    }

    const statusConfig = getStatusConfig(event.asistencia)

    const equipmentIcons = []
    if (event.utilizaPizarra) equipmentIcons.push("📋")
    if (event.utilizaProyector) equipmentIcons.push("📽️")
    if (event.utilizaComputadora) equipmentIcons.push("💻")

    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                onClick?.()
            }}
            style={{
                backgroundColor: colors.bg,
                borderLeftColor: colors.border,
                color: colors.text,
            }}
            className="group relative p-2 rounded-md border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:z-10 min-h-[60px] flex flex-col justify-between"
            title={`${event.nombreEstudiante} — ${timeRange}\nAsunto: ${event.asuntoReserva}\nPersonas: ${event.cantidadPersonas}`}
        >
            {/* Status indicator */}
            <div className="absolute top-1 right-1 flex items-center space-x-1">
                <div
                    className={`w-2 h-2 rounded-full ${statusConfig.color} opacity-80`}
                    title={`Estado: ${event.asistencia}`}
                />
            </div>

            {/* Main content */}
            <div className="pr-4">
                <div className="font-semibold text-xs leading-tight truncate mb-1">{event.nombreEstudiante}</div>
                <div className="text-[10px] opacity-75 font-medium">{timeRange}</div>
            </div>

            {/* Bottom section */}
            <div className="flex items-center justify-between mt-1">
                {/* Equipment icons */}
                <div className="flex items-center space-x-0.5">
                    {equipmentIcons.map((icon, index) => (
                        <span key={index} className="text-[10px] opacity-70">
              {icon}
            </span>
                    ))}
                </div>

                {/* People count */}
                {event.cantidadPersonas > 1 && (
                    <div className="flex items-center text-[9px] opacity-60">
                        <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        {event.cantidadPersonas}
                    </div>
                )}
            </div>

            {/* Hover overlay with more details */}
            <div className="absolute inset-0 bg-white bg-opacity-95 rounded-md opacity-0 transition-opacity duration-200 p-2 flex flex-col justify-center pointer-events-none">
                <div className="text-xs font-semibold text-gray-800 truncate mb-1">{event.nombreEstudiante}</div>
                <div className="text-[10px] text-gray-600 truncate mb-1">{event.asuntoReserva}</div>
                <div className="text-[10px] text-gray-500 mb-1">{timeRange}</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        {equipmentIcons.map((icon, index) => (
                            <span key={index} className="text-xs">
                {icon}
              </span>
                        ))}
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className={`text-xs ${statusConfig.label}`}>{statusConfig.label}</span>
                        {event.cantidadPersonas > 1 && <span className="text-[10px] text-gray-500">{event.cantidadPersonas}p</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}
