// Validação de Senha Forte
// - Mínimo de 8 caracteres
// - Pelo menos 1 letra maiúscula
// - Pelo menos 1 letra minúscula
// - Pelo menos 1 número
// - Pelo menos 1 caractere especial
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) return false;
  
  return true;
}

// Formatação de Preço baseada nos requisitos do seu teste
// Utiliza separador de milhar com vírgula e decimal com ponto para bater com a regex `\d,\d{3}\.\d{2}`
export function formatPrice(value: number, decimalPlaces: number = 2): string {
  const isNegative = value < 0;
  const absoluteValue = Math.abs(value);
  
  // Arredonda e fixa as casas decimais
  const fixedValue = absoluteValue.toFixed(decimalPlaces);
  const [integerPart, decimalPart] = fixedValue.split(".");
  
  // Adiciona a vírgula como separador de milhar
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const sign = isNegative ? "-" : "";
  
  if (decimalPlaces === 0) {
    return `${sign}${formattedInteger}`;
  }
  
  return `${sign}${formattedInteger}.${decimalPart}`;
}