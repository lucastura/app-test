import { formatPrice, validatePassword } from "../../src/utils/formatters";

describe("Funções Utilitárias: validatePassword", () => {
  it("deve rejeitar senhas com menos de 8 caracteres", () => {
    expect(validatePassword("Aa1@567")).toBe(false);
  });

  it("deve rejeitar senhas sem letra maiúscula", () => {
    expect(validatePassword("senhafraca1@")).toBe(false);
  });

  it("deve rejeitar senhas sem letra minúscula", () => {
    expect(validatePassword("SENHAFRACA1@")).toBe(false);
  });

  it("deve rejeitar senhas sem números", () => {
    expect(validatePassword("SenhaFraca@")).toBe(false);
  });

  it("deve rejeitar senhas sem caracteres especiais", () => {
    expect(validatePassword("SenhaForte123")).toBe(false);
  });

  it("deve aprovar uma senha que cumpra todos os requisitos", () => {
    expect(validatePassword("SenhaForte123@")).toBe(true);
    expect(validatePassword("Outra#Senha99")).toBe(true);
  });
});

describe("Funções Utilitárias: formatPrice", () => {
  it("formata valores inteiros com duas casas decimais (padrão)", () => {
    expect(formatPrice(10)).toBe("10.00");
    expect(formatPrice(5)).toBe("5.00");
  });

  it("arredonda valores decimais para duas casas decimais", () => {
    expect(formatPrice(10.555)).toBe("10.56");
    expect(formatPrice(10.554)).toBe("10.55");
  });

  it("preenche casas decimais com zeros à direita", () => {
    expect(formatPrice(10.5)).toBe("10.50");
  });

  it("suporta quantidade personalizada de casas decimais", () => {
    expect(formatPrice(10.555, 3)).toBe("10.555");
    expect(formatPrice(10.5555, 4)).toBe("10.5555");
  });

  it("suporta zero casas decimais", () => {
    expect(formatPrice(10.99, 0)).toBe("11"); // Arredonda para cima
    expect(formatPrice(10.49, 0)).toBe("10"); // Arredonda para baixo
  });

  it("formata zero", () => {
    expect(formatPrice(0)).toBe("0.00");
  });

  it("formata valores negativos", () => {
    expect(formatPrice(-1500.5)).toBe("-1,500.50");
    expect(formatPrice(-10)).toBe("-10.00");
  });

  it("formata valores grandes com separadores de milhar", () => {
    expect(formatPrice(1000)).toBe("1,000.00");
    expect(formatPrice(1000000)).toBe("1,000,000.00");
  });

  it("verifica se atende a validação por Regex (toMatch)", () => {
    // Validando exatamente o cenário mencionado no seu arquivo uniTests.md
    expect(formatPrice(1000)).toMatch(/\d,\d{3}\.\d{2}/);
  });
});