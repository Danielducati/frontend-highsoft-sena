import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Switch } from "../../shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { User, Bell, Lock, Palette, Globe } from "lucide-react";
import { toast } from "sonner";

interface SettingsModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export function SettingsModule({ userRole }: SettingsModuleProps) {
  const handleSave = () => {
    toast.success("Configuración guardada exitosamente");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra tus preferencias y configuración del sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
          {userRole === 'admin' && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Tu nombre" defaultValue="Usuario" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Tu apellido" defaultValue="Demo" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" defaultValue="usuario@highlifespa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+1 234 567 8900" defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Input id="bio" placeholder="Cuéntanos sobre ti" />
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Notificaciones por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe actualizaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Notificaciones Push</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tiempo real
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Recordatorios de Citas</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe recordatorios antes de tus citas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Promociones y Ofertas</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe información sobre promociones especiales
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Novedades del Spa</p>
                  <p className="text-sm text-muted-foreground">
                    Mantente informado sobre nuevos servicios
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>Administra tu contraseña y opciones de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input id="currentPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                Actualizar Contraseña
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticación de Dos Factores</CardTitle>
              <CardDescription>Añade una capa extra de seguridad a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-foreground">Activar 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Requiere un código adicional al iniciar sesión
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab (Admin only) */}
        {userRole === 'admin' && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Configuración general del spa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="spaName">Nombre del Spa</Label>
                  <Input id="spaName" defaultValue="HIGHLIFE SPA & BAR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select defaultValue="est">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">EST (UTC-5)</SelectItem>
                      <SelectItem value="pst">PST (UTC-8)</SelectItem>
                      <SelectItem value="cst">CST (UTC-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="mxn">MXN ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-foreground">Modo de Mantenimiento</p>
                    <p className="text-sm text-muted-foreground">
                      Desactiva el acceso público al sistema
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horario de Operación</CardTitle>
                <CardDescription>Define los horarios generales del spa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lunes - Viernes</Label>
                    <div className="flex gap-2">
                      <Input placeholder="09:00" />
                      <span className="flex items-center">-</span>
                      <Input placeholder="21:00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sábado</Label>
                    <div className="flex gap-2">
                      <Input placeholder="10:00" />
                      <span className="flex items-center">-</span>
                      <Input placeholder="20:00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Domingo</Label>
                    <div className="flex gap-2">
                      <Input placeholder="10:00" />
                      <span className="flex items-center">-</span>
                      <Input placeholder="18:00" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-foreground">
                  Guardar Horarios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
