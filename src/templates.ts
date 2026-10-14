export interface PaystackEvent {
  event: string;
  data: Record<string, any>;
}

export const TEMPLATES: Record<string, PaystackEvent> = {
  'charge.success': {
    event: 'charge.success',
    data: {
      id: 302928190,
      domain: 'test',
      status: 'success',
      reference: 'trx_pk_9901842091',
      amount: 2500000, // 25,000 NGN in kobo
      message: null,
      gateway_response: 'Successful',
      paid_at: '2026-10-14T12:30:00.000Z',
      created_at: '2026-10-14T12:28:45.000Z',
      channel: 'card',
      currency: 'NGN',
      ip_address: '102.89.43.12',
      metadata: {
        cart_id: 'cart_88301',
        custom_fields: [
          {
            display_name: 'Store Name',
            variable_name: 'store_name',
            value: 'Lagos Tech Hub',
          },
        ],
      },
      log: {
        start_time: 1728908925,
        time_spent: 7,
        attempts: 1,
        errors: 0,
        success: true,
        mobile: false,
        input: [],
        history: [
          {
            type: 'action',
            message: 'Attempted to pay',
            time: 2,
          },
          {
            type: 'success',
            message: 'Successfully paid',
            time: 7,
          },
        ],
      },
      fees: 37500,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_891238910',
        bin: '408408',
        last4: '4081',
        exp_month: '12',
        exp_year: '2028',
        channel: 'card',
        card_type: 'visa',
        bank: 'Access Bank',
        country_code: 'NG',
        brand: 'visa',
        reusable: true,
        signature: 'SIG_u8901239812903',
        account_name: null,
      },
      customer: {
        id: 8492019,
        first_name: 'Chinedu',
        last_name: 'Okafor',
        email: 'chinedu.okafor@example.com',
        customer_code: 'CUS_9982019238',
        phone: '+2348012345678',
        metadata: null,
        risk_action: 'default',
        international_format_phone: null,
      },
      plan: null,
      subaccount: {},
      split: {},
      order_id: null,
      paidAt: '2026-10-14T12:30:00.000Z',
      requested_amount: 2500000,
      pos_transaction_data: null,
      source: {
        type: 'api',
        source: 'merchant_api',
        entry_point: 'transaction_initialize',
      },
    },
  },
  'transfer.success': {
    event: 'transfer.success',
    data: {
      amount: 1500000, // 15,000 NGN in kobo
      currency: 'NGN',
      domain: 'test',
      failures: null,
      id: 8901234,
      integration: {
        id: 48920,
        is_live: false,
        business_name: 'SwiftPay Solutions',
      },
      reason: 'Staff payroll disbursement',
      reference: 'trf_9821389012',
      source: 'balance',
      source_details: null,
      status: 'success',
      titan_code: null,
      transfer_code: 'TRF_1ptvinn3u3218',
      transferred_at: '2026-10-14T11:45:00.000Z',
      recipient: {
        active: true,
        currency: 'NGN',
        description: 'Vendor payment',
        domain: 'test',
        email: 'amina.bello@example.com',
        id: 289102,
        integration: 48920,
        name: 'Amina Bello',
        recipient_code: 'RCP_2891029381',
        type: 'nuban',
        is_deleted: false,
        details: {
          authorization_code: null,
          account_number: '0123456789',
          account_name: 'Amina Bello',
          bank_code: '058',
          bank_name: 'Guaranty Trust Bank',
        },
      },
      session: {
        provider: null,
        id: null,
      },
      created_at: '2026-10-14T11:40:00.000Z',
      updated_at: '2026-10-14T11:45:00.000Z',
    },
  },
  'transfer.failed': {
    event: 'transfer.failed',
    data: {
      amount: 5000000,
      currency: 'NGN',
      domain: 'test',
      failures: null,
      id: 8901235,
      reason: 'Invalid beneficiary account number or destination bank unreachable',
      reference: 'trf_fail_9981203',
      source: 'balance',
      status: 'failed',
      transfer_code: 'TRF_fail_891238',
      recipient: {
        account_number: '9999999999',
        bank_code: '057',
        bank_name: 'Zenith Bank',
        name: 'Emeka Eze',
        recipient_code: 'RCP_fail_88912',
      },
      created_at: '2026-10-14T10:15:00.000Z',
      updated_at: '2026-10-14T10:16:30.000Z',
    },
  },
  'transfer.reversed': {
    event: 'transfer.reversed',
    data: {
      amount: 750000,
      currency: 'NGN',
      domain: 'test',
      id: 8901236,
      reason: 'Account closed by recipient institution; funds credited back to balance',
      reference: 'trf_rev_771829',
      status: 'reversed',
      transfer_code: 'TRF_rev_11234',
      created_at: '2026-10-14T09:00:00.000Z',
      updated_at: '2026-10-14T09:30:00.000Z',
    },
  },
  'invoice.create': {
    event: 'invoice.create',
    data: {
      domain: 'test',
      invoice_number: 104,
      amount: 1200000,
      period_start: '2026-10-01T00:00:00.000Z',
      period_end: '2026-10-31T23:59:59.000Z',
      status: 'pending',
      paid: false,
      description: 'Monthly Cloud Infrastructure Retainer',
      customer: {
        id: 77192,
        first_name: 'Olumide',
        last_name: 'Adeyemi',
        email: 'olumide@example.com',
        customer_code: 'CUS_inv_8829',
      },
    },
  },
  'invoice.payment_failed': {
    event: 'invoice.payment_failed',
    data: {
      domain: 'test',
      invoice_number: 104,
      amount: 1200000,
      status: 'failed',
      paid: false,
      gateway_response: 'Insufficient funds in customer card balance',
      customer: {
        id: 77192,
        email: 'olumide@example.com',
        customer_code: 'CUS_inv_8829',
      },
    },
  },
  'subscription.create': {
    event: 'subscription.create',
    data: {
      domain: 'test',
      status: 'active',
      subscription_code: 'SUB_monthly_pro_99182',
      amount: 1000000,
      cron_expression: '0 0 1 * *',
      next_payment_date: '2026-11-14T00:00:00.000Z',
      customer: {
        email: 'subscriber@startup.ng',
        customer_code: 'CUS_sub_99128',
      },
      plan: {
        name: 'Pro Tier Monthly',
        plan_code: 'PLN_pro_monthly',
        currency: 'NGN',
      },
    },
  },
  'subscription.disable': {
    event: 'subscription.disable',
    data: {
      domain: 'test',
      status: 'disabled',
      subscription_code: 'SUB_monthly_pro_99182',
      email_token: 'tok_sub_cancel_991',
      customer: {
        email: 'subscriber@startup.ng',
      },
    },
  },
  'dedicated_account.assign.success': {
    event: 'dedicated_account.assign.success',
    data: {
      bank: {
        name: 'Wema Bank',
        id: 20,
        slug: 'wema-bank',
      },
      account_name: 'SwiftPay / Babatunde Sanusi',
      account_number: '9920192831',
      assigned: true,
      currency: 'NGN',
      customer: {
        id: 991204,
        email: 'babatunde@example.com',
        customer_code: 'CUS_dva_0019',
      },
    },
  },
};

export function listTemplates(): string[] {
  return Object.keys(TEMPLATES);
}

export function getTemplate(name: string): PaystackEvent {
  const template = TEMPLATES[name];
  if (!template) {
    throw new Error(`Template not found: ${name}. Available: ${listTemplates().join(', ')}`);
  }
  // Return deep clone so caller mutations do not alter template
  return JSON.parse(JSON.stringify(template));
}
