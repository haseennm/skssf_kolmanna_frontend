import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Minus, Plus, Save, Wallet, X } from "lucide-react";

import { useLedgerCategory } from "../store/useLedgerCategory";
import { useProgramStore } from "../store/useProgramStore";
import { useAuthStore } from "../store/useAuthStore";
import { useLedgerStore, type CreateLedgerPayload } from "../store/useLedgerStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";
// Defined locally to match your useLedgerStore interface
export interface PaymentOverviewItem {
    payment_category_id: number;
    amount: number;
    note?: string;
}



const paymentItemSchema = z.object({
    payment_category_id: z
        .number({ message: "Please select a category" })
        .min(1, "Please select a category"),

    amount: z.coerce
        .number()
        .min(1, "Amount must be greater than zero"),

    note: z.string().optional(),
});

const schema = z.object({
    payment_flow: z.enum(["In", "Out"]),

    date: z.string().min(1, "Date is required"),

    note: z.string().optional(),

    program_id: z.number().nullable(),

    discount: z.coerce
        .number()
        .min(0)
        .default(0),

    paid_amount: z.coerce
        .number()
        .min(0, "Paid amount cannot be negative"),

    payment_overview: z
        .array(paymentItemSchema)
        .min(1, "Add at least one payment"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function LedgerPaymentForm({ open, onClose }: Props) {
    const {
        createLedger,
        isLoading,
        error,
        clearError,
    } = useLedgerStore();

    const { categories, fetchCategories } = useLedgerCategory();
    const { programs, fetchPrograms } = useProgramStore();
    const { user } = useAuthStore();
    const navigate = useNavigate()

    // Removing <FormValues> here lets RHF + zodResolver automatically map input and output types
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            payment_flow: "In" as "In" | "Out",
            date: new Date().toISOString().substring(0, 10),
            note: "",
            program_id: null as number | null,
            discount: 0,
            paid_amount: 0,
            payment_overview: [
                {
                    payment_category_id: 0,
                    amount: 0,
                    note: "",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "payment_overview",
    });
    useEffect(() => {
         if (!( checkPermission(user, ["ledger handle","all handle"], navigate))) return;
     
    }, [user, navigate]);
    useEffect(() => {
        if (!open) return;

        fetchCategories({
            page: 1,
            limit: 1000,
        });

        fetchPrograms({
            page: 1,
            limit: 1000,
        });

        clearError();
    }, [open]);

    const items = useWatch({
        control,
        name: "payment_overview",
    });
    const discount = watch("discount");
    const selectedProgram = watch("program_id");

    const subtotal = useMemo(() => {
        return (items || []).reduce(
            (sum, item) => sum + Number(item?.amount || 0),
            0
        );
    }, [items]);

    const totalAmount = useMemo(() => {
        return Math.max(subtotal - Number(discount || 0), 0);
    }, [subtotal, discount]);

    const [paidEdited, setPaidEdited] = useState(false);

    useEffect(() => {
        if (!paidEdited) {
            setValue("paid_amount", totalAmount);
        }
    }, [totalAmount, paidEdited, setValue]);

    const handleClose = () => {
        reset();
        setPaidEdited(false);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!(await checkPermission(user, ["ledger handle", "all handle"], navigate))) return;


        const payload: CreateLedgerPayload = {
            program_id: values.program_id || null,
            payment_flow: values.payment_flow,
            date: values.date,
            note: values.note ?? "",
            discount: values.discount,
            total_amount: totalAmount,
            paid_amount: values.paid_amount,
            active_year_id: user!.active_year_id,
            action_by: user!.id,
            payment_overview: values.payment_overview.map((item) => ({
                payment_category_id: item.payment_category_id,
                amount: item.amount,
                note: item.note ?? "", // Converts undefined -> "" to satisfy string type
            })),
        };

        const ok = await createLedger(payload);
        if (ok) {
            handleClose();
        }


    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">
                            New Ledger Payment
                        </h2>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">
                            Record a new income or expense.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl p-2 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                            {/* Left Column */}
                            <div className="space-y-6 xl:col-span-2">
                                {/* Payment Flow */}
                                <div>
                                    <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Payment Flow
                                    </label>
                                    <Controller
                                        control={control}
                                        name="payment_flow"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange("In")}
                                                    className={`py-3 font-semibold transition ${field.value === "In"
                                                        ? "bg-secondary-600 text-white"
                                                        : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                                                        }`}
                                                >
                                                    Income
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange("Out")}
                                                    className={`py-3 font-semibold transition ${field.value === "Out"
                                                        ? "bg-red-600 text-white"
                                                        : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                                                        }`}
                                                >
                                                    Expense
                                                </button>
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Program */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Program
                                    </label>

                                    <select
                                        {...register("program_id", {
                                            setValueAs: (v) => (v === "" ? null : Number(v)),
                                        })}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="">No Program</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.title} ({program.wing})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selected Program Details Banner */}
                                {selectedProgram && (() => {
                                    const p = programs.find((x) => x.id === selectedProgram);
                                    if (!p) return null;

                                    return (
                                        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-900/20">
                                            <h3 className="font-semibold text-primary-700 dark:text-primary-300">
                                                {p.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                Wing : <span className="font-medium">{p.wing}</span>
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Date */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Date
                                    </label>

                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            {...register("date")}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    {errors.date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.date.message}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Items Table */}
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                                        <h3 className="font-semibold dark:text-white">
                                            Payment Items
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                append({
                                                    payment_category_id: 0,
                                                    amount: 0,
                                                    note: "",
                                                })
                                            }
                                            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700"
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                                        Category
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                                        Note
                                                    </th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {fields.map((field, index) => (
                                                    <tr
                                                        key={field.id}
                                                        className="border-t border-slate-200 dark:border-slate-700"
                                                    >
                                                        <td className="p-3 align-top">
                                                            <select
                                                                {...register(
                                                                    `payment_overview.${index}.payment_category_id`,
                                                                    { valueAsNumber: true }
                                                                )}
                                                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                            >
                                                                <option value={0}>Select</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id} value={Number(cat.id)}>
                                                                        {cat.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors.payment_overview?.[index]?.payment_category_id && (
                                                                <p className="mt-1 text-xs text-red-500">
                                                                    {
                                                                        errors.payment_overview[index]
                                                                            ?.payment_category_id?.message
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="p-3 align-top">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                {...register(
                                                                    `payment_overview.${index}.amount`,
                                                                    { valueAsNumber: true }
                                                                )}
                                                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                            />
                                                            {errors.payment_overview?.[index]?.amount && (
                                                                <p className="mt-1 text-xs text-red-500">
                                                                    {
                                                                        errors.payment_overview[index]?.amount
                                                                            ?.message
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="p-3 align-top">
                                                            <input
                                                                {...register(`payment_overview.${index}.note`)}
                                                                placeholder="Description"
                                                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                            />
                                                        </td>

                                                        <td className="p-3 align-top">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                disabled={fields.length === 1}
                                                                className="rounded-xl p-2 text-red-600 hover:bg-red-100 disabled:opacity-30 dark:hover:bg-red-900/20"
                                                            >
                                                                <Minus size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Overall Transaction Note */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Transaction Note
                                    </label>
                                    <textarea
                                        rows={3}
                                        {...register("note")}
                                        placeholder="Add overall notes or comments..."
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Summary Box */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-xl bg-primary-100 p-3 dark:bg-primary-900/30">
                                            <Wallet className="h-5 w-5 text-primary-600" />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold dark:text-white">
                                                Payment Summary
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Automatically calculated
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub Total */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-slate-600 dark:text-slate-300">
                                            Sub Total
                                        </span>

                                        <span className="font-semibold dark:text-white">
                                            ₹{subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Discount */}
                                    <div className="py-3">
                                        <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Discount
                                        </label>

                                        <input
                                            type="number"
                                            min={0}
                                            {...register("discount", {
                                                valueAsNumber: true,
                                            })}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>

                                    <div className="my-4 border-t border-dashed border-slate-300 dark:border-slate-700" />

                                    {/* Final Total */}
                                    <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-4 dark:bg-primary-900/20">
                                        <span className="font-semibold text-primary-700 dark:text-primary-300">
                                            Total Amount
                                        </span>

                                        <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                                            ₹{totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Paid Amount Box */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Paid Amount
                                    </label>

                                    <input
                                        type="number"
                                        min={0}
                                        {...register("paid_amount", {
                                            valueAsNumber: true,
                                            onChange: () => setPaidEdited(true),
                                        })}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {errors.paid_amount && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.paid_amount.message}
                                        </p>
                                    )}

                                    {paidEdited && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaidEdited(false);
                                                setValue("paid_amount", totalAmount);
                                            }}
                                            className="mt-2 text-xs text-primary-600 hover:underline dark:text-primary-400"
                                        >
                                            Reset to total amount
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSubmitting || isLoading ? "Saving..." : "Save Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}