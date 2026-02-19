'use client';

import { useEffect, useState } from "react";
import { modalBus } from "@/app/lib/modalBus";
import CreateRequirementModal from "@/app/components/dashboard/tpa-dashboard/requirement-management/CreateRequirementModal";
import AddSponsorModal from "@/app/components/dashboard/tpa-dashboard/sponsor-management/AddSponsorModal";
export default function GlobalModal() {

  const [activeModal, setActiveModal] = useState<"requirement" | "sponsor" | null>(null);

  useEffect(() => {
    modalBus.subscribe(setActiveModal);
  }, []);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <CreateRequirementModal
        isOpen={activeModal === "requirement"}
        onClose={closeModal}
        onSubmit={(data) => {
          console.log("Requirement Created:", data);
          closeModal();
        }}
        sponsors={[]}
      />

      <AddSponsorModal
        isOpen={activeModal === "sponsor"}
        onClose={closeModal}
        onAdd={(data) => {
          console.log("Sponsor Added:", data);
          closeModal();
        }}
      />
    </>
  );
}
