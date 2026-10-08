"use client";

import { useState } from "react";
import { Loader2, Check, Pencil, X } from "lucide-react";
import { toast } from "@/lib/services/feedback";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWorkspace } from "./WorkspaceProvider";
import { BusinessForm } from "./BusinessForm";
import { browserSupabase } from "@/lib/supabase/browser";
import { PlansView } from "./PlansView";

export function SettingsView() {
  const { workspace, refresh } = useWorkspace();
  const [name, setName] = useState(workspace.user.name);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  function editProfile() {
    setName(workspace.user.name);
    setIsEditingProfile(true);
  }

  function cancelProfileEdit() {
    setName(workspace.user.name);
    setIsEditingProfile(false);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (workspace.mode === "demo") {
      toast.info("El perfil de ejemplo se conserva en la demostración.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await browserSupabase().auth.updateUser({
        data: { full_name: name.trim() },
      });

      if (error) throw error;

      await refresh();
      setIsEditingProfile(false);
      toast.success("Perfil actualizado.");
    } catch {
      toast.error("No se pudo guardar tu perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">LOS DETALLES QUE TE REPRESENTAN</span>
          <h1>Todo a tu manera.</h1>
          <p>La información de tu negocio y tu cuenta, en un solo lugar.</p>
        </div>
      </div>

      <Tabs defaultValue="business">
        <TabsList variant="line" className="settings-tabs">
          <TabsTrigger value="business">Mi negocio</TabsTrigger>
          <TabsTrigger value="profile">Mi perfil</TabsTrigger>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <div className="settings-section">
            <div className="settings-intro">
              <h2>La identidad de tu negocio.</h2>
              <p>La información que aparecerá en cada nueva propuesta.</p>
            </div>

            <BusinessForm />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="settings-section">
            <div className="settings-intro">
              <h2>Tu perfil.</h2>
              <p>Cómo te identificas en tu espacio de trabajo.</p>
            </div>

            <form onSubmit={saveProfile} className="profile-form">
              <div className="field">
                <label htmlFor="profile-name">Tu nombre</label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditingProfile || loading}
                  required
                  minLength={2}
                  maxLength={160}
                />
              </div>

              <div className="field mt-5">
                <label htmlFor="profile-email">Correo de la cuenta</label>
                <input
                  id="profile-email"
                  value={workspace.user.email}
                  disabled
                />
                <small>
                  El correo de contacto del negocio se cambia en “Mi negocio”.
                </small>
              </div>

              <div className="profile-form-actions">
                {!isEditingProfile ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={editProfile}
                  >
                    <Pencil size={16} />
                    Editar perfil
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost profile-cancel-button"
                      disabled={loading}
                      onClick={cancelProfileEdit}
                    >
                      <X size={16} />
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={16} className="loading-indicator" />
                      ) : (
                        <Check size={16} />
                      )}
                      Guardar perfil
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="settings-plans">
            <PlansView />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
