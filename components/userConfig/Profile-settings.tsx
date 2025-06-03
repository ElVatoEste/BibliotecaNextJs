"use client"

import React, { useState } from "react"
import { CheckCircle, AlertCircle, Mail, Key, Link2, Shield, Lock } from "lucide-react"

interface ProfileSettingsProps {
    providers: string[]
    userEmail: string
    onLinkGoogle: () => Promise<void>
    onLinkEmail: (email: string, password: string) => Promise<void>
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

type Status = "idle" | "loading" | "success" | "error"

export default function ProfileSettings({
                                            providers,
                                            userEmail,
                                            onLinkGoogle,
                                            onLinkEmail,
                                            onChangePassword,
                                        }: ProfileSettingsProps) {
    // Estados para cambio de contraseña
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Estados para vincular cuenta con contraseña
    const [linkPassword, setLinkPassword] = useState("")

    // Estados de UI
    const [status, setStatus] = useState<Status>("idle")
    const [message, setMessage] = useState("")
    const [activeSection, setActiveSection] = useState<string | null>(null)

    const hasEmailProvider = providers.includes("email")
    const hasGoogleProvider = providers.includes("google.com")

    const resetForm = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setLinkPassword("")
        setActiveSection(null)
    }

    const showMessage = (msg: string, type: Status) => {
        setMessage(msg)
        setStatus(type)
        setTimeout(() => {
            setMessage("")
            setStatus("idle")
        }, 5000)
    }

    const handleLinkGoogle = async () => {
        setStatus("loading")
        setActiveSection("google")
        try {
            await onLinkGoogle()
            showMessage("Cuenta vinculada con Google correctamente", "success")
            resetForm()
        } catch (error: any) {
            showMessage(error.message || "Error al vincular con Google", "error")
        }
    }

    const handleLinkEmail = async () => {
        if (!linkPassword.trim()) {
            showMessage("Por favor ingresa una contraseña", "error")
            return
        }

        setStatus("loading")
        setActiveSection("email")
        try {
            await onLinkEmail(userEmail, linkPassword)
            showMessage("Cuenta vinculada con contraseña correctamente", "success")
            resetForm()
        } catch (error: any) {
            showMessage(error.message || "Error al vincular contraseña", "error")
        }
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage("Por favor completa todos los campos", "error")
            return
        }

        if (newPassword !== confirmPassword) {
            showMessage("La nueva contraseña y su confirmación no coinciden", "error")
            return
        }

        if (newPassword.length < 6) {
            showMessage("La nueva contraseña debe tener al menos 6 caracteres", "error")
            return
        }

        setStatus("loading")
        setActiveSection("password")
        try {
            await onChangePassword(currentPassword, newPassword)
            showMessage("Contraseña cambiada correctamente", "success")
            resetForm()
        } catch (error: any) {
            let errorMessage = "Error al cambiar la contraseña"

            if (error.code === "auth/wrong-password") {
                errorMessage = "Contraseña actual incorrecta"
            } else if (error.code === "auth/weak-password") {
                errorMessage = "La nueva contraseña es muy débil"
            } else if (error.message) {
                errorMessage = error.message
            }

            showMessage(errorMessage, "error")
        }
    }

    const isLoading = status === "loading"

    return (
        <div className="overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="flex-shrink-0 text-center py-4 px-4 border-b border-gray-200 bg-white">
                <h1 className="text-2xl font-bold text-gray-900">Configuración de Cuenta</h1>
                <p className="text-gray-600 text-sm">Gestiona tu información de seguridad y métodos de acceso</p>
            </div>

            {/* Mensajes de estado fijos */}
            {message && (
                <div
                    className={`flex-shrink-0 mx-4 mt-4 p-3 rounded-lg border ${
                        status === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {status === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <span className="text-sm">{message}</span>
                    </div>
                </div>
            )}

            {/* Contenido principal en columnas */}
            <div className="flex-1 overflow-hidden p-4">
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                    {/* Columna izquierda - Estado de cuenta */}
                    <div className="flex flex-col space-y-4 overflow-y-auto">
                        {/* Estado actual de la cuenta */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-5 w-5 text-gray-700" />
                                    <h2 className="text-lg font-semibold text-gray-900">Estado de tu Cuenta</h2>
                                </div>
                                <p className="text-gray-600 text-sm">Información actual de tus métodos de autenticación</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700 text-sm">{userEmail}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    <Lock className="h-3 w-3" />
                    Verificado
                  </span>

                                    {hasEmailProvider && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      <Key className="h-3 w-3" />
                      Contraseña
                    </span>
                                    )}
                                    {hasGoogleProvider && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      <svg className="h-3 w-3" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vincular con Google */}
                        {hasEmailProvider && !hasGoogleProvider && (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link2 className="h-4 w-4 text-gray-700" />
                                        <h2 className="text-lg font-semibold text-gray-900">Vincular con Google</h2>
                                    </div>
                                    <p className="text-gray-600 text-sm">Añade Google como método de acceso alternativo</p>
                                </div>
                                <div className="p-4">
                                    <button
                                        onClick={handleLinkGoogle}
                                        disabled={isLoading && activeSection === "google"}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        {isLoading && activeSection === "google" ? (
                                            "Vinculando..."
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                                    <path
                                                        fill="currentColor"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="currentColor"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="currentColor"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    />
                                                    <path
                                                        fill="currentColor"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    />
                                                </svg>
                                                Vincular con Google
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna derecha - Acciones */}
                    <div className="flex flex-col space-y-4 overflow-y-auto">
                        {/* Vincular con contraseña */}
                        {hasGoogleProvider && !hasEmailProvider && (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Key className="h-4 w-4 text-gray-700" />
                                        <h2 className="text-lg font-semibold text-gray-900">Añadir Contraseña</h2>
                                    </div>
                                    <p className="text-gray-600 text-sm">Crea una contraseña para acceder sin depender de Google</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="space-y-1">
                                        <label htmlFor="link-password" className="block text-sm font-medium text-gray-700">
                                            Nueva contraseña
                                        </label>
                                        <input
                                            id="link-password"
                                            type="password"
                                            placeholder="Ingresa una contraseña segura"
                                            value={linkPassword}
                                            onChange={(e) => setLinkPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <button
                                        onClick={handleLinkEmail}
                                        disabled={!linkPassword.trim() || (isLoading && activeSection === "email")}
                                        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading && activeSection === "email" ? "Vinculando..." : "Añadir Contraseña"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cambiar contraseña */}
                        {hasEmailProvider && (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-gray-700" />
                                        <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
                                    </div>
                                    <p className="text-gray-600 text-sm">Actualiza tu contraseña para mantener tu cuenta segura</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="space-y-1">
                                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                                            Contraseña actual
                                        </label>
                                        <input
                                            id="current-password"
                                            type="password"
                                            placeholder="Ingresa tu contraseña actual"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="border-t border-gray-200 my-3"></div>

                                    <div className="space-y-1">
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                            Nueva contraseña
                                        </label>
                                        <input
                                            id="new-password"
                                            type="password"
                                            placeholder="Ingresa tu nueva contraseña"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                            Confirmar nueva contraseña
                                        </label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Confirma tu nueva contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={
                                            !currentPassword ||
                                            !newPassword ||
                                            !confirmPassword ||
                                            (isLoading && activeSection === "password")
                                        }
                                        className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading && activeSection === "password" ? "Cambiando..." : "Cambiar Contraseña"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
