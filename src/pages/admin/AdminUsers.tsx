import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { UserResponse } from "@/types/admin";
import { formatAdminDate } from "@/utils/admin-format";

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) {
        return String(error.message);
    }
    return fallback;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            await adminService.updateUserActiveStatus(user.id, { isActive: !user.isActive });
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update user active status."));
        } finally {
            setUpdatingUserId(null);
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
                    <Button variant="outline" onClick={() => void loadUsers()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={updatingUserId === user.id}
                                                onClick={() => void toggleActiveStatus(user)}
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
        </div>
    );
}
