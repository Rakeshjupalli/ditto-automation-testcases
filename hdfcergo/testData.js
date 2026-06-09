export const VALID_USER = {
  age: '28',
  pincode: '517113',
  hasExistingPolicy: false,
};

export const VALID_FAMILY = {
  self: { gender: 'Male' },
  spouse: { gender: 'Female', age: '29' },
  father: { age: '50' },
  mother: { age: '45' },
  son: { age: '10' },
};

export const INVALID_DATA = {
  age: {
    tooYoung: '0',
    tooOld: '100',
    negative: '-5',
    nonNumeric: 'abc',
    empty: '',
  },
  pincode: {
    tooShort: '123',
    tooLong: '1234567',
    nonNumeric: 'ABCDEF',
    invalid: '000000',
    empty: '',
  },
};

export const PRODUCTS = {
  HDFC_ERGO_OPTIMA_SECURE: 'HDFCERGO Optima Secure',
};

export const ADDONS = {
  OPTIMA_WELLBEING: 'Optima Well-being',
  SERIOUS_ILLNESS_BOOSTER: 'Serious Illness Booster',
  PARENTHOOD: 'Parenthood',
};

export const URLS = {
  FQ: 'https://app.joinditto.in/fq',
};
