/* Seeded member + claim data for the Meridian Advantage demo portal.
   Keys are normalized MBIs: uppercase, separators stripped.

   Real Medicare Beneficiary Identifiers are 11 characters and never contain
   S, L, O, I, B or Z (they're too easy to confuse with 5, 1, 0, 1, 8, 2).
   The MBIs below follow the real CMS format so they look right on camera. */

const MERIDIAN_MEMBERS = {
  '1EG4TE5MK73': {
    mbi: '1EG4TE5MK73',
    firstName: 'Dolores',
    lastName: 'Whitfield',
    dob: '03/14/1952',
    age: 74,
    gender: 'F',
    email: 'dolores.whitfield@example.com',
    address: '1418 Larkspur Ave, Apt 3B',
    cityStateZip: 'Oakland, CA 94610',
    state: 'California',
    phone: '(510) 555-0148',
    coverage: {
      status: 'ACTIVE',
      planName: 'Meridian Advantage Choice (PPO)',
      planId: 'H5432-004',
      effectiveDate: '01/01/2026',
      termDate: '—',
      network: 'In-network and out-of-network benefits',
      partA: 'Active — 03/01/2017',
      partB: 'Active — 03/01/2017',
      partD: 'Included — S5432-021',
      pcpName: 'Reyes, Marisol MD',
      pcpGroup: 'Bayview Primary Care Group',
      pcpPhone: '(510) 555-0192',
    },
    costShares: [
      ['Primary care visit', '$0 copay', 'No referral required'],
      ['Specialist visit', '$35 copay', 'No referral required'],
      ['Urgent care', '$50 copay', 'Waived if admitted within 24 hrs'],
      ['Emergency room', '$120 copay', 'Waived if admitted'],
      ['Inpatient hospital', '$295 / day', 'Days 1–5, then $0'],
      ['Advanced imaging (MRI/CT/PET)', '20% coinsurance', 'Prior authorization required'],
      ['Lab &amp; diagnostics', '$0 copay', 'In-network only'],
    ],
    accumulators: {
      deductibleMet: 340,
      deductibleTotal: 500,
      oopMet: 1180,
      oopTotal: 4900,
    },
    priorAuth: [
      'Advanced imaging — MRI, CT, PET',
      'Durable medical equipment over $500',
      'Out-of-network specialty care',
      'Inpatient admission (non-emergent)',
    ],
    claims: [
      {
        id: 'CLM-2026-084417',
        dos: '06/12/2026',
        provider: 'Reyes, Marisol MD',
        facility: 'Bayview Primary Care Group',
        service: 'Office Visit — Established Patient',
        cpt: '99214',
        billed: 285.0,
        allowed: 142.6,
        planPaid: 142.6,
        patientResp: 0.0,
        status: 'PAID',
        processedDate: '06/24/2026',
        paymentRef: 'EFT-4471902',
        note: 'Processed at in-network rate. Primary care copay $0.',
        lines: [
          ['99214', 'Office/outpatient visit, established', '$285.00', '$142.60', '$142.60', '$0.00'],
        ],
      },
      {
        id: 'CLM-2026-091203',
        dos: '07/02/2026',
        provider: 'Okonkwo, Daniel MD',
        facility: 'Bayview Imaging Center',
        service: 'MRI Lumbar Spine w/o Contrast',
        cpt: '72148',
        billed: 1840.0,
        allowed: 0.0,
        planPaid: 0.0,
        patientResp: 0.0,
        status: 'DENIED',
        processedDate: '07/15/2026',
        paymentRef: '—',
        denialCode: 'CO-197',
        denialReason:
          'Precertification / authorization absent. Advanced imaging requires prior authorization under plan H5432-004.',
        appealDeadline: '09/30/2026',
        note: 'Member is not financially responsible. Provider may submit a retrospective authorization request.',
        lines: [
          ['72148', 'MRI lumbar spine w/o contrast', '$1,840.00', '$0.00', '$0.00', '$0.00'],
        ],
      },
      {
        id: 'CLM-2026-093855',
        dos: '07/28/2026',
        provider: 'Coastal Regional Labs',
        facility: 'Coastal Regional Labs — Oakland',
        service: 'Comprehensive Metabolic Panel',
        cpt: '80053',
        billed: 96.0,
        allowed: null,
        planPaid: null,
        patientResp: null,
        status: 'PROCESSING',
        processedDate: '—',
        paymentRef: '—',
        note: 'Received 07/30/2026. Standard adjudication window is 14 business days.',
        lines: [['80053', 'Comprehensive metabolic panel', '$96.00', '—', '—', '—']],
      },
    ],
  },

  '2XW9HK4NP12': {
    mbi: '2XW9HK4NP12',
    firstName: 'Arthur',
    lastName: 'Beaumont',
    dob: '11/02/1948',
    age: 77,
    gender: 'M',
    email: 'arthur.beaumont@example.com',
    address: '922 Sutter Ridge Rd',
    cityStateZip: 'Berkeley, CA 94708',
    state: 'California',
    phone: '(510) 555-0273',
    coverage: {
      status: 'ACTIVE',
      planName: 'Meridian Advantage Value (HMO)',
      planId: 'H5432-011',
      effectiveDate: '01/01/2024',
      termDate: '—',
      network: 'In-network only',
      partA: 'Active — 12/01/2013',
      partB: 'Active — 12/01/2013',
      partD: 'Included — S5432-018',
      pcpName: 'Nakamura, Elise MD',
      pcpGroup: 'Sutter Ridge Family Medicine',
      pcpPhone: '(510) 555-0311',
    },
    costShares: [
      ['Primary care visit', '$0 copay', 'No referral required'],
      ['Specialist visit', '$45 copay', 'Referral required'],
      ['Urgent care', '$40 copay', 'Waived if admitted within 24 hrs'],
      ['Emergency room', '$110 copay', 'Waived if admitted'],
      ['Inpatient hospital', '$350 / day', 'Days 1–4, then $0'],
      ['Advanced imaging (MRI/CT/PET)', '$275 copay', 'Prior authorization required'],
      ['Lab &amp; diagnostics', '$0 copay', 'In-network only'],
    ],
    accumulators: {
      deductibleMet: 0,
      deductibleTotal: 0,
      oopMet: 615,
      oopTotal: 3800,
    },
    priorAuth: [
      'Advanced imaging — MRI, CT, PET',
      'All specialty referrals',
      'Skilled nursing facility admission',
    ],
    claims: [
      {
        id: 'CLM-2026-077140',
        dos: '05/19/2026',
        provider: 'Nakamura, Elise MD',
        facility: 'Sutter Ridge Family Medicine',
        service: 'Annual Wellness Visit',
        cpt: 'G0439',
        billed: 210.0,
        allowed: 118.0,
        planPaid: 118.0,
        patientResp: 0.0,
        status: 'PAID',
        processedDate: '05/30/2026',
        paymentRef: 'EFT-4402118',
        note: 'Preventive service. No member cost share.',
        lines: [['G0439', 'Annual wellness visit, subsequent', '$210.00', '$118.00', '$118.00', '$0.00']],
      },
      {
        id: 'CLM-2026-088902',
        dos: '06/25/2026',
        provider: 'Vance, Priya MD',
        facility: 'East Bay Cardiology',
        service: 'Cardiology Consultation',
        cpt: '99244',
        billed: 480.0,
        allowed: 262.0,
        planPaid: 217.0,
        patientResp: 45.0,
        status: 'PAID',
        processedDate: '07/08/2026',
        paymentRef: 'EFT-4459330',
        note: 'Specialist copay $45 applied. Referral on file.',
        lines: [['99244', 'Office consultation, level 4', '$480.00', '$262.00', '$217.00', '$45.00']],
      },
    ],
  },

  '4TQ6MC8RV30': {
    mbi: '4TQ6MC8RV30',
    firstName: 'Ruth',
    lastName: 'Callahan',
    dob: '07/19/1955',
    age: 71,
    gender: 'F',
    email: 'ruth.callahan@example.com',
    address: '57 Mariposa Ln',
    cityStateZip: 'Alameda, CA 94501',
    state: 'California',
    phone: '(510) 555-0466',
    coverage: {
      status: 'TERMINATED',
      planName: 'Meridian Advantage Choice (PPO)',
      planId: 'H5432-004',
      effectiveDate: '01/01/2023',
      termDate: '05/31/2026',
      network: 'Coverage ended — no active benefits',
      partA: 'Active — 08/01/2020',
      partB: 'Active — 08/01/2020',
      partD: 'Terminated — 05/31/2026',
      pcpName: '—',
      pcpGroup: '—',
      pcpPhone: '—',
      termReason: 'Voluntary disenrollment — relocated outside plan service area',
    },
    costShares: [],
    accumulators: {
      deductibleMet: 500,
      deductibleTotal: 500,
      oopMet: 2240,
      oopTotal: 4900,
    },
    priorAuth: [],
    claims: [
      {
        id: 'CLM-2026-061882',
        dos: '04/08/2026',
        provider: 'Alvarez, Tomas MD',
        facility: 'Alameda Internal Medicine',
        service: 'Office Visit — Established Patient',
        cpt: '99213',
        billed: 195.0,
        allowed: 104.0,
        planPaid: 104.0,
        patientResp: 0.0,
        status: 'PAID',
        processedDate: '04/21/2026',
        paymentRef: 'EFT-4318744',
        note: 'Date of service falls within active coverage period.',
        lines: [['99213', 'Office/outpatient visit, established', '$195.00', '$104.00', '$104.00', '$0.00']],
      },
    ],
  },
};

/* ---------- helpers ---------- */

/* Voice transcription is unpredictable: "1EG4-TE5-MK73", "1 e g 4 t e 5 m k 7 3",
   "1EG4TE5MK73" all need to resolve to the same member. Strip everything that
   isn't alphanumeric and uppercase the rest. */
function normalizeMbi(raw) {
  return String(raw || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
}

/* Display form matches how the MBI is printed on a Medicare card: 4-3-4. */
function formatMbi(raw) {
  const n = normalizeMbi(raw);
  if (n.length !== 11) return n;
  return n.slice(0, 4) + '-' + n.slice(4, 7) + '-' + n.slice(7);
}

function findMember(raw) {
  return MERIDIAN_MEMBERS[normalizeMbi(raw)] || null;
}

function findClaim(claimId) {
  const target = String(claimId || '').trim().toUpperCase();
  for (const mbi in MERIDIAN_MEMBERS) {
    const member = MERIDIAN_MEMBERS[mbi];
    const claim = member.claims.find((c) => c.id.toUpperCase() === target);
    if (claim) return { member, claim };
  }
  return null;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function money(value) {
  if (value === null || value === undefined) return '—';
  return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
