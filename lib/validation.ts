import { z } from "zod";
import { isSafeImageUrl, sanitizePlainText } from "./security";

const trimmedString = (min: number, max: number) =>
  z.string().transform((v) => sanitizePlainText(v, max)).pipe(z.string().min(min).max(max));

const optionalTrimmedString = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v ? sanitizePlainText(v, max) : ""))
    .optional();

const phoneSchema = z
  .string()
  .transform((v) => sanitizePlainText(v, 24))
  .refine((v) => /^[0-9+\-\s()]{7,20}$/.test(v), "Invalid phone number format");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .pipe(z.string().email("Invalid email address"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password is required").max(128),
});

export const rescueCreateSchema = z.object({
  animalType: trimmedString(2, 40),
  emergencyLevel: z.enum(["Critical", "High", "Normal"]).optional(),
  location: trimmedString(3, 300),
  reporterName: trimmedString(2, 100),
  reporterPhone: phoneSchema,
  reporterEmail: z
    .union([z.string().trim().email(), z.literal(""), z.null(), z.undefined()])
    .optional(),
  condition: optionalTrimmedString(60),
  description: trimmedString(5, 2000),
  photoUrl: z
    .union([
      z.string().refine(
        (u) => isSafeImageUrl(u),
        "Image URL must be an uploaded shelter/Vercel Blob image or valid raster photo"
      ),
      z.null(),
      z.undefined(),
    ])
    .optional(),
});

export const adoptionCreateSchema = z.object({
  applicantName: trimmedString(2, 100),
  age: z.coerce.number().int().min(18, "Applicant must be at least 18").max(110),
  phone: phoneSchema,
  email: emailSchema,
  address: trimmedString(5, 300),
  occupation: optionalTrimmedString(100),
  hasPets: z.coerce.boolean(),
  petDetails: optionalTrimmedString(120),
  homeType: trimmedString(2, 100),
  familyMembers: z.coerce.number().int().min(1).max(30).default(1),
  reason: trimmedString(10, 1500),
  animalId: z.union([z.string().trim().min(1).max(64), z.null(), z.undefined()]).optional(),
});

export const volunteerCreateSchema = z.object({
  name: trimmedString(2, 100),
  age: z.coerce.number().int().min(14, "Minimum volunteer age is 14").max(100),
  phone: phoneSchema,
  email: emailSchema,
  location: optionalTrimmedString(120),
  experience: optionalTrimmedString(1500),
  roles: z.array(trimmedString(2, 60)).min(1, "Select at least one volunteer role").max(12),
  availability: z.array(trimmedString(2, 60)).max(8).default([]),
});

export const donationCreateSchema = z.object({
  amount: z.coerce.number().finite().min(10, "Minimum donation is ₹10").max(10_000_000),
  purpose: trimmedString(2, 80),
  frequency: z.enum(["one-time", "monthly", "One-time", "Monthly"]).default("one-time"),
  name: trimmedString(2, 100),
  phone: phoneSchema,
  email: emailSchema,
  pan: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v ? sanitizePlainText(v, 10).toUpperCase() : ""))
    .refine((v) => v === "" || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v), "Invalid PAN format")
    .optional(),
});

export const sponsorshipCreateSchema = z.object({
  sponsorName: trimmedString(2, 100),
  sponsorPhone: phoneSchema,
  sponsorEmail: emailSchema,
  animalId: z.union([z.string().trim().min(1).max(64), z.null(), z.undefined()]).optional(),
  tier: z.enum(["Food - 500", "Medical - 1000", "Care - 1500", "Full Care - 3000"]),
  frequency: z.enum(["One-time", "Monthly"]).default("Monthly"),
});

export const createOrderSchema = z.object({
  recordType: z.enum(["donation", "sponsorship"]),
  recordId: z.string().trim().min(1).max(80),
});

export const verifyPaymentSchema = z
  .object({
    razorpay_order_id: z.string().trim().min(3).max(120),
    razorpay_payment_id: z.string().trim().min(3).max(120),
    razorpay_signature: z.string().trim().min(3).max(256),
    donationId: z.string().trim().min(1).max(80).optional(),
    sponsorshipId: z.string().trim().min(1).max(80).optional(),
  })
  .refine(
    (d) => Boolean(d.donationId) !== Boolean(d.sponsorshipId),
    "Provide exactly one of donationId or sponsorshipId"
  );

export const contactCreateSchema = z.object({
  name: trimmedString(2, 100),
  phone: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v ? sanitizePlainText(v, 24) : ""))
    .refine((v) => v === "" || /^[0-9+\-\s()]{7,20}$/.test(v), "Invalid phone number")
    .optional(),
  email: emailSchema,
  subject: trimmedString(2, 120),
  message: trimmedString(10, 2500),
});

export const chatMessageSchema = z.object({
  message: z.string().transform((v) => sanitizePlainText(v, 1000)).optional(),
  history: z
    .array(
      z.object({
        sender: z.enum(["user", "bot"]),
        text: z.string().transform((v) => sanitizePlainText(v, 800)),
      })
    )
    .max(8)
    .optional(),
});

export const animalFormSchema = z.object({
  name: trimmedString(1, 80),
  type: trimmedString(2, 40),
  breed: trimmedString(2, 80),
  gender: z.enum(["Male", "Female", "Unknown"]),
  age: trimmedString(1, 40),
  color: trimmedString(2, 60),
  location: trimmedString(2, 120),
  status: z.enum([
    "Available for Adoption",
    "Rescued",
    "Under Treatment",
    "Recovering",
    "Sponsored",
    "Adopted",
  ]),
  image: z
    .string()
    .trim()
    .refine(
      (u) => isSafeImageUrl(u),
      "Animal image URL must be a local sanctuary asset, uploaded Vercel Blob URL, or raster data URL"
    )
    .optional(),
  vaccinated: z.boolean().default(false),
  dewormed: z.boolean().default(false),
  sterilized: z.boolean().default(false),
  rescueDate: z.string().optional(),
  shelter: trimmedString(2, 120),
  shelterLocationId: z.string().trim().nullable().optional(),
  story: trimmedString(10, 4000),
});
