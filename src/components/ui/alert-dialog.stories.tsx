import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
import { Button } from "./button";

i18n.addResourceBundle(
  "en",
  "alertDialog",
  {
    voidCharge: "Void charge",
    voidChargeTitle: "Void this charge?",
    voidChargeDescription:
      "Charge #CHG-3381 ($1,850.00 rent) will be voided and a reversing entry posted to the GL. This cannot be undone.",
    keepCharge: "Keep charge",
    deleteTenant: "Delete tenant",
    deleteTenantTitle: "Delete Jordan Avery?",
    deleteTenantDescription:
      "This permanently removes the tenant record and all draft data. Financial history is never hard-deleted and will be retained for audit.",
    cancel: "Cancel",
    deletePermanently: "Delete permanently",
  },
  true,
  true,
);
i18n.addResourceBundle(
  "es",
  "alertDialog",
  {
    voidCharge: "Anular cargo",
    voidChargeTitle: "¿Anular este cargo?",
    voidChargeDescription:
      "El cargo #CHG-3381 ($1,850.00 de renta) se anulará y se registrará un asiento de reversión en el libro mayor. Esta acción no se puede deshacer.",
    keepCharge: "Conservar cargo",
    deleteTenant: "Eliminar inquilino",
    deleteTenantTitle: "¿Eliminar a Jordan Avery?",
    deleteTenantDescription:
      "Esto elimina permanentemente el registro del inquilino y todos los datos en borrador. El historial financiero nunca se elimina de forma definitiva y se conservará para auditoría.",
    cancel: "Cancelar",
    deletePermanently: "Eliminar permanentemente",
  },
  true,
  true,
);

/**
 * Confirmation dialog for destructive or irreversible actions. Unlike `Dialog`,
 * it traps focus and requires an explicit Cancel/Action choice — used for voiding
 * charges, deleting records, and other accounting-sensitive operations.
 */
const meta: Meta = {
  title: "Components/Overlays/AlertDialog",
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj = {
  render: () => {
    const { t } = useTranslation("alertDialog");
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">{t("voidCharge")}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("voidChargeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("voidChargeDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepCharge")}</AlertDialogCancel>
            <AlertDialogAction>{t("voidCharge")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};

export const Destructive: StoryObj = {
  render: () => {
    const { t } = useTranslation("alertDialog");
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">{t("deleteTenant")}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTenantTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteTenantDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction tone="destructive">
              {t("deletePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};
