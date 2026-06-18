import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Alert } from "react-native";
import Signup from "../../src/app/signup"; // Ajuste do caminho voltando 2 níveis

// --- 1. CONFIGURAÇÃO DOS MOCKS ---

// Mock do Firebase Auth
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock da instância de Auth exportada pelo arquivo lib/firebase.ts
jest.mock("../../src/lib/firebase", () => ({
  auth: {},
}));

// Mock do Expo Router (Link) para evitar erros de renderização
jest.mock("expo-router", () => ({
  Link: "Link",
}));

// Espiona a função de Alerta nativa do React Native
jest.spyOn(Alert, "alert");

// --- 2. SUÍTE DE TESTES ---

describe("Tela de Cadastro (src/app/signup.tsx)", () => {
  
  // Limpa o histórico de chamadas dos mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir alerta de erro se as senhas não forem iguais", () => {
    const { getByPlaceholderText, getByText } = render(<Signup />);
    
    // Preenche as senhas de forma divergente
    fireEvent.changeText(getByPlaceholderText("Senha"), "senha123");
    fireEvent.changeText(getByPlaceholderText("Confirmar Senha"), "senhaDiferente");
    
    // Clica no botão
    fireEvent.press(getByText("Cadastrar"));
    
    // Verifica se o alerta foi chamado corretamente e se a criação foi bloqueada
    expect(Alert.alert).toHaveBeenCalledWith("Erro", "As senhas não são iguais");
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("deve chamar createUserWithEmailAndPassword e exibir alerta de sucesso com dados válidos", async () => {
    // Simula uma resposta de sucesso do Firebase
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: "12345" }
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    
    // Preenche todos os inputs
    fireEvent.changeText(getByPlaceholderText("Nome"), "Usuário Teste");
    fireEvent.changeText(getByPlaceholderText("E-mail"), " teste@teste.com "); // Espaços para testar o .trim()
    fireEvent.changeText(getByPlaceholderText("Senha"), "senhaSegura123");
    fireEvent.changeText(getByPlaceholderText("Confirmar Senha"), "senhaSegura123");
    
    fireEvent.press(getByText("Cadastrar"));

    await waitFor(() => {
      // Verifica se o Firebase foi chamado com o email sem os espaços extras
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "teste@teste.com",
        "senhaSegura123"
      );
      
      // Verifica o alerta de sucesso
      expect(Alert.alert).toHaveBeenCalledWith("Sucesso!", "Conta criada com sucesso");
    });
  });

  it("deve exibir alerta informando que o e-mail já está em uso", async () => {
    // Simula o erro específico do Firebase
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/email-already-in-use"
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    
    fireEvent.changeText(getByPlaceholderText("E-mail"), "usado@teste.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senha123");
    fireEvent.changeText(getByPlaceholderText("Confirmar Senha"), "senha123");
    fireEvent.press(getByText("Cadastrar"));

    await waitFor(() => {
      // O seu código do signup passa apenas 1 argumento no alerta de erro
      expect(Alert.alert).toHaveBeenCalledWith("Esse email já está em uso");
    });
  });

  it("deve exibir alerta informando que o e-mail é inválido", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/invalid-email"
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    
    fireEvent.changeText(getByPlaceholderText("E-mail"), "email-errado");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senha123");
    fireEvent.changeText(getByPlaceholderText("Confirmar Senha"), "senha123");
    fireEvent.press(getByText("Cadastrar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("E-Mail inválido");
    });
  });

  it("deve exibir alerta genérico para outros erros de criação de conta", async () => {
    // Simula um erro qualquer, como senha muito fraca
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/weak-password"
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    
    fireEvent.changeText(getByPlaceholderText("E-mail"), "teste@teste.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "123");
    fireEvent.changeText(getByPlaceholderText("Confirmar Senha"), "123");
    fireEvent.press(getByText("Cadastrar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro desconhecido ao criar conta");
    });
  });
});