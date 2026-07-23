import type { PaymentMethod } from '@/types'

/**
 * Couche d'abstraction paiement.
 *
 * ⚠️ ÉTAT ACTUEL : aucun prestataire (PSP) n'est branché. `processPayment`
 * simule une autorisation et ne contacte aucun service externe. Les
 * enregistrements `payments` et `tickets` créés ensuite sont, eux, bien réels.
 *
 * POUR PASSER EN PRODUCTION :
 * chaque méthode doit être traitée côté serveur (Supabase Edge Function),
 * jamais depuis ce fichier — la clé secrète du PSP ne doit jamais atteindre
 * le navigateur :
 *   - card         → PSP à hosted fields / redirection (Stripe, Paystack…).
 *                    Les champs carte du formulaire ne doivent JAMAIS transiter
 *                    par notre code : ils sont ici purement décoratifs et ne
 *                    sont envoyés nulle part.
 *   - orange_money → API Orange Money Web Payment (initiation serveur + webhook)
 *   - mtn_momo     → API MTN MoMo Collections (requestToPay + webhook)
 *   - paypal       → PayPal Orders API (create + capture côté serveur)
 *
 * Le webhook du PSP devra écrire le statut final du paiement ; c'est lui, et
 * non le client, qui doit faire foi.
 */

export interface PaymentRequest {
  method: PaymentMethod
  amount: number
  currency: string
  /** Numéro mobile money, requis pour orange_money et mtn_momo. */
  phone?: string
}

export interface PaymentResult {
  success: boolean
  reference: string
  message?: string
}

/** Référence lisible et unique, réutilisée comme clé métier du paiement. */
export function generateReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `EVS-${stamp}-${random}`
}

const MOBILE_MONEY: PaymentMethod[] = ['orange_money', 'mtn_momo']

/** Validation locale du formulaire, avant tout appel. */
export function validatePaymentInput(req: PaymentRequest): string | null {
  if (req.amount <= 0) return 'Montant invalide'
  if (MOBILE_MONEY.includes(req.method)) {
    const digits = (req.phone ?? '').replace(/\D/g, '')
    if (digits.length < 9) return 'Numéro de téléphone invalide'
  }
  return null
}

export async function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  const error = validatePaymentInput(req)
  if (error) return { success: false, reference: '', message: error }

  // TODO(paiement) : remplacer par un appel à l'Edge Function du PSP retenu.
  await new Promise(resolve => setTimeout(resolve, 1200))

  return { success: true, reference: generateReference() }
}
