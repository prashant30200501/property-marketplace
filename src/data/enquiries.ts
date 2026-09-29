
export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Site Visit"
  | "Converted"
  | "Closed";

export type EnquiryActivity = {
  status: EnquiryStatus;
  timestamp: string;
};

export type Enquiry = {
  id: string;
  customer: string;
  phone: string;
  property: string;
  location: string;
  price: string;
  date: string;
  status: EnquiryStatus;
  history: EnquiryActivity[];
};

export const enquiries: Enquiry[] = [
  {
    id: "ENQ-001",
    customer: "Aarav Sharma",
    phone: "98XXXXXX21",
    property: "Modern 3 BHK Apartment",
    location: "Vaishali Nagar, Jaipur",
    price: "₹85 Lakh",
    date: "Today, 10:30 AM",
    status: "New",
    history: [
      {
        status: "New",
        timestamp: "Today, 10:30 AM",
      },
    ],
  },
  {
    id: "ENQ-002",
    customer: "Priya Verma",
    phone: "97XXXXXX45",
    property: "Premium Residential Plot",
    location: "Ajmer Road, Jaipur",
    price: "₹45 Lakh",
    date: "Yesterday, 4:15 PM",
    status: "Contacted",
    history: [
      {
        status: "New",
        timestamp: "Yesterday, 4:15 PM",
      },
      {
        status: "Contacted",
        timestamp: "Yesterday, 4:45 PM",
      },
    ],
  },
  {
    id: "ENQ-003",
    customer: "Rahul Mehta",
    phone: "99XXXXXX18",
    property: "Spacious 2 BHK Flat",
    location: "Mansarovar, Jaipur",
    price: "₹52 Lakh",
    date: "25 Sep, 2:00 PM",
    status: "Site Visit",
    history: [
      {
        status: "New",
        timestamp: "25 Sep, 2:00 PM",
      },
      {
        status: "Contacted",
        timestamp: "25 Sep, 2:30 PM",
      },
      {
        status: "Site Visit",
        timestamp: "26 Sep, 11:00 AM",
      },
    ],
  },
];

export function updateEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus
) {
  const enquiry = enquiries.find(
    (item) => item.id === enquiryId
  );

  if (!enquiry || enquiry.status === status) {
    return;
  }

  enquiry.status = status;

  enquiry.history.push({
    status,
    timestamp: new Date().toLocaleString(),
  });
}