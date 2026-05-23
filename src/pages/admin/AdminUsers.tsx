import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Pencil, Plus, RefreshCw, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminNotice } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { UserResponse } from "@/types/admin";
import type { RoleResponse } from "@/types/user";
import { formatAdminDate } from "@/utils/admin-format";

const PAGE_SIZE = 10;

interface UserFormState {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    roles: string[];
}

const emptyUserForm: UserFormState = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isActive: true,
    roles: [],
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) {
        return String(error.message);
    }
    return fallback;
}

export default function AdminUsers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
    const [statusUser, setStatusUser] = useState<UserResponse | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<UserFormState>(emptyUserForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1") || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (page > 1) next.set("page", String(page));
        if (keyword.trim()) next.set("keyword", keyword.trim());
        setSearchParams(next, { replace: true });
    }, [keyword, page, setSearchParams]);

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.searchUsers({ page, size: PAGE_SIZE });
            setUsers(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "User management endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await adminService.getRoles();
                setRoles(response);
            } catch {
                setRoles([]);
            }
        };

        void loadRoles();
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) return users;

        return users.filter((user) =>
            [user.username, user.email, user.firstName, user.lastName, user.phoneNumber ?? ""]
                .join(" ")
                .toLowerCase()
                .includes(normalizedKeyword),
        );
    }, [keyword, users]);

    const toggleActiveStatus = async (user: UserResponse) => {
        try {
            setUpdatingUserId(user.id);
            setSuccess(null);
            await adminService.updateUserActiveStatus(user.id, { isActive: !user.isActive });
            setSuccess(`${user.username} was ${user.isActive ? "deactivated" : "activated"}.`);
            setStatusUser(null);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update user active status."));
        } finally {
            setUpdatingUserId(null);
        }
    };

    const openCreateDialog = () => {
        setEditingUser(null);
        setForm(emptyUserForm);
        setIsFormOpen(true);
    };

    const openEditDialog = (user: UserResponse) => {
        setEditingUser(user);
        setForm({
            username: user.username,
            password: "",
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber ?? "",
            isActive: Boolean(user.isActive),
            roles: user.roles?.map((role) => role.name) ?? [],
        });
        setIsFormOpen(true);
    };

    const toggleRole = (roleName: string, checked: boolean) => {
        setForm((current) => ({
            ...current,
            roles: checked
                ? Array.from(new Set([...current.roles, roleName]))
                : current.roles.filter((name) => name !== roleName),
        }));
    };

    const submitUserForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            if (editingUser) {
                await adminService.updateUser(editingUser.id, {
                    password: form.password.trim() || undefined,
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    isActive: form.isActive,
                    roles: form.roles,
                });
            } else {
                await adminService.createUser({
                    username: form.username.trim(),
                    password: form.password,
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    isActive: form.isActive,
                    roles: form.roles,
                });
            }
            setIsFormOpen(false);
            setSuccess(editingUser ? `${form.username || editingUser.username} was updated.` : `${form.username} was created.`);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err, editingUser ? "Could not update user." : "Could not create user."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <AdminLoadingState title="Loading users..." />;
    }

    if (error && users.length === 0) {
        return <AdminErrorState description={error} onRetry={loadUsers} />;
    }

    return (
        <div>
            <AdminPageHeader
                title="Users"
                description="Search, inspect, and manage account status for platform users."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={openCreateDialog}>
                            <Plus className="size-4" />
                            Create user
                        </Button>
                        <Button variant="outline" onClick={() => void loadUsers()}>
                            <RefreshCw className="size-4" />
                            Refresh
                        </Button>
                    </div>
                }
            />

            <div className="mb-4 flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        className="pl-9"
                        placeholder="Filter loaded users by name, email, or phone"
                    />
                </div>
            </div>

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <AdminNotice tone="success" message={success} />

            {filteredUsers.length === 0 ? (
                <AdminEmptyState title="No users found" />
            ) : (
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{user.username}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.roles?.map((role) => role.name).join(", ") || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <AdminStatusBadge value={user.isActive} />
                                    </TableCell>
                                    <TableCell>{formatAdminDate(user.createdAt)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedUser(user)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(user)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={updatingUserId === user.id}
                                                onClick={() => setStatusUser(user)}
                                            >
                                                {user.isActive ? (
                                                    <ToggleRight className="size-4" />
                                                ) : (
                                                    <ToggleLeft className="size-4" />
                                                )}
                                                {user.isActive ? "Deactivate" : "Activate"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <AdminPagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <Sheet open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{selectedUser?.username}</SheetTitle>
                        <SheetDescription>User detail from the admin search result.</SheetDescription>
                    </SheetHeader>
                    {selectedUser && (
                        <div className="px-4 pb-6">
                            <AdminDetailRow label="Name">
                                {selectedUser.firstName} {selectedUser.lastName}
                            </AdminDetailRow>
                            <AdminDetailRow label="Email">{selectedUser.email}</AdminDetailRow>
                            <AdminDetailRow label="Phone">{selectedUser.phoneNumber ?? "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Status">
                                <AdminStatusBadge value={selectedUser.isActive} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Roles">
                                {selectedUser.roles?.map((role) => role.name).join(", ") || "N/A"}
                            </AdminDetailRow>
                            <AdminDetailRow label="Created">{formatAdminDate(selectedUser.createdAt)}</AdminDetailRow>
                            <AdminDetailRow label="Updated">{formatAdminDate(selectedUser.updatedAt)}</AdminDetailRow>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <form onSubmit={(event) => void submitUserForm(event)} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>{editingUser ? "Edit user" : "Create user"}</DialogTitle>
                            <DialogDescription>
                                {editingUser
                                    ? "Update account details using the documented admin update payload."
                                    : "Create an account using the documented admin creation payload."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {!editingUser && (
                                <div className="space-y-2">
                                    <Label htmlFor="admin-user-username">Username</Label>
                                    <Input
                                        id="admin-user-username"
                                        value={form.username}
                                        onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                                        required
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="admin-user-password">
                                    Password{editingUser ? " (leave blank to keep)" : ""}
                                </Label>
                                <Input
                                    id="admin-user-password"
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                    required={!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-user-first-name">First name</Label>
                                <Input
                                    id="admin-user-first-name"
                                    value={form.firstName}
                                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-user-last-name">Last name</Label>
                                <Input
                                    id="admin-user-last-name"
                                    value={form.lastName}
                                    onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-user-email">Email</Label>
                                <Input
                                    id="admin-user-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-user-phone">Phone</Label>
                                <Input
                                    id="admin-user-phone"
                                    value={form.phoneNumber}
                                    onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 rounded-md border p-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="admin-user-active"
                                    checked={form.isActive}
                                    onCheckedChange={(checked) => setForm((current) => ({ ...current, isActive: checked === true }))}
                                />
                                <Label htmlFor="admin-user-active">Active account</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {roles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No roles returned by the API.</p>
                                    ) : (
                                        roles.map((role) => (
                                            <label key={role.name} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                                <Checkbox
                                                    checked={form.roles.includes(role.name)}
                                                    onCheckedChange={(checked) => toggleRole(role.name, checked === true)}
                                                />
                                                <span>{role.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
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
                open={Boolean(statusUser)}
                title={statusUser?.isActive ? "Deactivate user" : "Activate user"}
                description={
                    statusUser
                        ? `${statusUser.username} will be ${statusUser.isActive ? "blocked from active workflows" : "allowed to use the platform again"}.`
                        : ""
                }
                confirmLabel={statusUser?.isActive ? "Deactivate" : "Activate"}
                destructive={Boolean(statusUser?.isActive)}
                isSubmitting={Boolean(statusUser && updatingUserId === statusUser.id)}
                onOpenChange={(open) => !open && setStatusUser(null)}
                onConfirm={() => statusUser && void toggleActiveStatus(statusUser)}
            />
        </div>
    );
}
