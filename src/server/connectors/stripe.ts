import Stripe from "stripe";

import type { EvidencePack } from "../domain/types";
import { getEnv, requireEnv } from "../env/loadEnv";
import { compileEvidence } from "../risk/compiler";

export function getStripe(): Stripe {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"));
}

export function stripeConfigured(): boolean {
  return Boolean(getEnv("STRIPE_SECRET_KEY") && getEnv("STRIPE_WEBHOOK_SECRET"));
}

export function verifyStripeWebhook(payload: string | Buffer, signature: string): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    requireEnv("STRIPE_WEBHOOK_SECRET"),
  );
}

export function evidenceFromStripeEvent(event: Stripe.Event): EvidencePack {
  const obj = event.data.object as {
    id?: string;
    customer?: string | { id?: string };
    amount_due?: number;
    amount?: number;
    status?: string;
  };
  const customer =
    typeof obj.customer === "string" ? obj.customer : (obj.customer?.id ?? "unknown_customer");
  const cents = obj.amount_due ?? obj.amount ?? 0;
  const arrAtRiskUsd = Math.max(1, Math.round(cents / 100));
  const input: Parameters<typeof compileEvidence>[0] = {
    triggerId: event.id,
    triggerKind: "stripe",
    accountName: `stripe:${customer}`,
    accountId: customer,
    arrAtRiskUsd,
    signalSummary: `Stripe ${event.type} status=${obj.status ?? "n/a"}`,
  };
  if (obj.id) input.rawRef = obj.id;
  return compileEvidence(input);
}
