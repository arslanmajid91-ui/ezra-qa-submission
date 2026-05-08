export const memberCredentials = {
  firstName: process.env.MEMBER_FIRST_NAME ?? 'Test',
  lastName: process.env.MEMBER_LAST_NAME ?? 'Member',
  email: process.env.MEMBER_EMAIL ?? '',
  password: process.env.MEMBER_PASSWORD ?? '',
  phone: process.env.MEMBER_PHONE ?? '',
  linkPhone: process.env.MEMBER_LINK_PHONE ?? '',
}

export function generateMember() {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 7)
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `test.user+${ts}-${rand}@gmail.com`,
    phone: `212${6000000 + (ts % 3000000)}`,
    password: 'Pumpkin7@',
  }
}

export type Member = ReturnType<typeof generateMember>

export const cardVariants = [
  {
    brand: 'Visa',
    number: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
    zip: '10001',
  },
  {
    brand: 'Mastercard',
    number: '5555 5555 5555 4444',
    expiry: '12/30',
    cvc: '123',
    zip: '10001',
  },
  {
    brand: 'Amex',
    number: '3714 496353 98431',
    expiry: '12/30',
    cvc: '1234',
    zip: '10001',
  },
]
