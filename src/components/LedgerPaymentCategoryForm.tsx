import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useLedgerCategory } from "../store/useLedgerCategory";
import type {
  CreateLedgerCategoryPayload,
  EditLedgerCategoryPayload,
  LedgerCategory,
} from "../store/useLedgerCategory";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

const schema = z.object({
  name: z
    .string()
    .min(2, "Category name is required")
    .max(100, "Maximum 100 characters"),

  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  category?: LedgerCategory | null;
}

export function LedgerPaymentCategoryForm({
  open,
  onClose,
  category,
}: Props) {
  const { user } = useAuthStore();

  const {
    createCategory,
    editCategory,
    isLoading,
    error,
    clearError,
  } = useLedgerCategory();

  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),

    defaultValues: {
      name: "",
      note: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        note: category.note ?? "",
      });
    } else {
      reset({
        name: "",
        note: "",
      });
    }
  }, [category, reset]);
  const navigate = useNavigate()
  useEffect(() => {
    if (!(checkPermission(user, ["ledger handle", "all handle"], navigate))) return;

  }, [user, navigate]);
  const onSubmit = async (values: FormData) => {
    if (!(await checkPermission(user, ["ledger handle", "all handle"], navigate))) return;

    let success = false;

    if (isEdit) {
      success = await editCategory({
        action_by: user?.id, active_year_id: user?.active_year_id,
        id: category.id,
        ...values,
      } as EditLedgerCategoryPayload);
    } else {
      success = await createCategory({
        action_by: user?.id, active_year_id: user?.active_year_id,
        ...values
      } as CreateLedgerCategoryPayload
      );
    }

    if (success) {
      reset();
      onClose();
    }

  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-900">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Category" : "New Category"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEdit
                ? "Update ledger payment category."
                : "Create a new payment category."}
            </p>

          </div>

          <button
            onClick={() => {
              reset();
              clearError();
              onClose();
            }}
            className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col"
        >

          <div className="flex-1 space-y-6 overflow-y-auto p-6">

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Name */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Category Name
              </label>

              <input
                {...register("name")}
                placeholder="Enter category name"
                className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                outline-none
                transition

                focus:border-primary-500
                focus:ring-4
                focus:ring-primary-100

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:placeholder:text-slate-500
                dark:focus:ring-primary-900/40
                "
              />

              {errors.name && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}

            </div>

            {/* Note */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Note
              </label>

              <textarea
                rows={5}
                {...register("note")}
                placeholder="Write something..."
                className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                outline-none
                transition

                focus:border-primary-500
                focus:ring-4
                focus:ring-primary-100

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:placeholder:text-slate-500
                dark:focus:ring-primary-900/40
                "
              />

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">

            <button
              type="button"
              onClick={() => {
                reset();
                clearError();
                onClose();
              }}
              className="
              rounded-xl
              border
              border-slate-300
              px-5
              py-3
              font-medium
              transition

              hover:bg-slate-100

              dark:border-slate-700
              dark:text-white
              dark:hover:bg-slate-800
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-primary-600
              px-6
              py-3
              font-semibold
              text-white
              transition

              hover:bg-primary-700

              disabled:cursor-not-allowed
              disabled:opacity-60
              "
            >
              {(isLoading || isSubmitting) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Update Category" : "Save Category"}
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}