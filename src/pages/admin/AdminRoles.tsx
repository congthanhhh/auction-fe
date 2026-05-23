import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminNotice } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { PermissionResponse, RoleResponse } from "@/types/user";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminRoles() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [tab, setTab] = useState(searchParams.get("tab") === "permissions" ? "permissions" : "roles");
    const [dialogType, setDialogType] = useState<"role" | "permission" | null>(null);
    const [deletingRole, setDeletingRole] = useState<RoleResponse | null>(null);
    const [deletingPermission, setDeletingPermission] = useState<PermissionResponse | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissionNames, setPermissionNames] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (tab !== "roles") next.set("tab", tab);
        setSearchParams(next, { replace: true });
    }, [setSearchParams, tab]);

    const loadRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [rolesResponse, permissionsResponse] = await Promise.all([
                adminService.getRoles(),
                adminService.getPermissions(),
            ]);
            setRoles(rolesResponse ?? []);
            setPermissions(permissionsResponse ?? []);
        } catch (err) {
            setError(getErrorMessage(err, "Role or permission endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRoles();
    }, [loadRoles]);

    const openDialog = (type: "role" | "permission") => {
        setDialogType(type);
        setName("");
        setDescription("");
        setPermissionNames("");
    };

    const submitItem = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            if (dialogType === "role") {
                await adminService.createRole({
                    name: name.trim(),
                    description: description.trim(),
                    permissions: permissionNames
                        .split(",")
                        .map((permission) => permission.trim())
                        .filter(Boolean),
                });
                setSuccess(`${name.trim()} role was created.`);
            } else if (dialogType === "permission") {
                await adminService.createPermission({
                    name: name.trim(),
                    description: description.trim(),
                });
                setSuccess(`${name.trim()} permission was created.`);
            }
            setDialogType(null);
            await loadRoles();
        } catch (err) {
            setError(getErrorMessage(err, "Could not save role or permission."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteRole = async (role: RoleResponse) => {
        try {
            setIsSubmitting(true);
            setSuccess(null);
            await adminService.deleteRole(role.name);
            setSuccess(`${role.name} role was deleted.`);
            setDeletingRole(null);
            await loadRoles();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete role."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const deletePermission = async (permission: PermissionResponse) => {
        try {
            setIsSubmitting(true);
            setSuccess(null);
            await adminService.deletePermission(permission.name);
            setSuccess(`${permission.name} permission was deleted.`);
            setDeletingPermission(null);
            await loadRoles();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete permission."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <AdminLoadingState title="Loading roles and permissions..." />;
    }

    if (error && roles.length === 0 && permissions.length === 0) {
        return <AdminErrorState description={error} onRetry={loadRoles} />;
    }

    return (
        <div>
            <AdminPageHeader
                title="Roles"
                description="Manage role and permission records used by admin and application authorization."
                actions={
                    <>
                        <Button variant="outline" onClick={() => void loadRoles()}>
                            <RefreshCw className="size-4" />
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => openDialog("permission")}>
                            <Plus className="size-4" />
                            Permission
                        </Button>
                        <Button onClick={() => openDialog("role")}>
                            <Plus className="size-4" />
                            Role
                        </Button>
                    </>
                }
            />

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <AdminNotice tone="success" message={success} />

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="roles">
                    {roles.length === 0 ? (
                        <AdminEmptyState title="No roles found" />
                    ) : (
                        <div className="overflow-hidden rounded-md border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.name}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>{role.description}</TableCell>
                                            <TableCell className="max-w-lg truncate">
                                                {role.permissions?.map((permission) => permission.name).join(", ") || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeletingRole(role)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="permissions">
                    {permissions.length === 0 ? (
                        <AdminEmptyState title="No permissions found" />
                    ) : (
                        <div className="overflow-hidden rounded-md border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((permission) => (
                                        <TableRow key={permission.name}>
                                            <TableCell className="font-medium">{permission.name}</TableCell>
                                            <TableCell>{permission.description}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeletingPermission(permission)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogType === "role" ? "Create role" : "Create permission"}</DialogTitle>
                        <DialogDescription>
                            Values are sent using the documented role and permission request DTOs.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={submitItem}>
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Name</Label>
                            <Input id="role-name" value={name} onChange={(event) => setName(event.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Input
                                id="role-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                required
                            />
                        </div>
                        {dialogType === "role" && (
                            <div className="space-y-2">
                                <Label htmlFor="role-permissions">Permissions</Label>
                                <Input
                                    id="role-permissions"
                                    value={permissionNames}
                                    onChange={(event) => setPermissionNames(event.target.value)}
                                    placeholder="PERMISSION_ONE, PERMISSION_TWO"
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogType(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AdminConfirmDialog
                open={Boolean(deletingRole)}
                title="Delete role"
                description={
                    deletingRole
                        ? `Delete role "${deletingRole.name}"? Existing users may depend on this role.`
                        : ""
                }
                confirmLabel="Delete role"
                destructive
                isSubmitting={isSubmitting}
                onOpenChange={(open) => !open && setDeletingRole(null)}
                onConfirm={() => deletingRole && void deleteRole(deletingRole)}
            />

            <AdminConfirmDialog
                open={Boolean(deletingPermission)}
                title="Delete permission"
                description={
                    deletingPermission
                        ? `Delete permission "${deletingPermission.name}"? Existing roles may depend on this permission.`
                        : ""
                }
                confirmLabel="Delete permission"
                destructive
                isSubmitting={isSubmitting}
                onOpenChange={(open) => !open && setDeletingPermission(null)}
                onConfirm={() => deletingPermission && void deletePermission(deletingPermission)}
            />
        </div>
    );
}
