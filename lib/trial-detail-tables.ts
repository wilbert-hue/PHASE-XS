import { CTRI_DB_TABLE_DEFAULT } from "@/lib/ctri-trial-map"
import { UK_DB_TABLE_DEFAULT } from "@/lib/uk-trial-map"
import { SPAIN_DB_TABLE_DEFAULT } from "@/lib/spain-trial-map"
import { BELGIUM_DB_TABLE_DEFAULT } from "@/lib/belgium-trial-map"

export function ctriDetailTableName(base = CTRI_DB_TABLE_DEFAULT): string {
  return `${base}_detail`
}

export function ukDetailTableName(base = UK_DB_TABLE_DEFAULT): string {
  return `${base}_detail`
}

export function spainDetailTableName(base = SPAIN_DB_TABLE_DEFAULT): string {
  return `${base}_detail`
}

export function belgiumDetailTableName(base = BELGIUM_DB_TABLE_DEFAULT): string {
  return `${base}_detail`
}

export function usDetailTableName(
  base = (process.env.POSTGRES_TABLE?.trim() || "final_output_22").trim() || "final_output_22",
): string {
  return `${base}_detail`
}
