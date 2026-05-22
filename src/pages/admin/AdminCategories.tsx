import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { CategoryResponse } from "@/types/auction";

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.getCategories({ page, size: PAGE_SIZE });
            setCategories(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Category endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setName("");
        setDescription("");
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: CategoryResponse) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description);
        setIsDialogOpen(true);
    };

    const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);
            const payload = { name: name.trim(), description: description.trim() };
            if (editingCategory) {
                await adminService.updateCategory(editingCategory.id, payload);
            } else {
                await adminService.createCategory(payload);
            }
            setIsDialogOpen(false);
            await loadCategories();
        } catch (err) {
            setError(getErrorMessage(err, "Could not save category."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteCategory = async (category: CategoryResponse) => {
        const confirmed = window.confirm(`Delete category "${category.name}"?`);
        if (!confirmed) return;

        try {
            setError(null);
            await adminService.deleteCategory(category.id);
            await loadCategories();
        } catch (err) {
            setError(getErrorMessage(err, "Could not delete category."));
        }
    };

    return (
        <div>
            <AdminPageHeader
                title="Categories"
                description="Manage product categories used by storefront and admin product workflows."
                actions={
                    <>
                        <Button variant="outline" onClick={() => void loadCategories()}>
                            <RefreshCw className="size-4" />
                            Refresh
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus className="size-4" />
                            New category
                        </Button>
                    </>
                }
            />

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

            {isLoading ? (
                <AdminLoadingState title="Loading categories..." />
            ) : error && categories.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadCategories} />
            ) : categories.length === 0 ? (
                <AdminEmptyState title="No categories found" />
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
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="max-w-xl truncate">{category.description}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(category)}>
                                                <Edit className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => void deleteCategory(category)}
                                            >
                                                <Trash2 className="size-4" />
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit category" : "New category"}</DialogTitle>
                        <DialogDescription>Category data follows the documented CategoryRequest DTO.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Name</Label>
                            <Input
                                id="category-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category-description">Description</Label>
                            <textarea
                                id="category-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
