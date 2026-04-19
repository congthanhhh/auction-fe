import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPinHouse, Trash2, Plus, Edit2, ShieldCheck, MapPin } from "lucide-react";
import { addressService } from "@/services/addressService";
import type { AddressRequest, AddressResponse } from "@/types/user";

const ProfileAddressSection = () => {
    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);
    const [addressesError, setAddressesError] = useState<string | null>(null);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState<boolean>(false);

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
    const [addressForm, setAddressForm] = useState<AddressRequest>({
        recipientName: "",
        phoneNumber: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
    });
    const [addressFormError, setAddressFormError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setAddressesError(null);
                setIsLoadingAddresses(true);
                const addressList = await addressService.getMyAddresses();
                setAddresses(addressList);
            } catch (error) {
                console.error("Failed to load addresses:", error);
                setAddressesError("Failed to load addresses.");
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    const resetAddressForm = () => {
        setAddressForm({
            recipientName: "",
            phoneNumber: "",
            street: "",
            ward: "",
            district: "",
            city: "",
            isDefault: false,
        });
        setAddressFormError(null);
        setEditingAddress(null);
    };

    const handleAddressInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSetDefaultAddress = async (id: number) => {
        try {
            setIsUpdatingAddress(true);
            await addressService.setDefaultAddress(id);
            setAddresses(prev =>
                prev.map(addr => ({
                    ...addr,
                    isDefault: addr.id === id,
                })),
            );
        } catch (error) {
            console.error("Failed to set default address:", error);
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: number) => {
        try {
            setIsUpdatingAddress(true);
            await addressService.deleteAddress(id);
            setAddresses(prev => prev.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("Failed to delete address:", error);
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleAddNewAddressClick = () => {
        resetAddressForm();
        setIsAddressDialogOpen(true);
    };

    const handleEditAddressClick = (address: AddressResponse) => {
        setAddressForm({
            recipientName: address.recipientName,
            phoneNumber: address.phoneNumber,
            street: address.street,
            ward: address.ward,
            district: address.district,
            city: address.city,
            isDefault: address.isDefault,
        });
        setAddressFormError(null);
        setEditingAddress(address);
        setIsAddressDialogOpen(true);
    };

    const handleAddressDialogOpenChange = (open: boolean) => {
        setIsAddressDialogOpen(open);
        if (!open) {
            resetAddressForm();
        }
    };

    const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAddressFormError(null);

        if (!addressForm.recipientName.trim() || !addressForm.phoneNumber.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
            setAddressFormError("Please fill in all required fields.");
            return;
        }

        try {
            setIsUpdatingAddress(true);

            if (editingAddress) {
                const updated = await addressService.updateAddress(editingAddress.id, addressForm);
                setAddresses(prev =>
                    prev.map(addr => {
                        if (addr.id === updated.id) {
                            return updated;
                        }
                        if (updated.isDefault) {
                            return { ...addr, isDefault: false };
                        }
                        return addr;
                    }),
                );
            } else {
                const created = await addressService.createAddress(addressForm);
                setAddresses(prev => {
                    const updatedList = created.isDefault
                        ? prev.map(addr => ({ ...addr, isDefault: false }))
                        : prev;
                    return [...updatedList, created];
                });
            }

            setIsAddressDialogOpen(false);
            resetAddressForm();
        } catch (error) {
            console.error("Failed to save address:", error);
            setAddressFormError("Failed to save address. Please try again.");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    if (isLoadingAddresses) {
        return <p className="text-gray-600 dark:text-gray-400">Loading addresses...</p>;
    }

    if (addressesError) {
        return <p className="text-red-500 text-sm">{addressesError}</p>;
    }

    return (
        <div className="space-y-6">
            {addresses.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="w-16 h-16 bg-brand/10 dark:bg-brand/20 text-brand rounded-full flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        You haven't added any shipping addresses yet. Add one now to speed up checkout.
                    </p>
                    <Button onClick={handleAddNewAddressClick} disabled={isUpdatingAddress} className="rounded-full shadow-sm hover:shadow-md transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Address
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`relative rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
                                addr.isDefault 
                                    ? "bg-brand/5 border-brand/20 dark:bg-brand/10 dark:border-brand/30" 
                                    : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                            }`}
                        >
                            {/* Card Content */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MapPinHouse className="h-5 w-5 text-brand" />
                                            {addr.recipientName}
                                        </h4>
                                        {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 rounded-full px-2.5 py-0.5">
                                                <ShieldCheck className="w-3 h-3" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium text-gray-500">Phone: </span> 
                                            {addr.phoneNumber}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {addr.fullAddress || [
                                                addr.street,
                                                addr.ward,
                                                addr.district,
                                                addr.city,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:pl-4">
                                    {!addr.isDefault && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full sm:w-auto justify-start text-xs text-gray-500 hover:text-brand"
                                            disabled={isUpdatingAddress}
                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                        >
                                            Set default
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full sm:w-auto justify-start text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        disabled={isUpdatingAddress}
                                        onClick={() => handleEditAddressClick(addr)}
                                    >
                                        <Edit2 className="w-3 h-3 mr-1.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full sm:w-auto justify-start text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        disabled={isUpdatingAddress}
                                        onClick={() => handleDeleteAddress(addr.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1.5" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <Button
                        variant="outline"
                        className="mt-4 border-dashed border-2 py-6 text-gray-500 hover:text-brand hover:border-brand hover:bg-brand/5 transition-colors"
                        onClick={handleAddNewAddressClick}
                        disabled={isUpdatingAddress}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add another address
                    </Button>
                </div>
            )}

            <Dialog open={isAddressDialogOpen} onOpenChange={handleAddressDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingAddress ? "Edit address" : "Add new address"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress
                                ? "Update your shipping address details."
                                : "Add a new shipping address to your account."}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4 mt-4" onSubmit={handleSubmitAddress}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="recipientName">Recipient name *</Label>
                                <Input
                                    id="recipientName"
                                    name="recipientName"
                                    value={addressForm.recipientName}
                                    onChange={handleAddressInputChange}
                                    placeholder="Full name"
                                    autoComplete="name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phoneNumber">Phone number *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={addressForm.phoneNumber}
                                    onChange={handleAddressInputChange}
                                    placeholder="e.g. 0901 234 567"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="street">Street / house number *</Label>
                            <Input
                                id="street"
                                name="street"
                                value={addressForm.street}
                                onChange={handleAddressInputChange}
                                placeholder="Street, house number, apartment, ..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="ward">Ward</Label>
                                <Input
                                    id="ward"
                                    name="ward"
                                    value={addressForm.ward}
                                    onChange={handleAddressInputChange}
                                    placeholder="Ward"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    name="district"
                                    value={addressForm.district}
                                    onChange={handleAddressInputChange}
                                    placeholder="District"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="city">City / Province *</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressInputChange}
                                    placeholder="City or province"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <Label htmlFor="isDefault" className="gap-3">
                                <Checkbox
                                    id="isDefault"
                                    checked={addressForm.isDefault}
                                    onCheckedChange={checked =>
                                        setAddressForm(prev => ({
                                            ...prev,
                                            isDefault: checked === true,
                                        }))
                                    }
                                />
                                <span>Set as default shipping address</span>
                            </Label>
                        </div>

                        {addressFormError && (
                            <p className="text-xs text-red-500 mt-1">{addressFormError}</p>
                        )}

                        <DialogFooter className="mt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleAddressDialogOpenChange(false)}
                                disabled={isUpdatingAddress}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdatingAddress} className="rounded-full px-6 shadow-sm">
                                {editingAddress ? "Save changes" : "Add address"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileAddressSection;
