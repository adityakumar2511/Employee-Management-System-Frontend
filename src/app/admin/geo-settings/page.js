"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { settingsService } from "@/services/settings.service"
import { useToast } from "@/hooks/useToast"
import { MapPin, Plus, Trash2, Edit, Navigation, Building } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

const GeoFenceMap = dynamic(() => import("@/components/maps/GeoFenceMap"), { ssr: false })

export default function GeoSettingsPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [editLocation, setEditLocation] = useState(null)
  const [deleteLocation, setDeleteLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", radius: 500 })

  const { data: locations, isLoading } = useQuery({
    queryKey: ["geo-locations"],
    queryFn: () => settingsService.getGeoLocations(),
    select: d => d.data,
  })

  const addMutation = useMutation({
    mutationFn: settingsService.addGeoLocation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geo-locations"] }); toast.success("Office location added!"); setAddModal(false); setForm({ name: "", address: "", latitude: "", longitude: "", radius: 500 }) },
    onError: e => toast.error(e.response?.data?.message || "Failed to save"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => settingsService.updateGeoLocation(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geo-locations"] }); toast.success("Location updated!"); setEditLocation(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: settingsService.deleteGeoLocation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geo-locations"] }); toast.success("Location deleted"); setDeleteLocation(null) },
  })

  const handleMapClick = (coords) => setForm(f => ({ ...f, latitude: coords.lat.toFixed(6), longitude: coords.lng.toFixed(6) }))
  const handleEditMapClick = (coords) => setEditLocation(f => ({ ...f, latitude: coords.lat.toFixed(6), longitude: coords.lng.toFixed(6) }))

  const activeLocation = selectedLocation || locations?.[0]

  return (
    <AdminLayout title="Geo-Fence Settings">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="page-header mb-0">
            <h1 className="page-title">Geo-Fence Settings</h1>
            <p className="page-subtitle">Configure office locations and attendance radius</p>
          </div>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4" /> Add Location
          </Button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4">
          <Navigation className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-300">How Geo-Fencing Works</p>
            <p className="text-blue-600 dark:text-blue-400 mt-0.5">
              Employees can only check-in when within the configured radius of an office location. Browser GPS is used — no extra hardware needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Locations List */}
          <div>
            <Card>
              <CardHeader><CardTitle className="text-base">Office Locations</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">{[1,2].map(i => <div key={i} className="shimmer h-16 rounded-lg" />)}</div>
                ) : locations?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Building className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No locations added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations?.map(loc => (
                      <div key={loc.id}
                        className={`rounded-xl border p-3 cursor-pointer transition-colors ${selectedLocation?.id === loc.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => setSelectedLocation(loc)}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{loc.name}</p>
                              <p className="text-xs text-muted-foreground">{loc.address}</p>
                              <p className="text-xs text-blue-600 mt-0.5">Radius: {loc.radius}m</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); setEditLocation({ ...loc }) }}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={e => { e.stopPropagation(); setDeleteLocation(loc) }}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {activeLocation ? `Map: ${activeLocation.name}` : "Select a location to preview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeLocation ? (
                  <>
                    <GeoFenceMap
                      center={{ lat: parseFloat(activeLocation.latitude), lng: parseFloat(activeLocation.longitude) }}
                      radius={activeLocation.radius}
                      height="380px"
                      readonly
                    />
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="font-mono text-xs">{parseFloat(activeLocation.latitude).toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">Latitude</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="font-mono text-xs">{parseFloat(activeLocation.longitude).toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">Longitude</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <p className="font-mono text-xs">{activeLocation.radius}m</p>
                        <p className="text-xs text-muted-foreground">Radius</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No location selected</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Office Location" size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <Label required>Location Name</Label>
              <Input placeholder="e.g. Head Office, Branch - Mumbai" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Latitude</Label>
                <Input placeholder="28.6139" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} className="mt-1.5 font-mono" />
              </div>
              <div>
                <Label required>Longitude</Label>
                <Input placeholder="77.2090" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} className="mt-1.5 font-mono" />
              </div>
            </div>
            <div>
              <Label required>Geo-Fence Radius (meters)</Label>
              <Input type="number" min="50" max="5000" value={form.radius} onChange={e => setForm(f => ({ ...f, radius: parseInt(e.target.value) || 500 }))} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Default: 500m. Employees outside this radius cannot check-in.</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Click on map to set coordinates</p>
            <GeoFenceMap
              center={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : null}
              radius={form.radius}
              onLocationSelect={handleMapClick}
              height="320px"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button loading={addMutation.isPending} onClick={() => addMutation.mutate(form)} disabled={!form.name || !form.latitude || !form.longitude}>
            <MapPin className="h-4 w-4" /> Save Location
          </Button>
        </div>
      </Modal>

      {editLocation && (
        <Modal isOpen onClose={() => setEditLocation(null)} title="Edit Location" size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <Label required>Location Name</Label>
                <Input value={editLocation.name} onChange={e => setEditLocation(f => ({ ...f, name: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={editLocation.address || ""} onChange={e => setEditLocation(f => ({ ...f, address: e.target.value }))} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Latitude</Label>
                  <Input value={editLocation.latitude} onChange={e => setEditLocation(f => ({ ...f, latitude: e.target.value }))} className="mt-1.5 font-mono" />
                </div>
                <div>
                  <Label required>Longitude</Label>
                  <Input value={editLocation.longitude} onChange={e => setEditLocation(f => ({ ...f, longitude: e.target.value }))} className="mt-1.5 font-mono" />
                </div>
              </div>
              <div>
                <Label required>Radius (meters)</Label>
                <Input type="number" value={editLocation.radius} onChange={e => setEditLocation(f => ({ ...f, radius: parseInt(e.target.value) }))} className="mt-1.5" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Click to update coordinates</p>
              <GeoFenceMap center={{ lat: parseFloat(editLocation.latitude), lng: parseFloat(editLocation.longitude) }} radius={editLocation.radius} onLocationSelect={handleEditMapClick} height="320px" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditLocation(null)}>Cancel</Button>
            <Button loading={updateMutation.isPending} onClick={() => updateMutation.mutate(editLocation)}>Save Changes</Button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteLocation} onClose={() => setDeleteLocation(null)}
        onConfirm={() => deleteMutation.mutate(deleteLocation?.id)} loading={deleteMutation.isPending}
        title="Delete Location" message={`Delete "${deleteLocation?.name}"? Employees assigned here won't be able to check-in.`} confirmLabel="Delete"
      />
    </AdminLayout>
  )
}
