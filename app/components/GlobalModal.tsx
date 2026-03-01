'use client';

import { useEffect, useState, useCallback } from "react";
import { modalBus } from "@/app/lib/modalBus";
import CreateRequirementModal from "@/app/components/dashboard/tpa-dashboard/requirement-management/CreateRequirementModal";
import AddSponsorModal from "@/app/components/dashboard/tpa-dashboard/sponsor-management/AddSponsorModal";

interface Sponsor {
  id: string;
  name: string;
  email: string;
}

interface Plan {
  id: string;
  planName: string;
  planType: string;
}

export default function GlobalModal() {
  const [activeModal, setActiveModal] = useState<"requirement" | "sponsor" | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const fetchRequirementData = useCallback(async () => {
    const [sponsorsRes, plansRes] = await Promise.all([
      fetch("/api/sponsors"),
      fetch("/api/plans"),
    ]);

    if (sponsorsRes.ok) {
      const sponsorsData = await sponsorsRes.json();
      setSponsors(sponsorsData.data ?? []);
    }

    if (plansRes.ok) {
      const plansData = await plansRes.json();
      setPlans(plansData.data ?? []);
    }
  }, []);

  useEffect(() => {
    modalBus.subscribe(setActiveModal);
  }, []);

  useEffect(() => {
    if (activeModal === "requirement") {
      fetchRequirementData();
    }
  }, [activeModal, fetchRequirementData]);

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
        sponsors={sponsors}
        plans={plans}
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
