"use client";

import { InlineSelect } from "@/components/admin/inline-select";
import {
  fieldVolunteerStatusLabels,
  type FieldVolunteerStatus,
} from "@/lib/constants";
import { updateFieldVolunteerStatus } from "@/actions/volunteers";

export function VolunteerStatusSelect({
  id,
  status,
}: {
  id: string;
  status: FieldVolunteerStatus;
}) {
  return (
    <InlineSelect
      value={status}
      options={Object.entries(fieldVolunteerStatusLabels).map(
        ([value, label]) => ({
          value,
          label,
        })
      )}
      onChange={(v) =>
        updateFieldVolunteerStatus(id, v as FieldVolunteerStatus)
      }
    />
  );
}
