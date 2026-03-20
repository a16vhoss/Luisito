"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Camera,
  Ruler,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const materialOptions = [
  "Mármol Blanco Carrara",
  "Mármol Crema Marfil",
  "Mármol Negro Monterrey",
  "Mármol Rosa Zarci",
  "Travertino Noce",
  "Granito Gris Oxford",
  "Granito Negro Absoluto",
  "Cuarzo Blanco",
  "Ónix Verde",
]

const calidadOptions = [
  { value: "buena", label: "Buena - Apta para cualquier pieza" },
  { value: "regular", label: "Regular - Piezas medianas" },
  { value: "solo_piezas_pequeñas", label: "Solo piezas pequeñas" },
] as const

const ubicacionOptions = [
  "Rack A-1", "Rack A-2", "Rack A-3", "Rack A-4", "Rack A-5",
  "Rack B-1", "Rack B-2", "Rack B-3",
  "Rack C-1", "Rack C-2",
  "Rack D-1", "Rack D-2", "Rack D-3",
  "Piso - Área de corte",
  "Piso - Área de pulido",
]

export default function NuevoSobrantePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    tipo_material: "",
    largo_cm: "",
    ancho_cm: "",
    espesor_cm: "",
    es_irregular: false,
    calidad: "buena" as "buena" | "regular" | "solo_piezas_pequeñas",
    ubicacion_planta: "",
    foto_url: "",
    notas: "",
  })

  function updateField(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const areaM2 =
    form.largo_cm && form.ancho_cm
      ? ((parseFloat(form.largo_cm) * parseFloat(form.ancho_cm)) / 10000).toFixed(3)
      : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.tipo_material) { setError("Selecciona un tipo de material."); return }
    if (!form.largo_cm || parseFloat(form.largo_cm) <= 0) { setError("Ingresa un largo válido."); return }
    if (!form.ancho_cm || parseFloat(form.ancho_cm) <= 0) { setError("Ingresa un ancho válido."); return }
    if (!form.espesor_cm || parseFloat(form.espesor_cm) <= 0) { setError("Ingresa un espesor válido."); return }

    setSaving(true)

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from("desperdicios").insert({
        tipo_material: form.tipo_material,
        largo_cm: parseFloat(form.largo_cm),
        ancho_cm: parseFloat(form.ancho_cm),
        espesor_cm: parseFloat(form.espesor_cm),
        es_irregular: form.es_irregular,
        calidad: form.calidad,
        ubicacion_planta: form.ubicacion_planta || null,
        foto_url: form.foto_url || null,
        disponible: true,
        usado_en_pieza_id: null,
      })

      if (dbError) throw dbError
      router.push("/admin/sobrantes")
    } catch (err: any) {
      setError(err.message || "Error al guardar el sobrante.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sobrantes"
          className="rounded-lg border border-[#E0DBD1] p-2 text-[#7A6D5A] hover:bg-[#F0EDE8]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1E1A14]">Registrar Sobrante</h1>
          <p className="text-sm text-[#7A6D5A]">Registrar un nuevo desperdicio reutilizable en el inventario</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#D4A843]" />
            Material y Dimensiones
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Tipo de material *</label>
            <select
              value={form.tipo_material}
              onChange={(e) => updateField("tipo_material", e.target.value)}
              className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
            >
              <option value="">Seleccionar material...</option>
              {materialOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Largo (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.largo_cm}
                onChange={(e) => updateField("largo_cm", e.target.value)}
                placeholder="0.0"
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Ancho (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.ancho_cm}
                onChange={(e) => updateField("ancho_cm", e.target.value)}
                placeholder="0.0"
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Espesor (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.espesor_cm}
                onChange={(e) => updateField("espesor_cm", e.target.value)}
                placeholder="0.0"
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
          </div>

          {areaM2 && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              &Aacute;rea: <span className="font-semibold">{areaM2} m&sup2;</span>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.es_irregular}
              onChange={(e) => updateField("es_irregular", e.target.checked)}
              className="h-4 w-4 rounded border-[#E0DBD1] text-[#1E1A14] focus:ring-[#D4A843]"
            />
            <span className="text-sm text-[#1E1A14]">Forma irregular</span>
          </label>
        </div>

        {/* Calidad & Ubicación */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#D4A843]" />
            Calidad y Ubicaci&oacute;n
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Calidad *</label>
            <div className="space-y-2">
              {calidadOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    form.calidad === opt.value
                      ? "border-[#D4A843] bg-amber-50/50"
                      : "border-[#E0DBD1] hover:bg-[#FAF9F7]"
                  }`}
                >
                  <input
                    type="radio"
                    name="calidad"
                    value={opt.value}
                    checked={form.calidad === opt.value}
                    onChange={(e) => updateField("calidad", e.target.value)}
                    className="h-4 w-4 text-[#D4A843] focus:ring-[#D4A843]"
                  />
                  <span className="text-sm text-[#1E1A14]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Ubicaci&oacute;n en planta</label>
            <select
              value={form.ubicacion_planta}
              onChange={(e) => updateField("ubicacion_planta", e.target.value)}
              className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
            >
              <option value="">Seleccionar ubicación...</option>
              {ubicacionOptions.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Foto & Notas */}
        <div className="rounded-xl border border-[#E0DBD1] bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1E1A14] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#D4A843]" />
            Foto y Notas
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Foto (URL)</label>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#7A6D5A] shrink-0" />
              <input
                type="url"
                value={form.foto_url}
                onChange={(e) => updateField("foto_url", e.target.value)}
                placeholder="https://..."
                className="h-10 w-full rounded-lg border border-[#E0DBD1] bg-white px-3 text-sm text-[#1E1A14] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
              />
            </div>
            <p className="mt-1 text-[10px] text-[#7A6D5A]">Sube la foto al almacenamiento y pega la URL aqu&iacute;</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6D5A] mb-1.5">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              rows={3}
              placeholder="Observaciones adicionales..."
              className="w-full rounded-lg border border-[#E0DBD1] bg-white px-3 py-2 text-sm text-[#1E1A14] placeholder:text-[#7A6D5A] focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843] resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/sobrantes"
            className="rounded-lg border border-[#E0DBD1] px-4 py-2.5 text-sm font-medium text-[#7A6D5A] hover:bg-[#F0EDE8]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E1A14] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2A2520] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Sobrante
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
