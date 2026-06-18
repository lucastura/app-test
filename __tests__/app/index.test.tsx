import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Alert } from "react-native";
import Index from "./index"; // Ajuste o caminho se necessário

// --- 1. CONFIGURAÇÃO DOS MOCKS ---

// Mock do Firebase Auth
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Simula que o usuário não está logado ao abrir a tela
    return jest.fn(); // Simula o retorno da função 'unsub'
  }),
}));

// Mock da instância de Auth exportada pelo seu arquivo lib/firebase.ts
jest.mock("../lib/firebase", () => ({
  auth: {},
}));

// Mock do Expo Router (Link) para evitar erros de renderização
jest.mock("expo-router", () => ({
  Link: "Link",
}));

// Espiona a função de Alerta nativa do React Native
jest.spyOn(Alert, "alert");

// --- 2. SUÍTE DE TESTES ---

describe("Tela de Login (src/app/index.tsx)", () => {
  
  // Limpa o histórico de chamadas dos mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve exibir alerta de erro se e-mail ou senha estiverem vazios", () => {
    const { getByText } = render(<Index />);
    const button = getByText("Entrar");
    
    fireEvent.press(button);
    
    // Verifica se o alerta foi chamado com os textos corretos
    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Preencha e-mail e senha!");
    
    // Garante que o Firebase não foi chamado
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("deve chamar signInWithEmailAndPassword e exibir alerta de sucesso com dados válidos", async () => {
    // Simula uma resposta de sucesso do Firebase
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { email: "teste@teste.com" }
    });

    const { getByPlaceholderText, getByText } = render(<Index />);
    
    // Preenche os inputs. Note o espaço extra no email para testar o .trim()
    fireEvent.changeText(getByPlaceholderText("E-mail"), "teste@teste.com ");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senhaSegura123");
    
    // Clica no botão
    fireEvent.press(getByText("Entrar"));

    // O waitFor aguarda as Promises (operações assíncronas) resolverem
    await waitFor(() => {
      // Verifica se o Firebase foi chamado com o email limpo (trim) e a senha correta
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // Passa a instância do auth mockada
        "teste@teste.com",
        "senhaSegura123"
      );
      
      // Verifica o alerta de sucesso
      expect(Alert.alert).toHaveBeenCalledWith("Login Ok", "Bem-vindo teste@teste.com");
    });
  });

  it("deve exibir alerta de erro com a mensagem do Firebase caso o login falhe", async () => {
    // Simula um erro do Firebase (ex: credenciais inválidas)
    const errorMessage = "Firebase: Error (auth/invalid-credential).";
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { getByPlaceholderText, getByText } = render(<Index />);
    
    fireEvent.changeText(getByPlaceholderText("E-mail"), "teste@teste.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senhaErrada");
    fireEvent.press(getByText("Entrar"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Erro no Login", errorMessage);
    });
  });
});